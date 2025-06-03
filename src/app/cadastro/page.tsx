'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Cadastro() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [celular, setCelular] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nomeCompleto,
          celular,
        },
      },
    });

    setCarregando(false);

    if (error) {
      setErro(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="max-w-md mx-auto mt-12 p-4 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Criar Conta</h1>
      <form onSubmit={handleCadastro} className="space-y-4">
        <input
          type="text"
          placeholder="Nome completo"
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="tel"
          placeholder="Celular (com DDD)"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          {carregando ? 'Criando conta...' : 'Cadastrar'}
        </button>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
      </form>
    </main>
  );
}
