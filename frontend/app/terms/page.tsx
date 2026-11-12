import Link from 'next/link';
import { PublicPage } from '@/components/shared/public-page';
import { PzPageHero } from '@/components/shared/pz-hero';

export default function TermsPage() {
  return (
    <PublicPage>
      <PzPageHero
        eyebrow="Legal"
        title="Terms"
        description="This page is being finalised. For any question in the meantime, get in touch and we will answer directly."
      >
        <Link href="/contact" className="mt-8 inline-block font-display text-sm font-semibold text-pz-signal hover:underline">
          Contact us
        </Link>
      </PzPageHero>
    </PublicPage>
  );
}
