import type { Metadata } from "next";
import { hubForRoute, hubMetadata, hubStaticParams, renderHubPage } from "@/lib/hub-pages";
export const generateStaticParams = () => hubStaticParams("byoki").filter(({ slug }) => slug !== "utsu-soukyoku");
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return hubMetadata(hubForRoute("byoki", (await params).slug)); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return renderHubPage("byoki", (await params).slug); }
