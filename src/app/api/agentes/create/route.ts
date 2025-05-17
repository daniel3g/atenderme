import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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

  const { data, error } = await supabase
    .from('agentes')
    .insert([{ nome: body.nome, prompt }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}
