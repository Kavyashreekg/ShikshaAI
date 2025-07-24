import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookText, Layers, BrainCircuit, Paintbrush, Users, CalendarCheck } from 'lucide-react';

const features = [
  {
    title: 'Localized Content Generation',
    description: 'Create stories and examples in local languages.',
    href: '/content-generation',
    icon: <BookText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Differentiated Worksheets',
    description: 'Generate worksheets from textbook pages for multiple grades.',
    href: '/worksheets',
    icon: <Layers className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Instant Knowledge Base',
    description: 'Get simple explanations and analogies for any question.',
    href: '/knowledge-base',
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Visual Aid Designer',
    description: 'Create simple drawings and charts for your lessons.',
    href: '/visual-aids',
    icon: <Paintbrush className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Student Assessment',
    description: 'Track student progress and get AI-powered suggestions.',
    href: '/student-assessment',
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: 'AI Lesson Planner',
    description: 'Generate weekly lesson plans to save time.',
    href: '/lesson-planner',
    icon: <CalendarCheck className="h-8 w-8 text-primary" />,
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="Welcome to your Dashboard"
          description="ShikshaAI is your AI teaching companion. Here's what you can do:"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.href}>
              <Card className="flex h-full flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-headline">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                    {feature.icon}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
