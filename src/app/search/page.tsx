import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

/** Legacy /search?q= URLs (from the reference site's sitemap) redirect to the markets browser. */
export default async function SearchPage(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  redirect(q ? `/markets?q=${encodeURIComponent(q)}` : "/markets");
}
