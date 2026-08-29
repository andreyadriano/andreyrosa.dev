// src/lib/projects.ts
//
// Pipeline de estudo de caso dos projetos — mesmo espírito de
// src/lib/blog.ts, mas mais simples: o projeto em si (título, tags, links,
// capa) já vem de @/data/projects.ts, então o .mdx aqui não precisa de
// `export const metadata`, é só o corpo do texto. Um estudo de caso é
// totalmente opcional por projeto/idioma — sem o arquivo, o card
// simplesmente não mostra o link "Estudo de caso" (ver hasCaseStudy em
// ProjectCard). Pra adicionar um: crie
// src/content/projects/{lang}/{slug}.mdx com o mesmo `slug` já cadastrado
// em @/data/projects.ts — nenhum código muda.

import fs from "node:fs";
import path from "node:path";
import type { Lang } from "@/types";

const CASE_STUDIES_DIR = path.join(process.cwd(), "src/content/projects");
const WORDS_PER_MINUTE = 200;

function caseStudyDir(lang: Lang): string {
  return path.join(CASE_STUDIES_DIR, lang);
}

function caseStudyFile(lang: Lang, slug: string): string {
  return path.join(caseStudyDir(lang), `${slug}.mdx`);
}

export function hasCaseStudy(lang: Lang, slug: string): boolean {
  return fs.existsSync(caseStudyFile(lang, slug));
}

export function getCaseStudySlugs(lang: Lang): string[] {
  const dir = caseStudyDir(lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getCaseStudyReadingTime(lang: Lang, slug: string): number {
  const raw = fs.readFileSync(caseStudyFile(lang, slug), "utf8");
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
