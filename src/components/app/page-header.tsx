
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  showCloseButton?: boolean;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, description, showCloseButton = false }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {showCloseButton && (
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Link>
        </Button>
      )}
    </div>
  );
};
