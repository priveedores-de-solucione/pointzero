'use client';

import { useState, useRef, useEffect } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { messages as messagesApi, Conversation, Message, PaginatedResponse } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

function getDisplayName(c: Conversation) {
  if (c.other_user) return `${c.other_user.first_name} ${c.other_user.last_name}`.trim();
  return c.name ?? 'Unknown';
}

function getAvatar(c: Conversation) {
  return c.other_user?.avatar_url ?? c.avatar ?? '';
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: convData, loading: convLoading } = useApi<{ data: Conversation[] }>(() =>
    messagesApi.conversations().then((d) => ({ data: d })),
  );

  const conversations = convData?.data ?? [];

  const { data: threadData, loading: threadLoading, refetch: refetchThread } = useApi<PaginatedResponse<Message>>(
    () => activeId ? messagesApi.thread(activeId, { limit: 50 }) : Promise.resolve({ items: [], total: 0, page: 1, limit: 50, pages: 0 }),
    [activeId],
  );

  const msgs = threadData?.items ?? [];
  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (conversations.length && !activeId) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const handleSend = async () => {
    if (!draft.trim() || !activeId) return;
    setSending(true);
    try {
      await messagesApi.send(activeId, draft.trim());
      setDraft('');
      refetchThread();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardShell type="member" title="Messages">
      <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-border">
        <aside className="w-72 shrink-0 border-r border-border overflow-y-auto">
          {convLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 m-2 rounded-lg" />)
            : conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors',
                  activeId === c.id && 'bg-muted',
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={getAvatar(c)} />
                  <AvatarFallback>{getDisplayName(c)[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{getDisplayName(c)}</p>
                    {(c.unread_count ?? 0) > 0 && (
                      <Badge className="ml-1 h-4 w-4 shrink-0 rounded-full p-0 flex items-center justify-center text-[10px]">
                        {c.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                </div>
              </button>
            ))}
        </aside>

        <div className="flex flex-1 flex-col">
          {active && (
            <>
              <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatar(active)} />
                  <AvatarFallback>{getDisplayName(active)[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{getDisplayName(active)}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {threadLoading
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-48 rounded-xl" />)
                  : msgs.map((m) => (
                    <div key={m.id} className={cn('flex', m.sender_id === user?.id ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-xs rounded-xl px-4 py-2.5 text-sm', m.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border px-5 py-3 flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <Button size="icon" onClick={handleSend} disabled={sending || !draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          {!active && !convLoading && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
