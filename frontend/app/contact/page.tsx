'use client';

import { useState } from 'react';
import { PublicPage } from '@/components/shared/public-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, MapPin, Mail } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <PublicPage>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight">Get in Touch</h1>
              <p className="mt-4 text-muted-foreground">
                Have a question? We read every message and reply to all relevant inquiries.
              </p>
              <div className="mt-8 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Ogbomoso, Oyo State, Nigeria</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                  <a href="mailto:hello@pointzero.build" className="text-muted-foreground hover:text-foreground">
                    hello@pointzero.build
                  </a>
                </div>
              </div>
            </div>

            <div>
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <h2 className="mt-4 font-display text-2xl font-bold">Message Sent</h2>
                  <p className="mt-2 text-muted-foreground">We will get back to you shortly.</p>
                </div>
              ) : (
                <form
                  className="space-y-5"
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input required placeholder="Your name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" required placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Input required placeholder="What is this about?" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message</Label>
                    <Textarea required rows={5} placeholder="Your message…" />
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}