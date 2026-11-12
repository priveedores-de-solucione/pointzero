import { PublicNav, PublicFooter } from '@/components/shared/public-layout';

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pz-void">
      <PublicNav />
      {/* Nav is fixed and transparent at scrollY 0, so pages start under it. */}
      <main className="pt-16">{children}</main>
      <PublicFooter />
    </div>
  );
}
