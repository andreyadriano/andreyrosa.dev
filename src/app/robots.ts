// src/app/robots.ts
//
// Convenção de arquivo do Next.js — vira /robots.txt no build (mesmo
// mecanismo de sitemap.ts: Route Handler pré-renderizado sob
// output: 'export'). Site inteiro é público, sem área logada nem rota que
// deva ficar fora do índice — só aponta pro sitemap.

import type { MetadataRoute } from "next";

// output: 'export' exige declarar explicitamente que essa rota é estática.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://andreyrosa.dev/sitemap.xml",
  };
}
