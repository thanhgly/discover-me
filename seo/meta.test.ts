import {
  faviconSvg,
  headTags,
  ogImageSvg,
  robotsTxt,
  siteUrl,
  sitemapXml,
} from "./meta.ts";

const profile = {
  firstName: "Alex",
  lastName: "Rivera",
  title: "Frontend Engineer",
  bio: 'Builds "fast" apps & tools.',
  location: "Austin, Texas",
  githubLink: "https://github.com/alex",
  linkedinLink: "",
  siteUrl: "https://alex.example/",
};
const url = "https://alex.example";

it("prefers Netlify's URL, then the profile's siteUrl", () => {
  expect(siteUrl(profile, { URL: "https://site.netlify.app" })).toBe(
    "https://site.netlify.app",
  );
  expect(siteUrl(profile, {})).toBe(url);
});

it("builds the title, description, preview tags and JSON-LD", () => {
  const tags = headTags(profile, url);
  const meta = (key: string) =>
    tags.find((t) => t.attrs?.name === key || t.attrs?.property === key)?.attrs
      ?.content;
  expect(tags[0]).toEqual({
    tag: "title",
    children: "Alex Rivera · Frontend Engineer",
  });
  expect(meta("description")).toBe(profile.bio);
  expect(meta("og:title")).toBe("Alex Rivera · Frontend Engineer");
  expect(meta("og:image")).toBe(`${url}/og-image.png`);
  expect(meta("twitter:card")).toBe("summary_large_image");
  expect(tags).toContainEqual({
    tag: "link",
    attrs: { rel: "canonical", href: `${url}/` },
  });

  const jsonLd = JSON.parse(
    tags.find((t) => t.attrs?.type === "application/ld+json")!.children!,
  );
  expect(jsonLd).toMatchObject({
    "@type": "Person",
    name: "Alex Rivera",
    jobTitle: "Frontend Engineer",
    address: { addressLocality: "Austin, Texas" },
    sameAs: ["https://github.com/alex"],
  });
});

it("keeps profile text from breaking out of the JSON-LD script", () => {
  const tags = headTags({ ...profile, bio: "</script><b>hi" }, url);
  const jsonLd = tags.find((t) => t.tag === "script")!.children!;
  expect(jsonLd).not.toContain("</script>");
});

it("lists both pages in the sitemap and points robots.txt at it", () => {
  expect(sitemapXml(url)).toContain(`<loc>${url}/</loc>`);
  expect(sitemapXml(url)).toContain(`<loc>${url}/contact</loc>`);
  expect(robotsTxt(url)).toContain(`Sitemap: ${url}/sitemap.xml`);
});

it("draws the initials and escapes text in the images", () => {
  expect(faviconSvg(profile)).toContain(">AR</text>");
  const og = ogImageSvg({ ...profile, title: "R&D <Lead>" }, url);
  expect(og).toContain("R&amp;D &lt;Lead&gt;");
  expect(og).toContain('width="1200" height="630"');
});
