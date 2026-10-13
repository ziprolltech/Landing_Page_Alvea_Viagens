# SEO técnico

O que o site entrega aos buscadores e onde alterar cada coisa. Ter isso certo permite que o Google leia e entenda o site; **não garante** posição nem prazo de indexação.

## Domínio canônico

`https://www.alveaviagens.com.br`

É o endereço que responde com as páginas. `alveaviagens.com.br` (sem `www`) redireciona para ele — pode continuar sendo divulgado normalmente. O valor fica em uma linha só: `SITE_URL` em `src/lib/config/site.ts`. Se algum dia o redirecionamento for invertido na Vercel, é só essa linha que muda.

## Páginas

| Página | Indexável | No sitemap | Título ao compartilhar |
|---|---|---|---|
| `/` | sim | sim | Alvea Viagens — Transformamos milhas em experiências inesquecíveis |
| `/destinos` | sim | sim | Destinos \| Alvea Viagens |
| `/milhas` | sim | sim | Milhas \| Alvea Viagens |
| `/grupo-de-ofertas` | sim | sim | Grupo de Ofertas \| Alvea Viagens |
| `/experiencias` | sim | sim | ALVEA JOURNEY — Uma viagem antes da viagem |
| `/atendimento` | sim | sim | Atendimento \| Alvea Viagens |
| `/passagens` | **não** (`noindex`) | não | Passagens \| Alvea Viagens |
| página 404 | não (automático) | não | — |

`/passagens` está fora do menu e do rodapé; por isso fica fora do Google. Para voltar a indexá-la: tire `index: false` de `src/app/passagens/layout.tsx` e acrescente a rota em `INDEXABLE_ROUTES` (`src/lib/config/site.ts`).

## Título da aba

A aba do navegador mostra exatamente `Alvea Viagens` em todas as páginas. Nenhuma página define título próprio — a função `pageMetadata()` nem aceita esse campo. O que muda por página é a **descrição**, a **URL canônica** e o **título de compartilhamento** (`og:title`), que só aparece quando o link é colado em WhatsApp, Instagram, etc.

Consequência a conhecer: no resultado do Google, todas as páginas aparecem com o mesmo título, "Alvea Viagens". O Google às vezes reescreve o título usando o `h1` da página, mas isso é decisão dele.

## Onde alterar

| O quê | Arquivo |
|---|---|
| Domínio, nome, e-mail, Instagram, CNPJ, lista do sitemap | `src/lib/config/site.ts` |
| Descrição e título de compartilhamento da página inicial | `src/app/layout.tsx` |
| Idem para `/destinos`, `/milhas`, `/atendimento`, `/passagens` | `src/app/<rota>/layout.tsx` |
| Idem para `/experiencias`, `/grupo-de-ofertas` | `src/app/<rota>/page.tsx` |
| Conjunto de metadados gerado para cada página | `src/lib/seo/page-metadata.ts` |
| `robots.txt` | `src/app/robots.ts` |
| `sitemap.xml` | `src/app/sitemap.ts` |
| Dados estruturados | `src/components/seo/JsonLd.tsx` |
| Imagem de compartilhamento e ícones | `scripts/build-brand-images.mjs` |

## robots.txt e sitemap

- `https://www.alveaviagens.com.br/robots.txt` — libera todas as páginas, bloqueia só `/api/` e aponta para o sitemap. Os arquivos de script e estilo (`/_next/`) não são bloqueados: o Google precisa deles para desenhar a página.
- `https://www.alveaviagens.com.br/sitemap.xml` — as seis páginas indexáveis, sempre com o domínio canônico.

Para incluir uma página nova no sitemap, acrescente-a em `INDEXABLE_ROUTES`.

## Compartilhamento (Open Graph e Twitter Card)

Toda página tem `og:title`, `og:description`, `og:url`, `og:image`, `og:locale` (`pt_BR`) e Twitter Card do tipo imagem grande. A imagem é `public/og-image.png` (1200×630): o logo sobre o gradiente do site.

WhatsApp, Instagram e Facebook guardam a prévia de um link por dias. Para forçar a atualização no Facebook/Instagram, use o Sharing Debugger da Meta (`developers.facebook.com/tools/debug`). No WhatsApp não há ferramenta: a prévia nova aparece quando o cache expira.

## Dados estruturados (JSON-LD)

Um bloco só, no layout raiz, com dois itens:

- `TravelAgency` — nome, endereço do site, descrição, logo, imagem, e-mail, telefone (o WhatsApp), CNPJ (`taxID`), área atendida (Brasil), Instagram e ponto de contato.
- `WebSite` — nome, endereço e idioma.

Só entram dados que o próprio site já exibe. **Não** há endereço físico, horário, preços, nota ou quantidade de avaliações: nada disso foi publicado de forma verificável, e o Google penaliza dados estruturados inventados. Se a agência passar a ter endereço de atendimento ou avaliações reais em uma plataforma, dá para acrescentar.

Para validar depois do deploy: `https://search.google.com/test/rich-results` e `https://validator.schema.org`, informando o endereço da página inicial.

## Ícones

Gerados a partir de `public/favicon-alvea.png` (a arte não mudou; o original, de 1,5 MB, continua no projeto e não é mais baixado pelos visitantes):

- `public/favicon.ico` e `public/icons/icon-48.png` — aba do navegador e resultado do Google
- `public/icons/icon-192.png` — Android
- `public/icons/apple-touch-icon.png` — iPhone
- `public/icons/icon-512.png` — logo nos dados estruturados

Se a arte mudar, substitua `public/favicon-alvea.png` e rode `node scripts/build-brand-images.mjs`. O ícone no resultado do Google pode levar dias ou semanas para atualizar.

## Como conferir

Depois de cada deploy, no navegador:

1. `https://www.alveaviagens.com.br/robots.txt` e `/sitemap.xml` abrem.
2. Em qualquer página, botão direito → "Exibir código-fonte" e procurar `rel="canonical"`: o endereço deve ser o da própria página com `www`.
3. Colar o link de uma página em uma conversa do WhatsApp: deve aparecer a imagem com o logo (se aparecer a prévia antiga, é o cache).

## Oportunidades de conteúdo (não implementadas)

Mudanças de texto ou páginas novas ficam para decisão sua:

- **Páginas por destino.** Hoje os 29 destinos são cartões dentro de `/destinos`; nenhum tem endereço próprio, então o site não aparece para buscas como "passagem para Paris com milhas". Páginas próprias, com texto real sobre cada destino, são a maior oportunidade de busca — desde que o conteúdo seja útil e diferente em cada uma.
- **Texto explicativo sobre milhas.** `/milhas` descreve os serviços em poucas linhas. Perguntas e respostas reais (como funciona a venda, prazos, programas aceitos) ajudam tanto o visitante quanto a busca.
- **Título por página.** Se a regra do título fixo for revista, títulos como "Destinos | Alvea Viagens" melhoram a taxa de clique no Google.
- **Perfil da Empresa no Google.** Se houver atendimento presencial ou área de atendimento definida, o cadastro gratuito no Google Business Profile é o que faz a agência aparecer em buscas locais e no Maps.
