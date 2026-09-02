import type { Metadata } from "next";
import { hubIndexMetadata, renderHubIndex } from "@/lib/hub-index";

export const metadata: Metadata = hubIndexMetadata("nayami");
export default function Page() { return renderHubIndex("nayami"); }
