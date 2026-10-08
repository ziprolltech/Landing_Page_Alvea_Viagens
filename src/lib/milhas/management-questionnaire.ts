// ─── Gestão de Milhas — official questionnaire ────────────────────────────────
// This file is the single source for the 17 questions: the form, the review
// step, and the WhatsApp message are all generated from it.
//
// The wording of every question and option is the official text supplied by
// Alvea. Do NOT rephrase, reorder, correct spellings ("Nu Bank", "LatamPass",
// "Aadvantage", "TudoAzul"…), or add/remove options.

export type QuestionType = 'single' | 'multiple' | 'text'

export interface Question {
  id:         string          // q1 … q17
  number:     number
  text:       string          // official wording, without the leading number
  short:      string          // label used in the review and in the WhatsApp message
  type:       QuestionType
  options?:   string[]
  required?:  boolean
  exclusive?: string          // option that cannot be combined with the others
  placeholder?: string
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1', number: 1, type: 'single', short: 'Compras online',
    text: 'Como você costuma fazer suas compras do dia a dia e compras de maior valor pela internet?',
    options: [
      'Compro praticamente tudo que posso online e costumo me planejar com antecedência',
      'Compro online com frequência, mas ainda poderia concentrar mais compras pela internet',
      'Compro online apenas algumas vezes, quando lembro ou encontro uma boa oportunidade',
      'Evito comprar online porque preciso receber os produtos rapidamente',
      'Evito comprar online porque ainda tenho dúvidas ou insegurança',
      'Não tenho o hábito de comprar online',
      'Não faço compras online',
    ],
  },
  {
    id: 'q2', number: 2, type: 'multiple', short: 'Programas de pontos/milhas', exclusive: 'Não',
    text: 'Você participa atualmente de algum programa de pontos ou milhas?',
    options: [
      'Não', 'Esfera', 'Livelo', 'Smiles', 'TudoAzul', 'Curtaí', 'Inter Loop',
      'Iupp Itaú', 'LatamPass', 'Aadvantage', 'Dotz', 'Outros',
    ],
  },
  {
    id: 'q3', number: 3, type: 'multiple', short: 'Bancos/instituições',
    text: 'Com quais bancos ou instituições financeiras você possui relacionamento?',
    options: [
      'Banco do Brasil', 'Banco Inter', 'Bradesco', 'BTG Pactual', 'Caixa', 'C6 Bank', 'Itaú',
      'Nu Bank', 'Santander', 'Sicoob', 'Sicredi', 'XP Investimentos', 'Outros',
    ],
  },
  {
    id: 'q4', number: 4, type: 'single', short: 'Gasto mensal nos cartões PF',
    text: 'Qual é o gasto médio mensal somando todos os seus cartões de crédito de pessoa física?',
    options: [
      'Não uso cartão de crédito',
      'Até R$ 5.000 por mês',
      'De R$ 5.000 a R$ 8.000 por mês',
      'De R$ 8.000 a R$ 15.000 por mês',
      'De R$ 15.000 a R$ 20.000 por mês',
      'De R$ 20.000 a R$ 30.000 por mês',
      'De R$ 30.000 a R$ 50.000 por mês',
      'De R$ 50.000 a R$ 100.000 por mês',
      'Acima de R$ 100.000 por mês',
    ],
  },
  {
    id: 'q5', number: 5, type: 'single', short: 'Gasto mensal nos cartões PJ',
    text: 'Qual é o gasto médio mensal somando todos os seus cartões de crédito de pessoa jurídica (PJ)? Caso não utilize, informe que não usa.',
    options: [
      'Não utilizo cartão de crédito PJ',
      'Até R$ 10.000 por mês',
      'De R$ 10.000 a R$ 20.000 por mês',
      'De R$ 20.000 a R$ 30.000 por mês',
      'De R$ 30.000 a R$ 50.000 por mês',
      'De R$ 50.000 a R$ 100.000 por mês',
      'De R$ 100.000 a R$ 200.000 por mês',
      'Acima de R$ 200.000 por mês',
    ],
  },
  {
    id: 'q6', number: 6, type: 'single', short: 'Conhecimento em pontos e milhas',
    text: 'Qual opção melhor representa seu conhecimento e autonomia atual com pontos e milhas?',
    options: [
      'Não conheço nada sobre pontos e milhas e preciso de orientação completa',
      'Tenho conhecimento básico, mas não acompanho oportunidades e estratégias',
      'Já uso milhas ocasionalmente, mas ainda preciso de ajuda para aproveitar melhor',
      'Conheço estratégias de acúmulo, transferência e emissão e faço boa parte sozinho',
      'Sou avançado/expert e acompanho oportunidades, campanhas e emissões sozinho',
    ],
  },
  {
    id: 'q7', number: 7, type: 'single', short: 'Investimento anual em viagens',
    text: 'Quanto você investe aproximadamente em viagens por ano, considerando passagens, hospedagem, transfers, aluguel de carro, passeios e outros serviços?',
    options: [
      'Hoje não tenho gasto com viagens',
      'Até R$ 5.000 por ano',
      'De R$ 5.000 a R$ 10.000 por ano',
      'De R$ 10.000 a R$ 20.000 por ano',
      'De R$ 20.000 a R$ 30.000 por ano',
      'De R$ 30.000 a R$ 50.000 por ano',
      'De R$ 50.000 a R$ 100.000 por ano',
      'Acima de R$ 100.000 por ano',
    ],
  },
  {
    id: 'q8', number: 8, type: 'single', short: 'Viagens compradas por ano',
    text: 'Quantas viagens você compra por ano, incluindo viagens para você e para outras pessoas?',
    options: [
      'Nenhuma viagem por ano',
      '1 viagem por ano',
      '2 viagens por ano',
      'De 3 a 4 viagens por ano',
      'De 5 a 7 viagens por ano',
      '8 ou mais viagens por ano',
    ],
  },
  {
    id: 'q9', number: 9, type: 'single', short: 'Viagens que gostaria de fazer por ano',
    text: 'Quantas viagens você gostaria de fazer por ano?',
    options: [
      'Nenhuma viagem por ano',
      '1 viagem por ano',
      '2 viagens por ano',
      'De 3 a 4 viagens por ano',
      'De 5 a 7 viagens por ano',
      '8 ou mais viagens por ano',
    ],
  },
  {
    id: 'q10', number: 10, type: 'text', short: 'Viagem dos sonhos',
    text: 'Qual é a viagem dos seus sonhos?',
    placeholder: 'Digite sua resposta...',
  },
  {
    id: 'q11', number: 11, type: 'single', short: 'Viagens internacionais por ano', required: true,
    text: 'Quantas viagens internacionais você compra por ano?',
    options: [
      'Nenhuma viagem internacional por ano',
      '1 viagem internacional por ano',
      '2 viagens internacionais por ano',
      '3 viagens internacionais por ano',
      '4 ou mais viagens internacionais por ano',
    ],
  },
  {
    id: 'q12', number: 12, type: 'single', short: 'Pessoas por viagem', required: true,
    text: 'Em média, quantas pessoas viajam em cada viagem que você compra?',
    options: ['1 pessoa', '2 pessoas', '3 pessoas', '4 pessoas', '5 ou mais pessoas'],
  },
  {
    id: 'q13', number: 13, type: 'single', short: 'Pontuação do cartão PF por dólar', required: true,
    text: 'Você sabe qual é a pontuação média do seu principal cartão de pessoa física (PF) por dólar gasto?',
    options: [
      'Meu cartão não acumula pontos ou milhas',
      'Menos de 1,5 ponto por dólar',
      'De 1,5 a 2,19 pontos por dólar',
      'De 2,2 a 2,99 pontos por dólar',
      '3 ou mais pontos por dólar',
      'Não sei informar',
    ],
  },
  {
    id: 'q14', number: 14, type: 'single', short: 'Pontuação do cartão PJ por dólar',
    text: 'Você sabe qual é a pontuação média do seu principal cartão de pessoa jurídica (PJ) por dólar gasto?',
    options: [
      'Meu cartão não acumula pontos ou milhas',
      'Menos de 1,5 ponto por dólar',
      'De 1,5 a 2,19 pontos por dólar',
      'De 2,2 a 2,99 pontos por dólar',
      '3 ou mais pontos por dólar',
      'Não sei informar',
    ],
  },
  {
    id: 'q15', number: 15, type: 'single', short: 'Gastos planejáveis para compras online', required: true,
    text: 'Aproximadamente quanto dos seus gastos mensais pode ser planejado para compras online?',
    options: ['Nenhum / 0%', 'Até 10%', 'De 10% a 25%', 'De 25% a 50%', 'Mais de 50%', 'Não sei informar'],
  },
  {
    id: 'q16', number: 16, type: 'multiple', short: 'Benefícios de maior interesse',
    text: 'Quais benefícios mais chamam sua atenção em um serviço de viagens e fidelidade?',
    options: [
      'Cashback na compra de passagem aérea',
      'Cashback na compra de hospedagens',
      'Cashback na compra de produtos (ex: smartphones, eletrodomésticos, perfumes e outros)',
      'Descontos na compra de passeios turísticos / ingressos',
      'Descontos na compra de serviços não relacionados a turismo',
    ],
  },
  {
    id: 'q17', number: 17, type: 'single', short: 'Gastos via PIX/débito/dinheiro', required: true,
    text: 'Aproximadamente quanto você paga por mês via PIX, débito ou dinheiro que poderia passar no cartão de crédito sem aumentar seus gastos?',
    options: [
      'Nenhum / não tenho gastos que poderiam passar no cartão',
      'Até R$ 3.000 por mês',
      'De R$ 3.000 a R$ 7.000 por mês',
      'De R$ 7.000 a R$ 15.000 por mês',
      'De R$ 15.000 a R$ 30.000 por mês',
      'Mais de R$ 30.000 por mês',
    ],
  },
]

/* How the 17 questions are split across form steps (order is never changed) */
export const QUESTION_STEPS: { label: string; from: number; to: number }[] = [
  { label: 'Perfil de consumo',           from: 1,  to: 5  },
  { label: 'Conhecimento e viagens',      from: 6,  to: 10 },
  { label: 'Perfil de viagem e cartões',  from: 11, to: 14 },
  { label: 'Oportunidades e potencial',   from: 15, to: 17 },
]

export function questionsBetween(from: number, to: number): Question[] {
  return QUESTIONS.filter((q) => q.number >= from && q.number <= to)
}

export type Answers = Record<string, string | string[]>

export function isAnswered(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' && value.trim() !== ''
}
