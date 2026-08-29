// src/components/ProjectCard/index.tsx

import Link from "next/link";
import { FileText } from "lucide-react";
import { ProjectCover } from "./Cover";
import { ProjectLinks } from "./Links";
import { StackIcon } from "./StackIcon";
import { hasCaseStudy } from "@/lib/projects";
import { getDictionary } from "@/i18n/config";
import type { Lang, Project } from "@/types";

export async function ProjectCard({ project, lang }: { project: Project; lang: Lang }) {
  const dict = await getDictionary(lang);
  const showCaseStudy = hasCaseStudy(lang, project.slug);
  const primaryLinks = project.links.filter((link) => link.variant === "primary");
  const secondaryLinks = project.links.filter((link) => link.variant !== "primary");

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 hover:border-accent/40 hover:bg-surface-hover transition-colors">
      <ProjectCover
        image={project.image}
        title={project.title}
        tags={project.tags}
        coverVariant={project.coverVariant}
        lang={lang}
      />
      <h3 className="mt-4 font-mono text-base text-fg line-clamp-2 min-h-[3rem]">
        {project.title}
      </h3>
      <p className="mt-2 text-sm text-fg-muted leading-relaxed line-clamp-3 min-h-[4.25rem]">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
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
      <div className="mt-auto flex flex-nowrap items-center gap-2 pt-4 border-t border-border overflow-x-auto">
        <ProjectLinks links={primaryLinks} />
        {showCaseStudy && (
          <Link
            href={`/${lang}/projects/${project.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium transition-colors border-accent/50 text-accent hover:bg-accent hover:text-accent-fg hover:border-accent"
          >
            <FileText size={13} strokeWidth={1.75} />
            {dict.projectsPage.caseStudy}
          </Link>
        )}
        <ProjectLinks links={secondaryLinks} />
      </div>
    </div>
  );
}
