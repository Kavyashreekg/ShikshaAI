'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { KnowledgeBaseClient } from './_components/knowledge-base-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Instant Knowledge Base',
    description: 'Get simple, accurate explanations for complex student questions, complete with easy-to-understand analogies.',
  },
  Hindi: {
    title: 'त्वरित ज्ञान कोष',
    description: 'जटिल छात्र प्रश्नों के लिए सरल, सटीक स्पष्टीकरण प्राप्त करें, जो समझने में आसान उपमाओं के साथ पूर्ण हों।',
  },
  Marathi: {
    title: 'झटपट ज्ञान आधार',
    description: 'गुंतागुंतीच्या विद्यार्थ्यांच्या प्रश्नांसाठी सोपी, अचूक स्पष्टीकरण मिळवा, समजण्यास सोप्या उपमांसह पूर्ण करा.',
  },
  Kannada: {
    title: 'ತ್ವರಿತ ಜ್ಞಾನದ ಮೂಲ',
    description: 'ಸಂಕೀರ್ಣ ವಿದ್ಯಾರ್ಥಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸರಳ, ನಿಖರವಾದ ವಿವರಣೆಗಳನ್ನು ಪಡೆಯಿರಿ, ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಸಾದೃಶ್ಯಗಳೊಂದಿಗೆ ಪೂರ್ಣಗೊಳಿಸಿ.',
  },
  Telugu: {
    title: 'తక్షణ జ్ఞాన ఆధారం',
    description: 'క్లిష్టమైన విద్యార్థి ప్రశ్నలకు సరళమైన, ఖచ్చితమైన వివరణలను పొందండి, సులభంగా అర్థం చేసుకోగల సారూప్యతలతో పూర్తి చేయండి.',
  },
};

export default function KnowledgeBasePage() {
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
        <KnowledgeBaseClient />
      </div>
    </AppShell>
  );
}