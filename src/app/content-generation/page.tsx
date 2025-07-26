
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
  Kashmiri: {
    title: 'مواد جنریشن',
    description: 'مقامی زبانن مَنٛز کہانی، مثال تہٕ وضاحتھ بنایو تاکہِ طالب علمن ہنٛدِ مطالعہٕ مزید متعلقہٕ بنن۔',
  },
  Bengali: {
    title: 'বিষয়বস্তু তৈরি',
    description: 'আপনার শিক্ষার্থীদের জন্য শেখাকে আরও সম্পর্কিত করতে স্থানীয় ভাষায় গল্প, উদাহরণ এবং ব্যাখ্যা তৈরি করুন।',
  },
  Tamil: {
    title: 'உள்ளடக்க உருவாக்கம்',
    description: 'உங்கள் மாணவர்களுக்கு கற்றலை மேலும் தொடர்புடையதாக மாற்ற உள்ளூர் மொழிகளில் கதைகள், எடுத்துக்காட்டுகள் மற்றும் விளக்கங்களை உருவாக்கவும்।',
  },
  Gujarati: {
    title: 'સામગ્રી નિર્માણ',
    description: 'તમારા વિદ્યાર્થીઓ માટે ભણતરને વધુ સંબંધિત બનાવવા માટે સ્થાનિક ભાષાઓમાં વાર્તાઓ, ઉદાહરણો અને સ્પષ્ટતાઓ બનાવો।',
  },
  Malayalam: {
    title: 'ഉള്ളടക്ക നിർമ്മാണം',
    description: 'നിങ്ങളുടെ വിദ്യാർത്ഥികൾക്ക് പഠനം കൂടുതൽ ബന്ധപ്പെടുത്തുന്നതിന് പ്രാദേശിക ഭാഷകളിൽ കഥകളും ഉദാഹരണങ്ങളും വിശദീകരണങ്ങളും സൃഷ്ടിക്കുക।',
  },
  Punjabi: {
    title: 'ਸਮੱਗਰੀ ਸਿਰਜਣਾ',
    description: 'ਆਪਣੇ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਸਿੱਖਣ ਨੂੰ ਹੋਰ ਸੰਬੰਧਿਤ ਬਣਾਉਣ ਲਈ ਸਥਾਨਕ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਕਹਾਣੀਆਂ, ਉਦਾਹਰਣਾਂ ਅਤੇ ਵਿਆਖਿਆਵਾਂ ਬਣਾਓ।',
  },
  Odia: {
    title: 'ବିଷୟବସ୍ତୁ ସୃଷ୍ଟି',
    description: 'ଆପଣଙ୍କ ଛାତ୍ରମାନଙ୍କ ପାଇଁ ଶିକ୍ଷାକୁ ଅଧିକ ପ୍ରାସଙ୍ଗିକ କରିବା ପାଇଁ ସ୍ଥାନୀୟ ଭାଷାରେ କାହାଣୀ, ଉଦାହରଣ ଏବଂ ବ୍ୟାଖ୍ୟା ସୃଷ୍ଟି କରନ୍ତୁ।',
  },
  Assamese: {
    title: 'বিষয়বস্তু সৃষ্টি',
    description: 'আপোনাৰ শিক্ষাৰ্থীসকলৰ বাবে শিক্ষাক অধিক প্ৰাসংগিক কৰিবলৈ স্থানীয় ভাষাত কাহিনী, উদাহৰণ আৰু ব্যাখ্যা সৃষ্টি কৰক।',
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
          showCloseButton
        />
        <ContentGenerationClient />
      </div>
    </AppShell>
  );
}
