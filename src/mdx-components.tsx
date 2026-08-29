// src/mdx-components.tsx
//
// Convenção do @next/mdx (App Router): mapeia tags HTML gerados pelo
// Markdown/MDX para componentes estilizados com os tokens do site, em vez
// de depender do plugin de tipografia do Tailwind (não instalado).

import { isValidElement } from "react";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => (
      <h2
        className="font-mono text-2xl text-fg mt-10 mb-4 first:mt-0"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="font-mono text-xl text-fg mt-8 mb-3 first:mt-0"
        {...props}
      />
    ),
    // MDX sempre envolve uma imagem solo (![]()) num <p> — <figure> (bloco)
    // dentro de <p> é HTML inválido e quebra a hidratação. Quando o único
    // filho do parágrafo é uma imagem, renderiza como <figure> em vez de
    // <p> (o componente `img` abaixo assume que nunca fica dentro de um
    // <p> de verdade).
    p: ({ children, ...props }) => {
      if (isValidElement(children) && (children.props as { src?: string })?.src) {
        return <>{children}</>;
      }
      return (
        <p className="text-fg-subtle leading-relaxed mb-5" {...props}>
          {children}
        </p>
      );
    },
    a: (props) => (
      <a
        className="text-accent-2 hover:text-accent-2-hover underline underline-offset-4 decoration-accent-2/40 transition-colors"
        {...props}
      />
    ),
    ul: (props) => (
      <ul
        className="list-disc pl-6 space-y-2 text-fg-subtle mb-5"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="list-decimal pl-6 space-y-2 text-fg-subtle mb-5"
        {...props}
      />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    strong: (props) => (
      <strong className="text-fg font-semibold" {...props} />
    ),
    em: (props) => <em className="italic" {...props} />,
    code: (props) => (
      <code
        className="font-mono text-[0.85em] text-accent-2 bg-surface border border-border rounded px-1.5 py-0.5"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="font-mono text-sm bg-surface border border-border rounded-lg p-4 overflow-x-auto mb-5 [&>code]:bg-transparent [&>code]:border-0 [&>code]:p-0"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="border-l-2 border-accent/50 pl-4 text-fg-muted italic mb-5"
        {...props}
      />
    ),
    hr: () => <hr className="border-border my-10" />,
    // markdown ![]() não carrega largura/altura, então next/image (que
    // exige as duas ou fill) não serve aqui; unoptimized:true no
    // next.config.ts (export estático) já tira o ganho de otimização que
    // seria o motivo de usá-lo. alt vem sempre do próprio ![alt](src) do
    // markdown, só o eslint não consegue provar isso estaticamente.
    img: (props) => (
      <figure className="my-6">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          className="w-full h-auto rounded-lg border border-border"
          {...props}
        />
        {props.alt && (
          <figcaption className="mt-2 font-mono text-xs text-fg-muted text-center">
            {props.alt}
          </figcaption>
        )}
      </figure>
    ),
    ...components,
  };
}
