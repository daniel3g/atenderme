import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

function gerarPrompt({ nome, area, tom, funcoes, regras }: any) {
  return `
Você é ${nome}, um(a) agente virtual que atua na área de ${area}.
Seu tom de voz é ${tom}.

Funções principais:
${funcoes}

Regras de comportamento:
${regras}

Seja sempre coerente, prestativo(a) e respeitoso(a) ao interagir.
`.trim();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prompt = gerarPrompt(body);

  // 1. Cria o assistant na OpenAI
  const openaiRes = await fetch('https://api.openai.com/v1/assistants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      name: body.nome,
      instructions: prompt,
      model: 'gpt-4', // ou 'gpt-3.5-turbo' se preferir
    }),
  });

  const openaiData = await openaiRes.json();

  if (!openaiRes.ok) {
    return NextResponse.json({ error: 'Erro ao criar assistant', details: openaiData }, { status: 500 });
  }

  const assistant_id = openaiData.id;

  // 2. Salva no Supabase
  const { data, error } = await supabase
    .from('agentes')
    .insert([{ nome: body.nome, prompt, assistant_id }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, assistant_id });
}
