'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { LessonPlannerClient } from './_components/lesson-planner-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'AI Lesson Planner',
    description: 'Generate AI-powered weekly lesson plans that structure activities and optimize your valuable time.',
  },
  Hindi: {
    title: 'एआई पाठ योजनाकार',
    description: 'एआई-संचालित साप्ताहिक पाठ योजनाएँ उत्पन्न करें जो गतिविधियों की संरचना करती हैं और आपके मूल्यवान समय का अनुकूलन करती हैं।',
  },
  Marathi: {
    title: 'एआय पाठ नियोजक',
    description: 'एआय-चालित साप्ताहिक पाठ योजना तयार करा जे क्रियाकलापांची रचना करतात आणि आपला मौल्यवान वेळ अनुकूल करतात.',
  },
  Kannada: {
    title: 'ಎಐ ಪಾಠ ಯೋಜಕ',
    description: 'ಚಟುವಟಿಕೆಗಳನ್ನು ರಚಿಸುವ ಮತ್ತು ನಿಮ್ಮ ಅಮೂಲ್ಯ ಸಮಯವನ್ನು ಉತ್ತಮಗೊಳಿಸುವ AI-ಚಾಲಿತ ಸಾಪ್ತಾಹಿಕ ಪಾಠ ಯೋಜನೆಗಳನ್ನು ರಚಿಸಿ.',
  },
  Telugu: {
    title: 'ఏఐ పాఠ ప్రణాళిక',
    description: 'కార్యకలాపాలను నిర్మాణాత్మకంగా మరియు మీ విలువైన సమయాన్ని ఆప్టిమైజ్ చేసే AI-ఆధారిత వారపు పాఠ ప్రణాళికలను రూపొందించండి.',
  },
};

export default function LessonPlannerPage() {
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
        <LessonPlannerClient />
      </div>
    </AppShell>
  );
}