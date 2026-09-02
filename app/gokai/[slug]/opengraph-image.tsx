import { GOKAI } from "@/data/gokai";
import { gokaiCardBySlug } from "@/lib/gokai";
import { OG_CONTENT_TYPE, OG_SIZE, gokaiOgImage } from "@/lib/gokai-og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() { return GOKAI.map(({ slug }) => ({ slug })); }

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = gokaiCardBySlug(slug);
  if (!card) throw new Error(`不明な誤解カード: ${slug}`);
  return gokaiOgImage(card.misconception, card.truth);
}
