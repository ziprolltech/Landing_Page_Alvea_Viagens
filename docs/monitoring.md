# Monitoramento

Onde olhar para saber se o site está no ar, rápido e sem erros. Tudo aqui usa o que já existe na Vercel e no Google, sem custo. O que exigiria serviço novo está marcado como **opcional** — nada foi contratado nem ativado.

## Rotina sugerida

| Frequência | O quê | Onde |
|---|---|---|
| A cada publicação | O deploy terminou como "Ready"; abrir a página inicial e `/destinos` no celular | Vercel → Deployments |
| Semanal | Visitas, origens, eventos principais | Google Analytics (`analytics.md`) |
| Semanal | Cliques da busca, páginas indexadas, avisos | Search Console (`search-console.md`) |
| Mensal | Uso do plano (banda, imagens) | Vercel → Usage |
| Mensal ou depois de mudança visual | Velocidade no celular | PageSpeed Insights |

## Deploys e falhas de build

- **Vercel → projeto `alvea-viagens` → Deployments.** Cada envio para a branch `main` gera um deploy. Estados: *Building*, *Ready* (publicado) ou *Error*.
- Se um build falha, **a versão anterior continua no ar**; o site não cai. Clique no deploy com erro para ler o log.
- A Vercel envia e-mail ao dono da conta quando um deploy falha. Confira em **Account Settings → Notifications** se "Deployment Failures" está ligado.
- **Voltar atrás:** em Deployments, abra um deploy antigo que estava bom → menu **⋯ → Promote to Production** (ou "Instant Rollback"). Leva segundos e não mexe no código.

## Erros em produção

- **Vercel → projeto → Logs**: requisições e erros do servidor. Filtre por status `404` ou `5xx`. O tempo que os registros ficam guardados depende do plano (cerca de uma hora no gratuito).
- **Vercel → projeto → Observability**: rotas mais acessadas, erros e tempo de resposta.
- O site é quase todo estático, então erro de servidor é raro. A única rota com código de servidor é `/api/flights/search`, desligada no site; chamadas a ela vindas de fora aparecem nos logs e podem ser ignoradas.
- **Erros de JavaScript no navegador do visitante não aparecem em lugar nenhum hoje.** Para vê-los seria preciso uma ferramenta de erros (por exemplo, Sentry, que tem plano gratuito). **Opcional**; não instalado.
- **Endereços quebrados que o Google encontrou:** Search Console → Indexação → Páginas → "Não encontrado (404)".

## Disponibilidade

A Vercel não avisa se o site sair do ar. Para receber alerta, é preciso um monitor externo. **Opcional**: serviços como UptimeRobot ou Better Stack têm plano gratuito que verifica o endereço a cada 5 minutos e avisa por e-mail. Se for criar, monitore `https://www.alveaviagens.com.br/` esperando status 200. Nenhuma conta foi criada.

Estado dos serviços da própria Vercel: `vercel-status.com`.

## Desempenho

### Medir quando quiser

`pagespeed.web.dev` → cole `https://www.alveaviagens.com.br/` → aba **Celular**. Olhe:

| Indicador | Bom | O que é |
|---|---|---|
| LCP | até 2,5 s | Tempo até o maior elemento da tela aparecer |
| INP | até 200 ms | Demora da página para reagir a um toque |
| CLS | até 0,1 | O quanto o conteúdo "pula" enquanto carrega |

A parte de cima do resultado ("Descubra o que seus usuários reais estão vivenciando") só aparece quando o site tem visitas suficientes; no começo dirá que não há dados. A parte de baixo é uma simulação em celular lento: varia de uma execução para outra e serve para comparar antes e depois, não como retrato dos visitantes.

### Visitantes reais

- **Search Console → Experiência → Core Web Vitals**, quando houver tráfego suficiente.
- **Opcional — Vercel Speed Insights:** mede LCP, INP e CLS de visitantes reais, por página, sem cookies. Exige ativar no painel (**projeto → Speed Insights → Enable**) e acrescentar um pacote ao código. Tem cota gratuita limitada; acima dela é cobrado em alguns planos. Não ativado.

### Resultado desta rodada

Lighthouse 12, perfil celular, página inicial em produção, uma execução de cada.

| Indicador | Antes | Depois (deploy `925bb49`) |
|---|---|---|
| Desempenho | 68 | 86 |
| Acessibilidade | 96 | 96 |
| Boas práticas | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 1,9 s | 2,2 s |
| LCP | 10,6 s | 3,4 s |
| TBT | 40 ms | 60 ms |
| CLS | 0 | 0 |
| Peso total | 1.986 KB | 514 KB |

Medido em 2026-10-13. A melhora vem de o favicon de 1,5 MB não ser mais baixado. As pequenas diferenças em FCP e TBT estão dentro da variação normal entre duas execuções. O LCP de 3,4 s ainda fica acima do alvo de 2,5 s nesse perfil de celular lento; o motivo é o item 1 abaixo. Nenhum erro apareceu no console do navegador durante o teste.

### Gargalos conhecidos

1. **Entrada animada do título.** O título principal fica invisível até o JavaScript carregar; em celular lento isso segura o LCP. Mudar exige alterar a animação de entrada — não foi feito.
2. **Vídeo de 44 MB** em `/grupo-de-ofertas`. Não pesa no carregamento da página, mas cada reprodução completa consome 44 MB de banda do plano (ver abaixo).
3. **Fotos dos destinos** vêm direto do Unsplash, em 1400 px, sem passar pela otimização do site. São carregadas só quando entram na tela.

## Contagem de visitas sem depender de cookies (opcional)

O Google Analytics só conta quem aceita os cookies. **Vercel Web Analytics** conta todas as visitas sem cookies e sem aviso, com páginas, origens e países. Exige ativar no painel (**projeto → Analytics → Enable**) e acrescentar um pacote ao código. Há cota gratuita mensal de eventos; os filtros por UTM e a cota maior dependem do plano. Não ativado — se quiser, é uma mudança pequena.

## Limites do plano da Vercel

Não foi possível confirmar qual plano a conta usa. **Confira em Vercel → Settings → Billing**, porque muda o que vale aqui:

- **O plano gratuito (Hobby) é restrito a uso pessoal e não comercial** pelos termos da Vercel. Um site de agência com divulgação paga é uso comercial: se a conta estiver no Hobby, o correto é passar para o Pro (pago por usuário, por mês) antes de anunciar.
- **Banda:** o Hobby inclui uma franquia mensal de transferência (da ordem de 100 GB). As páginas são leves, mas o vídeo de 44 MB não: algo em torno de 2 mil reproduções completas esgotam essa franquia sozinhas. No Hobby, ao estourar, o site pode ser pausado até o mês virar; no Pro, o excedente é cobrado.
- Acompanhe em **Vercel → Usage**. A Vercel avisa por e-mail perto do limite.

Não foi feito teste de carga, então não há número medido de visitantes simultâneos suportados. O que dá para afirmar: as páginas são arquivos estáticos servidos pela rede de distribuição da Vercel, sem banco de dados nem servidor próprio no caminho; o limite prático é a franquia do plano, não a capacidade de processamento.

## Eventos de conversão

Ver `analytics.md`. Para ser avisado de mudanças bruscas: no Analytics, **Relatórios → Visão geral → Insights → Criar** permite alertas por e-mail (por exemplo, "`whatsapp_click` caiu mais de 50% em relação à semana anterior").

## Dependências externas

| Serviço | Para quê | Se cair |
|---|---|---|
| Vercel | Hospedagem | Site fora do ar |
| Registro.br | DNS do domínio | Site inacessível pelo domínio |
| WhatsApp | Destino de todos os formulários | Formulários abrem página de erro do WhatsApp |
| Unsplash | Fotos dos destinos | Cartões aparecem com o degradê de fundo, sem foto |
| Google (gtag) | Medição, só após consentimento | Site funciona normalmente; sem medição |
