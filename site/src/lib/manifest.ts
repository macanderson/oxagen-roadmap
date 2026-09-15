import raw from "@gen/manifest.json";

export interface SiteLink {
  text: string;
  href: string;
}

export interface ManifestPage {
  id: string;
  title: string;
  shortTitle: string;
  group: string;
  states: string[];
  audit: boolean;
  walkthrough: SiteLink[];
  spec: SiteLink[];
  plan: SiteLink[];
  scenarios: { id: string; title: string; steps: number[] }[];
}

export interface ManifestScenario {
  id: string;
  title: string;
  release: "wedge" | "full";
  w: { file: string; label: string; title: string } | null;
  steps: { n: number; page: string | null }[];
}

export const manifest = raw as unknown as {
  walkthrough: string | null;
  pages: ManifestPage[];
  scenarios: ManifestScenario[];
};

export const GROUPS = ["Workspace", "Organization", "Auth & onboarding"] as const;

export function pageById(id: string | undefined): ManifestPage | undefined {
  return id ? manifest.pages.find((p) => p.id === id) : undefined;
}
