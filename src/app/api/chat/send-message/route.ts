import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openaiClient';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { agenteId, mensagens } = await req.json();

  // Busca o prompt do agente no Supabase
  const { data: agente, error } = await supabase
    .from('agentes')
    .select('prompt')
    .eq('id', agenteId)
    .single();

  if (error || !agente) {
    return NextResponse.json({ error: 'Agente não encontrado.' }, { status: 404 });
  }

  // Prepara as mensagens para o modelo da OpenAI
  const messages = [
    { role: 'system', content: agente.prompt },
    ...mensagens,
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
    });

    const resposta = response.choices[0]?.message?.content || 'Erro ao gerar resposta.';
    return NextResponse.json({ resposta });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao consultar a OpenAI.' }, { status: 500 });
  }
}
