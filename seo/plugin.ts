import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import type { Plugin } from "vite";
import {
  faviconSvg,
  headTags,
  ogImageSvg,
  OG_IMAGE,
  robotsTxt,
  siteUrl,
  sitemapXml,
  type SeoProfile,
} from "./meta.ts";

const fonts = ["Inter_800ExtraBold.ttf", "Inter_600SemiBold.ttf"].map((f) =>
  resolve(import.meta.dirname, "fonts", f),
);

// resvg is a prebuilt native renderer (no browser, no system fonts needed),
// so the preview image renders the same on a laptop and in CI.
const renderPng = (svg: string) =>
  new Resvg(svg, {
    font: {
      fontFiles: fonts,
      loadSystemFonts: false,
      defaultFontFamily: "Inter",
    },
  })
    .render()
    .asPng();

// Adds title, description, Open Graph/Twitter tags, canonical URL and JSON-LD to
// index.html, and emits favicon.svg, og-image.png, robots.txt and sitemap.xml.
export default function seo(profileJson: string): Plugin {
  const profile: SeoProfile = JSON.parse(readFileSync(profileJson, "utf8"));
  const url = siteUrl(profile, process.env);
  const files = (): Record<string, string | Uint8Array> => ({
    "favicon.svg": faviconSvg(profile),
    [OG_IMAGE.path]: renderPng(ogImageSvg(profile, url)),
    "robots.txt": robotsTxt(url),
    "sitemap.xml": sitemapXml(url),
  });

  return {
    name: "discover-me-seo",
    transformIndexHtml: () =>
      headTags(profile, url).map(({ tag, attrs, children }) => ({
        tag,
        attrs,
        children,
        injectTo: "head",
      })),
    configureServer(server) {
      const types: Record<string, string> = {
        svg: "image/svg+xml",
        png: "image/png",
        txt: "text/plain",
        xml: "application/xml",
      };
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split("?")[0].slice(1) ?? "";
        const generated = [
          "favicon.svg",
          OG_IMAGE.path,
          "robots.txt",
          "sitemap.xml",
        ];
        if (!generated.includes(name)) return next();
        res.setHeader("Content-Type", types[name.split(".").pop()!]);
        res.end(files()[name]);
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(files())) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
  };
}
