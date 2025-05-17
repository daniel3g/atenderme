import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const EVOLUTION_API = 'https://wsapi.guarumidia.com';
const TOKEN = process.env.EVOLUTION_API_TOKEN || '';

console.log('Token carregado:', TOKEN);


export async function POST(req: NextRequest) {
  const { agenteId } = await req.json();
  const session_id = `sessao-${agenteId}`;

  try {
  console.log('Criando instância com nome:', session_id);

  const response = await fetch(`${EVOLUTION_API}/instance/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'AuthenticationApiKey': TOKEN,
  },
  body: JSON.stringify({ instanceName: session_id }),
});


  const result = await response.json();

  console.log('Resposta da Evolution:', result);

  if (!result.qrcode) {
    return NextResponse.json({ error: 'QR Code não retornado pela Evolution.' }, { status: 500 });
  }

  await supabase.from('instancias').insert([
    {
      agente_id: agenteId,
      session_id,
      status: 'pendente',
    },
  ]);

  return NextResponse.json({ qrcode_base64: result.qrcode });
} catch (err) {
  console.error('Erro detalhado ao criar instância:', err);
  return NextResponse.json({ error: 'Erro ao criar instância na Evolution.' }, { status: 500 });
}

}
