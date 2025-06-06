import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { InstanciaClient } from '@/components/InstanciaClient';

export default async function InstanciaPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user;
  if (!user) {
    redirect('/login');
  }

  return <InstanciaClient agenteId={params.id} />;
}
