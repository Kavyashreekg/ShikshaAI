'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookText, Layers, BrainCircuit, Paintbrush, Users, CalendarCheck } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const features = [
  {
    href: '/content-generation',
    icon: <BookText className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Content Generation',
        description: 'Create stories and examples in local languages.',
      },
      Hindi: {
        title: 'सामग्री निर्माण',
        description: 'स्थानीय भाषाओं में कहानियाँ और उदाहरण बनाएँ।',
      },
      Marathi: {
        title: 'सामग्री निर्मिती',
        description: 'स्थानिक भाषांमध्ये कथा आणि उदाहरणे तयार करा.',
      },
    },
  },
  {
    href: '/worksheets',
    icon: <Layers className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Differentiated Worksheets',
        description: 'Generate worksheets from textbook pages for multiple grades.',
      },
      Hindi: {
        title: 'विभेदित कार्यपत्रक',
        description: 'कई ग्रेड के लिए पाठ्यपुस्तक पृष्ठों से वर्कशीट उत्पन्न करें।',
      },
      Marathi: {
        title: 'विभेदित कार्यपत्रके',
        description: 'एकाधिक श्रेणींसाठी पाठ्यपुस्तकाच्या पृष्ठांवरून कार्यपत्रके तयार करा.',
      },
    },
  },
  {
    href: '/knowledge-base',
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Instant Knowledge Base',
        description: 'Get simple explanations and analogies for any question.',
      },
      Hindi: {
        title: 'त्वरित ज्ञान कोष',
        description: 'किसी भी प्रश्न के लिए सरल स्पष्टीकरण और उपमाएँ प्राप्त करें।',
      },
      Marathi: {
        title: 'झटपट ज्ञान आधार',
        description: 'कोणत्याही प्रश्नासाठी सोपी स्पष्टीकरणे आणि उपमा मिळवा.',
      },
    },
  },
  {
    href: '/visual-aids',
    icon: <Paintbrush className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Visual Aid Designer',
        description: 'Create simple drawings and charts for your lessons.',
      },
      Hindi: {
        title: 'दृश्य सहायता डिजाइनर',
        description: 'अपने पाठों के लिए सरल चित्र और चार्ट बनाएँ।',
      },
      Marathi: {
        title: 'दृश्यात्मक मदत डिझाइनर',
        description: 'तुमच्या पाठांसाठी सोपी रेखाचित्रे आणि तक्ते तयार करा.',
      },
    },
  },
  {
    href: '/student-assessment',
    icon: <Users className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Student Assessment',
        description: 'Track student progress and get AI-powered suggestions.',
      },
      Hindi: {
        title: 'छात्र मूल्यांकन',
        description: 'छात्र की प्रगति को ट्रैक करें और AI-संचालित सुझाव प्राप्त करें।',
      },
      Marathi: {
        title: 'विद्यार्थी मूल्यांकन',
        description: 'विद्यार्थ्यांच्या प्रगतीचा मागोवा घ्या आणि AI-चालित सूचना मिळवा.',
      },
    },
  },
  {
    href: '/lesson-planner',
    icon: <CalendarCheck className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'AI Lesson Planner',
        description: 'Generate weekly lesson plans to save time.',
      },
      Hindi: {
        title: 'एआई पाठ योजनाकार',
        description: 'समय बचाने के लिए साप्ताहिक पाठ योजनाएँ उत्पन्न करें।',
      },
      Marathi: {
        title: 'एआय पाठ नियोजक',
        description: 'वेळ वाचवण्यासाठी साप्ताहिक पाठ योजना तयार करा.',
      },
    },
  },
];

export default function DashboardPage() {
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof features[0]['translations'];

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="Welcome to your Dashboard"
          description="ShikshaAI is your AI teaching companion. Here's what you can do:"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const translation = feature.translations[typedLanguage] || feature.translations['English'];
            return (
              <Link href={feature.href} key={feature.href}>
                <Card className="flex h-full flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-headline">{translation.title}</CardTitle>
                        <CardDescription>{translation.description}</CardDescription>
                      </div>
                      {feature.icon}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
