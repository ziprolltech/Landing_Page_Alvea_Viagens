# Links de campanha (UTM)

Para saber qual divulgação trouxe cada visitante, todo link que você publica fora do site deve levar parâmetros UTM. O Google Analytics lê esses parâmetros sozinho e os mostra em **Relatórios → Aquisição → Aquisição de tráfego**.

Sem UTM, boa parte das visitas vindas de Instagram e WhatsApp cai em "Direct" (acesso direto), porque os aplicativos não informam a origem.

## Formato

```
https://www.alveaviagens.com.br/PAGINA?utm_source=ORIGEM&utm_medium=MEIO&utm_campaign=CAMPANHA&utm_content=PECA
```

| Parâmetro | Responde | Obrigatório |
|---|---|---|
| `utm_source` | De **onde** veio: `instagram`, `whatsapp`, `google`, `facebook`, nome do parceiro | sim |
| `utm_medium` | Por que **tipo de canal** (lista fechada abaixo) | sim |
| `utm_campaign` | De qual **ação** | sim |
| `utm_content` | Qual **peça** ou posição, para comparar duas versões | opcional |
| `utm_term` | Palavra-chave, só em anúncios de busca | opcional |

## Regras

1. **Tudo em minúsculas, sem acentos e sem espaços.** Use `_` para separar palavras. `Instagram` e `instagram` viram duas linhas diferentes no relatório.
2. **Sempre os mesmos valores.** Use os da tabela abaixo; não invente variações (`insta`, `ig`, `Instagram`).
3. **Nunca coloque dados pessoais**: nada de nome de cliente, telefone, e-mail ou CPF em nenhum parâmetro.
4. **Só em links de fora para dentro.** Nunca em links do próprio site (menu, botões): isso apagaria a origem verdadeira da visita.
5. **Use sempre `https://www.alveaviagens.com.br`.** O endereço sem `www` também funciona e mantém os parâmetros, mas passa por um redirecionamento a mais.
6. O nome da campanha deve dizer o assunto e o período: `paris_nov26`, `milhas_black_friday26`.

### Valores de `utm_medium`

| Valor | Quando usar |
|---|---|
| `social` | Publicação não paga em rede social: bio, post, story, reel |
| `paid_social` | Anúncio pago em rede social (Instagram/Facebook Ads) |
| `cpc` | Anúncio pago em busca (Google Ads) |
| `whatsapp` | Mensagem ou grupo de WhatsApp |
| `email` | E-mail |
| `referral` | Site ou perfil de parceiro |
| `influencer` | Divulgação por influenciador |
| `qr` | QR code impresso |

Com `social`, `paid_social`, `cpc`, `email` e `referral` o Analytics classifica o canal sozinho ("Organic Social", "Paid Social", "Paid Search", "Email", "Referral"). Os valores `whatsapp`, `influencer` e `qr` não fazem parte da lista padrão do Google: no agrupamento por **canal** eles podem aparecer como "Unassigned", mas aparecem normalmente em **Origem / mídia** e em **Campanha**, que são as visões a usar.

## Exemplos prontos

**Bio do Instagram** — é o link mais importante; troque o atual por este:

```
https://www.alveaviagens.com.br/?utm_source=instagram&utm_medium=social&utm_campaign=bio
```

**Story com link**

```
https://www.alveaviagens.com.br/destinos?utm_source=instagram&utm_medium=social&utm_campaign=paris_nov26&utm_content=story
```

**Publicação ou reel** (link na legenda ou no comentário)

```
https://www.alveaviagens.com.br/destinos?utm_source=instagram&utm_medium=social&utm_campaign=paris_nov26&utm_content=reel
```

**Anúncio no Instagram/Facebook**

```
https://www.alveaviagens.com.br/destinos?utm_source=instagram&utm_medium=paid_social&utm_campaign=paris_nov26&utm_content=video_a
```

Para comparar dois criativos, mude só o `utm_content` (`video_a`, `video_b`).

**Anúncio no Google**

```
https://www.alveaviagens.com.br/milhas?utm_source=google&utm_medium=cpc&utm_campaign=venda_milhas&utm_term=vender_milhas
```

No Google Ads, o mais simples é ligar a "marcação automática" e vincular a conta ao Analytics; os UTMs manuais ficam como reserva.

**Grupo de ofertas no WhatsApp**

```
https://www.alveaviagens.com.br/destinos?utm_source=whatsapp&utm_medium=whatsapp&utm_campaign=grupo_ofertas&utm_content=oferta_lisboa
```

**Mensagem direta ou lista de transmissão**

```
https://www.alveaviagens.com.br/milhas?utm_source=whatsapp&utm_medium=whatsapp&utm_campaign=transmissao_milhas_out26
```

**Parceiro**

```
https://www.alveaviagens.com.br/?utm_source=nome_do_parceiro&utm_medium=referral&utm_campaign=parceria_out26
```

**Influenciador** — um link por pessoa, identificada pelo perfil público:

```
https://www.alveaviagens.com.br/experiencias?utm_source=perfil_do_influenciador&utm_medium=influencer&utm_campaign=lancamento_journey
```

**Campanha de destino**

```
https://www.alveaviagens.com.br/destinos?utm_source=instagram&utm_medium=social&utm_campaign=europa_verao27
```

**Campanha de milhas**

```
https://www.alveaviagens.com.br/milhas?utm_source=instagram&utm_medium=social&utm_campaign=gestao_milhas_out26
```

Para montar outros sem erro de digitação, use o construtor oficial do Google: `ga-dev-tools.google/campaign-url-builder`.

## Páginas de destino

| Objetivo | Página |
|---|---|
| Apresentar a agência | `/` |
| Pedido de passagem | `/destinos` |
| Vender ou gerir milhas | `/milhas` |
| Entrar no grupo | `/grupo-de-ofertas` |
| Marca, encantamento | `/experiencias` |
| Falar com alguém | `/atendimento` |

## Onde ver o resultado

**Relatórios → Aquisição → Aquisição de tráfego**, e troque a dimensão da tabela:

- **Origem / mídia da sessão** — `instagram / social`, `whatsapp / whatsapp`…
- **Campanha da sessão** — o valor de `utm_campaign`
- Para ver o `utm_content`, clique no **+** ao lado da dimensão e acrescente **"Conteúdo do anúncio manual da sessão"**

Para saber qual campanha traz gente **engajada**, e não só cliques, compare na mesma tabela: **Taxa de engajamento**, **Tempo médio de engajamento por sessão** e **Eventos principais** (depois de marcar os eventos como principais — ver `analytics.md`).

## Como o site trata os parâmetros

- Os parâmetros não mudam nada na página: qualquer endereço do site funciona igual com ou sem eles.
- O Analytics atribui a visita inteira à campanha da **primeira página**. Navegar pelo menu depois não perde a origem — não é preciso (nem se deve) repetir os parâmetros nos links internos.
- Como a medição só começa depois que o visitante aceita os cookies, o site guarda a campanha da primeira página enquanto a aba estiver aberta e a entrega ao Analytics se o aceite vier algumas páginas depois. Isso foi testado em navegador automatizado: aceitar na segunda página repassou `utm_source`, `utm_medium` e `utm_campaign` da primeira.
- Visitantes que recusam os cookies não entram no Analytics, com ou sem UTM.
- O redirecionamento de `alveaviagens.com.br` para `www.alveaviagens.com.br` preserva os parâmetros.

## Limites

- O Instagram abre links em um navegador próprio; se o visitante depois abrir o site no Chrome ou Safari, isso conta como outra visita, sem a campanha.
- Encurtadores (bit.ly etc.) funcionam desde que o endereço final leve os UTMs.
