import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-3 px-4 py-24">
      <h1 className="text-2xl font-semibold">No page at this address</h1>
      <p className="text-fd-muted-foreground">
        Start from the <Link href="/">walkthrough</Link>.
      </p>
    </main>
  );
}
