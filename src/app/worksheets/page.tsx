'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { WorksheetClient } from './_components/worksheet-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Differentiated Worksheets',
    description: 'Upload a photo of a textbook page to instantly generate worksheets tailored to different grade levels.',
  },
  Hindi: {
    title: 'विभेदित कार्यपत्रक',
    description: 'विभिन्न ग्रेड स्तरों के अनुरूप वर्कशीट तुरंत उत्पन्न करने के लिए पाठ्यपुस्तक पृष्ठ की एक तस्वीर अपलोड करें।',
  },
  Marathi: {
    title: 'विभेदित कार्यपत्रके',
    description: 'वेगवेगळ्या ग्रेड स्तरांनुसार त्वरित कार्यपत्रके तयार करण्यासाठी पाठ्यपुस्तकाच्या पृष्ठाचा फोटो अपलोड करा.',
  },
  Kannada: {
    title: 'ಭೇದಾತ್ಮಕ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು',
    description: 'ವಿಭಿನ್ನ ದರ್ಜೆಯ ಹಂತಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ತ್ವರಿತವಾಗಿ ರಚಿಸಲು ಪಠ್ಯಪುಸ್ತಕ ಪುಟದ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
  },
  Telugu: {
    title: 'విభేదించిన వర్క్‌షీట్లు',
    description: 'విభిన్న గ్రేడ్ స్థాయిలకు అనుగుణంగా వర్క్‌షీట్‌లను తక్షణమే రూపొందించడానికి పాఠ్యపుస్తక పేజీ యొక్క ఫోటోను అప్‌లోడ్ చేయండి.',
  },
};

export default function WorksheetsPage() {
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
        <WorksheetClient />
      </div>
    </AppShell>
  );
}