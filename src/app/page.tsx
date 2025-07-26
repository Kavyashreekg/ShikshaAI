'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookText, Layers, BrainCircuit, Paintbrush, Users, CalendarCheck, FileSignature, MessageCircleQuestion } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';


const pageTranslations = {
  English: {
    title: 'Welcome Teacher',
    description: "ShikshaAI is your AI teaching companion. Here's what you can do:",
  },
  Hindi: {
    title: 'नमस्ते, शिक्षक',
    description: 'शिक्षाएआई आपका एआई शिक्षण साथी है। यहाँ आप क्या कर सकते हैं:',
  },
  Marathi: {
    title: 'नमस्कार, शिक्षक',
    description: 'शिक्षाएआय तुमचा एआय शिक्षण साथी आहे. तुम्ही येथे काय करू शकता ते येथे आहे:',
  },
  Kashmiri: {
    title: 'خوش آمدید استاد',
    description: 'شِکشا اے آی چھُ توٚہُنٛد اے آی ٹیچنگ سٲتھی۔ ییٚتہِ چھُ توٚہہِ ہیٚکِو کٔرِتھ:',
  },
  Bengali: {
    title: 'স্বাগতম শিক্ষক',
    description: 'শিক্ষাএআই আপনার এআই শিক্ষার সঙ্গী। এখানে আপনি যা করতে পারেন:',
  },
  Tamil: {
    title: 'வாருங்கள் ஆசிரியரே',
    description: 'ஷிக்ஷாஏஐ உங்கள் ஏஐ கற்பித்தல் துணை। இங்கே நீங்கள் என்ன செய்ய முடியும்:',
  },
  Gujarati: {
    title: 'સ્વાગત છે, શિક્ષક',
    description: 'શિક્ષાએઆઈ તમારા એઆઈ શિક્ષણ સાથી છે। અહીં તમે શું કરી શકો છો:',
  },
  Malayalam: {
    title: 'സ്വാഗതം, ടീച്ചർ',
    description: 'ശിക്ഷാഎഐ നിങ്ങളുടെ എഐ അധ്യാപക സഹായിയാണ്। നിങ്ങൾക്ക് ഇവിടെ എന്തുചെയ്യാൻ കഴിയും:',
  },
  Punjabi: {
    title: 'ਜੀ ਆਇਆਂ ਨੂੰ, ਅਧਿਆਪਕ',
    description: 'ਸ਼ਿਕਸ਼ਾਏਆਈ ਤੁਹਾਡਾ ਏਆਈ ਸਿੱਖਿਆ ਸਾਥੀ ਹੈ। ਇੱਥੇ ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ:',
  },
  Odia: {
    title: 'ସ୍ୱାଗତ ଶିକ୍ଷକ',
    description: 'ଶିକ୍ଷାଏଆଇ ଆପଣଙ୍କର ଏଆଇ ଶିକ୍ଷାଦାନ ସାଥୀ ଅଟେ। ଏଠାରେ ଆପଣ କଣ କରିପାରିବେ:',
  },
  Assamese: {
    title: 'স্বাগতম শিক্ষক',
    description: 'শিক্ষাএআই আপোনাৰ এআই শিক্ষণৰ সঙ্গী। আপুনি ইয়াত কি কৰিব পাৰে সেয়া তলত দিয়া হৈছে:',
  },
  Kannada: {
    title: 'ನಮಸ್ಕಾರ, ಶಿಕ್ಷಕರೆ',
    description: 'ಶಿಕ್ಷಾಎಐ ನಿಮ್ಮ ಎಐ ಬೋಧನಾ ಸಂಗಾತಿಯಾಗಿದೆ. ಇಲ್ಲಿ ನೀವು ಏನು ಮಾಡಬಹುದು ಎಂಬುದು ಇಲ್ಲಿದೆ:',
  },
  Telugu: {
    title: 'స్వాగతం, గురువు గారు',
    description: 'శిక్షాఏఐ మీ ఏఐ బోధన సహచరుడు. ఇక్కడ మీరు ఏమి చేయగలరో చూడండి:',
  },
};

const features = [
  {
    href: '/content-generation',
    icon: <BookText className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Content Generation',
        description: 'Create stories and examples in local languages.',
      },
      Hindi: {
        title: 'सामग्री निर्माण',
        description: 'स्थानीय भाषाओं में कहानियाँ और उदाहरण बनाएँ।',
      },
      Marathi: {
        title: 'सामग्री निर्मिती',
        description: 'स्थानिक भाषांमध्ये कथा आणि उदाहरणे तयार करा.',
      },
       Kannada: {
        title: 'ವಿಷಯ ರಚನೆ',
        description: 'ಸ್ಥಳೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಕಥೆಗಳು ಮತ್ತು ಉದಾಹರಣೆಗಳನ್ನು ರಚಿಸಿ.',
      },
      Telugu: {
        title: 'విషయ సృష్టి',
        description: 'స్థానిక భాషలలో కథలు మరియు ఉదాహరణలను సృష్టించండి.',
      },
    },
  },
  {
    href: '/worksheets',
    icon: <Layers className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Differentiated Worksheets',
        description: 'Generate worksheets from textbook pages for multiple grades.',
      },
      Hindi: {
        title: 'विभेदित कार्यपत्रक',
        description: 'कई ग्रेड के लिए पाठ्यपुस्तक पृष्ठों से वर्कशीट उत्पन्न करें।',
      },
      Marathi: {
        title: 'विभेदित कार्यपत्रके',
        description: 'एकाधिक श्रेणींसाठी पाठ्यपुस्तकाच्या पृष्ठांवरून कार्यपत्रके तयार करा.',
      },
      Kannada: {
        title: 'ಭೇದಾತ್ಮಕ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು',
        description: 'ಬಹು ಶ್ರೇಣಿಗಳಿಗಾಗಿ ಪಠ್ಯಪುಸ್ತಕ ಪುಟಗಳಿಂದ ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ರಚಿಸಿ.',
      },
      Telugu: {
        title: 'విభేదించిన వర్క్‌షీట్లు',
        description: 'బహుళ గ్రేడ్‌ల కోసం పాఠ్యపుస్తక పేజీల నుండి వర్క్‌షీట్‌లను రూపొందించండి.',
      },
    },
  },
  {
    href: '/knowledge-base',
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Instant Knowledge Base',
        description: 'Get simple explanations and analogies for any question.',
      },
      Hindi: {
        title: 'त्वरित ज्ञान कोष',
        description: 'किसी भी प्रश्न के लिए सरल स्पष्टीकरण और उपमाएँ प्राप्त करें।',
      },
      Marathi: {
        title: 'झटपट ज्ञान आधार',
        description: 'कोणत्याही प्रश्नासाठी सोपी स्पष्टीकरणे आणि उपमा मिळवा.',
      },
      Kannada: {
        title: 'ತ್ವರಿತ ಜ್ಞಾನದ ಮೂಲ',
        description: 'ಯಾವುದೇ ಪ್ರಶ್ನೆಗೆ ಸರಳ ವಿವರಣೆಗಳು ಮತ್ತು ಸಾದೃಶ್ಯಗಳನ್ನು ಪಡೆಯಿರಿ.',
      },
      Telugu: {
        title: 'తక్షణ జ్ఞాన ఆధారం',
        description: 'ఏదైనా ప్రశ్నకు సాధారణ వివరణలు మరియు సారూప్యతలను పొందండి.',
      },
    },
  },
  {
    href: '/visual-aids',
    icon: <Paintbrush className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Visual Aid Designer',
        description: 'Create simple drawings and charts for your lessons.',
      },
      Hindi: {
        title: 'दृश्य सहायता डिजाइनर',
        description: 'अपने पाठों के लिए सरल चित्र और चार्ट बनाएँ।',
      },
      Marathi: {
        title: 'दृश्यात्मक मदत डिझाइनर',
        description: 'तुमच्या पाठांसाठी सोपी रेखाचित्रे आणि तक्ते तयार करा.',
      },
       Kannada: {
        title: 'ದೃಶ್ಯ ಸಹಾಯ ವಿನ್ಯಾಸಕ',
        description: 'ನಿಮ್ಮ ಪಾಠಗಳಿಗಾಗಿ ಸರಳ ರೇಖಾಚಿತ್ರಗಳು ಮತ್ತು ಚಾರ್ಟ್‌ಗಳನ್ನು ರಚಿಸಿ.',
      },
      Telugu: {
        title: 'దృశ్య సహాయ డిజైనర్',
        description: 'మీ పాఠాల కోసం సాధారణ చిత్రాలు మరియు చార్ట్‌లను సృష్టించండి.',
      },
    },
  },
  {
    href: '/student-assessment',
    icon: <Users className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Student Assessment',
        description: 'Track student progress and get AI-powered suggestions.',
      },
      Hindi: {
        title: 'छात्र मूल्यांकन',
        description: 'छात्र की प्रगति को ट्रैक करें और AI-संचालित सुझाव प्राप्त करें।',
      },
      Marathi: {
        title: 'विद्यार्थी मूल्यांकन',
        description: 'विद्यार्थ्यांच्या प्रगतीचा मागोवा घ्या आणि AI-चालित सूचना मिळवा.',
      },
      Kannada: {
        title: 'ವಿದ್ಯಾರ್ಥಿ ಮೌಲ್ಯಮಾಪನ',
        description: 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು AI-ಚಾಲಿತ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
      },
      Telugu: {
        title: 'విద్యార్థి మూల్యాంకనం',
        description: 'విద్యార్థి పురోగతిని ట్రాక్ చేయండి మరియు AI-ఆధారిత సూచనలను పొందండి.',
      },
    },
  },
  {
    href: '/lesson-planner',
    icon: <CalendarCheck className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'AI Lesson Planner',
        description: 'Generate weekly lesson plans to save time.',
      },
      Hindi: {
        title: 'एआई पाठ योजनाकार',
        description: 'समय बचाने के लिए साप्ताहिक पाठ योजनाएँ उत्पन्न करें।',
      },
      Marathi: {
        title: 'एआय पाठ नियोजक',
        description: 'वेळ वाचवण्यासाठी साप्ताहिक पाठ योजना तयार करा.',
      },
      Kannada: {
        title: 'ಎಐ ಪಾಠ ಯೋಜಕ',
        description: 'ಸಮಯವನ್ನು ಉಳಿಸಲು ವಾರಕ್ಕೊಮ್ಮೆ ಪಾಠ ಯೋಜನೆಗಳನ್ನು ರಚಿಸಿ.',
      },
      Telugu: {
        title: 'ఏఐ పాఠ ప్రణాళిక',
        description: 'సమయం ఆదా చేయడానికి వారపు పాఠ ప్రణాళికలను రూపొందించండి.',
      },
    },
  },
   {
    href: '/reading-assessment',
    icon: <FileSignature className="h-8 w-8 text-primary" />,
    translations: {
      English: {
        title: 'Reading Assessment',
        description: 'Generate passages to improve vocabulary.',
      },
      Hindi: {
        title: 'पठन मूल्यांकन',
        description: 'शब्दावली में सुधार के लिए अनुच्छेद उत्पन्न करें।',
      },
      Marathi: {
        title: 'वाचन मूल्यांकन',
        description: 'शब्दसंग्रह सुधारण्यासाठी परिच्छेद तयार करा.',
      },
       Kannada: {
        title: 'ಓದುವಿಕೆ ಮೌಲ್ಯಮಾಪನ',
        description: 'ಶಬ್ದಕೋಶವನ್ನು ಸುಧಾರಿಸಲು ಭಾಗಗಳನ್ನು ರಚಿಸಿ.',
      },
      Telugu: {
        title: 'పఠన మూల్యాంకనం',
        description: 'పదజాలం మెరుగుపరచడానికి భాగాలను రూపొందించండి.',
      },
    },
  },
];

export default function DashboardPage() {
  const { language } = useLanguage();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const typedLanguage = language as keyof typeof pageTranslations;
  const pageTranslation = pageTranslations[typedLanguage] || pageTranslations['English'];

  if (isAuthLoading || !isAuthenticated) {
    // You can replace this with a proper loading spinner component
    return <div>Loading...</div>;
  }

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title={pageTranslation.title}
          description={pageTranslation.description}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const translation = feature.translations[language as keyof typeof feature.translations] || feature.translations['English'];
            return (
              <Link href={feature.href} key={feature.href}>
                <Card className="flex h-full flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-headline">{translation.title}</CardTitle>
                        <CardDescription>{translation.description}</CardDescription>
                      </div>
                      {feature.icon}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
