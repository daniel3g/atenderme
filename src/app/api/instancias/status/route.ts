import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const EVOLUTION_API = 'https://wsapi.guarumidia.com';
const TOKEN = process.env.EVOLUTION_API_TOKEN || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agenteId = searchParams.get('id');

  if (!agenteId) {
    return NextResponse.json({ error: 'ID do agente não fornecido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('instancias')
    .select('session_id')
    .eq('agente_id', agenteId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Instância não encontrada.' }, { status: 404 });
  }

  const { session_id } = data;

  try {
    const response = await fetch(`${EVOLUTION_API}/instance/connectionState/${session_id}`, {
  headers: {
    'AuthenticationApiKey': TOKEN,
  },
});

    const result = await response.json();

    if (result.state === 'CONNECTED') {
      await supabase
        .from('instancias')
        .update({ status: 'ativo' })
        .eq('session_id', session_id);

      return NextResponse.json({ status: 'ativo' });
    }

    return NextResponse.json({ status: 'pendente' });
  } catch (err) {
    console.error('Erro ao verificar status da instância:', err);
    return NextResponse.json({ error: 'Erro ao consultar status da Evolution API.' }, { status: 500 });
  }
}
