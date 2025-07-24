import type { FC } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
