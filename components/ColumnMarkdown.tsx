import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import AppCta from "@/components/AppCta";

const CTA_MARKER = /\(→ (?:本文中盤|記事末)CTAをここに配置\)/g;
const IMAGE_MARKER = /^\[IMG: ([^|]+?) \| alt: ([^|]+?) \| 撮影指示: ([\s\S]+)\]$/;

const PORTRAIT_SCREENSHOTS = new Set([
  "moushitatesho-kakikata/img-03.png",
  "moushitatesho-kakikata/img-04.png",
  "moushitatesho-kakikata/img-05.png",
  "shinsatsu-mae-memo/img-01.png",
  "shinsatsu-mae-memo/img-02.png",
  "moushitatesho-a4-insatsu/img-02.png",
]);

function imageDimensions(slug: string, filename: string) {
  return PORTRAIT_SCREENSHOTS.has(`${slug}/${filename}`)
    ? { width: 554, height: 1200 }
    : { width: 1200, height: 675 };
}

export default function ColumnMarkdown({
  markdown,
  slug,
  ctaHeading,
  ctaBody,
}: {
  markdown: string;
  slug: string;
  ctaHeading: string;
  ctaBody: string;
}) {
  let imageIndex = 0;
  let headingIndex = 0;

  const components: Components = {
    h2({ children }) {
      headingIndex += 1;
      return <h2 id={`section-${headingIndex}`}>{children}</h2>;
    },
    a({ href = "", children }) {
      if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer external">
          {children}
        </a>
      );
    },
    p({ children }) {
      const marker =
        React.Children.count(children) === 1 && typeof children === "string"
          ? children.match(IMAGE_MARKER)
          : null;
      if (!marker) return <p>{children}</p>;

      const [, rawFilename, alt] = marker;
      const filename = rawFilename.trim();
      const relativePath = `/columns/${slug}/${filename}`;
      const filePath = join(process.cwd(), "public", "columns", slug, filename);
      const dimensions = imageDimensions(slug, filename);
      const firstImage = imageIndex++ === 0;

      if (!existsSync(filePath)) {
        return (
          <figure className="article-image article-image-placeholder">
            <div role="img" aria-label={`${alt}（画像準備中）`}>
              <strong>画像準備中</strong>
              <span>{filename}</span>
            </div>
            <figcaption>{alt}</figcaption>
          </figure>
        );
      }

      return (
        <figure className="article-image">
          <Image
            src={relativePath}
            alt={alt}
            width={dimensions.width}
            height={dimensions.height}
            loading={firstImage ? "eager" : "lazy"}
            fetchPriority={firstImage ? "high" : "auto"}
            sizes="(max-width: 672px) calc(100vw - 40px), 672px"
          />
          <figcaption>{alt}</figcaption>
        </figure>
      );
    },
    table({ children }) {
      return (
        <div className="table-scroll" tabIndex={0} role="region" aria-label="表（横にスクロールできます）">
          <table>{children}</table>
        </div>
      );
    },
  };

  const sections = markdown.split(CTA_MARKER);

  return sections.map((section, index) => (
    <Fragment key={index}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {section}
      </ReactMarkdown>
      {index < sections.length - 1 ? (
        <AppCta ct={slug} heading={ctaHeading} body={ctaBody} />
      ) : null}
    </Fragment>
  ));
}
