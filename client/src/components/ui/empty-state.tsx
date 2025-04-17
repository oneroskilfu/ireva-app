import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {action && (
          <div>
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;