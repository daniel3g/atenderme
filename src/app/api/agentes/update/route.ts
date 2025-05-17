import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { id, prompt } = await req.json();

  const { error } = await supabase
    .from('agentes')
    .update({ prompt })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Prompt atualizado com sucesso.' });
}
