# Google Analytics 4

## Situação atual

- **Propriedade:** criada. **ID da métrica: `G-PGVBY1GKMD`** (identificador público, não é segredo).
- **Código:** pronto e testado com esse ID (ver "O que foi testado").
- **Produção:** a medição só liga quando a variável `NEXT_PUBLIC_GA_MEASUREMENT_ID` existir na Vercel e houver um deploy feito depois dela. Em 2026-10-13 o site publicado **não** continha o ID: nenhum script do Google, nenhum cookie e nenhum aviso de cookies. Ou a variável ainda não foi criada, ou foi criada depois do último deploy.

O acesso usado na implementação não tem permissão para ler nem criar variáveis na Vercel (as duas tentativas foram recusadas), então esse passo é manual.

## Ligar em produção

1. Na Vercel: projeto `alvea-viagens` → **Settings → Environment Variables → Add**.
   - **Key:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value:** `G-PGVBY1GKMD`
   - **Environments:** marque **só Production** (desmarque Preview e Development).
   - Se a variável já existir, confira o valor e o ambiente em vez de criar outra.
2. **Deployments** → último deploy de produção → menu **⋯ → Redeploy**. O valor é gravado no site na hora do build: sem um deploy novo nada muda.
3. Valide pelos passos de "Validar que está funcionando".

Para desligar: apague a variável e faça Redeploy. O site volta a não carregar nada do Google e o aviso some.

### No painel do Google Analytics

- Em **Administrador → Coleta e modificação de dados → Fluxos de dados → o fluxo Web**, o endereço deve ser `https://www.alveaviagens.com.br`.
- **Medição otimizada** ligada (é o padrão), com **"Mudanças na página com base em eventos do histórico de navegação"** marcado: é esse item que conta as páginas quando o visitante navega pelo menu. O site não envia `page_view` por conta própria — se o item for desmarcado, só a primeira página de cada visita será contada.
- **Não instale a tag de novo** por outro caminho (Tag Manager, "Instalar manualmente", plug-in): o site já carrega o `gtag.js` uma vez, e uma segunda instalação dobraria todos os números.

### No seu computador (desenvolvimento)

Não é preciso configurar nada: sem a variável, o site roda igual, sem Analytics e sem aviso. Deixe assim no dia a dia, para que os testes locais não entrem nos relatórios.

Só para testar a medição localmente, acrescente ao `.env.local` a linha `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-PGVBY1GKMD`, reinicie o `npm run dev`, e **remova a linha ao terminar**. As visitas feitas assim vão para a propriedade real, com endereço `localhost`.

O ID nunca é escrito no código: o único lugar que o lê é `src/lib/analytics/config.ts`, que aceita apenas o formato `G-XXXXXXXXXX` e ignora qualquer outro valor.

## Como funciona no site

- Na primeira visita aparece um aviso no rodapé da tela com **Recusar** e **Aceitar**.
- O script do Google só é pedido **depois** de "Aceitar". Sem resposta ou com "Recusar", nada é carregado e nenhum cookie é gravado.
- A escolha fica guardada no navegador do visitante. No rodapé do site há o link **"Preferências de cookies"** para mudar de ideia; ao recusar depois de ter aceitado, a medição para e os cookies do Analytics são apagados.
- Sinais de publicidade (`ad_storage`, `ad_user_data`, `ad_personalization`) ficam sempre negados: não há ferramenta de anúncios instalada.

**Consequência importante:** quem recusa ou ignora o aviso **não é contado**. Os números do Analytics serão sempre menores que as visitas reais. Use-os para comparar períodos, canais e páginas — não como contagem exata de pessoas. Para o total de visitas sem depender de consentimento, veja Vercel Web Analytics em `monitoring.md`.

## Eventos

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `page_view` | Abertura de cada página (automático do GA4) | — |
| `flight_request_click` | Clique em **"Emitir Passagem"** (topo e final da página inicial) ou em "Planejar minha viagem" (final de Experiências) | `link_location`: `home_hero`, `home_cta`, `experiencias_final` |
| `destination_interest` | Clique no cartão de um destino em `/destinos` | `destination_name`, `destination_iata`, `destination_country`, `continent` |
| `flight_request_whatsapp` | Último passo do formulário de viagem: botão **"Solicitar pelo WhatsApp"** | `destination_name`, `destination_iata`, `trip_type`, `flight_class`, `passengers` |
| `contact_form_submit` | Formulário de `/atendimento` preenchido corretamente e enviado | `form_name`: `atendimento` |
| `miles_form_submit` | Botão **"Enviar para a Alvea"** no fim dos questionários de `/milhas` | `form_type`: `venda` ou `gestao` |
| `offer_group_click` | Clique em **"Entrar no Grupo de Ofertas"** | `link_location` |
| `whatsapp_click` | **Toda** saída para o WhatsApp da Alvea: links, cartões e os três formulários acima | `link_location`: `footer`, `atendimento_card`, `atendimento_form`, `destinos_form`, `milhas_form`, `experiencias_final` |
| `email_click` | Clique em um link de e-mail | `link_location`: `footer`, `atendimento_card` |
| `instagram_click` | Clique no ícone do Instagram | `link_location` |

Como ler:

- `whatsapp_click` é o **total** de saídas para o WhatsApp. Os eventos de formulário dizem **qual** formulário; cada envio de formulário gera o seu evento **e** um `whatsapp_click` — some os de formulário entre si, não com o total.
- Todos esses eventos registram que o visitante **abriu** o WhatsApp ou o e-mail. O site não tem como saber se a mensagem foi enviada nem se virou venda.
- Nenhum evento leva nome, e-mail, telefone ou texto de mensagem. Só vão o tipo de ação, a posição na página e, nos pedidos de viagem, destino, classe, tipo de viagem e quantidade de passageiros.

Há um único ponto de envio (`src/lib/analytics/gtag.ts`) e não há Google Tag Manager, então nenhum evento tem duas origens.

### Configuração no painel para os eventos aparecerem direito

Faça depois de ligar, uma vez:

1. **Parâmetros como dimensões.** Em **Administrador → Exibição de dados → Definições personalizadas → Criar dimensão personalizada**, escopo "Evento", crie uma para cada: `link_location`, `destination_name`, `destination_country`, `continent`, `trip_type`, `flight_class`, `passengers`, `form_type`, `form_name`. Sem isso os parâmetros são coletados mas não aparecem nos relatórios. Só vale para dados a partir da criação.
2. **Eventos principais (conversões).** Em **Administrador → Exibição de dados → Eventos**, depois que os eventos aparecerem na lista (até 24 h após o primeiro disparo), marque a estrela de: `whatsapp_click`, `flight_request_whatsapp`, `contact_form_submit`, `miles_form_submit`, `offer_group_click`.
3. **Retenção.** Em **Administrador → Coleta e modificação de dados → Retenção de dados**, mude de 2 para 14 meses.
4. **Seu próprio tráfego.** Em **Fluxos de dados → o fluxo → Configurar as definições da tag → Definir tráfego interno**, cadastre o IP do escritório, se for fixo.

## Onde ver cada resposta

| Pergunta | Onde |
|---|---|
| Quem está no site agora | **Relatórios → Tempo real** |
| Visitantes hoje, ontem, 7 e 30 dias | **Relatórios → Visão geral dos relatórios** — troque o período no canto superior direito. "Usuários ativos" são pessoas; "Sessões" são visitas |
| Novos × recorrentes | **Relatórios → Retenção**; ou no período escolhido compare "Novos usuários" com "Usuários ativos" |
| De onde vieram (Instagram, Google, WhatsApp, direto) | **Relatórios → Aquisição → Aquisição de tráfego** — coluna "Origem / mídia da sessão" |
| Qual campanha trouxe mais gente engajada | Mesmo relatório, dimensão **"Campanha da sessão"**; compare "Taxa de engajamento", "Tempo médio de engajamento" e "Eventos principais" |
| Páginas mais vistas | **Relatórios → Engajamento → Páginas e telas** |
| Destinos mais procurados | **Relatórios → Engajamento → Eventos → `destination_interest`**, e abra o cartão `destination_name` |
| Cliques no WhatsApp | **Engajamento → Eventos → `whatsapp_click`** (cartão `link_location` mostra de onde) |
| Cliques em "Emitir Passagem" | **Engajamento → Eventos → `flight_request_click`** |
| Contatos iniciados | `contact_form_submit`, `miles_form_submit`, `flight_request_whatsapp`, `email_click` |
| Celular × computador | **Relatórios → Tecnologia → Visão geral** |

Para cruzar duas coisas (por exemplo, destino × campanha), use **Explorar → Exploração de formato livre**.

Os relatórios comuns levam de 24 a 48 horas para fechar um dia. Só "Tempo real" e o DebugView são imediatos.

## Validar que está funcionando

Depois de configurar a variável e refazer o deploy:

1. Abra o site em uma **janela anônima**. O aviso de cookies deve aparecer.
2. Clique em **Aceitar**.
3. No Analytics, abra **Relatórios → Tempo real**: em até um minuto deve aparecer 1 usuário e o evento `page_view`.
4. Navegue pelo menu: cada página deve gerar um `page_view` — um só por página. Se aparecerem dois, alguém instalou uma segunda tag (por exemplo, pelo Tag Manager).
5. Clique em "Emitir Passagem", abra um destino, clique no WhatsApp do rodapé: `flight_request_click`, `destination_interest` e `whatsapp_click` devem aparecer em "Tempo real → Contagem de eventos por nome".

Se o aviso de cookies **não** aparecer na janela anônima, a variável não entrou no deploy: confira o nome, o valor, o ambiente Production e se o Redeploy foi feito depois de salvar.

Para ver os parâmetros de cada evento, use o **DebugView** (**Administrador → Exibição de dados → DebugView**): instale no Chrome a extensão oficial "Google Analytics Debugger", ative-a, recarregue o site e aceite os cookies. Os eventos aparecem em linha do tempo, e clicar em um deles mostra os parâmetros.

Teste também o caminho oposto: em outra janela anônima clique em **Recusar** e confira que nada novo aparece em "Tempo real".

### O que foi testado

**Com o ID real `G-PGVBY1GKMD`, em 2026-10-13**, em um navegador automatizado contra o build local, com as requisições ao Google liberadas:

- antes da escolha, e depois de navegar sem responder ao aviso: nenhuma requisição ao Google, nenhum cookie;
- "Aceitar" na segunda página: o `gtag.js` é pedido **uma vez**, os cookies `_ga` e `_ga_PGVBY1GKMD` são gravados e sai **um** `page_view`, com a campanha da primeira página (`utm_source`, `utm_medium`, `utm_campaign`);
- navegar pelo menu (duas páginas) e voltar pelo botão do navegador: **um** `page_view` por navegação, sem repetição;
- clique no WhatsApp do rodapé: **um** `whatsapp_click` com `link_location: footer`;
- recarregar a página com a escolha guardada: o script é pedido uma vez e sai um `page_view`;
- "Recusar" pelo link do rodapé: os cookies `_ga` são apagados e nenhum envio acontece nas navegações e cliques seguintes; ao recarregar, o script não é pedido;
- o Google respondeu `204` (aceito) a todos os envios; nenhum erro no console.

Esse teste gerou cerca de seis visualizações com endereço `localhost` e campanha `validacao_ga4` na propriedade. Podem aparecer nos relatórios desse dia e devem ser ignoradas.

**Antes, com um ID de teste e o Google bloqueado:** `destination_interest`, `flight_request_click`, `email_click`, `instagram_click`, `offer_group_click` e `contact_form_submit` disparam uma vez por ação, com os parâmetros da tabela; formulário de atendimento vazio não gera evento; nenhum dado digitado aparece nos eventos.

**Não verificado:**

- a chegada dos dados aos relatórios (não há acesso à conta do Google Analytics) — confirme pelo "Tempo real", passos acima;
- o site em produção com a medição ligada — depende da variável na Vercel;
- `flight_request_whatsapp` e `miles_form_submit`, que ficam no último passo de formulários longos: conferidos por leitura do código, sem execução.

## Google Tag Manager

**Não instalado, por decisão.** O site tem uma ferramenta de medição e dez eventos, todos no código; o Tag Manager acrescentaria um segundo script, um segundo lugar onde eventos podem ser criados e o risco de contagem dobrada, sem resolver nenhum problema atual.

Passa a valer a pena quando houver várias tags de anúncio geridas por alguém de marketing sem acesso ao código. Nesse caso, a migração correta é **mover** a tag do GA4 para dentro do Tag Manager e remover o carregamento direto — nunca manter os dois.

## Anúncios no futuro (Google Ads, Meta)

Nada disso está instalado, e nenhum ID de pixel ou de conta foi criado.

- **Google Ads:** o caminho mais simples é vincular a conta do Ads à propriedade GA4 (**Administrador → Vinculações de produtos**) e importar os eventos principais como conversões. Não exige tag nova no site.
- **Meta (Instagram/Facebook):** o Pixel é uma tag nova e grava cookies de publicidade. Precisa entrar no mesmo mecanismo de consentimento, com uma categoria separada de "publicidade" no aviso — o aviso atual só cobre medição.
- Em ambos, os sinais `ad_storage`, `ad_user_data` e `ad_personalization` hoje ficam negados; teriam de passar a obedecer à escolha do visitante.
- Um evento deve ser enviado a cada plataforma por um único caminho.

## LGPD e cookies

Decisões técnicas tomadas — **isto não é parecer jurídico nem garantia de conformidade**:

- Cookies de medição não são necessários para o site funcionar; por isso só são ativados com consentimento, com "Recusar" e "Aceitar" lado a lado e com o mesmo destaque.
- O aviso controla de fato o carregamento: sem aceite, o navegador não faz nenhuma requisição ao Google.
- A escolha pode ser revista a qualquer momento pelo rodapé.
- Nenhum dado pessoal é enviado nos eventos, e os formulários não guardam nada no site: o que o visitante digita só vai para o WhatsApp dele.
- Antes do consentimento, o site guarda na aba do visitante (apagado ao fechá-la) o endereço e a origem da primeira página, só para não perder a campanha caso ele aceite mais tarde. Nada disso sai do navegador sem o aceite.

Pontos que pedem avaliação de um advogado ou de quem responde pela empresa:

1. **Política de privacidade.** O site não tem, e o aviso de cookies por isso não aponta para nenhuma. É a principal lacuna ao ligar a medição. A LGPD exige informar quem trata os dados, para quê, por quanto tempo e como exercer direitos. O texto precisa ser escrito ou aprovado pela empresa; quando existir, o aviso de cookies deve apontar para ele.
2. **Encarregado (DPO)** e canal de contato para pedidos de titulares.
3. **Transferência internacional:** os dados do Analytics são processados pelo Google fora do Brasil.
4. **Dados recebidos pelo WhatsApp** (nome, telefone, e-mail dos formulários): o tratamento acontece fora do site, mas é da empresa.

## Arquivos

| Arquivo | Função |
|---|---|
| `src/lib/analytics/config.ts` | Lê e valida o ID |
| `src/lib/analytics/consent.ts` | Guarda e lê a escolha do visitante |
| `src/lib/analytics/gtag.ts` | Carrega o script, envia eventos, interrompe a medição |
| `src/components/analytics/Analytics.tsx` | Liga tudo e captura os cliques em links de contato |
| `src/components/analytics/ConsentBanner.tsx` | Aviso de cookies |
| `src/components/analytics/CookiePreferencesLink.tsx` | Link do rodapé |

Para medir um botão novo: se for um link de WhatsApp, e-mail ou do grupo, já é medido sozinho. Para outro elemento, acrescente `data-track="nome_do_evento"` e, se quiser, `data-track-location="posicao"`.
