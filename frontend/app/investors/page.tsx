import { PublicPage } from '@/components/shared/public-page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrendingUp, Filter, Handshake, Calendar, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Startup Discovery', description: 'Browse a curated directory of vetted startups across industries and stages.' },
  { icon: Filter, title: 'Curated Deal Flow', description: 'Receive deal flow matched to your thesis, stage, and sector preferences.' },
  { icon: Handshake, title: 'Founder Introductions', description: 'Request direct introductions to founders through POINTZERO.' },
  { icon: Calendar, title: 'Demo Days', description: 'Attend quarterly demo days and see cohort companies pitch live.' },
  { icon: BarChart3, title: 'Ecosystem Intelligence', description: 'Track the growth of POINTZERO companies with regular ecosystem updates.' },
];

export default function InvestorsPage() {
  return (
    <PublicPage>
      <section className="py-16 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Discover what the next generation of African companies is building.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              POINTZERO gives investors early access to disciplined founders building in Ogbomoso — and across Africa.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/apply">Apply as an Investor</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/startups">Browse Startups <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border p-6">
                <div className="rounded-lg bg-primary/10 p-3 w-fit">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-24 rounded-2xl bg-foreground px-8 py-16 text-center text-background">
            <h2 className="font-display text-3xl font-bold">Ready to invest in the next generation?</h2>
            <p className="mt-4 text-sm opacity-70 max-w-md mx-auto">
              Join POINTZERO as a verified investor and get access to the full platform.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href="/apply">Apply as an Investor</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}