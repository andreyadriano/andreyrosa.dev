// src/app/[lang]/opengraph-image.tsx
//
// Imagem de preview (Open Graph/Twitter Card) exibida quando o link do site
// é colado no LinkedIn, Slack, WhatsApp etc. — convenção de arquivo do
// Next.js: qualquer coisa em opengraph-image.(tsx|jsx) numa rota é
// detectada automaticamente e injetada como <meta property="og:image">,
// sem precisar declarar isso manualmente em generateMetadata.
//
// Roda via ImageResponse (Satori), que NÃO lê globals.css nem next/font —
// mesma razão de ResumeDocument.tsx ter sua própria paleta em hex literal
// em vez de var(--token): aqui também não tem outro jeito. Fonte fica no
// sans padrão do Satori (sem custom font) de propósito — evita depender de
// fetch de rede durante o build estático (Cloudflare Pages) só por uma
// imagem que a maioria das pessoas vê por 2 segundos numa prévia de link.
//
// generateStaticParams pŕoprio (igual ao de resume/pdf/route.ts): sob
// output: 'export', cada rota que gera output por parâmetro dinâmico
// precisa enumerar os valores que existem — não basta o generateStaticParams
// do layout ancestral.

import { ImageResponse } from "next/og";
import resumeData from "@/data/resume.json";
import { locales } from "@/i18n/config";
import type { Lang, ResumeData } from "@/types";

const resume = resumeData as ResumeData;

const BG = "#05060d";
const FG = "#e6e9e6";
const MUTED = "#85908a";
const ACCENT = "#67b667";
const BORDER = "rgba(103,182,103,0.3)";

export const alt = "Andrey Adriano da Rosa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return locales.map((lang: Lang) => ({ lang }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { name, role, summary } = resume[lang as Lang] ?? resume.pt;
  // whoami é comando, não texto de UI — nunca traduzido em nenhum outro
  // lugar do site (ver COMMANDS em Terminal/useShell.tsx), não devia ter
  // virado "quem-sou-eu" aqui também.
  const prompt = "$ whoami";
  // Só a primeira frase do resumo — o texto completo (2-3 frases) não cabe
  // com folga numa imagem de 630px de altura ao lado de nome + cargo.
  const tagline = summary.split(". ")[0] + ".";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          padding: "80px 96px",
          background: BG,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: ACCENT }}>
          {prompt}
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: FG }}>
          {name}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: ACCENT }}>
          {role}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            paddingTop: 24,
            borderTop: `1px solid ${BORDER}`,
            fontSize: 22,
            color: MUTED,
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
