import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HubLanding from "@/components/platform/HubLanding";
import { HUBS, type HubDefinition } from "@/lib/hubs";
import { pageMetadata } from "@/lib/seo";

export function hubForRoute(kind: HubDefinition["kind"], slug: string): HubDefinition {
  const hub = HUBS.find((item) => item.kind === kind && item.path.endsWith(`/${slug}`));
  if (!hub?.published) notFound();
  return hub;
}
export function hubStaticParams(kind: HubDefinition["kind"]) {
  return HUBS.filter((item) => item.kind === kind && item.published).map((item) => ({ slug: item.path.split("/").at(-1)! }));
}
export function hubMetadata(hub: HubDefinition): Metadata {
  return pageMetadata({ title: `${hub.label}｜障害年金のテーマガイド`, description: `${hub.label}に関係する障害年金のコラム、公開裁決例、次に確認することをまとめています。`, path: hub.path });
}
export function renderHubPage(kind: HubDefinition["kind"], slug: string) { return <HubLanding hub={hubForRoute(kind, slug)} />; }
