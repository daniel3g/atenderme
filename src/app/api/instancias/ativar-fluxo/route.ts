import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import workflowModelo from '@/assets/WhatsApp_modelo.json'
import { spawn } from 'child_process'
import path from 'path'

const N8N_URL = 'https://workflows.guarumidia.com'
const N8N_API_KEY = process.env.N8N_API_KEY || 'SUA_CHAVE_GERADA_DO_N8N'
const EVOLUTION_API = 'https://wsapi.guarumidia.com'
const TOKEN = process.env.EVOLUTION_API_TOKEN || ''

export async function POST(req: NextRequest) {
  const { agenteId } = await req.json()

  const { data, error } = await supabase
    .from('instancias')
    .select('*')
    .eq('agente_id', agenteId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 })
  }

  const { session_id, status, assistant_id } = data

  if (status !== 'ativo') {
    return NextResponse.json({ error: 'Instância ainda não está conectada.' }, { status: 400 })
  }

  if (!assistant_id) {
    return NextResponse.json({ error: 'assistant_id não definido para essa instância.' }, { status: 400 })
  }

  const novoWebhook = `https://webhooks.guarumidia.com/webhook/${session_id}`
  const novoNome = `WhatsApp - Agente ${agenteId.slice(0, 5)} (${session_id.slice(0, 5)})`

  const fluxoClonado = structuredClone(workflowModelo)
  const nomeWebhook = `Webhook Sessão ${session_id.slice(0, 5)}`

  for (const node of fluxoClonado.nodes) {
    if (node.name === 'Webhook') {
      node.name = nomeWebhook
      break
    }
  }

  const conexoes = fluxoClonado.connections as Record<string, any>;
if (conexoes['Webhook']) {
  conexoes[nomeWebhook] = conexoes['Webhook'];
  delete conexoes['Webhook'];
}


  const fluxoRaw = JSON.stringify(fluxoClonado)
    .replace(/{{session_id}}/g, session_id)
    .replace(/{{assistant_id}}/g, assistant_id)

  const novoFluxo = JSON.parse(fluxoRaw)
  delete novoFluxo.active
  novoFluxo.name = novoNome
  novoFluxo.settings = {
    timezone: 'America/Sao_Paulo',
    executionTimeout: 3600,
  }

  const createRes = await fetch(`${N8N_URL}/api/v1/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY,
    },
    body: JSON.stringify(novoFluxo),
  })

  const createData = await createRes.json()
  if (!createRes.ok) {
    return NextResponse.json({ error: 'Erro ao criar fluxo no n8n', details: createData }, { status: 500 })
  }

  const workflowId = createData.id

  await fetch(`${N8N_URL}/api/v1/workflows/${workflowId}/activate`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
    },
  })

  await fetch(`${EVOLUTION_API}/webhook/set/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: TOKEN,
    },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: novoWebhook,
        method: 'POST',
        contentType: 'application/json',
        base64: false,
        headers: {},
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE'],
      },
    }),
  })

  await supabase
    .from('instancias')
    .update({ webhook: novoWebhook, workflow_id: workflowId })
    .eq('session_id', session_id)

  // ✅ Executa script Puppeteer para forçar salvamento do fluxo
  setTimeout(() => {
    const scriptPath = path.resolve(process.cwd(), 'forcaSalvarFluxo.js')
    console.log(`🔧 Executando script para salvar o fluxo ${workflowId}...`)

    const processo = spawn('node', [scriptPath, workflowId], {
      stdio: 'inherit',
      env: process.env,
    })

    processo.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ Fluxo ${workflowId} salvo automaticamente com sucesso!`)
      } else {
        console.error(`❌ Erro ao salvar fluxo ${workflowId} (exit code: ${code})`)
      }
    })
  }, 3000)

  return NextResponse.json({ success: true, workflowId, webhook: novoWebhook })
}
