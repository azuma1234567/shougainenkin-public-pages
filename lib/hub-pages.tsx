import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HubLanding from "@/components/platform/HubLanding";
import { HUBS, type HubDefinition } from "@/lib/hubs";
import { pageMetadata } from "@/lib/seo";
import { getHubContent } from "@/lib/hub-content";

export function hubForRoute(kind: HubDefinition["kind"], slug: string): HubDefinition {
  const hub = HUBS.find((item) => item.kind === kind && item.path.endsWith(`/${slug}`));
  if (!hub?.published) notFound();
  return hub;
}
export function hubStaticParams(kind: HubDefinition["kind"]) {
  return HUBS.filter((item) => item.kind === kind && item.published).map((item) => ({ slug: item.path.split("/").at(-1)! }));
}
export function hubMetadata(hub: HubDefinition): Metadata {
  const content = getHubContent(hub.path);
  return pageMetadata({ title: content?.title ?? hub.label, description: content?.source.split("\n").find((line) => line && !line.startsWith("#")) ?? hub.label, path: hub.path });
}
export function renderHubPage(kind: HubDefinition["kind"], slug: string) { return <HubLanding hub={hubForRoute(kind, slug)} />; }
