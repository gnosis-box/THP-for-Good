import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type StatusVariant = 'info' | 'warning' | 'error' | 'success';

const icons: Record<StatusVariant, typeof Info> = {
  info: Info,
  warning: TriangleAlert,
  error: AlertCircle,
  success: CheckCircle2,
};

const styles: Record<StatusVariant, string> = {
  info: 'border-trust/30 bg-trust/10 text-foreground [&>svg]:text-trust',
  warning: 'border-warning/40 bg-warning/10 text-foreground [&>svg]:text-warning',
  error: 'border-destructive/40 bg-destructive/10 text-foreground [&>svg]:text-destructive',
  success: 'border-success/40 bg-success/10 text-foreground [&>svg]:text-success',
};

type Props = {
  variant?: StatusVariant;
  title: string;
  description?: React.ReactNode;
  className?: string;
  role?: 'alert' | 'status';
};

export function StatusAlert({
  variant = 'info',
  title,
  description,
  className,
  role = variant === 'error' ? 'alert' : 'status',
}: Props) {
  const Icon = icons[variant];
  return (
    <Alert className={cn(styles[variant], className)} role={role}>
      <Icon aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      {description ? <AlertDescription>{description}</AlertDescription> : null}
    </Alert>
  );
}
