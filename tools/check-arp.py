#!/usr/bin/env python3
"""Check ARP design fixtures, not production adapters. Requires jsonschema/cryptography."""
import base64
import copy
import hashlib
import json
import pathlib

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.exceptions import InvalidSignature
from jsonschema import Draft202012Validator, FormatChecker, ValidationError

ROOT = pathlib.Path(__file__).resolve().parent.parent / "protocols/arp/0.1"
FIXTURES = ROOT / "fixtures"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def pairs(items):
    result = {}
    for key, value in items:
        require(key not in result, "duplicate JSON key")
        result[key] = value
    return result


def canonical(value):
    """Restricted control-document JCS: integers only; UTF-16 key ordering."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        require(abs(value) <= 9007199254740991, "unsafe integer")
        return str(value)
    if isinstance(value, str):
        require(not any(0xD800 <= ord(c) <= 0xDFFF for c in value), "lone surrogate")
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(canonical(x) for x in value) + "]"
    require(isinstance(value, dict), "non-control JSON value")
    for key in value:
        canonical(key)
    keys = sorted(value, key=lambda x: x.encode("utf-16-be"))
    return "{" + ",".join(canonical(k) + ":" + canonical(value[k]) for k in keys) + "}"


def parse(data):
    def integer(text):
        require(text != "-0", "negative zero")
        return int(text)

    value = json.loads(data, object_pairs_hook=pairs, parse_int=integer)
    canonical(value)
    return value


def read(name):
    return parse((FIXTURES / name).read_bytes())


def digest_bytes(data):
    return "sha256:" + hashlib.sha256(data).hexdigest()


def digest(value):
    return digest_bytes(canonical(value).encode())


SCHEMA = json.loads((ROOT / "arp.schema.json").read_text())
Draft202012Validator.check_schema(SCHEMA)
VALIDATOR = Draft202012Validator(SCHEMA, format_checker=FormatChecker())


def validate(value):
    canonical(value)
    VALIDATOR.validate(value)
    require(not value.get("required_extensions", []), "unsupported required extension")


def closure(roots, blobs):
    seen = set()

    def visit(value, depth=0):
        require(depth <= 64, "fixture traversal depth")
        if isinstance(value, list):
            for item in value:
                visit(item, depth + 1)
        if not isinstance(value, dict):
            return
        if set(value) == {"digest", "bytes", "media_type"}:
            key = value["digest"]
            require(key in blobs, "missing blob")
            data = blobs[key]
            require(len(data) == value["bytes"], "blob size mismatch")
            require(digest_bytes(data) == key, "blob digest mismatch")
            if key not in seen:
                seen.add(key)
                if value["media_type"] == "application/json":
                    child = parse(data)
                    if isinstance(child, dict) and str(child.get("schema", "")).startswith("arp."):
                        validate(child)
                    visit(child, depth + 1)
        else:
            for item in value.values():
                visit(item, depth + 1)

    visit(roots)
    return seen


def workspace_valid(workspace):
    validate(workspace)
    paths = {}
    for entry in workspace["entries"]:
        path = entry["path"]
        require(path not in paths, "duplicate workspace path")
        paths[path] = entry
    for path, entry in paths.items():
        parts = path.split("/")
        for i in range(1, len(parts)):
            parent = paths.get("/".join(parts[:i]))
            require(parent is not None and parent["kind"] == "directory", "non-directory parent")
        if entry["kind"] == "symlink":
            # Profile targets are root-relative identifiers; no '..' is admitted.
            require(entry["target"] in paths, "missing symlink target")
            require(paths[entry["target"]]["kind"] != "symlink", "symlink chain unsupported")
    require(not any(x["required"] for x in workspace["exclusions"]), "required excluded path")
    require(not workspace["resources"], "fixture resource adapter unavailable")


def checkpoint_valid(checkpoint, blobs):
    validate(checkpoint)
    require(not any(x["status"] == "unknown" for x in checkpoint["effects"]), "unresolved effect")
    require(not any(x["required"] for x in checkpoint["gaps"]), "required checkpoint gap")
    closure([checkpoint], blobs)
    workspace_valid(parse(blobs[checkpoint["workspace"]["digest"]]))
    prefix = parse(blobs[checkpoint["source"]["evidence_prefix"]["digest"]])
    require(prefix["fixture_only"] is True, "only synthetic prefix supported here")
    previous = digest_bytes(b"")
    for seq, event in enumerate(prefix["events"]):
        require(event["seq"] == seq and event["prev_hash"] == previous, "source chain position")
        unhashed = {k: v for k, v in event.items() if k != "hash"}
        require(digest(unhashed) == event["hash"], "source hash mismatch")
        previous = event["hash"]
    boundary = checkpoint["source"]["boundary"]
    last = prefix["events"][-1]
    require(boundary["digest"] == previous and boundary["seq"] == str(last["seq"]), "boundary mismatch")
    require(boundary["stream_id"] == last["session_uuid"], "source stream mismatch")


def verify_signature(value, attestation, trusted):
    validate(attestation)
    require(value["issuer"] == trusted["issuer"], "untrusted issuer")
    require(attestation["key_id"] == trusted["key_id"], "untrusted key")
    require(attestation["subject_digest"] == digest(value), "signed subject mismatch")
    key = Ed25519PublicKey.from_public_bytes(base64.b64decode(trusted["public_key_base64"], validate=True))
    key.verify(base64.b64decode(attestation["signature"], validate=True), ("ARP/0.1\n" + digest(value)).encode())


def report_valid(report, launch, checkpoint, capabilities):
    validate(report)
    require(report["launch_digest"] == digest(launch), "report launch mismatch")
    require(report["checkpoint_digest"] == digest(checkpoint), "report checkpoint mismatch")
    require(report["target"] == launch["target"], "target mismatch")
    require(report["capabilities_digest"] == digest(capabilities), "capabilities mismatch")
    required = any(x["required"] for x in report["findings"])
    expected = "blocked" if required else "degraded" if report["findings"] else "ready"
    require(report["status"] == expected, "report status contradicts findings")
    if report["status"] == "degraded":
        require(all(x["code"] in launch["allowed_optional_gaps"] for x in report["findings"]), "unaccepted gap")
    require(launch["tool_mode"] in capabilities["tool_modes"], "tool mode unsupported")
    require(launch["mode"] != "handoff" or capabilities["handoff_fencing"], "handoff unsupported")


def receipts_valid(receipts, launch, checkpoint, report):
    allowed = {
        None: {"requested"}, "requested": {"validating", "cancelled"},
        "validating": {"preparing", "blocked", "failed", "cancelled"},
        "preparing": {"prepared", "failed", "cancelled"},
        "prepared": {"starting", "failed", "cancelled"},
        "starting": {"running", "reconciling", "failed"},
        "running": {"completed", "failed", "cancelled", "reconciling"},
        "reconciling": {"running", "completed", "failed", "cancelled"},
    }
    previous = None
    state = None
    binding = None
    for seq, receipt in enumerate(receipts):
        validate(receipt)
        require(receipt["seq"] == str(seq), "receipt sequence gap")
        require(receipt["previous_receipt_digest"] == previous, "receipt chain mismatch")
        require(receipt["state"] in allowed.get(state, set()), "invalid lifecycle transition")
        require(receipt["launch_digest"] == digest(launch) and receipt["launch_id"] == launch["launch_id"], "receipt launch mismatch")
        require(receipt["checkpoint_digest"] == digest(checkpoint), "receipt checkpoint mismatch")
        if receipt["state"] in {"prepared", "starting", "running", "completed"}:
            require(receipt.get("report_digest") == digest(report), "missing report binding")
            require("delivered_context" in receipt, "missing delivered context")
        if receipt["state"] in {"running", "completed"}:
            require("binding" in receipt, "missing native binding")
        if "binding" in receipt:
            require(binding is None or binding == receipt["binding"], "native binding changed")
            binding = receipt["binding"]
        if receipt.get("usage", {}).get("status") == "unknown":
            require("cost_microusd" not in receipt["usage"], "unknown cost stated as measured")
        state = receipt["state"]
        previous = digest(receipt)


def experiment_valid(experiment, launches, checkpoint):
    validate(experiment)
    require(experiment["checkpoint_digest"] == digest(checkpoint), "experiment checkpoint mismatch")
    require(experiment["candidate_launches"] == [digest(x) for x in launches], "candidate roster mismatch")
    require(len({x["launch_id"] for x in launches}) == len(launches), "duplicate candidate identity")
    for launch in launches:
        validate(launch)
        require(launch["checkpoint_digest"] == digest(checkpoint), "candidate checkpoint mismatch")
        require(launch["experiment_id"] == experiment["experiment_id"], "experiment identity mismatch")
    require(sum(int(x["budget"]["max_microusd"]) for x in launches) <= int(experiment["aggregate_budget"]["max_microusd"]), "candidate reservations exceed budget")


def selection_valid(selection, evaluations, experiment):
    validate(selection)
    require(selection["experiment_digest"] == digest(experiment), "selection experiment mismatch")
    require(selection["selection_rule_digest"] == experiment["selection_rule"]["digest"], "selection rule mismatch")
    require(selection["evaluations"] == [digest(x) for x in evaluations], "evaluation roster mismatch")
    require(len({x["launch_digest"] for x in evaluations}) == len(evaluations), "duplicate candidate evaluation")
    require({x["launch_digest"] for x in evaluations} == set(experiment["candidate_launches"]), "missing candidate evaluation")
    eligible = set()
    for result in evaluations:
        validate(result)
        require(result["experiment_digest"] == digest(experiment), "evaluation experiment mismatch")
        require(result["experiment_id"] == experiment["experiment_id"], "evaluation experiment ID mismatch")
        require(result["evaluator_digest"] == experiment["evaluator"]["digest"], "evaluator mismatch")
        required = [x for x in result["checks"] if x["required"]]
        require(required, "missing required checks")
        if result["verdict"] == "eligible":
            require(all(x["verdict"] == "pass" for x in required), "eligible despite failing check")
            eligible.add(result["launch_digest"])
        if result["cost"]["status"] == "unknown":
            require("microusd" not in result["cost"], "unknown evaluation cost stated as measured")
    selected = selection["selected_launches"]
    require(set(selected) <= eligible, "ineligible winner")
    count = len(selected)
    require((selection["outcome"] == "winner" and count == 1) or
            (selection["outcome"] == "tie" and count > 1) or
            (selection["outcome"] == "no_winner" and count == 0), "selection cardinality")
    # Fixture rule: only one eligible candidate, so no ranking engine is needed.
    require(len(eligible) == 1 and set(selected) == eligible, "fixture selection rule mismatch")


def rejected(label, callback):
    try:
        callback()
    except (ValueError, ValidationError, InvalidSignature):
        print("ok   rejects " + label)
        return
    raise AssertionError("accepted invalid fixture: " + label)


def changed(value, key, replacement):
    result = copy.deepcopy(value)
    result[key] = replacement
    return result


def main():
    checkpoint = read("checkpoint.json")
    launches = [read("launch-1.json"), read("launch-2.json")]
    capabilities = read("capabilities.json")
    report = read("report.json")
    receipts = read("receipts.json")
    experiment = read("experiment.json")
    evaluations = read("evaluations.json")
    selection = read("selection.json")
    trusted = read("trusted-test-key.json")
    blobs = {"sha256:" + path.name: path.read_bytes() for path in (FIXTURES / "blobs/sha256").iterdir()}
    checkpoint_valid(checkpoint, blobs)
    validate(capabilities)
    report_valid(report, launches[0], checkpoint, capabilities)
    receipts_valid(receipts, launches[0], checkpoint, report)
    experiment_valid(experiment, launches, checkpoint)
    selection_valid(selection, evaluations, experiment)
    used = closure([checkpoint, launches, capabilities, report, receipts, experiment, evaluations, selection], blobs)
    require(used == set(blobs), "orphan fixture blob")
    verify_signature(checkpoint, read("checkpoint.attestation.json"), trusted)
    signatures = read("receipts.attestations.json")
    require(len(signatures) == len(receipts), "missing receipt signature")
    for receipt, signature in zip(receipts, signatures):
        verify_signature(receipt, signature, trusted)
    evaluation_signatures = read("evaluations.attestations.json")
    require(len(evaluation_signatures) == len(evaluations), "missing evaluation signature")
    for result, signature in zip(evaluations, evaluation_signatures):
        verify_signature(result, signature, trusted)
    verify_signature(selection, read("selection.attestation.json"), trusted)
    print(f"ok   schemas, {len(blobs)} blobs, checkpoint and {len(receipts)} signed lifecycle receipts")
    rejected("duplicate keys", lambda: parse('{"x":1,"x":2}'))
    rejected("negative zero", lambda: parse('-0'))
    rejected("unsafe integer", lambda: parse('9007199254740992'))
    rejected("floating control values", lambda: parse('1.5'))
    rejected("lone surrogate", lambda: parse('"\\ud800"'))
    rejected("unknown fields", lambda: validate(changed(checkpoint, "unexpected", True)))
    rejected("required extension", lambda: validate(changed(checkpoint, "required_extensions", ["vendor:unknown"])))
    rejected("missing blobs", lambda: checkpoint_valid(checkpoint, {}))
    corrupt = dict(blobs)
    key = checkpoint["context"]["digest"]
    corrupt[key] = bytes([corrupt[key][0] ^ 1]) + corrupt[key][1:]
    rejected("corrupt blob", lambda: checkpoint_valid(checkpoint, corrupt))
    rejected("unsettled effect", lambda: checkpoint_valid(changed(checkpoint, "effects", [{"operation_id":"x","status":"unknown","external_ids":[]}]), blobs))
    bad_boundary = copy.deepcopy(checkpoint)
    bad_boundary["source"]["boundary"]["seq"] = "99"
    rejected("wrong historical boundary", lambda: checkpoint_valid(bad_boundary, blobs))
    workspace = parse(blobs[checkpoint["workspace"]["digest"]])
    traversal = copy.deepcopy(workspace)
    traversal["entries"][1]["path"] = "../outside"
    rejected("path traversal", lambda: workspace_valid(traversal))
    duplicates = copy.deepcopy(workspace)
    duplicates["entries"].append(copy.deepcopy(duplicates["entries"][0]))
    rejected("duplicate paths", lambda: workspace_valid(duplicates))
    bad_report = changed(report, "findings", [{"code":"body_missing","dimension":"context","required":True,"detail":"Required context missing"}])
    rejected("false ready status", lambda: report_valid(bad_report, launches[0], checkpoint, capabilities))
    rejected("wrong target", lambda: report_valid(report, launches[1], checkpoint, capabilities))
    rejected("receipt gap", lambda: receipts_valid(receipts[1:], launches[0], checkpoint, report))
    terminal_append = changed(receipts[-1], "seq", str(len(receipts)))
    terminal_append["previous_receipt_digest"] = digest(receipts[-1])
    rejected("terminal append", lambda: receipts_valid(receipts + [terminal_append], launches[0], checkpoint, report))
    rejected("tampered signed checkpoint", lambda: verify_signature(changed(checkpoint, "checkpoint_id", "tampered"), read("checkpoint.attestation.json"), trusted))
    rejected("untrusted signer", lambda: verify_signature(checkpoint, read("checkpoint.attestation.json"), changed(trusted, "key_id", "different")))
    forged = changed(read("checkpoint.attestation.json"), "signature", base64.b64encode(bytes(64)).decode())
    rejected("forged signature", lambda: verify_signature(checkpoint, forged, trusted))
    rejected("experiment roster change", lambda: experiment_valid(experiment, list(reversed(launches)), checkpoint))
    rejected("ineligible winner", lambda: selection_valid(changed(selection, "selected_launches", [digest(launches[1])]), evaluations, experiment))
    rejected("omitted losing candidate", lambda: selection_valid(selection, evaluations[:1], experiment))
    require(digest({}) == "sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a", "empty object vector")
    require(canonical({"\ue000":1,"\U00010000":2}) == '{"\U00010000":2,"\ue000":1}', "UTF-16 ordering vector")
    print("ok   canonicalization vectors; fixture-only conformance passed")


if __name__ == "__main__":
    main()
