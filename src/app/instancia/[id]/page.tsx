'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InstanciaPage() {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('aguardando');
  const [erro, setErro] = useState('');

  // Cria a sessão na Evolution e obtém o QR
  useEffect(() => {
    const iniciarInstancia = async () => {
      try {
        const res = await fetch('/api/instancias/criar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agenteId: id }),
        });

        const data = await res.json();

        if (data.qrcode_base64) {
          setQrCode(data.qrcode_base64);
        } else {
          setErro('Erro ao iniciar a sessão.');
        }
      } catch (err) {
        setErro('Erro ao conectar com a Evolution API.');
      }
    };

    iniciarInstancia();
  }, [id]);

  // Polling para verificar se a sessão foi conectada
  useEffect(() => {
    if (!qrCode) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/instancias/status?id=${id}`);
      const data = await res.json();

      if (data.status === 'ativo') {
        setStatus('conectado');
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [qrCode, id]);

  return (
    <main className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Conectar no WhatsApp</h1>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      {status === 'conectado' ? (
        <p className="text-green-600 text-lg font-semibold">
          ✅ Conectado com sucesso!
        </p>
      ) : qrCode ? (
        <>
          <p className="mb-2 text-gray-700">Escaneie o QR Code abaixo:</p>
          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="mx-auto mb-4" />
          <p className="text-sm text-gray-500">Aguardando conexão...</p>
        </>
      ) : (
        <p className="text-gray-600">Preparando a sessão...</p>
      )}
    </main>
  );
}
