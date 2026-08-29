// src/app/sitemap.ts
//
// Convenção de arquivo do Next.js — vira /sitemap.xml no build (Route
// Handler pré-renderizado sob output: 'export', igual ao PDF do currículo).
// Fica na raiz de app/ (não em [lang]/) porque precisa listar as URLs dos
// dois idiomas de uma vez, com caminho absoluto — não faz sentido por
// segmento de rota.

import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getPostSlugs } from "@/lib/blog";
import { getCaseStudySlugs } from "@/lib/projects";
import type { Lang } from "@/types";

const SITE_URL = "https://andreyrosa.dev";

// output: 'export' exige declarar explicitamente que essa rota é estática
// (sem isso, o Next não sabe se sitemap() depende de dado por request).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales as Lang[]) {
    entries.push(
      { url: `${SITE_URL}/${lang}`, changeFrequency: "monthly", priority: 1 },
      { url: `${SITE_URL}/${lang}/projects`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${SITE_URL}/${lang}/blog`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE_URL}/${lang}/resume`, changeFrequency: "monthly", priority: 0.6 },
    );

    for (const slug of getPostSlugs(lang)) {
      entries.push({
        url: `${SITE_URL}/${lang}/blog/${slug}`,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }

    for (const slug of getCaseStudySlugs(lang)) {
      entries.push({
        url: `${SITE_URL}/${lang}/projects/${slug}`,
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
