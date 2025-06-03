'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InstanciaPage() {
  const { id } = useParams();
  const [agenteId, setAgenteId] = useState<string | null>(null);
  const [status, setStatus] = useState<'pendente' | 'ativo' | 'erro'>('pendente');
  const [qrcode, setQrcode] = useState<string | null>(null);

  // Define o ID do agente
  useEffect(() => {
    if (typeof id === 'string') {
      setAgenteId(id);
    }
  }, [id]);

  // Criação da instância
useEffect(() => {
  const criarInstancia = async () => {
    if (!agenteId) return;

    try {
      const resAgente = await fetch(`/api/agentes/get?id=${agenteId}`);
      const dataAgente = await resAgente.json();

      if (!dataAgente?.assistant_id) {
        console.error('❌ assistant_id não encontrado');
        setStatus('erro');
        return;
      }

      const resInstancia = await fetch('/api/instancias/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agenteId,
          assistant_id: dataAgente.assistant_id,
        }),
      });

      const dataInstancia = await resInstancia.json();
      if (dataInstancia.qrcode_base64) {
        setQrcode(dataInstancia.qrcode_base64);
      }
    } catch (err) {
      console.error('Erro ao criar instância:', err);
      setStatus('erro');
    }
  };

  criarInstancia();
}, [agenteId]);


  // Verificação do status
  useEffect(() => {
    if (!agenteId) return;

    const interval = setInterval(() => {
      fetch(`/api/instancias/status?id=${agenteId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ativo') {
            setStatus('ativo');
            setQrcode(null);
            clearInterval(interval);
          }
        })
        .catch(() => setStatus('erro'));
    }, 5000);

    return () => clearInterval(interval);
  }, [agenteId]);

  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <h1>Conectar no WhatsApp</h1>

      {status === 'ativo' && <p>✅ Conectado com sucesso!</p>}
      {status === 'erro' && <p>Erro ao iniciar a sessão.<br />Preparando a sessão...</p>}
      {status === 'pendente' && !qrcode && <p>Preparando a sessão...</p>}
      {status === 'pendente' && qrcode && (
        <img
          src={`data:image/png;base64,${qrcode}`}
          alt="QR Code"
          width={350}
          height={350}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
}