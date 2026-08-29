# andreyrosa.dev

Meu site pessoal e portfólio, disponível em português e inglês.

## O que tem no site

### Currículo

Uma página de currículo (`/resume`) e um PDF baixável (`/resume/pdf`) prontos para leitores automáticos de vagas (ATS): layout simples, em coluna única, fácil de ler tanto por humanos quanto por sistemas de recrutamento.

### Blog

Posts escritos em Markdown, sem enrolação — cada post é só um texto.

### Projetos

Uma vitrine dos projetos que já construí, com descrição, tecnologias usadas e, em alguns casos, um estudo de caso mais detalhado explicando o processo por trás.

### Um terminal de verdade flutuando na tela

O primeiro elemento que aparece na home não é um hero estático — é um **terminal simulado** que faz boot na sua frente, digita `whoami` sozinho e mostra minhas informações como se fosse a saída de um comando real. Depois disso, ele continua ali, aberto, esperando você digitar algo:

```
visitante@andrey:~$ whoami
nome     Andrey Adriano da Rosa
cargo    Desenvolvedor de software
status   ● Disponível para novas oportunidades

visitante@andrey:~$ ls
about.txt  blog/  contact/  projects/  resume/  skills.txt

visitante@andrey:~$ cd projects && open readme.link
```

Ele suporta comandos como `ls`, `cd`, `cat`, `open`, histórico com as setas, autocomplete com Tab e `clear` — se comporta como um shell de verdade, inclusive nos detalhes, como erros de "comando não encontrado".

### ...e um Explorador de Arquivos pra quem prefere clicar

O mesmo "sistema de arquivos" simulado pelo terminal também pode ser navegado visualmente, numa janela com ícones, breadcrumb e preview de texto e imagem — pra quem prefere clicar a digitar.

### Janelas de verdade

Terminal e Explorador de Arquivos são janelas de verdade: dá pra arrastar, redimensionar, minimizar, maximizar e alternar entre elas por uma barra de tarefas — como num sistema operacional em miniatura dentro da página.

### Tema

Site com tema escuro por padrão, com opção de trocar para o claro a qualquer momento.

---

Quer rodar o projeto localmente ou contribuir? Veja **[DEVELOPMENT.md](DEVELOPMENT.md)**.
