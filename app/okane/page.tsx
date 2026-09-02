import type { Metadata } from "next";
import { hubIndexMetadata, renderHubIndex } from "@/lib/hub-index";

export const metadata: Metadata = hubIndexMetadata("okane");
export default function Page() { return renderHubIndex("okane"); }
