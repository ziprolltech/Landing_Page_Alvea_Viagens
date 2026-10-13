# Auditoria de preparação para divulgação — 2026-10-13

Diagnóstico feito antes de alterar o código, e o que foi feito com cada ponto. Guias de uso: [`seo.md`](seo.md), [`analytics.md`](analytics.md), [`search-console.md`](search-console.md), [`marketing-tracking.md`](marketing-tracking.md), [`monitoring.md`](monitoring.md), [`deployment.md`](deployment.md).

## Como foi verificado

| Tipo | O que |
|---|---|
| Leitura do código | Todas as rotas, layout raiz, componentes com links e formulários |
| Produção (antes das mudanças) | Requisições HTTP a `alveaviagens.com.br`, `www.alveaviagens.com.br` e `alvea-viagens.vercel.app`; Lighthouse (celular) na página inicial |
| Painel Vercel (somente leitura) | Projeto, domínios, último deploy |
| DNS público | Servidores de nomes e registros TXT de `alveaviagens.com.br` |
| Build local | `tsc`, `eslint`, `next build`; conferência do HTML gerado de todas as rotas |
| Navegador local controlado | Chrome sem interface contra o build local, com as requisições ao Google bloqueadas e `window.open` neutralizado |

Não foi verificado: nenhum painel do Google (Analytics, Search Console), nenhum celular real, o navegador interno do Instagram, e as variáveis de ambiente da Vercel (o acesso disponível não tem permissão para listá-las).

## Estrutura encontrada

- Next.js 15.5 (App Router), React 18, TypeScript, Tailwind 3.4. Todas as páginas são estáticas; a única rota dinâmica é `/api/flights/search`, que está desligada no site.
- Rotas: `/`, `/destinos`, `/milhas`, `/grupo-de-ofertas`, `/experiencias`, `/atendimento` (todas no menu) e `/passagens` (existe, mas nada aponta para ela).
- Domínio: `alveaviagens.com.br` redireciona (308) para **`https://www.alveaviagens.com.br`**, que é o endereço que responde. É esse o domínio canônico usado em tudo. `alvea-viagens.vercel.app` serve o mesmo conteúdo.
- DNS no Registro.br (`*.sec.dns.br`). Não há registro `google-site-verification`.

## O que já existia e foi mantido

- `lang="pt-BR"`, título fixo `Alvea Viagens`, descrição global e palavras-chave.
- Um único `h1` por página e hierarquia de títulos coerente.
- Textos alternativos nas imagens com conteúdo; imagens decorativas com `alt=""`.
- Imagens locais servidas por `next/image`; fotos dos destinos com carregamento adiado.
- Fonte Inter via `next/font` (sem requisição a terceiros, `display: swap`).
- HTTPS e HSTS pela Vercel.
- Links de WhatsApp, e-mail e Instagram funcionando; formulários que terminam no WhatsApp sem guardar nada.

## Problemas encontrados e o que foi feito

| # | Problema | Situação |
|---|---|---|
| 1 | `/robots.txt` respondia 404 | **Corrigido** — `src/app/robots.ts` |
| 2 | `/sitemap.xml` respondia 404 | **Corrigido** — `src/app/sitemap.ts` |
| 3 | Nenhuma página tinha URL canônica; sem `metadataBase` | **Corrigido** |
| 4 | `/destinos`, `/milhas`, `/atendimento` e `/passagens` repetiam a descrição da página inicial | **Corrigido** — descrição própria por página |
| 5 | Sem imagem de compartilhamento (`og:image`) e sem Twitter Card: links colados no WhatsApp/Instagram apareciam sem imagem | **Corrigido** — `public/og-image.png` |
| 6 | Sem dados estruturados | **Implementado** — `TravelAgency` + `WebSite` |
| 7 | Favicon de 1,5 MB (1254×1254) baixado em toda primeira visita; `/favicon.ico` respondia 404 | **Corrigido** — mesma arte em 48/192/180 px e `favicon.ico`; o arquivo original continua no projeto |
| 8 | `/passagens` indexável, sem link de entrada e com conteúdo sobreposto ao das outras páginas | **Corrigido** — `noindex` e fora do sitemap; continua acessível pelo endereço |
| 9 | Página 404 padrão, em inglês | **Corrigido** — `src/app/not-found.tsx` |
| 10 | Nenhuma ferramenta de medição instalada | **Implementado** — GA4 com consentimento; **falta o ID** |
| 11 | Nenhum evento de conversão | **Implementado** — ver `analytics.md` |
| 12 | Links de WhatsApp do formulário de Milhas levavam nome e telefone no próprio endereço do link, que a medição automática de cliques do GA4 registraria | **Corrigido** — o endereço do link não leva mais a mensagem |
| 13 | Sem cabeçalhos de segurança além do HSTS | **Corrigido** — quatro cabeçalhos básicos; sem CSP |
| 14 | Search Console não configurado | **Depende de você** — ver `search-console.md` |
| 15 | Sem convenção de links de campanha | **Documentado** — ver `marketing-tracking.md` |

## Pontos observados e deliberadamente não alterados

Ficam registrados para decisão sua; mexer neles mudaria texto, cor ou animação do site.

- **Números exibidos no site** ("4.9/5 Avaliação dos clientes", "98% Satisfação", "R$10M+ Milhas economizadas", "120+ destinos", "resposta em até 2 horas úteis"). Não foram usados nos dados estruturados nem nas descrições porque não há fonte que os comprove. Vale confirmar que são sustentáveis antes de anunciar: são afirmações publicitárias.
- **Contraste do rodapé**: os textos em branco a 40% e 25% ficam abaixo do contraste recomendado (único ponto que tira a nota de acessibilidade de 100). É uma escolha de cor do design.
- **Animação de entrada**: o título principal nasce invisível e só aparece depois que o JavaScript carrega. Em celulares lentos isso atrasa o maior elemento visível (LCP). Corrigir exige mudar a animação de entrada.
- **Vídeo de 44 MB** em `/grupo-de-ofertas`: só os metadados são carregados antes do play; quem aperta play em rede móvel baixa o arquivo inteiro. Comprimir ou hospedar em serviço de vídeo resolveria.
- **Sem política de privacidade**: o aviso de cookies funciona, mas o site não tem página explicando o tratamento de dados. Ver `analytics.md`, seção LGPD.
- **Links antigos de WhatsApp escritos direto nos arquivos** (rodapé, atendimento): funcionam e não foram tocados.

## Desempenho (página inicial, antes das mudanças)

Lighthouse 12, perfil celular com rede e CPU limitadas, uma execução contra a produção em 2026-10-13. É teste de laboratório: serve para comparar, não representa visitantes reais.

| Indicador | Antes |
|---|---|
| Desempenho | 68 |
| Acessibilidade | 96 |
| Boas práticas | 100 |
| SEO | 100 |
| Primeira pintura com conteúdo (FCP) | 1,9 s |
| Maior elemento visível (LCP) | 10,6 s |
| Tempo de bloqueio (TBT) | 40 ms |
| Deslocamento de layout (CLS) | 0 |
| Peso total da página | 1.986 KB, dos quais 1.482 KB eram o favicon |

A nota de SEO do Lighthouse já era 100 porque ele não confere sitemap, canonical nem imagem de compartilhamento. O resultado depois das mudanças está em `monitoring.md`.

Não foi feito teste de carga. As páginas são arquivos estáticos entregues pela rede da Vercel, o que normalmente suporta picos de acesso sem ação nossa, mas isso não foi medido; os limites do plano contratado estão em `monitoring.md`.
