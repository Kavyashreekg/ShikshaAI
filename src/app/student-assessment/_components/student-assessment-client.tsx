'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { grades, languages } from '@/lib/data';
import { UserPlus } from 'lucide-react';
import { initialStudents, Student } from '@/lib/student-data';
import { useLanguage } from '@/context/language-context';


const translations = {
  English: {
    rosterTitle: 'Student Roster',
    rosterDescription: 'Manage your students and track their progress.',
    addStudent: 'Add Student',
    addNewStudent: 'Add New Student',
    newStudentDescription: 'Enter the details for the new student.',
    fullName: 'Full Name',
    namePlaceholder: 'e.g., Anika Gupta',
    grade: 'Grade',
    gradePlaceholder: 'Select a grade',
    initialNotes: 'Initial Notes',
    notesPlaceholder: 'Any initial observations...',
    cancel: 'Cancel',
    toastTitle: 'Student Added',
    toastDescription: (name: string) => `${name} has been added to your roster.`,
    tableName: 'Name',
    tableActions: 'Actions',
    details: 'Details',
    noStudents: 'No students added yet.',
    formErrors: {
        nameMin: 'Name must be at least 2 characters.',
        gradeMin: 'Please select a grade.',
    },
  },
  Hindi: {
    rosterTitle: 'छात्र रोस्टर',
    rosterDescription: 'अपने छात्रों का प्रबंधन करें और उनकी प्रगति को ट्रैक करें।',
    addStudent: 'छात्र जोड़ें',
    addNewStudent: 'नया छात्र जोड़ें',
    newStudentDescription: 'नए छात्र के लिए विवरण दर्ज करें।',
    fullName: 'पूरा नाम',
    namePlaceholder: 'उदा., अनिका गुप्ता',
    grade: 'ग्रेड',
    gradePlaceholder: 'एक ग्रेड चुनें',
    initialNotes: 'प्रारंभिक नोट्स',
    notesPlaceholder: 'कोई प्रारंभिक अवलोकन...',
    cancel: 'रद्द करें',
    toastTitle: 'छात्र जोड़ा गया',
    toastDescription: (name: string) => `${name} को आपके रोस्टर में जोड़ा गया है।`,
    tableName: 'नाम',
    tableActions: 'कार्रवाइयाँ',
    details: 'विवरण',
    noStudents: 'अभी तक कोई छात्र नहीं जोड़ा गया है।',
    formErrors: {
        nameMin: 'नाम कम से कम 2 अक्षरों का होना चाहिए।',
        gradeMin: 'कृपया एक ग्रेड चुनें।',
    },
  },
  Marathi: {
    rosterTitle: 'विद्यार्थी रोस्टर',
    rosterDescription: 'तुमच्या विद्यार्थ्यांचे व्यवस्थापन करा आणि त्यांच्या प्रगतीचा मागोवा घ्या.',
    addStudent: 'विद्यार्थी జోडा',
    addNewStudent: 'नवीन विद्यार्थी జోडा',
    newStudentDescription: 'नवीन विद्यार्थ्यांसाठी तपशील प्रविष्ट करा.',
    fullName: 'पूर्ण नाव',
    namePlaceholder: 'उदा., अनिका गुप्ता',
    grade: 'श्रेणी',
    gradePlaceholder: 'एक श्रेणी निवडा',
    initialNotes: 'प्रारंभिक नोंदी',
    notesPlaceholder: 'कोणतेही प्रारंभिक निरीक्षण...',
    cancel: 'रद्द करा',
    toastTitle: 'विद्यार्थी जोडला',
    toastDescription: (name: string) => `${name} तुमच्या रोस्टरमध्ये जोडला गेला आहे.`,
    tableName: 'नाव',
    tableActions: 'क्रिया',
    details: 'तपशील',
    noStudents: 'अद्याप कोणीही विद्यार्थी जोडलेले नाहीत.',
    formErrors: {
        nameMin: 'नाव किमान २ अक्षरांचे असावे.',
        gradeMin: 'कृपया एक श्रेणी निवडा.',
    },
  },
  Kashmiri: {
    rosterTitle: 'طالب علمٕک روٗسٹر',
    rosterDescription: 'پننٮ۪ن طالب علمن ہنٛد انتظام کریو تہٕ تِمن ہنٛز پیش رفتس پؠٹھ نظر تھاو۔',
    addStudent: 'طالب علم شٲمِل کریو',
    addNewStudent: 'نوٚو طالب علم شٲمِل کریو',
    newStudentDescription: 'نوٚنِس طالب علم خٲطرٕ تفصیلات دِیُت۔',
    fullName: 'بوٗر ناو',
    namePlaceholder: 'مثلن، انیکا گپتا',
    grade: 'گریڈ',
    gradePlaceholder: 'اکھ گریڈ ژارٕو',
    initialNotes: 'اِبتدٲیی نوٹس',
    notesPlaceholder: 'کاہِنہ تہِ ابتدٲیی مشاہدات...',
    cancel: 'منسوخ',
    toastTitle: 'طالب علم شٲمِل کرنہٕ آو',
    toastDescription: (name: string) => `${name} آو توٚہنٛدِس روٗسٹرس مَنٛز شٲمِل کرنہٕ۔`,
    tableName: 'ناو',
    tableActions: 'کاروٲیی',
    details: 'تفصیلات',
    noStudents: 'وُنی تام چھُ نہٕ کانٛہہ طالب علم شٲمِل کرنہٕ آمُت۔',
    formErrors: {
      nameMin: 'ناو گژھہِ کم از کم 2 اَक्षरَن ہُنٛد ٲسُن۔',
      gradeMin: 'مہربانی کرِتھ اکھ گریڈ ژارٕو۔',
    },
  },
  Bengali: {
    rosterTitle: 'ছাত্র তালিকা',
    rosterDescription: 'আপনার ছাত্রদের পরিচালনা করুন এবং তাদের অগ্রগতি ট্র্যাক করুন।',
    addStudent: 'ছাত্র যোগ করুন',
    addNewStudent: 'নতুন ছাত্র যোগ করুন',
    newStudentDescription: 'নতুন ছাত্রের জন্য বিবরণ লিখুন।',
    fullName: 'পুরো নাম',
    namePlaceholder: 'যেমন, অনিকা গুপ্তা',
    grade: 'গ্রেড',
    gradePlaceholder: 'একটি গ্রেড নির্বাচন করুন',
    initialNotes: 'প্রাথমিক নোট',
    notesPlaceholder: 'যেকোনো প্রাথমিক পর্যবেক্ষণ...',
    cancel: 'বাতিল করুন',
    toastTitle: 'ছাত্র যোগ করা হয়েছে',
    toastDescription: (name: string) => `${name} আপনার তালিকায় যোগ করা হয়েছে।`,
    tableName: 'নাম',
    tableActions: 'ক্রিয়া',
    details: 'বিবরণ',
    noStudents: 'এখনও কোনো ছাত্র যোগ করা হয়নি।',
    formErrors: {
      nameMin: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।',
      gradeMin: 'অনুগ্রহ করে একটি গ্রেড নির্বাচন করুন।',
    },
  },
  Tamil: {
    rosterTitle: 'மாணவர் பட்டியல்',
    rosterDescription: 'உங்கள் மாணவர்களை நிர்வகிக்கவும் மற்றும் அவர்களின் முன்னேற்றத்தைக் கண்காணிக்கவும்।',
    addStudent: 'மாணவரைச் சேர்',
    addNewStudent: 'புதிய மாணவரைச் சேர்',
    newStudentDescription: 'புதிய மாணவருக்கான விவரங்களை உள்ளிடவும்।',
    fullName: 'முழு பெயர்',
    namePlaceholder: 'எ.கா., அனிகா குப்தா',
    grade: 'தரம்',
    gradePlaceholder: 'ஒரு தரத்தைத் தேர்ந்தெடுக்கவும்',
    initialNotes: 'ஆரம்ப குறிப்புகள்',
    notesPlaceholder: 'ஏதேனும் ஆரம்ப அவதானிப்புகள்...',
    cancel: 'ரத்துசெய்',
    toastTitle: 'மாணவர் சேர்க்கப்பட்டார்',
    toastDescription: (name: string) => `${name} உங்கள் பட்டியலில் சேர்க்கப்பட்டுள்ளார்।`,
    tableName: 'பெயர்',
    tableActions: 'செயல்கள்',
    details: 'விவரங்கள்',
    noStudents: 'இன்னும் மாணவர்கள் சேர்க்கப்படவில்லை।',
    formErrors: {
      nameMin: 'பெயர் குறைந்தது 2 எழுத்துகளாக இருக்க வேண்டும்.',
      gradeMin: 'தயவுசெய்து ஒரு தரத்தைத் தேர்ந்தெடுக்கவும்।',
    },
  },
  Gujarati: {
    rosterTitle: 'વિદ્યાર્થી રોસ્ટર',
    rosterDescription: 'તમારા વિદ્યાર્થીઓનું સંચાલન કરો અને તેમની પ્રગતિને ટ્રૅક કરો.',
    addStudent: 'વિદ્યાર્થી ઉમેરો',
    addNewStudent: 'નવો વિદ્યાર્થી ઉમેરો',
    newStudentDescription: 'નવા વિદ્યાર્થી માટે વિગતો દાખલ કરો.',
    fullName: 'પૂરું નામ',
    namePlaceholder: 'દા.ત., અનિકા ગુપ્તા',
    grade: 'ગ્રેડ',
    gradePlaceholder: 'એક ગ્રેડ પસંદ કરો',
    initialNotes: 'પ્રારંભિક નોંધો',
    notesPlaceholder: 'કોઈપણ પ્રારંભિક અવલોકનો...',
    cancel: 'રદ કરો',
    toastTitle: 'વિદ્યાર્થી ઉમેરવામાં આવ્યો',
    toastDescription: (name: string) => `${name} તમારા રોસ્ટરમાં ઉમેરવામાં આવ્યો છે.`,
    tableName: 'નામ',
    tableActions: 'ક્રિયાઓ',
    details: 'વિગતો',
    noStudents: 'હજી સુધી કોઈ વિદ્યાર્થી ઉમેરવામાં આવ્યો નથી.',
    formErrors: {
      nameMin: 'નામ ઓછામાં ઓછું 2 અક્ષરોનું હોવું જોઈએ.',
      gradeMin: 'કૃપા કરીને એક ગ્રેડ પસંદ કરો.',
    },
  },
  Malayalam: {
    rosterTitle: 'വിദ്യാർത്ഥി പട്ടിക',
    rosterDescription: 'നിങ്ങളുടെ വിദ്യാർത്ഥികളെ നിയന്ത്രിക്കുകയും അവരുടെ പുരോഗതി നിരീക്ഷിക്കുകയും ചെയ്യുക.',
    addStudent: 'വിദ്യാർത്ഥിയെ ചേർക്കുക',
    addNewStudent: 'പുതിയ വിദ്യാർത്ഥിയെ ചേർക്കുക',
    newStudentDescription: 'പുതിയ വിദ്യാർത്ഥിയുടെ വിവരങ്ങൾ നൽകുക.',
    fullName: 'മുഴുവൻ പേര്',
    namePlaceholder: 'ഉദാ., അനിക ഗുപ്ത',
    grade: 'ഗ്രേഡ്',
    gradePlaceholder: 'ഒരു ഗ്രേഡ് തിരഞ്ഞെടുക്കുക',
    initialNotes: 'പ്രാരംഭ കുറിപ്പുകൾ',
    notesPlaceholder: 'ഏതെങ്കിലും പ്രാരംഭ നിരീക്ഷണങ്ങൾ...',
    cancel: 'റദ്ദാക്കുക',
    toastTitle: 'വിദ്യാർത്ഥിയെ ചേർത്തു',
    toastDescription: (name: string) => `${name} നിങ്ങളുടെ പട്ടികയിൽ ചേർത്തു.`,
    tableName: 'പേര്',
    tableActions: 'പ്രവർത്തനങ്ങൾ',
    details: 'വിവരങ്ങൾ',
    noStudents: 'ഇതുവരെ വിദ്യാർത്ഥികളൊന്നും ചേർത്തിട്ടില്ല.',
    formErrors: {
      nameMin: 'പേര് കുറഞ്ഞത് 2 അക്ഷരങ്ങളെങ്കിലും ആയിരിക്കണം.',
      gradeMin: 'ദയവായി ഒരു ഗ്രേഡ് തിരഞ്ഞെടുക്കുക.',
    },
  },
  Punjabi: {
    rosterTitle: 'ਵਿਦਿਆਰਥੀ ਰੋਸਟਰ',
    rosterDescription: 'ਆਪਣੇ ਵਿਦਿਆਰਥੀਆਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ ਅਤੇ ਉਹਨਾਂ ਦੀ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰੋ।',
    addStudent: 'ਵਿਦਿਆਰਥੀ ਸ਼ਾਮਲ ਕਰੋ',
    addNewStudent: 'ਨਵਾਂ ਵਿਦਿਆਰਥੀ ਸ਼ਾਮਲ ਕਰੋ',
    newStudentDescription: 'ਨਵੇਂ ਵਿਦਿਆਰਥੀ ਲਈ ਵੇਰਵੇ ਦਰਜ ਕਰੋ।',
    fullName: 'ਪੂਰਾ ਨਾਮ',
    namePlaceholder: 'ਜਿਵੇਂ, ਅਨਿਕਾ ਗੁਪਤਾ',
    grade: 'ਗ੍ਰੇਡ',
    gradePlaceholder: 'ਇੱਕ ਗ੍ਰੇਡ ਚੁਣੋ',
    initialNotes: 'ਸ਼ੁਰੂਆਤੀ ਨੋਟਸ',
    notesPlaceholder: 'ਕੋਈ ਵੀ ਸ਼ੁਰੂਆਤੀ ਨਿਰੀਖਣ...',
    cancel: 'ਰੱਦ ਕਰੋ',
    toastTitle: 'ਵਿਦਿਆਰਥੀ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ',
    toastDescription: (name: string) => `${name} ਨੂੰ ਤੁਹਾਡੇ ਰੋਸਟਰ ਵਿੱਚ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ ਹੈ।`,
    tableName: 'ਨਾਮ',
    tableActions: 'ਕਾਰਵਾਈਆਂ',
    details: 'ਵੇਰਵੇ',
    noStudents: 'ਅਜੇ ਤੱਕ ਕੋਈ ਵਿਦਿਆਰਥੀ ਸ਼ਾਮਲ ਨਹੀਂ ਕੀਤਾ ਗਿਆ ਹੈ।',
    formErrors: {
      nameMin: 'ਨਾਮ ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।',
      gradeMin: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਗ੍ਰੇਡ ਚੁਣੋ।',
    },
  },
  Odia: {
    rosterTitle: 'ଛାତ୍ର ରୋଷ୍ଟର',
    rosterDescription: 'ଆପଣଙ୍କର ଛାତ୍ରମାନଙ୍କୁ ପରିଚାଳନା କରନ୍ତୁ ଏବଂ ସେମାନଙ୍କର ପ୍ରଗତି ଟ୍ରାକ୍ କରନ୍ତୁ।',
    addStudent: 'ଛାତ୍ର ଯୋଗ କରନ୍ତୁ',
    addNewStudent: 'ନୂତନ ଛାତ୍ର ଯୋଗ କରନ୍ତୁ',
    newStudentDescription: 'ନୂତନ ଛାତ୍ର ପାଇଁ ବିବରଣୀ ପ୍ରବେଶ କରନ୍ତୁ।',
    fullName: 'ପୂରା ନାମ',
    namePlaceholder: 'ଉଦାହରଣ, ଅନିକା ଗୁପ୍ତା',
    grade: 'ଗ୍ରେଡ୍',
    gradePlaceholder: 'ଏକ ଗ୍ରେଡ୍ ଚୟନ କରନ୍ତୁ',
    initialNotes: 'ପ୍ରାରମ୍ଭିକ ନୋଟ୍',
    notesPlaceholder: 'ଯେକୌଣସି ପ୍ରାରମ୍ଭିକ ପର୍ଯ୍ୟବେକ୍ଷଣ...',
    cancel: 'ବାତିଲ କରନ୍ତୁ',
    toastTitle: 'ଛାତ୍ର ଯୋଗ କରାଗଲା',
    toastDescription: (name: string) => `${name} ଆପଣଙ୍କ ରୋଷ୍ଟରରେ ଯୋଗ କରାଯାଇଛି।`,
    tableName: 'ନାମ',
    tableActions: 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ',
    details: 'ବିବରଣୀ',
    noStudents: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଛାତ୍ର ଯୋଡି ହୋଇନାହାଁନ୍ତି।',
    formErrors: {
      nameMin: 'ନାମ ଅତିକମରେ ୨ଟି ଅକ୍ଷର ହେବା ଆବଶ୍ୟକ।',
      gradeMin: 'ଦୟାକରି ଏକ ଗ୍ରେଡ୍ ଚୟନ କରନ୍ତୁ।',
    },
  },
  Assamese: {
    rosterTitle: 'ছাত্র তালিকা',
    rosterDescription: 'আপোনাৰ শিক্ষাৰ্থীসকলক পৰিচালনা কৰক আৰু তেওঁলোকৰ প্ৰগতি ট্ৰেক কৰক।',
    addStudent: 'ছাত্র যোগ কৰক',
    addNewStudent: 'নতুন ছাত্র যোগ কৰক',
    newStudentDescription: 'নতুন শিক্ষাৰ্থীৰ বাবে বিৱৰণ প্ৰবিষ্ট কৰক।',
    fullName: 'সম্পূৰ্ণ নাম',
    namePlaceholder: 'যেনে, অনিকা গুপ্তা',
    grade: 'গ্ৰেড',
    gradePlaceholder: 'এটা গ্ৰেড বাছনি কৰক',
    initialNotes: 'প্ৰাৰম্ভিক টোকা',
    notesPlaceholder: 'যিকোনো প্ৰাৰম্ভিক পৰ্যবেক্ষণ...',
    cancel: 'বাতিল কৰক',
    toastTitle: 'ছাত্র যোগ কৰা হ’ল',
    toastDescription: (name: string) => `${name}ক আপোনাৰ তালিকাত যোগ কৰা হৈছে।`,
    tableName: 'নাম',
    tableActions: 'কাৰ্য্য',
    details: 'বিৱৰণ',
    noStudents: 'এতিয়ালৈকে কোনো শিক্ষাৰ্থী যোগ কৰা হোৱা নাই।',
    formErrors: {
      nameMin: 'নামটো কমেও ২টা আখৰৰ হ’ব লাগিব।',
      gradeMin: 'অনুগ্ৰহ কৰি এটা গ্ৰেড বাছনি কৰক।',
    },
  },
  Kannada: {
    rosterTitle: 'ವಿದ್ಯಾರ್ಥಿ ರೋಸ್ಟರ್',
    rosterDescription: 'ನಿಮ್ಮ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಅವರ ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
    addStudent: 'ವಿದ್ಯಾರ್ಥಿಯನ್ನು ಸೇರಿಸಿ',
    addNewStudent: 'ಹೊಸ ವಿದ್ಯಾರ್ಥಿಯನ್ನು ಸೇರಿಸಿ',
    newStudentDescription: 'ಹೊಸ ವಿದ್ಯಾರ್ಥಿಗಾಗಿ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    namePlaceholder: 'ಉದಾ., ಅನಿಕಾ ಗುಪ್ತಾ',
    grade: 'ದರ್ಜೆ',
    gradePlaceholder: 'ಒಂದು ದರ್ಜೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    initialNotes: 'ಆರಂಭಿಕ ಟಿಪ್ಪಣಿಗಳು',
    notesPlaceholder: 'ಯಾವುದೇ ಆರಂಭಿಕ ಅವಲೋಕನಗಳು...',
    cancel: 'ರದ್ದುಮಾಡಿ',
    toastTitle: 'ವಿದ್ಯಾರ್ಥಿಯನ್ನು ಸೇರಿಸಲಾಗಿದೆ',
    toastDescription: (name: string) => `${name} ನಿಮ್ಮ ರೋಸ್ಟರ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ.`,
    tableName: 'ಹೆಸರು',
    tableActions: 'ಕ್ರಿಯೆಗಳು',
    details: 'ವಿವರಗಳು',
    noStudents: 'ಇನ್ನೂ ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ.',
    formErrors: {
      nameMin: 'ಹೆಸರು ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.',
      gradeMin: 'ದಯವಿಟ್ಟು ಒಂದು ದರ್ಜೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    },
  },
  Telugu: {
    rosterTitle: 'విద్యార్థి రోస్టర్',
    rosterDescription: 'మీ విద్యార్థులను నిర్వహించండి మరియు వారి పురోగతిని ట్రాక్ చేయండి.',
    addStudent: 'విద్యార్థిని జోడించు',
    addNewStudent: 'కొత్త విద్యార్థిని జోడించు',
    newStudentDescription: 'కొత్త విద్యార్థి కోసం వివరాలను నమోదు చేయండి.',
    fullName: 'పూర్తి పేరు',
    namePlaceholder: 'ఉదా., అనికా గుప్తా',
    grade: 'గ్రేడ్',
    gradePlaceholder: 'గ్రేడ్‌ను ఎంచుకోండి',
    initialNotes: 'ప్రారంభ గమనికలు',
    notesPlaceholder: 'ఏవైనా ప్రారంభ పరిశీలనలు...',
    cancel: 'రద్దు చేయి',
    toastTitle: 'విద్యార్థి జోడించబడ్డారు',
    toastDescription: (name: string) => `${name} మీ రోస్టర్‌కు జోడించబడ్డారు.`,
    tableName: 'పేరు',
    tableActions: 'చర్యలు',
    details: 'వివరాలు',
    noStudents: 'ఇంకా విద్యార్థులు ఎవరూ జోడించబడలేదు.',
    formErrors: {
      nameMin: 'పేరు కనీసం 2 అక్షరాలు ఉండాలి.',
      gradeMin: 'దయచేసి గ్రేడ్‌ను ఎంచుకోండి.',
    },
  },
};

export function StudentAssessmentClient() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const formSchema = z.object({
    name: z.string().min(2, t.formErrors.nameMin),
    grade: z.string().min(1, t.formErrors.gradeMin),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', grade: '', notes: '' },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setStudents((prev) => [...prev, { ...values, id: Date.now() }]);
    form.reset();
    setIsDialogOpen(false);
    toast({ title: t.toastTitle, description: t.toastDescription(values.name) });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t.rosterTitle}</CardTitle>
          <CardDescription>{t.rosterDescription}</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {t.addStudent}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.addNewStudent}</DialogTitle>
              <DialogDescription>{t.newStudentDescription}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fullName}</FormLabel>
                      <FormControl><Input placeholder={t.namePlaceholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.grade}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t.gradePlaceholder} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {grades.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.initialNotes}</FormLabel>
                      <FormControl><Textarea placeholder={t.notesPlaceholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">{t.cancel}</Button>
                  </DialogClose>
                  <Button type="submit">{t.addStudent}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.tableName}</TableHead>
                <TableHead className="w-[180px] text-right">{t.tableActions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="outline" size="sm">
                        <Link href={`/student-assessment/${student.id}`}>
                          {t.details}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    {t.noStudents}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
