import { Header, Footer } from '@/components/layout';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function RenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={
          user
            ? {
                email: user.email || '',
                role: profile?.role,
              }
            : null
        }
      />
      <main className="flex-1 bg-gray-50">
        <div className="container-page py-6 sm:py-8 lg:py-12">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
