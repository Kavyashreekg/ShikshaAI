'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { ContentGenerationClient } from './_components/content-generation-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Content Generation',
    description: 'Create stories, examples, and explanations in local languages to make learning more relatable for your students.',
  },
  Hindi: {
    title: 'सामग्री निर्माण',
    description: 'अपने छात्रों के लिए सीखने को और अधिक भरोसेमंद बनाने के लिए स्थानीय भाषाओं में कहानियाँ, उदाहरण और स्पष्टीकरण बनाएँ।',
  },
  Marathi: {
    title: 'सामग्री निर्मिती',
    description: 'तुमच्या विद्यार्थ्यांसाठी शिकणे अधिक संबंधित बनवण्यासाठी स्थानिक भाषांमध्ये कथा, उदाहरणे आणि स्पष्टीकरण तयार करा.',
  },
  Kannada: {
    title: 'ವಿಷಯ ರಚನೆ',
    description: 'ನಿಮ್ಮ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಲಿಕೆಯನ್ನು ಹೆಚ್ಚು ಸಂಬಂಧಿತವಾಗಿಸಲು ಸ್ಥಳೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಕಥೆಗಳು, ಉದಾಹರಣೆಗಳು ಮತ್ತು ವಿವರಣೆಗಳನ್ನು ರಚಿಸಿ.',
  },
  Telugu: {
    title: 'విషయ సృష్టి',
    description: 'మీ విద్యార్థులకు అభ్యాసాన్ని మరింత సంబంధితంగా చేయడానికి స్థానిక భాషలలో కథలు, ఉదాహరణలు మరియు వివరణలను సృష్టించండి.',
  },
};

export default function ContentGenerationPage() {
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
        <ContentGenerationClient />
      </div>
    </AppShell>
  );
}
