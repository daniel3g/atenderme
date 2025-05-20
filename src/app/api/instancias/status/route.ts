import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const EVOLUTION_API = 'https://wsapi.guarumidia.com';
const TOKEN = process.env.EVOLUTION_API_TOKEN || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agenteId = searchParams.get('id');

  if (!agenteId) {
    return NextResponse.json({ error: 'ID do agente não fornecido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('instancias')
    .select('session_id, status')
    .eq('agente_id', agenteId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Instância não encontrada.' }, { status: 404 });
  }

  const { session_id, status: statusAtual } = data;

  try {
    const response = await fetch(`${EVOLUTION_API}/instance/connectionState/${session_id}`, {
      headers: { apikey: TOKEN },
    });

    const result = await response.json();
    const state = result.instance?.state;
    const numero = result.instance?.number || null;

    console.debug('[DEBUG] Status atual da instância:', result);

    if (state === 'open') {
      if (statusAtual !== 'ativo') {
        console.info('[INFO] Instância conectada. Atualizando Supabase e ativando fluxo...');

        await supabase
          .from('instancias')
          .update({ status: 'ativo', numero_whatsapp: numero })
          .eq('session_id', session_id);

        // Ativa o fluxo no N8N
        await fetch(`${SITE_URL}/api/instancias/ativar-fluxo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agenteId }),
        });
      }

      return NextResponse.json({ status: 'ativo' });
    }

    return NextResponse.json({ status: 'pendente' });
  } catch (err) {
    console.error('Erro ao verificar status da instância:', err);
    return NextResponse.json({ error: 'Erro ao consultar status da Evolution API.' }, { status: 500 });
  }
}
