
'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { StudentAssessmentClient } from './_components/student-assessment-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Student Assessment',
    description: "Track student progress, assess their improvement, and receive tailored suggestions for each student's development.",
  },
  Hindi: {
    title: 'छात्र मूल्यांकन',
    description: 'छात्र की प्रगति को ट्रैक करें, उनके सुधार का आकलन करें, और प्रत्येक छात्र के विकास के लिए अनुरूप सुझाव प्राप्त करें।',
  },
  Marathi: {
    title: 'विद्यार्थी मूल्यांकन',
    description: 'विद्यार्थ्यांच्या प्रगतीचा मागोवा घ्या, त्यांच्या सुधारणेचे मूल्यांकन करा आणि प्रत्येक विद्यार्थ्याच्या विकासासाठी तयार केलेल्या सूचना मिळवा.',
  },
  Kashmiri: {
    title: 'طالب علمٕک تشخیص',
    description: 'طالب علمٕچ پیش رفتس پؠٹھ نظر تھاو، تِمن ہنٛز بہتری ہنٛد اندازٕ لگاو، تہٕ پرٛتھ طالب علمٕچ ترقی خٲطرٕ تیار کرنہٕ آمٕتہ تجاویز وصول کریو۔',
  },
  Bengali: {
    title: 'ছাত্র মূল্যায়ন',
    description: 'ছাত্রদের অগ্রগতি ট্র্যাক করুন, তাদের উন্নতির মূল্যায়ন করুন এবং প্রতিটি ছাত্রের বিকাশের জন্য উপযুক্ত পরামর্শ গ্রহণ করুন।',
  },
  Tamil: {
    title: 'மாணவர் மதிப்பீடு',
    description: 'மாணவர் முன்னேற்றத்தைக் கண்காணிக்கவும், அவர்களின் முன்னேற்றத்தை மதிப்பிடவும், ஒவ்வொரு மாணவரின் வளர்ச்சிக்கும் ஏற்றவாறு வடிவமைக்கப்பட்ட பரிந்துரைகளைப் பெறவும்।',
  },
  Gujarati: {
    title: 'વિદ્યાર્થી મૂલ્યાંકન',
    description: 'વિદ્યાર્થીની પ્રગતિને ટ્રૅક કરો, તેમના સુધારાનું મૂલ્યાંકન કરો, અને દરેક વિદ્યાર્થીના વિકાસ માટે તૈયાર કરેલા સૂચનો મેળવો।',
  },
  Malayalam: {
    title: 'വിദ്യാർത്ഥി വിലയിരുത്തൽ',
    description: 'വിദ്യാർത്ഥികളുടെ പുരോഗതി നിരീക്ഷിക്കുക, അവരുടെ മെച്ചപ്പെടുത്തൽ വിലയിരുത്തുക, ഓരോ വിദ്യാർത്ഥിയുടെയും വികസനത്തിനായി അനുയോജ്യമായ നിർദ്ദേശങ്ങൾ സ്വീകരിക്കുക।',
  },
  Punjabi: {
    title: 'ਵਿਦਿਆਰਥੀ ਮੁਲਾਂਕਣ',
    description: 'ਵਿਦਿਆਰਥੀ ਦੀ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰੋ, ਉਨ੍ਹਾਂ ਦੇ ਸੁਧਾਰ ਦਾ ਮੁਲਾਂਕਣ ਕਰੋ, ਅਤੇ ਹਰੇਕ ਵਿਦਿਆਰਥੀ ਦੇ ਵਿਕਾਸ ਲਈ ਤਿਆਰ ਕੀਤੇ ਗਏ ਸੁਝਾਅ ਪ੍ਰਾਪਤ ਕਰੋ।',
  },
  Odia: {
    title: 'ଛାତ୍ର ମୂଲ୍ୟାୟନ',
    description: 'ଛାତ୍ରଙ୍କ ପ୍ରଗତି ଟ୍ରାକ୍ କରନ୍ତୁ, ସେମାନଙ୍କର ଉନ୍ନତିର ମୂଲ୍ୟାଙ୍କନ କରନ୍ତୁ, ଏବଂ ପ୍ରତ୍ୟେକ ଛାତ୍ରଙ୍କ ବିକାଶ ପାଇଁ ପ୍ରସ୍ତୁତ ପରାମର୍ଶ ଗ୍ରହଣ କରନ୍ତୁ।',
  },
  Assamese: {
    title: 'ছাত্র মূল্যায়ন',
    description: 'ছাত্রৰ প্ৰগতি ট্ৰেক কৰক, তেওঁলোকৰ উন্নতিৰ মূল্যাঙ্কন কৰক, আৰু প্ৰতিজন ছাত্রৰ বিকাশৰ বাবে তৈয়াৰ কৰা পৰামৰ্শ গ্ৰহণ কৰক।',
  },
  Kannada: {
    title: 'ವಿದ್ಯಾರ್ಥಿ ಮೌಲ್ಯಮಾಪನ',
    description: 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಅವರ ಸುಧಾರಣೆಯನ್ನು ನಿರ್ಣಯಿಸಿ, ಮತ್ತು ಪ್ರತಿ ವಿದ್ಯಾರ್ಥಿಯ ಅಭಿವೃದ್ಧಿಗೆ ಅನುಗುಣವಾಗಿ ಸಲಹೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ.',
  },
  Telugu: {
    title: 'విద్యార్థి మూల్యాంకనం',
    description: 'విద్యార్థి పురోగతిని ట్రాక్ చేయండి, వారి మెరుగుదలని అంచనా వేయండి మరియు ప్రతి విద్యార్థి అభివృద్ధికి అనుగుణంగా సూచనలను స్వీకరించండి.',
  },
};

export default function StudentAssessmentPage() {
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
        <StudentAssessmentClient />
      </div>
    </AppShell>
  );
}
