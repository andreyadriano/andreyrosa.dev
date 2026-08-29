// src/components/ProjectCard/Links.tsx
//
// Botões de link externo (repositório, demo, artigo...) de um projeto —
// extraído de ProjectCard.tsx pra ser reaproveitado também no cabeçalho da
// página de estudo de caso (/[lang]/projects/[slug]).

import { ExternalLink } from "lucide-react";
import { GithubIcon, GITHUB_LINK_CLASSNAME } from "@/components/icons";
import type { ProjectLink } from "@/types";

export function ProjectLinks({ links }: { links: ProjectLink[] }) {
  return (
    <>
      {links.map((link) => {
        const isGithub = link.icon === "github";
        const LinkIcon = isGithub ? GithubIcon : ExternalLink;
        const className = isGithub
          ? GITHUB_LINK_CLASSNAME
          : link.variant === "primary"
            ? "bg-accent text-accent-fg hover:bg-accent-hover border-accent"
            : "border-border hover:border-border-strong";
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${className}`}
          >
            <LinkIcon size={13} strokeWidth={1.75} />
            {link.label}
          </a>
        );
      })}
    </>
  );
}
