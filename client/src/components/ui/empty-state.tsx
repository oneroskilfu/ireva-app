import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
  children,
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center min-h-[300px] rounded-lg border border-dashed bg-muted/30",
      className
    )}>
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      {actionLabel && (onAction || actionHref) && (
        <Button
          onClick={onAction}
          {...(actionHref ? { asChild: true } : {})}
          className="relative overflow-hidden group"
        >
          {actionHref ? (
            <a href={actionHref} className="flex items-center">
              <span>{actionLabel}</span>
            </a>
          ) : (
            <span>{actionLabel}</span>
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      )}
      
      {children}
    </div>
  );
};

export default EmptyState;