'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { ReadingAssessmentClient } from './_components/reading-assessment-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Reading Assessment',
    description: 'Generate student-friendly reading paragraphs to improve vocabulary and comprehension.',
  },
  Hindi: {
    title: 'पठन मूल्यांकन',
    description: 'शब्दावली और समझ में सुधार के लिए छात्र-अनुकूल पठन अनुच्छेद उत्पन्न करें।',
  },
  Marathi: {
    title: 'वाचन मूल्यांकन',
    description: 'शब्दसंग्रह आणि आकलन सुधारण्यासाठी विद्यार्थी-अनुकूल वाचन परिच्छेद तयार करा.',
  },
  Kashmiri: {
    title: 'پَرنُک تَحقیٖق',
    description: 'ذخیرٕ الفاظ تہٕ فہم بہتر بناونہٕ خٲطرٕ طالب علم دوست پَرنُک پیراگراف تیار کریو۔',
  },
  Bengali: {
    title: 'পড়া মূল্যায়ন',
    description: 'শব্দভান্ডার এবং বোধগম্যতা উন্নত করতে ছাত্র-বান্ধব পাঠ্য অনুচ্ছেদ তৈরি করুন।',
  },
  Tamil: {
    title: 'வாசிப்பு மதிப்பீடு',
    description: 'சொற்களஞ்சியம் மற்றும் புரிதலை மேம்படுத்த மாணவர் நட்பு வாசிப்பு பத்திகளை உருவாக்கவும்.',
  },
  Gujarati: {
    title: 'વાંચન મૂલ્યાંકન',
    description: 'શબ્દભંડોળ અને સમજ સુધારવા માટે વિદ્યાર્થી-મૈત્રીપૂર્ણ વાંચન ફકરા બનાવો.',
  },
  Malayalam: {
    title: 'വായന വിലയിരുത്തൽ',
    description: 'പദസമ്പത്തും ഗ്രഹണവും മെച്ചപ്പെടുത്തുന്നതിന് വിദ്യാർത്ഥി-സൗഹൃദപരമായ വായനാ ഖണ്ഡികകൾ സൃഷ്ടിക്കുക.',
  },
  Punjabi: {
    title: 'ਪੜ੍ਹਨ ਦਾ ਮੁਲਾਂਕਣ',
    description: 'ਸ਼ਬਦਾਵਲੀ ਅਤੇ ਸਮਝ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਲਈ ਵਿਦਿਆਰਥੀ-ਅਨੁਕੂਲ ਪੜ੍ਹਨ ਦੇ ਪੈਰਾਗ੍ਰਾਫ ਤਿਆਰ ਕਰੋ।',
  },
  Odia: {
    title: 'ପଠନ ମୂଲ୍ୟାଙ୍କନ',
    description: 'ଶବ୍ଦକୋଷ ଏବଂ ବୁଝାମଣାକୁ ଉନ୍ନତ କରିବା ପାଇଁ ଛାତ୍ର-ଅନୁକୂଳ ପଠନ ଅନୁଚ୍ଛେଦ ସୃଷ୍ଟି କରନ୍ତୁ।',
  },
  Assamese: {
    title: 'পঠন মূল্যায়ন',
    description: 'শব্দভাণ্ডাৰ আৰু বোধগম্যতা উন্নত কৰিবলৈ শিক্ষাৰ্থী-अनুকূল পঠন অনুচ্ছেদ সৃষ্টি কৰক।',
  },
  Kannada: {
    title: 'ಓದುವಿಕೆ ಮೌಲ್ಯಮಾಪನ',
    description: 'ಶಬ್ದಕೋಶ ಮತ್ತು ಗ್ರಹಿಕೆಯನ್ನು ಸುಧಾರಿಸಲು ವಿದ್ಯಾರ್ಥಿ-ಸ್ನೇಹಿ ಓದುವ ಪ್ಯಾರಾಗಳನ್ನು ರಚಿಸಿ.',
  },
  Telugu: {
    title: 'పఠన మూల్యాంకనం',
    description: 'పదజాలం మరియు గ్రహణశక్తిని మెరుగుపరచడానికి విద్యార్థి-స్నేహపూర్వక పఠన పేరాలను రూపొందించండి.',
  },
};

export default function ReadingAssessmentPage() {
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
        <ReadingAssessmentClient />
      </div>
    </AppShell>
  );
}
