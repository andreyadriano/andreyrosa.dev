// src/app/[lang]/projects/[slug]/page.tsx
//
// Estudo de caso de um projeto — mesmo padrão de
// src/app/[lang]/blog/[slug]/page.tsx (import dinâmico do .mdx, notFound()
// se não existir, generateStaticParams pra enumerar os arquivos sob
// output: 'export'). Diferença: o cabeçalho (título, tags, capa, links
// externos) vem de @/data/projects.ts, não do próprio .mdx — o projeto já
// tem essa informação em outro lugar, então o .mdx aqui é só o corpo do
// texto (ver src/lib/projects.ts pro porquê de não precisar de
// `export const metadata`).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCover } from "@/components/ProjectCard/Cover";
import { ProjectLinks } from "@/components/ProjectCard/Links";
import { StackIcon } from "@/components/ProjectCard/StackIcon";
import { SetLangAlternate } from "@/components/LangAlternateContext";
import { getDictionary, isValidLocale, locales } from "@/i18n/config";
import { projectsByLang } from "@/data/projects";
import { getCaseStudySlugs, getCaseStudyReadingTime, hasCaseStudy } from "@/lib/projects";
import type { Lang } from "@/types";

interface CaseStudyPageProps {
  params: Promise<{ lang: Lang; slug: string }>;
}

interface CaseStudyModule {
  default: React.ComponentType;
}

const READING_TIME_LABEL: Record<Lang, (minutes: number) => string> = {
  pt: (minutes) => `${minutes} min de leitura`,
  en: (minutes) => `${minutes} min read`,
};

async function loadCaseStudy(lang: Lang, slug: string): Promise<CaseStudyModule | null> {
  try {
    return (await import(`@/content/projects/${lang}/${slug}.mdx`)) as CaseStudyModule;
  } catch {
    return null;
  }
}

export default async function ProjectCaseStudyPage({ params }: CaseStudyPageProps) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const project = projectsByLang[lang].find((p) => p.slug === slug);
  const mod = project ? await loadCaseStudy(lang, slug) : null;

  if (!project || !mod) {
    notFound();
  }

  const { default: CaseStudyContent } = mod;
  const dateLocale = lang === "pt" ? "pt-BR" : "en-US";
  const otherLang = locales.find((l) => l !== lang);
  const alternatePath = otherLang
    ? hasCaseStudy(otherLang, slug)
      ? `/${otherLang}/projects/${slug}`
      : `/${otherLang}/projects`
    : null;

  return (
    <main className="text-fg min-h-screen">
      {alternatePath && <SetLangAlternate path={alternatePath} />}
      <article className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href={`/${lang}/projects`}
          className="font-mono text-sm text-accent-2 hover:text-accent-2-hover transition-colors"
        >
          {dict.projectsPage.back}
        </Link>

        <div className="mt-6">
          <ProjectCover
            image={project.image}
            title={project.title}
            tags={project.tags}
            coverVariant={project.coverVariant}
            lang={lang}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 font-mono text-xs text-fg-muted">
          <time>
            {new Date(project.date).toLocaleDateString(dateLocale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </time>
          <span aria-hidden="true">·</span>
          <span>{READING_TIME_LABEL[lang](getCaseStudyReadingTime(lang, slug))}</span>
        </div>

        <h1 className="mt-3 font-mono text-3xl md:text-4xl font-medium tracking-tight text-fg">
          {project.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium px-2 py-0.5 rounded border border-border text-accent-2"
            >
              <StackIcon tag={tag} />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ProjectLinks links={project.links} />
        </div>

        <div className="mt-10">
          <CaseStudyContent />
        </div>
      </article>
    </main>
  );
}

export async function generateStaticParams({
  params,
}: {
  params: { lang: string };
}) {
  if (!isValidLocale(params.lang)) return [];
  return getCaseStudySlugs(params.lang).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = projectsByLang[lang].find((p) => p.slug === slug);

  if (!project || !hasCaseStudy(lang, slug)) return {};

  const otherLang = locales.find((l) => l !== lang);

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `/${lang}/projects/${slug}`,
      ...(otherLang && hasCaseStudy(otherLang, slug)
        ? { languages: { [otherLang]: `/${otherLang}/projects/${slug}` } }
        : {}),
    },
  };
}
