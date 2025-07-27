
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
       Kashmiri: {
        title: 'مواد جنریشن',
        description: 'مقامی زبانن مَنٛز کہانی تہٕ مثال بنایو۔',
      },
      Bengali: {
        title: 'বিষয়বস্তু তৈরি',
        description: 'স্থানীয় ভাষায় গল্প এবং উদাহরণ তৈরি করুন।',
      },
      Tamil: {
        title: 'உள்ளடக்க உருவாக்கம்',
        description: 'உள்ளூர் மொழிகளில் கதைகள் மற்றும் உதாரணங்களை உருவாக்கவும்।',
      },
      Gujarati: {
        title: 'સામગ્રી નિર્માણ',
        description: 'સ્થાનિક ભાષાઓમાં વાર્તાઓ અને ઉદાહરણો બનાવો।',
      },
      Malayalam: {
        title: 'ഉള്ളടക്ക നിർമ്മാണം',
        description: 'പ്രാദേശിക ഭാഷകളിൽ കഥകളും ഉദാഹരണങ്ങളും സൃഷ്ടിക്കുക।',
      },
      Punjabi: {
        title: 'ਸਮੱਗਰੀ ਸਿਰਜਣਾ',
        description: 'ਸਥਾਨਕ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਕਹਾਣੀਆਂ ਅਤੇ ਉਦਾਹਰਣਾਂ ਬਣਾਓ।',
      },
      Odia: {
        title: 'ବିଷୟବସ୍ତୁ ସୃଷ୍ଟି',
        description: 'ସ୍ଥାନୀୟ ଭାଷାରେ କାହାଣୀ ଏବଂ ଉଦାହରଣ ସୃଷ୍ଟି କରନ୍ତୁ।',
      },
      Assamese: {
        title: 'বিষয়বস্তু সৃষ্টি',
        description: 'স্থানীয় ভাষাত কাহিনী আৰু উদাহৰণ সৃষ্টি কৰক।',
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
       Kashmiri: {
        title: 'مختلف ورک شیٹس',
        description: 'کئی گریڈ خٲطرٕ درسی کتابچہِ صفحہٕ پؠٹھہٕ ورک شیٹس تیار کریو۔',
      },
      Bengali: {
        title: 'ভিন্ন ভিন্ন ওয়ার্কশিট',
        description: 'একাধিক গ্রেডের জন্য পাঠ্যপুস্তকের পৃষ্ঠা থেকে ওয়ার্কশিট তৈরি করুন।',
      },
      Tamil: {
        title: 'வேறுபடுத்தப்பட்ட பணித்தாள்கள்',
        description: 'பல கிரேடுகளுக்கு பாடநூல் பக்கங்களிலிருந்து பணித்தாள்களை உருவாக்கவும்।',
      },
      Gujarati: {
        title: 'ભેદભાવપૂર્ણ વર્કશીટ',
        description: 'બહુવિધ ગ્રેડ માટે પાઠ્યપુસ્તકના પાનામાંથી વર્કશીટ બનાવો।',
      },
      Malayalam: {
        title: 'വ്യത്യസ്ത വർക്ക്ഷീറ്റുകൾ',
        description: 'ഒന്നിലധികം ഗ്രേഡുകൾക്കായി പാഠപുസ്തക പേജുകളിൽ നിന്ന് വർക്ക്ഷീറ്റുകൾ സൃഷ്ടിക്കുക।',
      },
      Punjabi: {
        title: 'ਵੱਖ-ਵੱਖ ਵਰਕਸ਼ੀਟਾਂ',
        description: 'ਕਈ ਗ੍ਰੇਡਾਂ ਲਈ ਪਾਠ-ਪੁਸਤਕ ਦੇ ਪੰਨਿਆਂ ਤੋਂ ਵਰਕਸ਼ੀਟਾਂ ਤਿਆਰ ਕਰੋ।',
      },
      Odia: {
        title: 'ଭିନ୍ନ ଭିନ୍ନ କାର୍ଯ୍ୟପତ୍ର',
        description: 'ଏକାଧିକ ଗ୍ରେଡ୍ ପାଇଁ ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠାରୁ କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରନ୍ତୁ।',
      },
      Assamese: {
        title: 'ভিন্ন ভিন্ন কার্যপত্ৰ',
        description: 'একাধিক গ্ৰেডৰ বাবে পাঠ্যপুথিৰ পৃষ্ঠাৰ পৰা কার্যপত্ৰ সৃষ্টি কৰক।',
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
       Kashmiri: {
        title: 'फوری علمٕچ بنیاد',
        description: 'کُنہِ تہِ سوال خٲطرٕ سادٕ وضاحت تہٕ مثال حٲصِل کریو۔',
      },
      Bengali: {
        title: 'তাত্ক্ষণিক জ্ঞান ভান্ডার',
        description: 'যেকোনো প্রশ্নের জন্য সহজ ব্যাখ্যা এবং উপমা পান।',
      },
      Tamil: {
        title: 'உடனடி அறிவுத் தளம்',
        description: 'எந்தவொரு கேள்விக்கும் எளிய விளக்கங்கள் மற்றும் ஒப்புமைகளைப் பெறுங்கள்।',
      },
      Gujarati: {
        title: 'ત્વરિત જ્ઞાન આધાર',
        description: 'કોઈપણ પ્રશ્ન માટે સરળ સમજૂતી અને ઉદાહરણો મેળવો।',
      },
      Malayalam: {
        title: 'തൽക്ഷണ വിജ്ഞാന കേന്ദ്രം',
        description: 'ഏത് ചോദ്യത്തിനും ലളിതമായ വിശദീകരണങ്ങളും ഉപമകളും നേടുക।',
      },
      Punjabi: {
        title: 'ਤੁਰੰਤ ਗਿਆਨ ਅਧਾਰ',
        description: 'ਕਿਸੇ ਵੀ ਸਵਾਲ ਲਈ ਸਧਾਰਨ ਵਿਆਖਿਆ ਅਤੇ ਸਮਾਨਤਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।',
      },
      Odia: {
        title: 'ତତକ୍ଷଣାତ୍ ଜ୍ଞାନ ଆଧାର',
        description: 'ଯେକୌଣସି ପ୍ରଶ୍ନ ପାଇଁ ସରଳ ବ୍ୟାଖ୍ୟା ଏବଂ ଅନୁରୂପତା ପାଆନ୍ତୁ।',
      },
      Assamese: {
        title: 'तत्क्षण জ্ঞান ভিত্তি',
        description: 'যিকোনো প্রশ্নৰ বাবে সৰল ব্যাখ্যা আৰু সাদৃশ্য লাভ কৰক।',
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
        Kashmiri: {
        title: 'بصری امداد ڈیزائنر',
        description: 'پننہٕ سبق خٲطرٕ سادٕ ڈرائنگ تہٕ چارٹ بنایو۔',
      },
      Bengali: {
        title: 'ভিজ্যুয়াল এইড ডিজাইনার',
        description: 'আপনার পাঠের জন্য সহজ অঙ্কন এবং চার্ট তৈরি করুন।',
      },
      Tamil: {
        title: 'காட்சி உதவி வடிவமைப்பாளர்',
        description: 'உங்கள் பாடங்களுக்கான எளிய வரைபடங்கள் மற்றும் விளக்கப்படங்களை உருவாக்கவும்।',
      },
      Gujarati: {
        title: 'વિઝ્યુઅલ એઇડ ડિઝાઇનર',
        description: 'તમારા પાઠ માટે સરળ ચિત્રો અને ચાર્ટ બનાવો।',
      },
      Malayalam: {
        title: 'വിഷ്വൽ എയ്ഡ് ഡിസൈനർ',
        description: 'നിങ്ങളുടെ പാഠങ്ങൾക്കായി ലളിതമായ ചിത്രങ്ങളും ചാർട്ടുകളും സൃഷ്ടിക്കുക।',
      },
      Punjabi: {
        title: 'ਵਿਜ਼ੂਅਲ ਏਡ ਡਿਜ਼ਾਈਨਰ',
        description: 'ਆਪਣੇ ਪਾਠਾਂ ਲਈ ਸਧਾਰਨ ਚਿੱਤਰ ਅਤੇ ਚਾਰਟ ਬਣਾਓ।',
      },
      Odia: {
        title: 'ଭିଜୁଆଲ୍ ଏଡ୍ ଡିଜାଇନର୍',
        description: 'ଆପଣଙ୍କ ପାଠ ପାଇଁ ସରଳ ଚିତ୍ର ଏବଂ ଚାର୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ।',
      },
      Assamese: {
        title: 'ভিজুৱেল এইড ডিজাইনাৰ',
        description: 'আপোনাৰ পাঠৰ বাবে সৰল ছবি আৰু চাৰ্ট সৃষ্টি কৰক।',
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
       Kashmiri: {
        title: 'طالب علمٕک تشخیص',
        description: 'طالب علمٕچ پیش رفتس پؠٹھ نظر تھاو تہٕ AI سٟتؠ تجاویز حٲصِل کریو۔',
      },
      Bengali: {
        title: 'ছাত্র মূল্যায়ন',
        description: 'ছাত্রদের অগ্রগতি ট্র্যাক করুন এবং AI-চালিত পরামর্শ পান।',
      },
      Tamil: {
        title: 'மாணவர் மதிப்பீடு',
        description: 'மாணவர் முன்னேற்றத்தைக் கண்காணிக்கவும், AI-ஆதரவு பரிந்துரைகளைப் பெறுங்கள்।',
      },
      Gujarati: {
        title: 'વિદ્યાર્થી મૂલ્યાંકન',
        description: 'વિદ્યાર્થીની પ્રગતિને ટ્રૅક કરો અને AI-સંચાલિત સૂચનો મેળવો।',
      },
      Malayalam: {
        title: 'വിദ്യാർത്ഥി വിലയിരുത്തൽ',
        description: 'വിദ്യാർത്ഥികളുടെ പുരോഗതി നിരീക്ഷിക്കുകയും AI- പവർഡ് നിർദ്ദേശങ്ങൾ നേടുകയും ചെയ്യുക।',
      },
      Punjabi: {
        title: 'ਵਿਦਿਆਰਥੀ ਮੁਲਾਂਕਣ',
        description: 'ਵਿਦਿਆਰਥੀ ਦੀ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰੋ ਅਤੇ AI-ਸੰਚਾਲਿਤ ਸੁਝਾਅ ਪ੍ਰਾਪਤ ਕਰੋ।',
      },
      Odia: {
        title: 'ଛାତ୍ର ମୂଲ୍ୟାୟନ',
        description: 'ଛାତ୍ରଙ୍କ ପ୍ରଗତି ଟ୍ରାକ୍ କରନ୍ତୁ ଏବଂ AI-ଚାଳିତ ପରାମର୍ଶ ପାଆନ୍ତୁ।',
      },
      Assamese: {
        title: 'ছাত্র মূল্যায়ন',
        description: 'ছাত্রৰ প্ৰগতি ট্ৰেক কৰক আৰু AI-চালিত পৰামৰ্শ লাভ কৰক।',
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
        Kashmiri: {
        title: 'AI سبق منصوبہ ساز',
        description: 'وقت بچاونہٕ خٲطرٕ ہفتہ وار سبقٕک منصوبہٕ تیار کریو۔',
      },
      Bengali: {
        title: 'এআই পাঠ পরিকল্পনাকারী',
        description: 'সময় বাঁচাতে সাপ্তাহিক পাঠ পরিকল্পনা তৈরি করুন।',
      },
      Tamil: {
        title: 'ஏஐ பாடம் திட்டமிடுபவர்',
        description: 'நேரத்தை சேமிக்க வாராந்திர பாடத் திட்டங்களை உருவாக்கவும்।',
      },
      Gujarati: {
        title: 'એઆઈ પાઠ યોજનાકાર',
        description: 'સમય બચાવવા માટે સાપ્તાહિક પાઠ યોજનાઓ બનાવો।',
      },
      Malayalam: {
        title: 'എഐ പാഠ ആസൂത്രകൻ',
        description: 'സമയം ലാഭിക്കാൻ പ്രതിവാര പാഠ പദ്ധതികൾ സൃഷ്ടിക്കുക।',
      },
      Punjabi: {
        title: 'ਏਆਈ ਪਾਠ ਯੋਜਨਾਕਾਰ',
        description: 'ਸਮਾਂ ਬਚਾਉਣ ਲਈ ਹਫਤਾਵਾਰੀ ਪਾਠ ਯੋਜਨਾਵਾਂ ਤਿਆਰ ਕਰੋ।',
      },
      Odia: {
        title: 'AI ପାଠ ଯୋଜନାକାରୀ',
        description: 'ସମୟ ବଞ୍ଚାଇବା ପାଇଁ ସାପ୍ତାହିକ ପାଠ ଯୋଜନା ସୃଷ୍ଟି କରନ୍ତୁ।',
      },
      Assamese: {
        title: 'এআই পাঠ পৰিকল্পনাকাৰী',
        description: 'সময় বচাবলৈ সাপ্তাহিক পাঠ পৰিকল্পনা সৃষ্টি কৰক।',
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
       Kashmiri: {
        title: 'پَرنُک تَحقیٖق',
        description: 'ذخیرٕ الفاظ بہتر بناونہٕ خٲطرٕ پیراگراف تیار کریو۔',
      },
      Bengali: {
        title: 'পড়া মূল্যায়ন',
        description: 'শব্দভান্ডার উন্নত করতে অনুচ্ছেদ তৈরি করুন।',
      },
      Tamil: {
        title: 'வாசிப்பு மதிப்பீடு',
        description: 'சொற்களஞ்சியத்தை மேம்படுத்த பத்திகளை உருவாக்கவும்।',
      },
      Gujarati: {
        title: 'વાંચન મૂલ્યાંકન',
        description: 'શબ્દભંડોળ સુધારવા માટે ફકરા બનાવો।',
      },
      Malayalam: {
        title: 'വായന വിലയിരുത്തൽ',
        description: 'പദസമ്പത്ത് മെച്ചപ്പെടുത്തുന്നതിന് ഭാഗങ്ങൾ സൃഷ്ടിക്കുക।',
      },
      Punjabi: {
        title: 'ਪੜ੍ਹਨ ਦਾ ਮੁਲਾਂਕਣ',
        description: 'ਸ਼ਬਦਾਵਲੀ ਨੂੰ ਸੁਧਾਰਨ ਲਈ ਪੈਰਾਗ੍ਰਾਫ ਤਿਆਰ ਕਰੋ।',
      },
      Odia: {
        title: 'ପଠନ ମୂଲ୍ୟାଙ୍କନ',
        description: 'ଶବ୍ଦକୋଷରେ ଉନ୍నତି ଆଣିବା ପାଇଁ ଅନୁଚ୍ଛେଦ ସୃଷ୍ଟି କରନ୍ତୁ।',
      },
      Assamese: {
        title: 'পঠন মূল্যায়ন',
        description: 'শব্দভাণ্ডাৰ উন্নত কৰিবলৈ অনুচ্ছেদ সৃষ্টি কৰক।',
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
        <div className="mx-auto max-w-7xl space-y-8">
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
      </div>
    </AppShell>
  );
}
