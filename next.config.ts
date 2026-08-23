import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// mdxRs: true usa o compilador MDX em Rust embutido no SWC do Next.js —
// nativo do Turbopack (usado por `next dev` por padrão). Frontmatter em
// YAML (gray-matter/remark-frontmatter) exigiria o pipeline em JS
// (@mdx-js/loader), que não roda sob Turbopack: as opções de loader
// precisam ser serializáveis, e plugins remark são funções. Por isso os
// posts usam `export const metadata = {...}` dentro do próprio .mdx — o
// padrão que a própria documentação do Next.js recomenda para o App
// Router.
const withMDX = createMDX({});

const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    mdxRs: true,
    // O layout raiz "de verdade" do site (app/[lang]/layout.tsx) usa um
    // segmento dinâmico no topo — não dá pra compor um not-found.tsx normal
    // porque o layout que ele deveria herdar é justamente o que falhou em
    // resolver `lang`. globalNotFound é o mecanismo do próprio Next.js pra
    // esse caso (ver app/global-not-found.tsx).
    globalNotFound: true,
  },
  images: {
    // output: 'export' não tem servidor pra otimizar imagem sob demanda —
    // sem isso, next/image aponta pra /_next/image?... (rota que não
    // existe em export estático) e a foto quebra.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
};

export default withMDX(nextConfig);
