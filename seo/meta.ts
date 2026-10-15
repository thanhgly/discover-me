// Builds the head tags and static SEO files from the profile. Pure, so it's unit-tested.

export type SeoProfile = {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  location?: string;
  githubLink?: string;
  linkedinLink?: string;
  siteUrl?: string;
};

export type HeadTag = {
  tag: string;
  attrs?: Record<string, string>;
  children?: string;
};

// Same as --color-accent (oklch(0.85 0.21 128)) in src/style.css.
export const ACCENT = "#a5e62c";
export const BACKGROUND = "#09090b";
export const OG_IMAGE = { path: "og-image.png", width: 1200, height: 630 };
export const PAGES = ["/", "/contact"];

const escapeXml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );

// Netlify sets URL at build time; otherwise use the profile's siteUrl.
export function siteUrl(
  profile: SeoProfile,
  env: Record<string, string | undefined>,
): string {
  const url = env.URL || profile.siteUrl || "http://localhost:5173";
  return url.replace(/\/+$/, "");
}

export const fullName = (p: SeoProfile) => `${p.firstName} ${p.lastName}`;
export const pageTitle = (p: SeoProfile) => `${fullName(p)} · ${p.title}`;

export function headTags(profile: SeoProfile, url: string): HeadTag[] {
  const title = pageTitle(profile);
  const description = profile.bio;
  const image = `${url}/${OG_IMAGE.path}`;
  const imageAlt = `${fullName(profile)}, ${profile.title}`;
  const meta = (key: "name" | "property", name: string, content: string) => ({
    tag: "meta",
    attrs: { [key]: name, content },
  });
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName(profile),
    jobTitle: profile.title,
    description,
    url: `${url}/`,
    image,
    ...(profile.location && {
      address: { "@type": "PostalAddress", addressLocality: profile.location },
    }),
    sameAs: [profile.githubLink, profile.linkedinLink].filter(Boolean),
  };
  return [
    { tag: "title", children: escapeXml(title) },
    meta("name", "description", description),
    { tag: "link", attrs: { rel: "canonical", href: `${url}/` } },
    {
      tag: "link",
      attrs: { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    },
    meta("property", "og:type", "profile"),
    meta("property", "og:site_name", fullName(profile)),
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    meta("property", "og:url", `${url}/`),
    meta("property", "og:image", image),
    meta("property", "og:image:width", String(OG_IMAGE.width)),
    meta("property", "og:image:height", String(OG_IMAGE.height)),
    meta("property", "og:image:alt", imageAlt),
    meta("property", "profile:first_name", profile.firstName),
    meta("property", "profile:last_name", profile.lastName),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", title),
    meta("name", "twitter:description", description),
    meta("name", "twitter:image", image),
    meta("name", "twitter:image:alt", imageAlt),
    {
      tag: "script",
      attrs: { type: "application/ld+json" },
      // Escape "<" so profile text can't close the script tag.
      children: JSON.stringify(person).replace(/</g, "\\u003c"),
    },
  ];
}

export const robotsTxt = (url: string) =>
  `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`;

export const sitemapXml = (url: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((page) => `  <url><loc>${escapeXml(url + page)}</loc></url>`).join("\n")}
</urlset>
`;

const initials = (p: SeoProfile) =>
  escapeXml(`${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase());

export const faviconSvg = (profile: SeoProfile) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${BACKGROUND}"/>
  <text x="32" y="33" fill="${ACCENT}" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="800" text-anchor="middle" dominant-baseline="central">${initials(profile)}</text>
</svg>
`;

// Shrinks long text so it fits on one line (Inter averages ~0.6em per character).
const fit = (text: string, max: number, width: number, em = 0.6) =>
  Math.min(max, Math.floor(width / (Math.max(text.length, 1) * em)));

// The 1200x630 link preview, rendered to PNG at build time.
export function ogImageSvg(profile: SeoProfile, url: string): string {
  const { width, height } = OG_IMAGE;
  const inner = width - 160;
  const name = fullName(profile);
  const nameSize = fit(name, 110, inner, 0.62);
  const titleSize = fit(profile.title, 52, inner, 0.56);
  const host = url.replace(/^https?:\/\//, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="0.9" cy="0" r="0.8">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${BACKGROUND}"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect x="80" y="80" width="88" height="88" rx="22" fill="${ACCENT}" fill-opacity="0.15"/>
  <text x="124" y="138" fill="${ACCENT}" font-family="Inter" font-weight="800" font-size="40" text-anchor="middle">${initials(profile)}</text>
  <text x="80" y="${height - 250}" fill="#fafafa" font-family="Inter" font-weight="800" font-size="${nameSize}">${escapeXml(name)}</text>
  <text x="80" y="${height - 170}" fill="${ACCENT}" font-family="Inter" font-weight="600" font-size="${titleSize}">${escapeXml(profile.title)}</text>
  <text x="80" y="${height - 80}" fill="#a1a1aa" font-family="Inter" font-weight="600" font-size="28">${escapeXml(host)} · Chat with my AI assistant</text>
</svg>
`;
}
