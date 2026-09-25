/* Isolated wireframe state. No requests, product mutations, or persistent storage. */
const profiles = [
  { id: 'builder', name: 'Code contributor', instructions: 'Inspect the repository before changing code. Keep changes focused and report what you changed and checked.', belt: 'code' },
  { id: 'reviewer', name: 'Code reviewer', instructions: 'Review the diff for defects and missing checks. Cite the affected files and explain each finding.', belt: 'review' },
  { id: 'explorer', name: 'Repository explorer', instructions: 'Read the repository and explain its structure. Cite the files that support your answer.', belt: 'read' },
];
const byId = (id) => document.getElementById(id);
let selected = 'builder';
let editing = 'builder';
let customPrompt = false;
let connection = false;
let firstRun = false;
let timer = null;
let seconds = 5;
let paused = false;
const currentProfile = () => profiles.find((profile) => profile.id === selected);
function suggestedPrompt() {
  const profile = currentProfile();
  return `I am connecting Stella to the Core platform workspace in Oxagen.\n\n${profile.instructions}\n\nFor this first run, describe the working directory and your intended next step. Do not modify files.`;
}
function updatePrompt() {
  if (!customPrompt) byId('first-prompt').value = suggestedPrompt();
  byId('prompt-basis').textContent = customPrompt ? 'Your customized prompt' : 'Suggested from your workspace and profile';
  byId('reset-prompt').hidden = !customPrompt;
}
function show(view) {
  for (const name of ['setup', 'profiles', 'fleet']) byId(`${name}-view`).hidden = name !== view;
  for (const name of ['setup', 'profiles']) {
    if (name === view) byId(`${name}-tab`).setAttribute('aria-current', 'page');
    else byId(`${name}-tab`).removeAttribute('aria-current');
  }
  if (view !== 'setup' && timer) {
    paused = true;
    byId('pause').textContent = 'Resume countdown';
    drawCountdown();
  }
}
function fillProfiles() {
  byId('setup-profile').replaceChildren();
  byId('profile-list').replaceChildren();
  for (const profile of profiles) {
    const option = document.createElement('option');
    option.value = profile.id;
    option.textContent = profile.name;
    byId('setup-profile').append(option);
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'ap-btn';
    button.textContent = profile.name;
    button.setAttribute('aria-pressed', String(editing === profile.id));
    button.onclick = () => { editing = profile.id; fillProfiles(); fillEditor(); };
    row.append(button);
    byId('profile-list').append(row);
  }
  byId('setup-profile').value = selected;
}
function fillEditor() {
  const profile = profiles.find((item) => item.id === editing);
  byId('profile-heading').textContent = profile.name;
  byId('profile-name').value = profile.name;
  byId('profile-instructions').value = profile.instructions;
  byId('profile-belt').value = profile.belt;
}
function drawState(id, done, detail) {
  const row = byId(id);
  row.classList.toggle('done', done);
  row.querySelector('.ap-dot').textContent = done ? '✓' : '○';
  row.querySelector('small').textContent = detail;
}
function drawCountdown() {
  byId('countdown').textContent = paused ? 'Automatic navigation is paused. Launch Mission Control when you are ready.' : `Mission Control opens in ${seconds} seconds. Your run will be visible in Fleet.`;
}
function launch() {
  if (!connection || !firstRun) return;
  clearInterval(timer);
  timer = null;
  show('fleet');
}
function receipts() {
  drawState('connection-state', connection, connection ? 'Confirmed for this machine and Stella.' : 'Waiting for this machine and harness.');
  drawState('run-state', firstRun, firstRun ? 'The run matches this setup.' : 'Waiting for the run from this setup.');
  const ready = connection && firstRun;
  byId('registration-title').textContent = ready ? 'Agent registered' : connection ? 'Awaiting first run' : 'Awaiting connection';
  byId('success').hidden = !ready;
  if (ready && !timer) {
    seconds = 5;
    paused = byId('setup-view').hidden;
    byId('pause').textContent = paused ? 'Resume countdown' : 'Pause countdown';
    drawCountdown();
    timer = setInterval(() => {
      if (paused) return;
      seconds -= 1;
      if (seconds <= 0) launch();
      else drawCountdown();
    }, 1000);
  }
}
byId('setup-tab').onclick = () => show('setup');
byId('profiles-tab').onclick = () => show('profiles');
byId('theme').onclick = () => {
  const light = document.documentElement.dataset.theme !== 'light';
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  byId('theme').textContent = light ? 'Switch to dark' : 'Switch to light';
};
byId('setup-profile').onchange = (event) => {
  selected = event.target.value;
  byId('setup-belt').value = currentProfile().belt || 'read';
  updatePrompt();
};
byId('edit-prompt').onclick = () => {
  byId('first-prompt').readOnly = false;
  byId('first-prompt').focus();
  byId('prompt-help').textContent = 'Edit the prompt freely. Connection verification uses the setup reference, not the wording.';
};
byId('first-prompt').oninput = () => { customPrompt = true; updatePrompt(); };
byId('reset-prompt').onclick = () => { customPrompt = false; updatePrompt(); };
// The copied state of engine.css's .btn.copied, drawn for .ap-btn in index.html: a check and "Copied" for 1.6s.
const COPIED = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 5"/></svg>Copied';
let copiedTimer = null;
const showCopied = (btn) => {
  if (!btn.classList.contains('copied')) { btn.dataset.label = btn.innerHTML; btn.style.minWidth = `${btn.offsetWidth}px`; }
  btn.innerHTML = COPIED;
  btn.classList.add('copied');
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    btn.innerHTML = btn.dataset.label;
    btn.classList.remove('copied');
    btn.style.minWidth = '';
    delete btn.dataset.label;
  }, 1600);
};
byId('copy-prompt').onclick = async () => {
  const text = byId('first-prompt').value.trim();
  if (!text) { byId('copy-status').textContent = 'Enter a prompt before copying.'; return; }
  try {
    await navigator.clipboard.writeText(text);
    showCopied(byId('copy-prompt'));
    byId('copy-status').textContent = 'Prompt copied. Send it through Stella. Registration is still waiting for its connection and run.';
  } catch {
    byId('first-prompt').focus();
    byId('first-prompt').select();
    byId('copy-status').textContent = 'Copy the selected prompt, then send it through Stella.';
  }
};
byId('save-profile').onclick = () => {
  const profile = profiles.find((item) => item.id === editing);
  const name = byId('profile-name').value.trim();
  const instructions = byId('profile-instructions').value.trim();
  if (!name || !instructions) { byId('profile-status').textContent = 'Enter a name and instructions.'; return; }
  Object.assign(profile, { name, instructions, belt: byId('profile-belt').value });
  fillProfiles();
  fillEditor();
  updatePrompt();
  byId('profile-status').textContent = 'Saved in this preview. Existing toolbelt choices stay unchanged.';
};
byId('receive-connection').onclick = () => { connection = true; byId('receipt-status').textContent = 'Matching connection received.'; receipts(); };
byId('receive-run').onclick = () => { firstRun = true; byId('receipt-status').textContent = connection ? 'Matching first run received.' : 'Run received. Still waiting for the matching connection.'; receipts(); };
byId('wrong-receipt').onclick = () => { byId('receipt-status').textContent = 'Activity from another harness does not complete this setup.'; };
byId('reset-receipts').onclick = () => { clearInterval(timer); timer = null; connection = false; firstRun = false; paused = false; byId('receipt-status').textContent = 'Receipts cleared in the preview.'; receipts(); };
byId('pause').onclick = () => { paused = !paused; byId('pause').textContent = paused ? 'Resume countdown' : 'Pause countdown'; drawCountdown(); };
byId('launch').onclick = launch;
byId('return-setup').onclick = () => { show('setup'); byId('reset-receipts').click(); };
fillProfiles();
fillEditor();
byId('setup-belt').value = currentProfile().belt;
updatePrompt();
receipts();
