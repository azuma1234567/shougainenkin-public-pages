// 検証スクリプトから lib/*.ts をそのまま import するための解決フック。
// tsconfig.json の paths ("@/*" → リポジトリ直下) を node にも教える。
//   node --import ./scripts/lib/ts-alias.mjs scripts/verify-*.mjs
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = pathToFileURL(`${path.resolve(import.meta.dirname, "../..")}/`).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = new URL(specifier.slice(2), root).href;
      const url = /\.[a-z]+$/.test(resolved) ? resolved : `${resolved}.ts`;
      /* TypeScript は resolveJsonModule で属性なしに JSON を読めるが、node の ESM は
         with { type: "json" } を要求する。ここで補う。 */
      const importAttributes = url.endsWith(".json") ? { ...context.importAttributes, type: "json" } : context.importAttributes;
      return { url, importAttributes, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
