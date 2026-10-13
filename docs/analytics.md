# Google Analytics 4

## Situação atual

**O código está pronto e desligado.** Enquanto a variável `NEXT_PUBLIC_GA_MEASUREMENT_ID` não existir na Vercel, o site não carrega nada do Google, não grava cookie e não mostra aviso de cookies. Nenhum dado está sendo coletado ainda.

Não foi possível conferir se a variável já existe na Vercel (o acesso usado na implementação não lista variáveis), e nenhuma propriedade do Google Analytics foi acessada.

## Ligar (uma vez)

1. Em `analytics.google.com`, crie uma **conta** e uma **propriedade** GA4 para a Alvea (fuso "Brasília", moeda "Real"). Se já existir uma, use-a.
2. Em **Administrador → Coleta e modificação de dados → Fluxos de dados → Adicionar fluxo → Web**, informe `https://www.alveaviagens.com.br` e crie o fluxo.
3. Copie o **ID da métrica**, no formato `G-XXXXXXXXXX`.
4. No mesmo fluxo, em **Medição otimizada**, deixe ligado (é o padrão). O item **"Mudanças na página com base em eventos do histórico de navegação"** precisa ficar marcado: é ele que conta as páginas quando o visitante navega pelo menu.
5. Na Vercel: projeto `alvea-viagens` → **Settings → Environment Variables** → nome `NEXT_PUBLIC_GA_MEASUREMENT_ID`, valor o ID copiado, ambiente **Production apenas** (desmarque Preview e Development). Salve.
6. Em **Deployments**, abra o último deploy de produção → menu **⋯ → Redeploy**. A variável só entra em vigor em um deploy novo.

O ID não é segredo: ele aparece no código de qualquer site que usa Analytics. Mesmo assim ele fica só na Vercel, não no repositório. Não coloque o ID no `.env.local`: assim os testes no seu computador não são contados.

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

Para ver os parâmetros de cada evento, use o **DebugView** (**Administrador → Exibição de dados → DebugView**): instale no Chrome a extensão oficial "Google Analytics Debugger", ative-a, recarregue o site e aceite os cookies. Os eventos aparecem em linha do tempo, e clicar em um deles mostra os parâmetros.

Teste também o caminho oposto: em outra janela anônima clique em **Recusar** e confira que nada novo aparece em "Tempo real".

### O que foi testado na implementação

Em um navegador automatizado, contra o build local, com um ID de teste e **todas as requisições ao Google bloqueadas** (nenhum dado chegou a nenhuma propriedade):

- antes da escolha: nenhuma requisição ao Google, nenhum evento;
- "Aceitar" em uma segunda página: o script é pedido uma única vez e a campanha da primeira página (`utm_source`, `utm_medium`, `utm_campaign`) é repassada;
- `destination_interest`, `flight_request_click`, `whatsapp_click`, `email_click`, `instagram_click`, `offer_group_click` e `contact_form_submit` disparam uma vez por ação, com os parâmetros da tabela;
- formulário de atendimento vazio não gera evento; preenchido, gera — e nenhum dado digitado aparece nos eventos;
- a escolha persiste ao recarregar; "Recusar" pelo link do rodapé interrompe a medição; recarregar depois de recusar não carrega nada.

Conferidos apenas por leitura do código, sem execução: `flight_request_whatsapp` e `miles_form_submit` (ficam no último passo de formulários longos). O `page_view` em si é enviado pelo script do Google, que estava bloqueado no teste — só dá para confirmá-lo com o ID real, pelos passos acima.

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

1. **Política de privacidade.** O site não tem. A LGPD exige informar quem trata os dados, para quê, por quanto tempo e como exercer direitos. O texto precisa ser escrito ou aprovado pela empresa; quando existir, o aviso de cookies deve apontar para ele.
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
