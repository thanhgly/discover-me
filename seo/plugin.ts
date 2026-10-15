import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import type { Plugin } from "vite";
import { cleanKnowledge } from "../netlify/lib/chat.ts";
import { jsonResume, llmsTxt, type ResumeProfile } from "./machine.ts";
import {
  faviconSvg,
  headTags,
  ogImageSvg,
  OG_IMAGE,
  robotsTxt,
  siteUrl,
  sitemapXml,
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
// index.html, and emits favicon.svg, og-image.png, robots.txt, sitemap.xml, plus
// llms.txt and resume.json for AI tools.
export default function seo(profileJson: string): Plugin {
  const profile: ResumeProfile = JSON.parse(readFileSync(profileJson, "utf8"));
  const knowledge = () =>
    cleanKnowledge(
      readFileSync(resolve(dirname(profileJson), "about-me.md"), "utf8"),
    );
  const url = siteUrl(profile, process.env);
  const files = (): Record<string, string | Uint8Array> => ({
    "favicon.svg": faviconSvg(profile),
    [OG_IMAGE.path]: renderPng(ogImageSvg(profile, url)),
    "robots.txt": robotsTxt(url),
    "sitemap.xml": sitemapXml(url),
    "llms.txt": llmsTxt(profile, knowledge(), url),
    "resume.json": `${JSON.stringify(jsonResume(profile, url), null, 2)}\n`,
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
        json: "application/json",
      };
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split("?")[0].slice(1) ?? "";
        const generated = [
          "favicon.svg",
          OG_IMAGE.path,
          "robots.txt",
          "sitemap.xml",
          "llms.txt",
          "resume.json",
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
