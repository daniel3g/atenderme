'use client';

import { signOut } from '@/app/login/actions';

export function DashboardLogout() {
  return (
    <form>
      <button
        className="flex items-center justify-center bg-red rounded-md p-2 h-8 w-20 text-black"
        formAction={signOut}
      >
        sair
      </button>
    </form>
  );
}
