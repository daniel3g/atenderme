'use client';

import { useState } from 'react';

type Mensagem = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatUI({
  agenteId,
  promptInicial,
}: {
  agenteId: string;
  promptInicial: string;
}) {
  const [prompt, setPrompt] = useState(promptInicial);
  const [novoPrompt, setNovoPrompt] = useState(promptInicial);
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [conversa, setConversa] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    const novaConversa: Mensagem[] = [
      ...conversa,
      { role: 'user', content: mensagem },
    ];

    setConversa(novaConversa);
    setMensagem('');
    setLoading(true);

    const res = await fetch('/api/chat/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agenteId, mensagens: novaConversa }),
    });

    const data = await res.json();

    setConversa([
      ...novaConversa,
      { role: 'assistant', content: data.resposta },
    ]);
    setLoading(false);
  };

  const salvarPrompt = async () => {
    const res = await fetch('/api/agentes/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: agenteId, prompt: novoPrompt }),
    });

    if (res.ok) {
      setPrompt(novoPrompt);
      setEditando(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        {!editando ? (
          <>
            <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{prompt}</p>
            <button
              className="text-sm text-blue-600 underline"
              onClick={() => setEditando(true)}
            >
              Editar prompt
            </button>
            <div className="mb-4">
              <a
                href={`/instancia/${agenteId}`}
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Conectar no WhatsApp
              </a>
            </div>
          </>
        ) : (
          <>
            <textarea
              value={novoPrompt}
              onChange={(e) => setNovoPrompt(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              rows={5}
            />
            <div className="flex gap-2">
              <button
                onClick={salvarPrompt}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Salvar alterações
              </button>
              <button
                onClick={() => setEditando(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>

      <div className="border p-4 rounded bg-gray-50 h-[400px] overflow-y-auto mb-4 space-y-2">
        {conversa.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-100 text-right'
                : 'bg-green-100 text-left'
            }`}
          >
            <span>{msg.content}</span>
          </div>
        ))}
        {loading && <p className="text-gray-400">Agente está digitando...</p>}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={enviarMensagem}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>
    </>
  );
}
