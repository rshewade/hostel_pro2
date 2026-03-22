import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/middleware';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return <div className="min-h-screen flex"><main className="flex-1 p-6">{children}</main></div>;
}
