import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID não fornecido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('agentes')
    .select('prompt')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Agente não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ prompt: data.prompt });
}
