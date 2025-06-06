import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CriarAgenteForm } from '@/components/CriarAgenteForm';

export default async function CriarAgentePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user;
  if (!user) {
    redirect('/login');
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 border shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Criar Agente</h1>
      <CriarAgenteForm profileId={user.id} />
    </main>
  );
}
