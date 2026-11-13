'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { ErrorState, LoadingState, NotFoundState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Globe, Heart, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/use-api';
import { investors as investorsApi, ApiError } from '@/lib/api';
import { mapStartup } from '@/lib/mappers';

export default function InvestorStartupDetailPage({ params }: { params: { id: string } }) {
  const { data, loading, error, refetch } = useApi(async () => {
    const [startup, saved] = await Promise.all([
      investorsApi.startup(params.id),
      investorsApi.saved().catch(() => []),
    ]);
    return { startup, isSaved: saved.some((s) => s.id === params.id) };
  }, [params.id]);

  const [savingToggle, setSavingToggle] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  if (loading) return <DashboardShell type="investor" title="Startup"><LoadingState /></DashboardShell>;
  if (error && (error.includes('not found') || error.includes('Not Found')))
    return <DashboardShell type="investor" title="Not Found"><NotFoundState /></DashboardShell>;
  if (error || !data) return <DashboardShell type="investor" title="Startup"><ErrorState description={error ?? undefined} onRetry={refetch} /></DashboardShell>;

  const raw = data.startup;
  const startup = mapStartup(raw);

  const toggleSave = async () => {
    setSavingToggle(true);
    try {
      if (data.isSaved) await investorsApi.unsave(raw.id);
      else await investorsApi.save(raw.id);
      toast.success(data.isSaved ? 'Removed from saved' : 'Saved');
      refetch();
    } catch (err) {
      toast.error((err as ApiError).message || 'Something went wrong');
    } finally {
      setSavingToggle(false);
    }
  };

  const requestIntro = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await investorsApi.requestIntro({ startup_id: raw.id, message, reason: reason || undefined });
      toast.success('Introduction requested. POINTZERO will review it first.');
      setIntroOpen(false);
      setMessage('');
      setReason('');
    } catch (err) {
      toast.error((err as ApiError).message || 'Could not request introduction');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardShell type="investor" title={startup.name}>
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarImage src={startup.logo} />
            <AvatarFallback className="rounded-xl text-xl">{startup.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{startup.name}</h1>
            <p className="text-muted-foreground">{startup.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {startup.industry && <Badge>{startup.industry}</Badge>}
              <Badge variant="secondary" className="capitalize">{startup.stage.replace('_', ' ')}</Badge>
              {startup.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{startup.location}</span>}
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Globe className="h-3 w-3" />Website
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={toggleSave} disabled={savingToggle} aria-label={data.isSaved ? 'Unsave' : 'Save'}>
              <Heart className={data.isSaved ? 'h-4 w-4 fill-current text-primary' : 'h-4 w-4'} />
            </Button>
            <Button onClick={() => setIntroOpen(true)}>Request Introduction</Button>
          </div>
        </div>

        {startup.longDescription && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">About</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-line text-sm text-muted-foreground">{startup.longDescription}</p></CardContent>
          </Card>
        )}

        {(raw.metrics ?? []).length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {raw.metrics!.map((m, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="text-muted-foreground">{m.value.toLocaleString()} {m.recorded_at && `· ${m.recorded_at}`}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {startup.founders.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Team</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {startup.founders.map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={f.avatar} />
                    <AvatarFallback>{f.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.role}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={introOpen} onOpenChange={setIntroOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request an introduction to {startup.name}</DialogTitle></DialogHeader>
          <form onSubmit={requestIntro} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Message to the founders</Label>
              <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Why this startup? (optional)</Label>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={sending || !message.trim()}>{sending ? 'Sending…' : 'Send request'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
