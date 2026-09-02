import type { Metadata } from "next";
import MoushitateshoPrint from "@/components/tools/MoushitateshoPrint";
export const metadata:Metadata={title:"申立書の印刷プレビュー",robots:{index:false,follow:false}};
export default function Page(){return <div className="platform mt-print-page"><MoushitateshoPrint/></div>}
