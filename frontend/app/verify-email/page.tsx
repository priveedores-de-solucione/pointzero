import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/logo.png" alt="Point Zero" height={24} width={96} priority />
        </Link>
        <MailCheck className="mx-auto h-14 w-14 text-primary" />
        <h1 className="font-display text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your email address. Click the link to activate your account.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}