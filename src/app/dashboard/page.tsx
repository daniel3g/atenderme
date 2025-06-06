import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardLogout } from '@/components/DashboardLogout';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: agentes } = await supabase
    .from('agentes')
    .select('id, nome, prompt, criado_em')
    .eq('profile_id', user.id)
    .order('criado_em', { ascending: false });

  const lista = agentes ?? [];

  return (
    <main className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-6">Meus Assistentes</h1>

      <DashboardLogout /> {/* Componente client com botão "sair" */}

      <Link
        href="/criar-agente"
        className="inline-block mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Criar novo assistente
      </Link>

      {lista.length === 0 ? (
        <p>Nenhum agente criado ainda.</p>
      ) : (
        <ul className="space-y-4">
          {lista.map((agente) => (
            <li key={agente.id} className="border p-4 rounded shadow-sm bg-white">
              <h2 className="text-xl font-semibold">{agente.nome}</h2>
              <p className="text-gray-600 text-sm mt-1">
                Criado em: {new Date(agente.criado_em).toLocaleDateString()}
              </p>
              <p className="mt-2 text-sm text-gray-800">
                {typeof agente.prompt === 'string'
                  ? agente.prompt.slice(0, 150) + '...'
                  : JSON.stringify(agente.prompt).slice(0, 150) + '...'}
              </p>
              <div className="mt-4 flex gap-4">
                <Link
                  href={`/chat/${agente.id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Ir para o Chat
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
