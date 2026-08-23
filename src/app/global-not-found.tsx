// src/app/global-not-found.tsx
//
// 404 pra qualquer URL que não bate com nenhuma rota — inclusive fora de
// /pt/* e /en/*. Convenção especial do Next.js (experimental.globalNotFound
// em next.config.ts) pra quando o layout raiz de conteúdo usa um segmento
// dinâmico no topo ([lang]): não dá pra compor um not-found.tsx normal
// porque ele herdaria de um layout que já falhou em resolver `lang`. Por
// isso este arquivo ignora inteiramente app/layout.tsx e monta seu próprio
// <html>/<body> — sem AuroraBackground, Footer ou Taskbar (todos vivem em
// [lang]/layout.tsx), só o essencial pra manter a identidade visual do site
// mesmo quando não sabemos em qual idioma a pessoa estava.
//
// Sem dicionário disponível aqui (não há `lang` resolvido), o texto é
// bilíngue lado a lado em vez de escolher um idioma — mesma lógica de
// app/page.tsx, que também roda fora de qualquer contexto de idioma.
//
// Cores em hex literal (não var(--token)): assim como em
// src/components/pdf/ResumeDocument.tsx, esta página não herda
// globals.css — precisa da própria paleta. Valores copiados dos tokens do
// tema escuro (que é o padrão fixo do site, independente do SO).

import Link from "next/link";
import { IBM_Plex_Mono } from "next/font/google";
import type { Metadata } from "next";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "404 — Andrey Adriano da Rosa",
  description: "Página não encontrada / Page not found",
};

export default function GlobalNotFound() {
  return (
    <html lang="pt" className={plexMono.className}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          background: "#05060d",
          color: "#e6e9e6",
        }}
      >
        <p style={{ margin: 0, color: "#67b667", fontSize: "0.85rem" }}>
          $ cat /requested/path
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 500 }}>
          404
        </h1>
        <p style={{ margin: 0, color: "#85908a", maxWidth: "32rem", lineHeight: 1.6 }}>
          Essa página não existe.
          <br />
          This page doesn&apos;t exist.
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <Link
            href="/pt"
            style={{
              border: "1px solid rgba(103,182,103,0.38)",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              color: "#67b667",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            ← Início
          </Link>
          <Link
            href="/en"
            style={{
              border: "1px solid rgba(103,182,103,0.38)",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              color: "#67b667",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            ← Home
          </Link>
        </div>
      </body>
    </html>
  );
}
