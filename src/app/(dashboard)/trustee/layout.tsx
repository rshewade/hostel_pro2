import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/middleware';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== 'TRUSTEE') redirect('/login?error=forbidden');
  return <>{children}</>;
}
