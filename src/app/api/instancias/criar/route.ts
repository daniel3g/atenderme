import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const EVOLUTION_API = 'https://wsapi.guarumidia.com';
const TOKEN = process.env.EVOLUTION_API_TOKEN || '';

export async function POST(req: NextRequest) {
  const { agenteId, assistant_id } = await req.json();
  const session_id = `sessao-${agenteId}`;

  try {
    // 🔍 Buscar profile_id do agente
    const { data: agenteData, error: agenteError } = await supabase
      .from('agentes')
      .select('profile_id')
      .eq('id', agenteId)
      .single();

    if (agenteError || !agenteData?.profile_id) {
      return NextResponse.json({ error: 'Profile ID não encontrado.' }, { status: 400 });
    }

    const profile_id = agenteData.profile_id;

    // Verifica se a instância já existe
    const checkRes = await fetch(`${EVOLUTION_API}/instance/connectionState/${session_id}`, {
      headers: { apikey: TOKEN },
    });

    if (checkRes.ok) {
      const checkData = await checkRes.json();
      const state = checkData?.instance?.state;

      if (state === 'open') {
        console.log('[INFO] Instância já conectada. Consultando número...');

        const infoRes = await fetch(`${EVOLUTION_API}/instance/info/${session_id}`, {
          headers: { apikey: TOKEN },
        });

        const infoData = await infoRes.json();
        const numero = infoData?.instance?.number || null;

        await supabase
          .from('instancias')
          .update({ status: 'ativo', numero_whatsapp: numero, assistant_id, profile_id })
          .eq('agente_id', agenteId);

        return NextResponse.json({ status: 'ativo' });
      }

      if (state === 'connecting' || state === 'close') {
        console.log('[INFO] Instância existente. Tentando conectar...');
        const connectRes = await fetch(`${EVOLUTION_API}/instance/connect/${session_id}`, {
          method: 'GET',
          headers: { apikey: TOKEN },
        });

        const connectData = await connectRes.json();

        if (connectRes.ok && connectData?.base64) {
          return NextResponse.json({
            qrcode_base64: connectData.base64.replace(/^data:image\/png;base64,/, ''),
          });
        } else {
          console.error('[Erro ao conectar instância existente]', connectData);
          return NextResponse.json({ error: 'Erro ao conectar instância existente.' }, { status: 500 });
        }
      }
    }

    // Se instância não existe, criar nova
    console.log('[INFO] Criando nova instância:', session_id);

    const createRes = await fetch(`${EVOLUTION_API}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: TOKEN,
      },
      body: JSON.stringify({
        instanceName: session_id,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      console.error('[Erro na criação da instância]', createData);
      return NextResponse.json({ error: createData.response?.message || 'Erro ao criar instância.' }, { status: 500 });
    }

    await supabase.from('instancias').insert([
      {
        agente_id: agenteId,
        session_id,
        status: 'pendente',
        assistant_id,
        profile_id,
      },
    ]);

    // Conecta após criar
    const connectRes = await fetch(`${EVOLUTION_API}/instance/connect/${session_id}`, {
      method: 'GET',
      headers: { apikey: TOKEN },
    });

    const connectData = await connectRes.json();

    if (connectRes.ok && connectData?.base64) {
      return NextResponse.json({
        qrcode_base64: connectData.base64.replace(/^data:image\/png;base64,/, ''),
      });
    } else {
      console.warn('[Instância criada, mas QR não retornado]', connectData);
      return NextResponse.json({ error: 'Instância criada, mas o QR Code não foi retornado.' }, { status: 200 });
    }
  } catch (err) {
    console.error('[Erro geral ao criar ou conectar instância]', err);
    return NextResponse.json({ error: 'Erro interno ao criar ou conectar instância.' }, { status: 500 });
  }
}
