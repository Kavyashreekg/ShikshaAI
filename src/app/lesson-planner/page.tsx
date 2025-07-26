
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
  Kashmiri: {
    title: 'AI سبق منصوبہ ساز',
    description: 'AI سٟتؠ ہفتہ وار سبقٕک منصوبہٕ تیار کریو یم سرگرمین ہنٛز ساخت تشکیل دیان چھِ تہٕ توٚہنٛد قیمتی وقت بہتر بناون چھِ۔',
  },
  Bengali: {
    title: 'এআই পাঠ পরিকল্পনাকারী',
    description: 'এআই-চালিত সাপ্তাহিক পাঠ পরিকল্পনা তৈরি করুন যা ক্রিয়াকলাপের কাঠামো তৈরি করে এবং আপনার মূল্যবান সময়কে সর্বোত্তম করে তোলে।',
  },
  Tamil: {
    title: 'ஏஐ பாடம் திட்டமிடுபவர்',
    description: 'ஏஐ-ஆல் இயக்கப்படும் வாராந்திர பாடத் திட்டங்களை உருவாக்குங்கள், அவை செயல்பாடுகளை கட்டமைத்து உங்கள் மதிப்புமிக்க நேரத்தை மேம்படுத்துகின்றன।',
  },
  Gujarati: {
    title: 'એઆઈ પાઠ યોજનાકાર',
    description: 'એઆઈ-સંચાલિત સાપ્તાહિક પાઠ યોજનાઓ બનાવો જે પ્રવૃત્તિઓની રચના કરે છે અને તમારા મૂલ્યવાન સમયને શ્રેષ્ઠ બનાવે છે।',
  },
  Malayalam: {
    title: 'എഐ പാഠ ആസൂത്രകൻ',
    description: 'എഐ-പവർഡ് പ്രതിവാര പാഠ പദ്ധതികൾ സൃഷ്ടിക്കുക, അത് പ്രവർത്തനങ്ങൾ ഘടനാപരമാക്കുകയും നിങ്ങളുടെ വിലയേറിയ സമയം ഒപ്റ്റിമൈസ് ചെയ്യുകയും ചെയ്യുന്നു।',
  },
  Punjabi: {
    title: 'ਏਆਈ ਪਾਠ ਯੋਜਨਾਕਾਰ',
    description: 'ਏਆਈ-ਸੰਚਾਲਿਤ ਹਫਤਾਵਾਰੀ ਪਾਠ ਯੋਜਨਾਵਾਂ ਬਣਾਓ ਜੋ ਗਤੀਵਿਧੀਆਂ ਦਾ ਢਾਂਚਾ ਬਣਾਉਂਦੀਆਂ ਹਨ ਅਤੇ ਤੁਹਾਡੇ ਕੀਮਤੀ ਸਮੇਂ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਉਂਦੀਆਂ ਹਨ।',
  },
  Odia: {
    title: 'AI ପାଠ ଯୋଜନାକାରୀ',
    description: 'AI-ଚାଳିତ ସାପ୍ତାହିକ ପାଠ ଯୋଜନା ସୃଷ୍ଟି କରନ୍ତୁ ଯାହା କାର୍ଯ୍ୟକଳାପଗୁଡ଼ିକୁ ସଂରଚନା କରେ ଏବଂ ଆପଣଙ୍କ ମୂଲ୍ୟବାନ ସମୟକୁ ଅନୁକୂଳ କରେ।',
  },
  Assamese: {
    title: 'এআই পাঠ পৰিকল্পনাকাৰী',
    description: 'এআই-চালিত সাপ্তাহিক পাঠ পৰিকল্পনা সৃষ্টি কৰক যিয়ে কাৰ্যকলাপৰ গাঁথনি নিৰ্ধাৰণ কৰে আৰু আপোনাৰ মূল্যবান সময়ৰ সদব্যৱহাৰ কৰে।',
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
          showCloseButton
        />
        <LessonPlannerClient />
      </div>
    </AppShell>
  );
}
