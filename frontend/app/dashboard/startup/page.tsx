'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { startups as startupsApi, files as filesApi, introductions as introductionsApi, type Startup, type UploadedFile } from '@/lib/api';
import { fullName, humanize } from '@/lib/mappers';

const errMsg = (err: unknown, fallback: string) => (err as Error).message || fallback;

type BasicForm = {
  name: string;
  description: string;
  industry: string;
  website: string;
  stage: string;
  location: string;
};

const toForm = (s?: Partial<Startup>): BasicForm => ({
  name: s?.name ?? '',
  description: s?.description ?? '',
  industry: s?.industry ?? '',
  website: s?.website ?? '',
  stage: s?.stage ?? '',
  location: s?.location ?? '',
});

function BasicInfoFields({ form, onChange }: { form: BasicForm; onChange: (f: BasicForm) => void }) {
  const set = (k: keyof BasicForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [k]: e.target.value });
  return (
    <>
      <div className="space-y-1.5"><Label>Startup Name</Label><Input value={form.name} onChange={set('name')} required /></div>
      <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={set('description')} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Industry</Label><Input value={form.industry} onChange={set('industry')} /></div>
        <div className="space-y-1.5"><Label>Website</Label><Input value={form.website} onChange={set('website')} placeholder="https://" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Stage</Label><Input value={form.stage} onChange={set('stage')} placeholder="e.g. Pre-seed" /></div>
        <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={set('location')} /></div>
      </div>
    </>
  );
}

function CreateStartup({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState<BasicForm>(toForm());
  const [saving, setSaving] = useState(false);
  const canCreate = user && ['FOUNDER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);

  if (!canCreate) {
    return (
      <EmptyState
        icon={Rocket}
        title="You're not on a startup yet"
        description="Ask a founder to add you to their team using your email address."
      />
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await startupsApi.create(form);
      toast.success('Startup created');
      onCreated();
    } catch (err) {
      toast.error(errMsg(err, 'Could not create startup'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle className="text-base">Create your startup</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <BasicInfoFields form={form} onChange={setForm} />
          <Button type="submit" disabled={saving || !form.name.trim()}>{saving ? 'Creating…' : 'Create startup'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TeamTab({ startupId }: { startupId: string }) {
  const { data: members, loading, refetch } = useApi(() => startupsApi.members(startupId), [startupId]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await startupsApi.addMember(startupId, { email, role: role || undefined });
      toast.success('Member added');
      setEmail('');
      setRole('');
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not add member'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (userId: string) => {
    try {
      await startupsApi.removeMember(startupId, userId);
      toast.success('Member removed');
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not remove member'));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <LoadingState className="py-6" />
        ) : (
          (members ?? []).map((m) => (
            <div key={m.user_id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{fullName(m.profiles, m.profiles?.email ?? 'Member')}</p>
                <p className="text-xs text-muted-foreground">
                  {m.role}{m.is_founder && ' · Founder'}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(m.user_id)}>Remove</Button>
            </div>
          ))
        )}
        <form onSubmit={add} className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
          <Input type="email" placeholder="teammate@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input placeholder="Role (optional)" value={role} onChange={(e) => setRole(e.target.value)} className="sm:max-w-[180px]" />
          <Button type="submit" size="sm" className="h-10" disabled={busy}>Add Member</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MetricsTab({ startupId }: { startupId: string }) {
  const { data: metrics, loading, refetch } = useApi(() => startupsApi.metrics(startupId), [startupId]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await startupsApi.addMetric(startupId, { name, value: Number(value) });
      setName('');
      setValue('');
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not add metric'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Traction & Metrics</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <LoadingState className="py-6" />
        ) : (metrics ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No metrics recorded yet.</p>
        ) : (
          (metrics ?? []).map((m, i) => (
            <div key={m.id ?? i} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span className="font-medium">{m.name}</span>
              <span className="text-muted-foreground">
                {m.value.toLocaleString()} {m.recorded_at && `· ${m.recorded_at}`}
              </span>
            </div>
          ))
        )}
        <form onSubmit={add} className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
          <Input placeholder="Metric (e.g. MRR)" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="number" step="any" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} required className="sm:max-w-[160px]" />
          <Button type="submit" size="sm" className="h-10" disabled={busy}>Add Metric</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DocumentsTab({ startupId }: { startupId: string }) {
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const f = await filesApi.upload('startup-documents', file, startupId);
      setUploaded((u) => [f, ...u]);
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(errMsg(err, 'Upload failed'));
    } finally {
      setBusy(false);
    }
  };

  const open = async (id: string) => {
    try {
      const { url } = await filesApi.downloadUrl(id);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error(errMsg(err, 'Could not open file'));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Documents</CardTitle>
        <Button size="sm" asChild disabled={busy}>
          <label className="cursor-pointer">
            {busy ? 'Uploading…' : 'Upload'}
            <input type="file" className="hidden" accept=".pdf,.docx,image/*" onChange={onFile} disabled={busy} />
          </label>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">PDF, DOCX or images. Only your team and POINTZERO staff can open them.</p>
        {uploaded.map((f) => (
          <button key={f.id} onClick={() => open(f.id)} className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm hover:bg-muted/50">
            <span className="truncate">{f.filename}</span>
            <Badge variant="secondary">Open</Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function InvestorIntrosTab({ startupId }: { startupId: string }) {
  const { data, loading, refetch } = useApi(() => introductionsApi.incoming(), []);
  const intros = (data ?? []).filter((r) => r.startup_id === startupId);

  const respond = async (id: string, accept: boolean) => {
    try {
      if (accept) await introductionsApi.accept(id);
      else await introductionsApi.decline(id);
      toast.success(accept ? 'Introduction accepted. A conversation has been opened.' : 'Introduction declined');
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not respond'));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Investor Introductions</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <LoadingState className="py-6" />
        ) : intros.length === 0 ? (
          <p className="text-sm text-muted-foreground">No introduction requests yet. Turn on investor visibility to be discovered.</p>
        ) : (
          intros.map((r) => (
            <div key={r.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{r.investors?.organization ?? 'Investor'}</p>
                <Badge variant="outline">{humanize(r.status)}</Badge>
              </div>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{r.message}</p>
              {r.status === 'founder_pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respond(r.id, true)}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => respond(r.id, false)}>Decline</Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function StartupDashboardPage() {
  const { data: mine, loading, error, refetch } = useApi(() => startupsApi.mine(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const startup = mine?.find((s) => s.id === selectedId) ?? mine?.[0];

  const [form, setForm] = useState<BasicForm>(toForm());
  const [longDescription, setLongDescription] = useState('');
  const [visibility, setVisibility] = useState({ is_public: false, investor_visible: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!startup) return;
    setForm(toForm(startup));
    setLongDescription(startup.long_description ?? '');
    setVisibility({ is_public: !!startup.is_public, investor_visible: !!startup.investor_visible });
  }, [startup]);

  const save = async (body: Partial<Startup>) => {
    if (!startup) return;
    setSaving(true);
    try {
      await startupsApi.update(startup.id, body);
      toast.success('Saved');
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not save'));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (key: 'is_public' | 'investor_visible', value: boolean) => {
    if (!startup) return;
    const prev = visibility;
    setVisibility({ ...visibility, [key]: value });
    try {
      await startupsApi.setVisibility(startup.id, { [key]: value });
    } catch (err) {
      setVisibility(prev);
      toast.error(errMsg(err, 'Could not update visibility'));
    }
  };

  let body: React.ReactNode;
  if (loading) body = <LoadingState />;
  else if (error) body = <ErrorState description={error} onRetry={refetch} />;
  else if (!startup) body = <CreateStartup onCreated={refetch} />;
  else
    body = (
      <>
        {mine && mine.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {mine.map((s) => (
              <Button key={s.id} size="sm" variant={s.id === startup.id ? 'default' : 'outline'} onClick={() => setSelectedId(s.id)}>
                {s.name}
              </Button>
            ))}
          </div>
        )}
        <Tabs defaultValue="overview">
          <TabsList>
            {['overview', 'team', 'product', 'metrics', 'documents', 'visibility', 'investors'].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6 max-w-2xl space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <BasicInfoFields form={form} onChange={setForm} />
                <Button onClick={() => save(form)} disabled={saving || !form.name.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-6 max-w-2xl">
            <TeamTab startupId={startup.id} />
          </TabsContent>

          <TabsContent value="visibility" className="mt-6 max-w-xl">
            <Card>
              <CardHeader><CardTitle className="text-base">Visibility Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Public Profile</p>
                    <p className="text-xs text-muted-foreground">Show startup in public directory</p>
                  </div>
                  <Switch checked={visibility.is_public} onCheckedChange={(v) => toggleVisibility('is_public', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Investor Visibility</p>
                    <p className="text-xs text-muted-foreground">Allow verified investors to view full profile</p>
                  </div>
                  <Switch checked={visibility.investor_visible} onCheckedChange={(v) => toggleVisibility('investor_visible', v)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="product" className="mt-6 max-w-2xl space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Product Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>The problem, your solution and the product</Label>
                  <Textarea rows={8} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
                </div>
                <Button onClick={() => save({ long_description: longDescription })} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="mt-6 max-w-2xl">
            <MetricsTab startupId={startup.id} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6 max-w-2xl">
            <DocumentsTab startupId={startup.id} />
          </TabsContent>

          <TabsContent value="investors" className="mt-6 max-w-2xl">
            <InvestorIntrosTab startupId={startup.id} />
          </TabsContent>
        </Tabs>
      </>
    );

  return (
    <DashboardShell type="member" title="Startup" subtitle="Manage your startup profile">
      {body}
    </DashboardShell>
  );
}
