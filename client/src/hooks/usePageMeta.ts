import { useEffect } from "react";

const SITE_NAME = "GoTravel Asia";
const BASE_URL = "https://gotravel-asia.vercel.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-default.webp`;

interface PageMeta {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string;
}

function setMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export function usePageMeta({ title, description, path, ogImage, keywords }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    setMeta("name", "description", description);

    if (keywords) {
      setMeta("name", "keywords", keywords);
    }

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", ogImage || DEFAULT_OG_IMAGE);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage || DEFAULT_OG_IMAGE);

    if (path) {
      const canonical = `${BASE_URL}${path}`;
      setCanonical(canonical);
      setMeta("property", "og:url", canonical);
    }

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, path, ogImage, keywords]);
}
