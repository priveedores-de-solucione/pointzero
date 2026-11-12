import { cn } from '@/lib/utils';
import { Loader2, Inbox, AlertCircle, Lock, Ban, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingState({ className, label = 'Loading...' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-muted-foreground', className)}>
      <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}

export function UnauthorizedState({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="mb-4 rounded-full bg-warning/10 p-4">
        <Lock className="h-8 w-8 text-warning" />
      </div>
      <h3 className="text-lg font-semibold">Access Restricted</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        You need to be signed in to view this content.
      </p>
      <Button asChild className="mt-4">
        <a href="/login">Sign In</a>
      </Button>
    </div>
  );
}

export function ForbiddenState({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <Ban className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">Forbidden</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        You do not have permission to access this page.
      </p>
    </div>
  );
}

export function NotFoundState({ className, message = 'The page you are looking for does not exist.' }: { className?: string; message?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="mb-4 rounded-full bg-muted p-4">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">Not Found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline" className="mt-4">
        <a href="/">Go Home</a>
      </Button>
    </div>
  );
}

export function SubmittingState({ label = 'Submitting...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
