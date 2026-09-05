import type { Metadata } from "next";
import { hubIndexMetadata, renderHubIndex } from "@/lib/hub-index";

export const metadata: Metadata = hubIndexMetadata("jukyuugo");
export default function Page() { return renderHubIndex("jukyuugo"); }
