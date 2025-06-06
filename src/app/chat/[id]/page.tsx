import { createClient } from '@/lib/supabase/server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChatUI } from '@/components/ChatUI';

export default async function ChatPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/login');
  }

  const cookieHeader = (await cookies()).toString();
  const host = (await headers()).get('host'); // ✅ agora está correto
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/agentes/get?id=${params.id}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  const agente = await res.json();
  const prompt = agente.prompt || '';

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Chat com seu agente</h1>
      <ChatUI agenteId={params.id} promptInicial={prompt} />
    </main>
  );
}
