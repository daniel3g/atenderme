'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CriarAgentePage() {
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');
  const [tom, setTom] = useState('');
  const [funcoes, setFuncoes] = useState('');
  const [regras, setRegras] = useState('');
  const [loading, setLoading] = useState(false);
  const [agenteId, setAgenteId] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/agentes/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, area, tom, funcoes, regras }),
    });

    const data = await res.json();

    if (data.id && data.assistant_id) {
      setAgenteId(data.id);

    // Cria a instância já vinculando o assistant_id
    await fetch('/api/instancias/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agenteId: data.id, assistant_id: data.assistant_id }),
    });
}


    setLoading(false);
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Criar Agente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nome do agente" className="w-full p-2 border rounded" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <input type="text" placeholder="Área de atuação" className="w-full p-2 border rounded" value={area} onChange={(e) => setArea(e.target.value)} required />
        <input type="text" placeholder="Tom de voz" className="w-full p-2 border rounded" value={tom} onChange={(e) => setTom(e.target.value)} required />
        <textarea placeholder="Funções principais" className="w-full p-2 border rounded" value={funcoes} onChange={(e) => setFuncoes(e.target.value)} required />
        <textarea placeholder="Regras de comportamento" className="w-full p-2 border rounded" value={regras} onChange={(e) => setRegras(e.target.value)} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Criando...' : 'Criar agente'}
        </button>
      </form>

      {agenteId && (
        <div className="mt-6 text-center">
          <p className="text-green-600 font-semibold">Agente criado com sucesso!</p>
          <a href={`/chat/${agenteId}`} className="inline-block mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Testar meu agente agora
          </a>
        </div>
      )}
    </main>
  );
}
