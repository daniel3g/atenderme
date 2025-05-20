import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import workflowModelo from '@/assets/WhatsApp_modelo.json';

const N8N_URL = 'https://workflows.guarumidia.com';
const N8N_API_KEY = process.env.N8N_API_KEY || 'SUA_CHAVE_GERADA_DO_N8N';
const EVOLUTION_API = 'https://wsapi.guarumidia.com';
const TOKEN = process.env.EVOLUTION_API_TOKEN || '';

export async function POST(req: NextRequest) {
  const { agenteId } = await req.json();

  // 1. Busca a instância vinculada no Supabase
  const { data, error } = await supabase
    .from('instancias')
    .select('*')
    .eq('agente_id', agenteId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
  }

  const { session_id, status, assistant_id } = data;

  if (status !== 'ativo') {
    return NextResponse.json({ error: 'Instância ainda não está conectada.' }, { status: 400 });
  }

  if (!assistant_id) {
    return NextResponse.json({ error: 'assistant_id não encontrado para esta instância.' }, { status: 400 });
  }

  const novoWebhook = `https://webhooks.guarumidia.com/webhook/${session_id.startsWith('sessao-') ? session_id : `sessao-${session_id}`}`;
  const novoNome = `WhatsApp - Agente ${agenteId.slice(0, 5)} (${session_id.slice(0, 5)})`;

  // 2. Clona e edita o modelo do fluxo
  const novoFluxo = JSON.parse(JSON.stringify(workflowModelo));
  novoFluxo.name = novoNome;
  novoFluxo.settings = {
    timezone: 'America/Sao_Paulo',
    executionTimeout: 3600,
  };

  novoFluxo.nodes = novoFluxo.nodes.map((node: any) => {
    if (node.type === 'n8n-nodes-base.webhook') {
      return {
        ...node,
        parameters: {
          ...node.parameters,
          path: session_id.startsWith('sessao-') ? session_id : `sessao-${session_id}`,
        },
      };
    }

    if (node.type === 'n8n-nodes-base.openaiAssistant') {
      return {
        ...node,
        parameters: {
          ...node.parameters,
          assistantId: {
            value: assistant_id,
            mode: 'list',
          },
        },
      };
    }

    return node;
  });

  // 3. Cria o fluxo via API do n8n
  const createRes = await fetch(`${N8N_URL}/api/v1/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY,
    },
    body: JSON.stringify(novoFluxo),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    return NextResponse.json({ error: 'Erro ao criar fluxo no n8n', details: createData }, { status: 500 });
  }

  const workflowId = createData.id;

  // 4. Ativa o fluxo
  await fetch(`${N8N_URL}/api/v1/workflows/${workflowId}/activate`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
    },
  });

  // 5. Define o webhook na Evolution
  await fetch(`${EVOLUTION_API}/webhook/set/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: TOKEN,
    },
    body: JSON.stringify({
      webhook: {
        url: novoWebhook,
        enabled: true,
        method: 'POST',
        contentType: 'application/json',
        base64: false,
        headers: {},
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE'],
      },
    }),
  });

  // 6. Atualiza Supabase
  await supabase
    .from('instancias')
    .update({ webhook: novoWebhook, workflow_id: workflowId })
    .eq('session_id', session_id);

  return NextResponse.json({ success: true, workflowId, webhook: novoWebhook });
}
