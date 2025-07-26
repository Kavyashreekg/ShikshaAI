
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
  Kashmiri: {
    title: 'फوری علمٕک بنیاد',
    description: 'طلبہ ہنٛد پیچیدٕ سوالاتن ہنٛدِ لٔٹِک، درست وضاحتھ، تہٕ آسان analogie ہیتھ مکمل کریو۔',
  },
  Bengali: {
    title: 'তাত্ক্ষণিক জ্ঞান ভান্ডার',
    description: 'জটিল ছাত্রছাত্রীদের প্রশ্নের জন্য সহজ, সঠিক ব্যাখ্যা পান, যা সহজে বোঝা যায় এমন উপমা দিয়ে সম্পূর্ণ।',
  },
  Tamil: {
    title: 'உடனடி அறிவுத் தளம்',
    description: 'சிக்கலான மாணவர் கேள்விகளுக்கு எளிய, துல்லியமான விளக்கங்களைப் பெறுங்கள், எளிதில் புரிந்துகொள்ளக்கூடிய ஒப்புமைகளுடன் முழுமையானது।',
  },
  Gujarati: {
    title: 'ત્વરિત જ્ઞાન આધાર',
    description: 'જટિલ વિદ્યાર્થી પ્રશ્નો માટે સરળ, સચોટ સ્પષ્ટતાઓ મેળવો, જે સમજવામાં સરળ ઉદાહરણો સાથે પૂર્ણ થાય છે।',
  },
  Malayalam: {
    title: 'തൽക്ഷണ വിജ്ഞാന കേന്ദ്രം',
    description: 'സങ്കീർണ്ണമായ വിദ്യാർത്ഥികളുടെ ചോദ്യങ്ങൾക്ക് ലളിതവും കൃത്യവുമായ വിശദീകരണങ്ങൾ നേടുക, എളുപ്പത്തിൽ മനസ്സിലാക്കാവുന്ന ഉപമകളോടുകൂടി പൂർത്തിയാക്കുക।',
  },
  Punjabi: {
    title: 'ਤੁਰੰਤ ਗਿਆਨ ਅਧਾਰ',
    description: 'ਗੁੰਝਲਦਾਰ ਵਿਦਿਆਰਥੀ ਪ੍ਰਸ਼ਨਾਂ ਲਈ ਸਧਾਰਨ, ਸਹੀ ਵਿਆਖਿਆ ਪ੍ਰਾਪਤ ਕਰੋ, ਜੋ ਸਮਝਣ ਵਿੱਚ ਆਸਾਨ ਸਮਾਨਤਾਵਾਂ ਨਾਲ ਪੂਰਾ ਹੋਵੇ।',
  },
  Odia: {
    title: 'ତତକ୍ଷଣାତ୍ ଜ୍ଞାନ ଆଧାର',
    description: 'ଜଟିଳ ଛାତ୍ର ପ୍ରଶ୍ନଗୁଡିକ ପାଇଁ ସରଳ, ସଠିକ୍ ବ୍ୟାଖ୍ୟା ପ୍ରାପ୍ତ କରନ୍ତୁ, ଯାହା ସହଜରେ ବୁଝିହେବା ଭଳି ଅନୁରୂପତା ସହିତ ସମ୍ପୂର୍ଣ୍ଣ।',
  },
  Assamese: {
    title: 'तत्क्षण জ্ঞান ভিত্তি',
    description: 'জটিল শিক্ষার্থীৰ প্রশ্নৰ বাবে সৰল, সঠিক ব্যাখ্যা লাভ কৰক, যিটো সহজ-সৰল উপমাৰে পৰিপূৰ্ণ।',
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
          showCloseButton
        />
        <KnowledgeBaseClient />
      </div>
    </AppShell>
  );
}
