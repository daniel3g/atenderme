'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function CriarAgentePage() {
  const [nome, setNome] = useState('')
  const [area, setArea] = useState('')
  const [tom, setTom] = useState('')
  const [funcoes, setFuncoes] = useState('')
  const [regras, setRegras] = useState('')
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // ← loading true por padrão
  const [erro, setErro] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      const session = data?.session

      if (error || !session?.user) {
        router.push('/login')
        return
      }

      setProfileId(session.user.id)
      setLoading(false)
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    if (!profileId) {
      setErro('Usuário não autenticado.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/agentes/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        area,
        tom,
        funcoes,
        regras,
        profile_id: profileId,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setErro('Erro ao criar agente: ' + (data?.error || 'Erro desconhecido'))
      return
    }

    const data = await res.json()
    router.push(`/chat/${data.id}`)
  }

  if (loading) {
    return <p className="text-center mt-10">Verificando autenticação...</p>
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 border shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Criar Agente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome do agente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Área de atuação"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Tom de voz"
          value={tom}
          onChange={(e) => setTom(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Funções do agente"
          value={funcoes}
          onChange={(e) => setFuncoes(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Regras do agente"
          value={regras}
          onChange={(e) => setRegras(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          {loading ? 'Salvando...' : 'Criar agente'}
        </button>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
      </form>
    </main>
  )
}
