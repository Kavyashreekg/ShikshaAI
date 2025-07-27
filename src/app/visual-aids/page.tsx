
'use client';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { VisualAidClient } from './_components/visual-aid-client';
import { useLanguage } from '@/context/language-context';

const pageTranslations = {
  English: {
    title: 'Visual Aid Designer',
    description: 'Generate simple line drawings or charts from a description, perfect for replicating on a blackboard.',
  },
  Hindi: {
    title: 'दृश्य सहायता डिजाइनर',
    description: 'एक विवरण से सरल रेखा चित्र या चार्ट उत्पन्न करें, जो ब्लैकबोर्ड पर प्रतिकृति बनाने के लिए एकदम सही है।',
  },
  Marathi: {
    title: 'दृश्यात्मक मदत डिझाइनर',
    description: 'ब्लॅकबोर्डवर प्रतिकृती तयार करण्यासाठी योग्य असलेल्या वर्णनावरून साधी रेखाचित्रे किंवा तक्ते तयार करा.',
  },
  Kashmiri: {
    title: 'بصری امداد ڈیزائنر',
    description: 'اک تفصیل پؠٹھہٕ سادہ لائن ڈرائنگ یا چارٹ تیار کریو، یم بلیک بورڈ پؠٹھ نقل کرنہٕ خٲطرٕ بہترین چھِ۔',
  },
  Bengali: {
    title: 'ভিজ্যুয়াল এইড ডিজাইনার',
    description: 'একটি বিবরণ থেকে সাধারণ লাইন অঙ্কন বা চার্ট তৈরি করুন, যা ব্ল্যাকবোর্ডে নকল করার জন্য উপযুক্ত।',
  },
  Tamil: {
    title: 'காட்சி உதவி வடிவமைப்பாளர்',
    description: 'ஒரு விளக்கத்திலிருந்து எளிய கோட்டோவியங்கள் அல்லது விளக்கப்படங்களை உருவாக்கவும், கரும்பலகையில் மீண்டும் உருவாக்குவதற்கு ஏற்றது।',
  },
  Gujarati: {
    title: 'વિઝ્યુઅલ એઇડ ડિઝાઇનર',
    description: 'એક વર્ણનમાંથી સાદા રેખાચિત્રો અથવા ચાર્ટ બનાવો, જે બ્લેકબોર્ડ પર નકલ કરવા માટે યોગ્ય છે।',
  },
  Malayalam: {
    title: 'വിഷ്വൽ എയ്ഡ് ഡിസൈനർ',
    description: 'ഒരു വിവരണത്തിൽ നിന്ന് ലളിതമായ രേഖാചിത്രങ്ങളോ ചാർട്ടുകളോ നിർമ്മിക്കുക, ബ്ലാക്ക്ബോർഡിൽ പകർത്താൻ അനുയോജ്യമാണ്।',
  },
  Punjabi: {
    title: 'ਵਿਜ਼ੂਅਲ ਏਡ ਡਿਜ਼ਾਈਨਰ',
    description: 'ਇੱਕ ਵੇਰਵੇ ਤੋਂ ਸਧਾਰਨ ਲਾਈਨ ਡਰਾਇੰਗ ਜਾਂ ਚਾਰਟ ਤਿਆਰ ਕਰੋ, ਜੋ ਬਲੈਕਬੋਰਡ ਤੇ ਨਕਲ ਕਰਨ ਲਈ ਸੰਪੂਰਨ ਹੈ।',
  },
  Odia: {
    title: 'ଭିଜୁଆଲ୍ ଏଡ୍ ଡିଜାଇନର୍',
    description: 'ଏକ ବର୍ଣ୍ଣନାରୁ ସରଳ ରେଖା ଚିତ୍ର କିମ୍ବା ଚାର୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ, ଯାହା ବ୍ଲାକବୋର୍ଡରେ ନକଲ କରିବା ପାଇଁ ଉପଯୁକ୍ତ।',
  },
  Assamese: {
    title: 'ভিজুৱেল এইড ডিজাইনাৰ',
    description: 'এটা বৰ্ণনাৰ পৰা সৰল লাইন ড্ৰয়িং বা চাৰ্ট সৃষ্টি কৰক, যি ব্লেকব’ৰ্ডত নকল কৰিবলৈ উপযুক্ত।',
  },
  Kannada: {
    title: 'ದೃಶ್ಯ ಸಹಾಯ ವಿನ್ಯಾಸಕ',
    description: 'ಕಪ್ಪು ಹಲಗೆಯ ಮೇಲೆ ಪುನರಾವರ್ತಿಸಲು ಪರಿಪೂರ್ಣವಾದ ವಿವರಣೆಯಿಂದ ಸರಳ ರೇಖಾಚಿತ್ರಗಳು ಅಥವಾ ಚಾರ್ಟ್‌ಗಳನ್ನು ರಚಿಸಿ.',
  },
  Telugu: {
    title: 'దృశ్య సహాయ డిజైనర్',
    description: 'నల్లబల్లపై పునరుత్పత్తి చేయడానికి సరైన వివరణ నుండి సాధారణ గీత చిత్రాలు లేదా చార్ట్‌లను రూపొందించండి.',
  },
};

export default function VisualAidsPage() {
    const { language } = useLanguage();
    const typedLanguage = language as keyof typeof pageTranslations;
    const pageTranslation = pageTranslations[typedLanguage] || pageTranslations['English'];

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
            <PageHeader
            title={pageTranslation.title}
            description={pageTranslation.description}
            showCloseButton
            />
            <VisualAidClient />
        </div>
      </div>
    </AppShell>
  );
}
