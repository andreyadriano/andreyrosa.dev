<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guide for AI agents

Site pessoal/portfólio (Next.js App Router, `src/` dir). Este arquivo documenta como o projeto funciona e as decisões de
arquitetura — leia antes de mexer em conteúdo, i18n, tema ou no pipeline de blog/currículo.

## Estrutura de rotas

Tudo fica sob `src/app/[lang]/` — `lang` é `"pt" | "en"` (ver `src/i18n/config.ts`). Não existe detecção de idioma via
`Accept-Language`; o padrão é sempre `/pt`.

**O redirect de `/` pra `/pt` é feito por `public/_redirects` (301, sintaxe do Cloudflare Pages), não por
`src/app/page.tsx`.** `page.tsx` ainda existe e chama `redirect("/pt")`, mas sob `output: 'export'` isso não vira um
HTTP redirect de verdade — vira uma página HTML quase vazia (`<html id="__next_error__">`, sem `<title>`, sem
`<meta description>`, corpo oculto) que só redireciona depois que o JS do Next carrega e executa no cliente. Isso já
causou um problema real: o Google não conseguia associar o favicon à raiz do domínio porque a página que ele indexava
ali não tinha praticamente nenhum sinal de conteúdo. `public/_redirects` intercepta `/` na borda do Cloudflare antes
de qualquer HTML ser servido, então esse `index.html` fantasma nunca chega a ser visto em produção — mas se algum dia
o deploy sair do Cloudflare Pages (outro host estático sem suporte a `_redirects`), esse problema volta, e `page.tsx`
sozinho não é suficiente pra resolver.

**`output: 'export'` está ativo** (`next.config.ts`, desde o commit "prepare for cloudflare pages") — o site deploya
como HTML/CSS/JS 100% estático no Cloudflare Pages, sem servidor Node em produção. Isso já foi documentado aqui como
"não roda com export" numa versão anterior deste arquivo — **estava desatualizado**, não confie em comentários antigos
sobre isso. Na prática, export estático muda o que uma Route Handler pode fazer: só verbo `GET`, sem depender de
`Request` (headers/cookies/query), e ela vira um arquivo estático gerado em build time — é assim que o PDF do
currículo funciona (`src/app/[lang]/resume/pdf/route.ts`, `runtime = "nodejs"` só importa pro build, não pra
produção) e é assim que `sitemap.ts`/`robots.ts`/`opengraph-image.tsx` funcionam também (todos exigem
`export const dynamic = "force-static"` quando o Next não consegue inferir isso sozinho — sem essa linha o build
falha com um erro claro apontando pra isso). Qualquer Route Handler nova precisa seguir essa mesma regra: se ela lê
`params`/dado estático e devolve sempre o mesmo resultado por combinação de parâmetros, ok; se depende de
`request.headers`/cookies/query string, não funciona sob export estático.

Rotas atuais: `/[lang]`, `/[lang]/projects`, `/[lang]/blog`, `/[lang]/blog/[slug]`, `/[lang]/resume`,
`/[lang]/resume/pdf`. Fora de `[lang]`: `/sitemap.xml`, `/robots.txt` (raiz, porque precisam listar as duas versões de
idioma de uma vez) e `/global-not-found.tsx` (404 de qualquer URL que não bate com nenhuma rota — ver seção de SEO
abaixo pro porquê de não ser um `not-found.tsx` comum).

## Design tokens — nunca hardcode cor

Todas as cores vêm de variáveis CSS em `src/app/globals.css` (`--bg`, `--fg`, `--accent`, `--accent-2`, `--border`,
etc.), expostas como utilitários Tailwind (`bg-bg`, `text-fg`, `border-border`, `text-accent`...). **Nunca** use hex/rgb
direto ou classes de paleta padrão do Tailwind (`amber-400`, `white/10`) em componentes — sempre os tokens semânticos.
Exceções pontuais e intencionais: cores de marca de terceiros (ex.: azul do LinkedIn `#0a66c2` no botão social) e o PDF
do currículo, que usa sua própria paleta em `src/components/pdf/ResumeDocument.tsx` (react-pdf não lê CSS).

Tema dark é o padrão fixo, independente do SO (`prefers-color-scheme` não é usado de propósito).
`:root[data-theme="light"]` define o par claro. Troca de tema: `src/components/ThemeToggle.tsx` grava em `localStorage`;
um script inline em `src/app/layout.tsx` aplica o tema salvo antes do primeiro paint (evita flash).

Fontes: IBM Plex Mono (`--font-mono`, usada em quase toda a UI — títulos, labels, botões) e IBM Plex Sans
(`--font-sans`, corpo de texto), carregadas via `next/font/google` em `src/app/layout.tsx`.

## i18n

`src/i18n/locales/{pt,en}.json` — dicionários planos, tipados a partir do `pt.json` (source of truth) em
`src/i18n/config.ts`. `getDictionary(lang)` faz dynamic import do JSON certo. Toda string de UI vem do dicionário —
nunca texto fixo em um idioma só.

`LangSwitcher` (`src/components/LangSwitcher.tsx`) troca `/pt/...` ↔ `/en/...` trocando o segmento no `pathname` atual —
funciona quando a URL é idêntica nos dois idiomas. Quando **não é** (ex.: slug de post traduzido é diferente), a página
deve registrar o caminho certo via `LangAlternateContext`/`SetLangAlternate` (ver `src/app/[lang]/blog/[slug]/page.tsx`
pro padrão) — sem isso, trocar de idioma num post gera 404.

## Conteúdo: projetos

`src/data/projects.ts` — `Record<Lang, Project[]>` estático (mock data, não vem de arquivo/CMS). Cada `Project` tem
`slug` (mesmo valor em pt e en — é o mesmo projeto, só o texto muda), `date` e `featured: boolean`.
`getFeaturedProjects(lang, limit)` filtra `featured`, ordena por `date` desc e corta — é isso que a home usa pra
"Projetos em destaque". `/projects` lista o array inteiro sem filtro. Ver README.md pra instruções de uso; a regra de
arquitetura é: **nunca hardcode a seleção de "quais projetos aparecem na home"** — sempre via `getFeaturedProjects`.

**Estudo de caso opcional por projeto** (`/[lang]/projects/[slug]`, `src/app/[lang]/projects/[slug]/page.tsx`) —
mesmo mecanismo de import dinâmico do blog, mas mais simples: o `.mdx` em `src/content/projects/{lang}/{slug}.mdx`
é só o corpo do texto, sem `export const metadata` (título/tags/links/capa já vêm do `Project` correspondente em
`data/projects.ts`, encontrado pelo mesmo `slug`). `src/lib/projects.ts` espelha `src/lib/blog.ts`
(`hasCaseStudy`/`getCaseStudySlugs`/`getCaseStudyReadingTime`, tudo `fs`-based). Pra adicionar um estudo de caso:
crie o `.mdx` com o `slug` já cadastrado — nenhum código muda, e o link "Estudo de caso" aparece sozinho no
`ProjectCard` (`hasCaseStudy` checado ali). Como é opcional por idioma, um projeto pode ter estudo de caso só em
pt (ou só em en) sem quebrar nada — a página só existe pros pares `(lang, slug)` onde o arquivo existe de verdade
(`generateStaticParams`), e o hreflang da outra versão só é declarado se ela também existir (mesma regra que
`blog/[slug]` já usa pra não apontar pra um slug que não existe no outro idioma).

**Cuidado ao adicionar imagens dentro de um `.mdx`** (`![alt](...)`) — MDX sempre embrulha uma imagem solo num
`<p>`, e o mapeamento de `img` em `src/mdx-components.tsx` renderiza um `<figure>` (elemento de bloco), que não pode
ficar dentro de `<p>` (quebra a hidratação). Por isso o mapeamento de `p` em `mdx-components.tsx` detecta quando o
único filho é uma imagem e pula o `<p>` nesse caso — se mexer nesse arquivo, não remova essa checagem sem entender
o porquê.

## Conteúdo: blog

Pipeline real de Markdown/MDX, **sem CMS nem banco de dados** — cada post é `src/content/blog/{lang}/{slug}.mdx`,
versionado no git. `src/lib/blog.ts` expõe `getAllPosts`, `getPostSlugs`, `getReadingTime` (lê os arquivos com `fs`,
calcula tempo de leitura por contagem de palavras).

**Decisão importante**: os metadados do post (`title`, `summary`, `date`, `translations`) são exportados como objeto JS
dentro do próprio `.mdx` (`export const metadata = {...}`) — **não** frontmatter YAML com `---`. Motivo: o compilador
MDX em Rust (`mdxRs: true`, ver `next.config.ts`) é o único caminho compatível com Turbopack (usado por `next dev` por
padrão); ele não aceita plugins remark/rehype (`remark-frontmatter` incluso), porque Turbopack exige que opções de
loader sejam serializáveis e um plugin é uma função JS. Isso já foi tentado e falhou — não reintroduza
`gray-matter`/`remark-frontmatter` sem antes resolver esse conflito (ou trocar Turbopack por webpack no `next dev`, o
que tem seu próprio custo).

A página de post (`/[lang]/blog/[slug]`) faz `import(`@/content/blog/${lang}/${slug}.mdx`)` dinamicamente — um único
import dá o componente compilado (`default`) e o `metadata`. `src/mdx-components.tsx` mapeia as tags HTML do Markdown
(h2, p, code, pre, a, blockquote...) pros tokens de cor/tipografia do site; é uma **convenção de nome e local exigida
pelo Next.js** (tem que ficar em `src/mdx-components.tsx` — não mova pra `lib/` ou outro lugar, o `@next/mdx` para de
encontrar).

## Currículo / PDF

`src/data/resume.json` é a fonte única. A página `/[lang]/resume` renderiza esse JSON na tela; a Route Handler
`/[lang]/resume/pdf` (`runtime = "nodejs"` só vale pro build — em produção é HTML estático, ver seção "Estrutura de
rotas") gera o PDF com `@react-pdf/renderer`, usando `src/components/pdf/ResumeDocument.tsx`, uma vez por idioma em
build time (`generateStaticParams`). Layout do PDF é pensado pra ser **ATS-friendly**: coluna única, sem tabelas, sem
texto dentro de imagem, skills/idiomas como texto corrido (não "chips" em `View`s separadas), `wrap={false}` em cada
seção/entrada pra nunca deixar um título de seção órfão numa quebra de página.

## SEO e indexação

Todas as peças de SEO derivam de fontes que já existem (`resume.json`, `getPostSlugs()`) — nada de texto/dado
duplicado só pra metadata.

- **`metadataBase`** — `src/app/layout.tsx` define `https://andreyrosa.dev`; qualquer campo de metadata baseado em URL
  (canonical, OG image) em qualquer rota pode usar caminho relativo a partir daí.
- **Canonical + hreflang** — cada `generateMetadata` de página (`[lang]/layout.tsx`, `projects/page.tsx`,
  `blog/page.tsx`, `resume/page.tsx`, `blog/[slug]/page.tsx`) declara `alternates.canonical` +
  `alternates.languages`. Em `blog/[slug]`, o hreflang só é declarado se o post tiver uma tradução publicada de
  verdade (`metadata.translations` no `.mdx`) — mesma fonte que `SetLangAlternate` já usa pro seletor de idioma, pra
  nunca apontar pra um slug que não existe no outro idioma.
- **`opengraph-image.tsx`** (`src/app/[lang]/opengraph-image.tsx`) — convenção de arquivo do Next.js, gera a imagem de
  preview de link (LinkedIn/Slack/WhatsApp) via `ImageResponse` (`next/og`, motor Satori) a partir de
  `resume.json`. Mesma exceção de paleta do `ResumeDocument.tsx`: `ImageResponse` não lê `globals.css`, então usa hex
  literal do tema escuro. De propósito sem custom font (fica no sans padrão do Satori) pra não depender de `fetch` de
  rede durante o build estático.
- **`sitemap.ts`/`robots.ts`** (raiz de `app/`, não em `[lang]/`) — listam as duas versões de idioma de uma vez, por
  isso não ficam dentro do segmento `[lang]`. Sob `output: 'export'`, os dois precisam de
  `export const dynamic = "force-static"` explícito — sem essa linha o `next build` falha (mensagem de erro aponta
  exatamente pra isso).
- **JSON-LD `Person`** — `<script type="application/ld+json">` embutido em `[lang]/layout.tsx`, montado a partir de
  `resume.json` (nome, cargo, resumo, LinkedIn, GitHub, e-mail).
- **`global-not-found.tsx`** (`src/app/global-not-found.tsx`, com `experimental.globalNotFound: true` em
  `next.config.ts`) — 404 de qualquer URL que não bate com nenhuma rota, inclusive fora de `/pt/*` e `/en/*`. Um
  `not-found.tsx` comum não dá porque o layout raiz "de verdade" (`[lang]/layout.tsx`) usa um segmento dinâmico no
  topo — o `not-found.tsx` que ele herdaria é do layout que já falhou em resolver `lang`, então o próprio Next.js
  documenta esse convention especial pra esse caso. Por não ter `lang` resolvido, o texto é bilíngue lado a lado (nem
  todo mundo que cai lá tinha um idioma escolhido) e a página monta seu próprio `<html>/<body>` do zero, sem
  AuroraBackground/Footer/Taskbar (isso tudo vive em `[lang]/layout.tsx`).

## Componentes reutilizáveis

- `SectionLabel` — label de seção (ex.: "SOBRE MIM") usado em várias páginas.
- `ProjectCard` / `PostCard` — cards usados tanto na home quanto nas páginas de listagem (`/projects`, `/blog`);
  qualquer ajuste visual deve ir nesses componentes, não duplicado em página.
- `icons.tsx` — `GithubIcon`/`LinkedinIcon` (SVG inline; lucide-react removeu ícones de marca) e `GITHUB_LINK_CLASSNAME`
  (estilo de hover compartilhado entre o social do hero e o botão "Repositório" dos cards).
- `TopBar` — nav + `LangSwitcher` + `ThemeToggle`, renderizada uma vez em `src/app/[lang]/layout.tsx`, compartilhada por
  todas as rotas.

## Terminal e Explorador de Arquivos ("janelas" flutuantes)

Há dois "programas" flutuantes montados uma vez em `src/app/[lang]/layout.tsx`, presentes em todas as rotas: um Terminal
e um Explorador de Arquivos. A arquitetura é dividida em duas camadas pra permitir isso — e futuros programas — sem
duplicar a mecânica de janela:

- `src/components/window/` — sistema de janelas **genérico**, sem saber nada sobre terminal/explorador:
  `useWindow({id, title, icon, defaultSize, minSize?, defaultMode?})` (mode/posição/tamanho, arrastar, redimensionar por
  qualquer borda, minimizar/maximizar/fechar, persistência entre remounts de troca de idioma — `Map` module-level por
  `id`), `WindowFrame` (chrome: titlebar com os 3 botões coloridos + alças de redimensionar),
  `WindowManagerContext`/`Taskbar` (registro de programas abertos pra barra de tarefas mostrar um botão por programa).
  Qualquer novo "programa" chama `useWindow(...)` e renderiza `<WindowFrame>` — essa é a "interface" que todo programa
  implementa. `defaultMode` (default `"open"`) só vale na primeira montagem de verdade — o Explorador usa `"minimized"`
  pra não abrir sobreposto ao Terminal.
- `src/components/apps/Terminal/` — `useShell` (boot, digitação, log, histórico, autocomplete, comandos) + `index.tsx`
  (composição).
- `src/components/apps/FileExplorer/` — `useExplorer` (cwd + abrir um nó: pasta desce, imagem/texto mostra preview
  inline, link navega/abre aba) + `FileIcon` (ícone por tipo de nó) + `index.tsx` (composição: breadcrumb, botão
  "subir", grid de ícones ou preview).

Os dois navegam o **mesmo sistema de arquivos simulado** (`src/lib/vfs/`), construído a partir de arquivos de verdade em
disco, não de dados hardcoded — `buildFileSystem(lang)` é chamado uma vez em `layout.tsx` e passado como prop `fs` pra
ambos os apps. Tudo mora dentro de `public/vfs/` — precisa ser público mesmo pra imagem virar `<img src>` de verdade
(arquivo em `src/` não é servido por URL, só compilado). Não tem split entre pasta de conteúdo e pasta pública: é uma
pasta só.

- `public/vfs/{lang}/` — arquivos de texto (`.txt`) e "atalhos" (`.link`, cujo conteúdo é uma URL/rota), um por idioma.
  A estrutura de pastas aqui **é** a árvore que `ls`/`cd`/o Explorador percorrem — adicionar um arquivo novo (texto,
  link ou imagem) é só soltar ele na pasta certa, sem mexer em código (mesmo espírito do pipeline de blog).
- `public/vfs/assets/` — imagens compartilhadas entre os dois idiomas, mescladas na raiz da árvore por
  `buildFileSystem()`. Imagem específica de um idioma pode ir direto dentro de `public/vfs/{lang}/` também —
  `readTree()` reconhece os três tipos (texto/link/imagem) em qualquer pasta.
- No Terminal, `cd`/`ls` navegam só dentro dessa simulação (não saem da página); o comando `open <arquivo>` é quem
  decide navegar pra uma rota real (`.link` interno) ou abrir em nova aba (`.link` externo/imagem). No Explorador,
  clicar numa pasta desce, num arquivo de texto/imagem mostra preview inline na própria janela, num link aplica a mesma
  regra interno/externo do `open`.

## Verificação antes de considerar uma tarefa pronta

- `npx tsc --noEmit` e `npx eslint src` (ou `npx eslint <arquivos>`) sem erros.
- Testar rotas relevantes com `curl -o /dev/null -w "%{http_code}"` pros dois idiomas.
- Pra mudanças visuais, capturar screenshot com `google-chrome --headless --disable-gpu --no-sandbox --screenshot=...`
  (o projeto não tem Playwright/Puppeteer instalado) em vez de assumir que ficou certo.
- Reiniciar o `next dev` depois de mudar `next.config.ts` — mudanças de config não são hot-reloaded.

## Mantenha isto atualizado

Se uma decisão de arquitetura mudar (ex.: trocar o pipeline de MDX, mudar o gerador de PDF, adicionar um novo idioma),
atualize esta seção no mesmo PR/commit — este arquivo existe pra evitar que o próximo agente redescubra as mesmas
armadilhas.
