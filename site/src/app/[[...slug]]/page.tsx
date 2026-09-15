import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { MockPanel } from "@/components/mock-panel";
import { TocRegister } from "@/components/thumb-bar";
import { pageById, type ManifestPage } from "@/lib/manifest";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export const dynamicParams = false;

function LinkRow({ label, links }: { label: string; links: { text: string; href: string }[] }) {
  if (!links.length) return null;
  return (
    <div className="ox-linkrow">
      <span className="ox-linkrow-label">{label}</span>
      <span className="ox-linkrow-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.text}
          </Link>
        ))}
      </span>
    </div>
  );
}

function PageLinks({ page, from }: { page: ManifestPage; from: "page" | "audit" }) {
  return (
    <div className="ox-links not-prose">
      <LinkRow
        label={from === "page" ? "Audit" : "Page"}
        links={
          from === "page"
            ? page.audit
              ? [{ text: `${page.shortTitle} audit prompt`, href: `/audit-prompts/${page.id}/` }]
              : []
            : [{ text: `${page.title} spec`, href: `/pages/${page.id}/` }]
        }
      />
      <LinkRow label="Walkthrough" links={page.walkthrough} />
      <LinkRow label="Spec" links={page.spec} />
      <LinkRow label="Plan" links={page.plan} />
      <LinkRow
        label="Scenarios"
        links={page.scenarios.map((s) => ({ text: `${s.title} (step ${s.steps.join(", ")})`, href: `/scenarios/${s.id}/` }))}
      />
    </div>
  );
}

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const spec = page.data.kind === "page" || page.data.kind === "audit" ? pageById(page.data.pageId) : undefined;

  return (
    <DocsPage toc={page.data.toc}>
      <TocRegister toc={page.data.toc} />
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description && !page.data.descriptionInBody ? <DocsDescription>{page.data.description}</DocsDescription> : null}
      {spec && page.data.kind === "page" ? (
        <>
          <MockPanel title={spec.shortTitle} hash={spec.hash} states={spec.states} />
          <PageLinks page={spec} from="page" />
        </>
      ) : null}
      {spec && page.data.kind === "audit" ? <PageLinks page={spec} from="audit" /> : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
