'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { SahayakBotClient } from './_components/sahayak-bot-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Sahayak AI Bot',
    description: 'Your versatile AI teaching assistant. Ask for stories, explanations, visual aids, and more.',
  },
  Hindi: {
    title: 'सहायक एआई बॉट',
    description: 'आपका बहुमुखी एआई शिक्षण सहायक। कहानियों, स्पष्टीकरणों, दृश्य सहायकों और बहुत कुछ के लिए पूछें।',
  },
  Marathi: {
    title: 'सहायक एआय बॉट',
    description: 'तुमचा बहुमुखी एआय शिक्षण सहाय्यक. कथा, स्पष्टीकरण, दृश्यात्मक मदत आणि बरेच काही विचारा.',
  },
  Kashmiri: {
    title: 'سہایک اے آی بوٹ',
    description: 'توٚہُنٛد ورسٹائل اے آی ٹیچنگ اسسٹنٹ۔ کہانی، وضاحت، بصری امداد، تہٕ بیترِ پوچھیو۔',
  },
  Bengali: {
    title: 'সহায়ক এআই বট',
    description: 'আপনার বহুমুখী এআই শিক্ষা সহকারী। গল্প, ব্যাখ্যা, ভিজ্যুয়াল এইড এবং আরও অনেক কিছুর জন্য জিজ্ঞাসা করুন।',
  },
  Tamil: {
    title: 'சஹாயக் AI பாட்',
    description: 'உங்கள் பல்துறை AI கற்பித்தல் உதவியாளர்। கதைகள், விளக்கங்கள், காட்சி உதவிகள் மற்றும் பலவற்றைக் கேளுங்கள்।',
  },
  Gujarati: {
    title: 'સહાયક એઆઈ બોટ',
    description: 'તમારા બહુમુખી એઆઈ શિક્ષણ સહાયક। વાર્તાઓ, સ્પષ્ટતાઓ, દ્રશ્ય સહાય અને વધુ માટે પૂછો।',
  },
  Malayalam: {
    title: 'സഹായക് എഐ ബോട്ട്',
    description: 'നിങ്ങളുടെ വൈവിധ്യമാർന്ന എഐ അധ്യാപന സഹായി। കഥകൾ, വിശദീകരണങ്ങൾ, ദൃശ്യ സഹായങ്ങൾ എന്നിവയും അതിലേറെയും ചോദിക്കുക।',
  },
  Punjabi: {
    title: 'ਸਹਾਇਕ ਏਆਈ ਬੋਟ',
    description: 'ਤੁਹਾਡਾ ਬਹੁਪੱਖੀ ਏਆਈ ਸਿੱਖਿਆ ਸਹਾਇਕ। ਕਹਾਣੀਆਂ, ਵਿਆਖਿਆਵਾਂ, ਵਿਜ਼ੂਅਲ ਏਡਜ਼ ਅਤੇ ਹੋਰ ਬਹੁਤ ਕੁਝ ਪੁੱਛੋ।',
  },
  Odia: {
    title: 'ସହାୟକ ଏଆଇ ବଟ୍',
    description: 'ଆପଣଙ୍କର ବହୁମୁଖୀ ଏଆଇ ଶିକ୍ଷାଦାନ ସହାୟକ। କାହାଣୀ, ବ୍ୟାଖ୍ୟା, ଭିଜୁଆଲ୍ ଏଡ୍, ଏବଂ ଅଧିକ ପାଇଁ ପଚାରନ୍ତୁ।',
  },
  Assamese: {
    title: 'সহায়ক এআই বট',
    description: 'আপোনাৰ বহুমুখী এআই শিক্ষণ সহায়ক। কাহিনী, ব্যাখ্যা, ভিজুৱেল এইড, আৰু অধিকৰ বাবে সোধক।',
  },
  Kannada: {
    title: 'ಸಹಾಯಕ್ ಎಐ ಬಾಟ್',
    description: 'ನಿಮ್ಮ ಬಹುಮುಖಿ ಎಐ ಬೋಧನಾ ಸಹಾಯಕ. ಕಥೆಗಳು, ವಿವರಣೆಗಳು, ದೃಶ್ಯ ಸಾಧನಗಳು ಮತ್ತು ಹೆಚ್ಚಿನದನ್ನು ಕೇಳಿ.',
  },
  Telugu: {
    title: 'సహాయక్ AI బాట్',
    description: 'మీ బహుముఖ AI బోధన సహాయకుడు. కథలు, వివరణలు, దృశ్య సహాయాలు మరియు మరిన్నింటి కోసం అడగండి.',
  },
};

export default function SahayakBotPage() {
    const { language } = useLanguage();
    const typedLanguage = language as keyof typeof pageTranslations;
    const pageTranslation = pageTranslations[typedLanguage] || pageTranslations['English'];

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-60px)]">
        <div className='p-4 md:p-8 pb-0'>
            <PageHeader
            title={pageTranslation.title}
            description={pageTranslation.description}
            />
        </div>
        <SahayakBotClient />
      </div>
    </AppShell>
  );
}
