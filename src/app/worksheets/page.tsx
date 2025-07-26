
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
  Kashmiri: {
    title: 'مختلف ورک شیٹس',
    description: 'مختلف درجہٕ بندی ہنٛدِ سطحن ہنٛز مطابقتہٕ ورک شیٹس فوری طور پٲٹھؠ تیار کرنہٕ خٲطرٕ درسی کتابچہِ صفحک اَکھ تصویر اپلوڈ کریو۔',
  },
  Bengali: {
    title: 'ভিন্ন ভিন্ন ওয়ার্কশিট',
    description: 'বিভিন্ন গ্রেড স্তরের জন্য তাত্ক্ষণিকভাবে ওয়ার্কশিট তৈরি করতে পাঠ্যপুস্তকের একটি পৃষ্ঠার ছবি আপলোড করুন।',
  },
  Tamil: {
    title: 'வேறுபடுத்தப்பட்ட பணித்தாள்கள்',
    description: 'பல்வேறு தர நிலைகளுக்கு ஏற்றவாறு பணித்தாள்களை உடனடியாக உருவாக்க பாடநூல் பக்கத்தின் புகைப்படத்தைப் பதிவேற்றவும்।',
  },
  Gujarati: {
    title: 'ભેદભાવપૂર્ણ વર્કશીટ',
    description: 'વિવિધ ગ્રેડ સ્તરોને અનુરૂપ વર્કશીટ તરત જ બનાવવા માટે પાઠ્યપુસ્તકના પાનાનો ફોટો અપલોડ કરો।',
  },
  Malayalam: {
    title: 'വ്യത്യസ്ത വർക്ക്ഷീറ്റുകൾ',
    description: 'വ്യത്യസ്ത ഗ്രേഡ് തലങ്ങളിലേക്ക് തൽക്ഷണം വർക്ക്ഷീറ്റുകൾ നിർമ്മിക്കുന്നതിന് പാഠപുസ്തക പേജിന്റെ ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക।',
  },
  Punjabi: {
    title: 'ਵੱਖ-ਵੱਖ ਵਰਕਸ਼ੀਟਾਂ',
    description: 'ਵੱਖ-ਵੱਖ ਗ੍ਰੇਡ ਪੱਧਰਾਂ ਲਈ ਤੁਰੰਤ ਵਰਕਸ਼ੀਟਾਂ ਬਣਾਉਣ ਲਈ ਪਾਠ ਪੁਸਤਕ ਦੇ ਪੰਨੇ ਦੀ ਇੱਕ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।',
  },
  Odia: {
    title: 'ଭିନ୍ନ ଭିନ୍ନ କାର୍ଯ୍ୟପତ୍ର',
    description: 'ଭିନ୍ନ ଭିନ୍ନ ଗ୍ରେଡ୍ ସ୍ତର ପାଇଁ ତତକ୍ଷଣାତ୍ କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରିବା ପାଇଁ ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠାର ଏକ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।',
  },
  Assamese: {
    title: 'ভিন্ন ভিন্ন কার্যপত্ৰ',
    description: 'ভিন্ন ভিন্ন গ্ৰেড স্তৰৰ বাবে তৎক্ষণাত কার্যপত্ৰ সৃষ্টি কৰিবলৈ পাঠ্যপুথিৰ পৃষ্ঠাৰ এখন ফটো আপলোড কৰক।',
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
          showCloseButton
        />
        <WorksheetClient />
      </div>
    </AppShell>
  );
}
