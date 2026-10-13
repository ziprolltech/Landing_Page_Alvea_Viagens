# Google Search Console

Mostra como o site aparece na busca do Google: quais pesquisas, quantos cliques, quais páginas estão indexadas e quais têm erro. É gratuito e não exige nada no código do site.

## Situação atual

**Não configurado.** Em 2026-10-13 o DNS de `alveaviagens.com.br` não tinha nenhum registro de verificação do Google, e não há registro de propriedade criada. A verificação depende de você: exige entrar na sua conta Google e no painel do Registro.br.

O site já está pronto do lado técnico: `robots.txt`, `sitemap.xml` e URLs canônicas estão publicados.

## 1. Criar e verificar a propriedade

Use uma **propriedade de domínio**. Ela cobre de uma vez `alveaviagens.com.br`, `www.alveaviagens.com.br`, http e https. A verificação é por DNS — e o DNS do domínio está no Registro.br.

1. Acesse `search.google.com/search-console` com a conta Google da empresa.
2. **Adicionar propriedade → Domínio** → digite `alveaviagens.com.br` (sem `https://`, sem `www`) → **Continuar**.
3. O Google mostra um registro **TXT** que começa com `google-site-verification=`. Copie o valor inteiro. Deixe essa tela aberta.
4. Em outra aba, entre em `registro.br` → **Domínios** → `alveaviagens.com.br` → **Configurar zona DNS** (ou "Editar zona") → **Nova entrada**:
   - Tipo: `TXT`
   - Nome: deixe em branco (o próprio domínio)
   - Valor: cole o texto copiado
   - Salve.
5. Aguarde de alguns minutos a algumas horas e clique em **Verificar** na tela do Google. Se falhar, espere mais e tente de novo — a tela continua disponível.

**Não apague esse registro TXT depois.** O Google confere periodicamente; sem ele a propriedade perde a verificação. E não mexa nos outros registros da zona: são eles que apontam o domínio para a Vercel.

Esse valor não é segredo, mas é único da sua conta — por isso não foi nem poderia ser gerado na implementação.

## 2. Enviar o sitemap

Com a propriedade verificada:

1. Menu **Indexação → Sitemaps**.
2. Em "Adicionar um novo sitemap", digite `https://www.alveaviagens.com.br/sitemap.xml` → **Enviar**.
3. O status deve ficar **"Processado"** com **6 páginas descobertas**. "Não foi possível buscar" nas primeiras horas costuma ser só atraso; se persistir por mais de um dia, abra o endereço do sitemap no navegador para conferir.

## 3. Pedir a indexação das páginas principais

Para cada um dos seis endereços do sitemap:

1. Cole o endereço completo na barra **"Inspecionar qualquer URL"**, no topo.
2. Se aparecer "O URL não está no Google", clique em **Solicitar indexação**.

Há um limite diário de pedidos, e o pedido só coloca a página na fila: a indexação costuma levar de alguns dias a algumas semanas e **não é garantida**. Não adianta pedir várias vezes a mesma página.

A mesma inspeção mostra, em **"Testar URL publicada"**, como o Google enxerga a página — útil para confirmar que o conteúdo aparece.

## 4. O que acompanhar

Os dados começam a aparecer alguns dias depois da verificação e chegam com cerca de dois dias de atraso.

| Relatório | O que olhar |
|---|---|
| **Desempenho → Resultados da pesquisa** | **Cliques** (visitas vindas do Google), **Impressões** (vezes em que o site apareceu), **CTR** e **Posição média**. A aba **Consultas** mostra as pesquisas; a aba **Páginas**, quais páginas aparecem |
| **Indexação → Páginas** | Quantas estão indexadas e o motivo das que não estão. O esperado é ver as 6 do sitemap indexadas e `/passagens` em "Excluída pela tag noindex" — isso é intencional. "Página com redirecionamento" para o endereço sem `www` também é normal |
| **Experiência → Core Web Vitals** | Velocidade medida em visitantes reais. Só aparece quando o site tem visitas suficientes; "dados insuficientes" no começo é normal |
| **Experiência → HTTPS** | Deve estar tudo em HTTPS |
| **Segurança e ações manuais** | Deve estar vazio. Qualquer aviso aqui é urgente |

Rotina sugerida: uma olhada por semana em **Desempenho** e **Indexação → Páginas**. O Search Console também avisa por e-mail quando encontra problema novo.

Sinais de atenção: queda brusca de páginas indexadas, páginas do sitemap em "Rastreada, mas não indexada" por semanas, ou erros 404/5xx em endereços que deveriam existir.

## 5. Vincular ao Google Analytics (opcional)

No Analytics: **Administrador → Vinculações de produtos → Vinculações do Search Console → Vincular**. As pesquisas do Google passam a aparecer também dentro do Analytics.

## O que não foi feito

Nenhuma etapa deste arquivo foi executada: a propriedade não foi criada, o sitemap não foi enviado e nenhuma indexação foi pedida. Tudo depende da verificação do passo 1.
