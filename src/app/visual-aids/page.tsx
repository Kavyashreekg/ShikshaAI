'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { VisualAidClient } from './_components/visual-aid-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Visual Aid Designer',
    description: 'Generate simple line drawings or charts from a description, perfect for replicating on a blackboard.',
  },
  Hindi: {
    title: 'दृश्य सहायता डिजाइनर',
    description: 'एक विवरण से सरल रेखा चित्र या चार्ट उत्पन्न करें, जो ब्लैकबोर्ड पर प्रतिकृति बनाने के लिए एकदम सही है।',
  },
  Marathi: {
    title: 'दृश्यात्मक मदत डिझाइनर',
    description: 'ब्लॅकबोर्डवर प्रतिकृती तयार करण्यासाठी योग्य असलेल्या वर्णनावरून साधी रेखाचित्रे किंवा तक्ते तयार करा.',
  },
  Kannada: {
    title: 'ದೃಶ್ಯ ಸಹಾಯ ವಿನ್ಯಾಸಕ',
    description: 'ಕಪ್ಪು ಹಲಗೆಯ ಮೇಲೆ ಪುನರಾವರ್ತಿಸಲು ಪರಿಪೂರ್ಣವಾದ ವಿವರಣೆಯಿಂದ ಸರಳ ರೇಖಾಚಿತ್ರಗಳು ಅಥವಾ ಚಾರ್ಟ್‌ಗಳನ್ನು ರಚಿಸಿ.',
  },
  Telugu: {
    title: 'దృశ్య సహాయ డిజైనర్',
    description: 'నల్లబల్లపై పునరుత్పత్తి చేయడానికి సరైన వివరణ నుండి సాధారణ గీత చిత్రాలు లేదా చార్ట్‌లను రూపొందించండి.',
  },
};

export default function VisualAidsPage() {
    const { language } = useLanguage();
    const typedLanguage = language as keyof typeof pageTranslations;
    const pageTranslation = pageTranslations[typedLanguage] || pageTranslations['English'];

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title={pageTranslation.title}
          description={pageTranslation.description}
        />
        <VisualAidClient />
      </div>
    </AppShell>
  );
}