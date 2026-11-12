import { PublicPage } from '@/components/shared/public-page';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CommunityMemberCard } from '@/components/shared/pz-cards';
import { communityMembers, activities } from '@/lib/mock-data';

const roles = ['Founders', 'Builders', 'Designers', 'Students', 'Mentors', 'Investors', 'Operators'];

export default function CommunityPage() {
  return (
    <PublicPage>
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">Community</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            You are not building alone.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A community of founders, builders, designers, students, mentors, and investors — all building the future of Africa together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {roles.map((r) => (
              <Badge key={r} variant="secondary" className="px-4 py-2 text-sm">{r}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="border-b border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">What we do together</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((a) => (
              <Card key={a.id} className="border-border/60">
                <CardContent className="pt-5">
                  <Badge variant="outline" className="mb-2 capitalize text-xs">{a.type.replace('_', ' ')}</Badge>
                  <h3 className="font-display font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  <p className="mt-3 text-xs font-medium text-primary">{a.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">The Community</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {communityMembers.map((m) => (
              <CommunityMemberCard key={m.id} member={m} />
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
