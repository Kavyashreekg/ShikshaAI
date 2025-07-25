'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { grades, subjects } from '@/lib/data';
import { CalendarCheck, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    lessonPlanDetails: 'Lesson Plan Details',
    specifyDetails: 'Specify the details for your weekly plan.',
    grade: 'Grade',
    selectGrade: 'Select a grade',
    subject: 'Subject',
    selectSubject: 'Select a subject',
    weekTopic: 'Week / Topic',
    weekTopicPlaceholder: "e.g., Week 5 or 'Introduction to Fractions'",
    generatePlan: 'Generate Plan',
    textbookResources: 'Textbook Resources',
    accessNCERT: 'Access official NCERT textbooks directly.',
    findResourcesFor: (grade: string, subject: string) => `Find resources for ${grade}, ${subject}.`,
    searchNCERT: 'Search NCERT Portal',
    goToNCERT: 'Go to NCERT Portal',
    generatedLessonPlan: 'Generated Lesson Plan',
    planWillBeStructured: 'Your weekly plan will be structured here.',
    plannerComingSoon: 'Lesson Planner Coming Soon',
    featureUnderDevelopment: 'This feature is currently under development.',
    toastTitle: 'Feature Coming Soon',
    toastDescription: 'The AI Lesson Planner is under development. Please check back later!',
    formErrors: {
      grade: 'Please select a grade.',
      subject: 'Please select a subject.',
      week: 'Please enter a week number or topic.',
    },
  },
  Hindi: {
    lessonPlanDetails: 'पाठ योजना विवरण',
    specifyDetails: 'अपनी साप्ताहिक योजना के लिए विवरण निर्दिष्ट करें।',
    grade: 'ग्रेड',
    selectGrade: 'एक ग्रेड चुनें',
    subject: 'विषय',
    selectSubject: 'एक विषय चुनें',
    weekTopic: 'सप्ताह / विषय',
    weekTopicPlaceholder: "जैसे, सप्ताह 5 या 'भिन्न का परिचय'",
    generatePlan: 'योजना बनाएं',
    textbookResources: 'पाठ्यपुस्तक संसाधन',
    accessNCERT: 'आधिकारिक एनसीईआरटी पाठ्यपुस्तकें सीधे एक्सेस करें।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} के लिए संसाधन खोजें।`,
    searchNCERT: 'एनसीईआरटी पोर्टल खोजें',
    goToNCERT: 'एनसीईआरटी पोर्टल पर जाएं',
    generatedLessonPlan: 'उत्पन्न पाठ योजना',
    planWillBeStructured: 'आपकी साप्ताहिक योजना यहाँ संरचित की जाएगी।',
    plannerComingSoon: 'पाठ योजनाकार जल्द ही आ रहा है',
    featureUnderDevelopment: 'यह सुविधा वर्तमान में विकास के अधीन है।',
    toastTitle: 'सुविधा जल्द ही आ रही है',
    toastDescription: 'एआई पाठ योजनाकार विकास के अधीन है। कृपया बाद में वापस देखें!',
    formErrors: {
      grade: 'कृपया एक ग्रेड चुनें।',
      subject: 'कृपया एक विषय चुनें।',
      week: 'कृपया एक सप्ताह संख्या या विषय दर्ज करें।',
    },
  },
  Marathi: {
    lessonPlanDetails: 'पाठ योजना तपशील',
    specifyDetails: 'तुमच्या साप्ताहिक योजनेसाठी तपशील निर्दिष्ट करा.',
    grade: 'श्रेणी',
    selectGrade: 'एक श्रेणी निवडा',
    subject: 'विषय',
    selectSubject: 'एक विषय निवडा',
    weekTopic: 'आठवडा / विषय',
    weekTopicPlaceholder: "उदा., आठवडा 5 किंवा 'अपूर्णांकांची ओळख'",
    generatePlan: 'योजना तयार करा',
    textbookResources: 'पाठ्यपुस्तक संसाधने',
    accessNCERT: 'अधिकृत एनसीईआरटी पाठ्यपुस्तके थेट मिळवा.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} साठी संसाधने शोधा.`,
    searchNCERT: 'एनसीईआरटी पोर्टल शोधा',
    goToNCERT: 'एनसीईआरटी पोर्टलवर जा',
    generatedLessonPlan: 'तयार केलेली पाठ योजना',
    planWillBeStructured: 'तुमची साप्ताहिक योजना येथे संरचित केली जाईल.',
    plannerComingSoon: 'पाठ नियोजक लवकरच येत आहे',
    featureUnderDevelopment: 'हे वैशिष्ट्य सध्या विकासाधीन आहे.',
    toastTitle: 'वैशिष्ट्य लवकरच येत आहे',
    toastDescription: 'एआय पाठ नियोजक विकासाधीन आहे. कृपया नंतर पुन्हा तपासा!',
    formErrors: {
      grade: 'कृपया एक श्रेणी निवडा.',
      subject: 'कृपया एक विषय निवडा.',
      week: 'कृपया आठवड्याचा क्रमांक किंवा विषय प्रविष्ट करा.',
    },
  },
  Kashmiri: {
    lessonPlanDetails: 'سبق منصوبہٕ تفصیل',
    specifyDetails: 'پننہٕ ہفتہٕ وار منصوبہٕ خٲطرٕ تفصیل دِیُت۔',
    grade: 'گریڈ',
    selectGrade: 'اکھ گریڈ ژارٕو',
    subject: 'مضمون',
    selectSubject: 'اکھ مضمون ژارٕو',
    weekTopic: 'ہفتہٕ / موضوع',
    weekTopicPlaceholder: "مثلن، ہفتہٕ 5 یا 'فریکشنٕچ تعارُف'",
    generatePlan: 'منصوبہٕ تیار کریو',
    textbookResources: 'درسی کتاب وسیلہٕ',
    accessNCERT: 'سرکٲرِ NCERT درسی کتابہٕ براہ راست حٲصِل کریو۔',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} خٲطرٕ وسیلہٕ ژھارٕو۔`,
    searchNCERT: 'NCERT پورٹل ژھارٕو',
    goToNCERT: 'NCERT پورٹلس پؠٹھ گژھو',
    generatedLessonPlan: 'تیار کرنہٕ آمُت سبق منصوبہٕ',
    planWillBeStructured: 'توٚہنٛد ہفتہٕ وار منصوبہٕ ییٚتہِ ترتیٖب دِنہٕ یِنہٕ۔',
    plannerComingSoon: 'سبق منصوبہٕ ساز جلدِ یِنہٕ وٲل',
    featureUnderDevelopment: 'یہِ فیچر چھُ وُنکین ترقی مَنٛز۔',
    toastTitle: 'فیچر جلدِ یِنہٕ وٲل',
    toastDescription: 'AI سبق منصوبہٕ ساز چھُ ترقی مَنٛز۔ مہربانی کرِتھ پتہٕ واپس وُچھِو!',
    formErrors: {
      grade: 'مہربانی کرِتھ اکھ گریڈ ژارٕو۔',
      subject: 'مہربانی کرِتھ اَکھ مضمون ژارٕو۔',
      week: 'مہربانی کرِتھ اَکھ ہفتہٕ نمبر یا موضوع دِیو۔',
    },
  },
  Bengali: {
    lessonPlanDetails: 'পাঠ পরিকল্পনার বিবরণ',
    specifyDetails: 'আপনার সাপ্তাহিক পরিকল্পনার জন্য বিবরণ নির্দিষ্ট করুন।',
    grade: 'শ্রেণী',
    selectGrade: 'একটি শ্রেণী নির্বাচন করুন',
    subject: 'বিষয়',
    selectSubject: 'একটি বিষয় নির্বাচন করুন',
    weekTopic: 'সপ্তাহ / বিষয়',
    weekTopicPlaceholder: "যেমন, সপ্তাহ ৫ বা 'ভগ্নাংশের ভূমিকা'",
    generatePlan: 'পরিকল্পনা তৈরি করুন',
    textbookResources: 'পাঠ্যপুস্তক সম্পদ',
    accessNCERT: 'সরাসরি সরকারি NCERT পাঠ্যপুস্তক অ্যাক্সেস করুন।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} এর জন্য সম্পদ খুঁজুন।`,
    searchNCERT: 'NCERT পোর্টাল অনুসন্ধান করুন',
    goToNCERT: 'NCERT পোর্টালে যান',
    generatedLessonPlan: 'উত্পন্ন পাঠ পরিকল্পনা',
    planWillBeStructured: 'আপনার সাপ্তাহিক পরিকল্পনা এখানে ರಚনা করা হবে।',
    plannerComingSoon: 'পাঠ পরিকল্পনাকারী শীঘ্রই আসছে',
    featureUnderDevelopment: 'এই বৈশিষ্ট্যটি বর্তমানে বিকাশের অধীনে রয়েছে।',
    toastTitle: 'বৈশিষ্ট্য শীঘ্রই আসছে',
    toastDescription: 'এআই পাঠ পরিকল্পনাকারী বিকাশের অধীনে রয়েছে। অনুগ্রহ করে পরে আবার দেখুন!',
    formErrors: {
      grade: 'অনুগ্রহ করে একটি শ্রেণী নির্বাচন করুন।',
      subject: 'অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।',
      week: 'অনুগ্রহ করে একটি সপ্তাহ নম্বর বা বিষয় লিখুন।',
    },
  },
  Tamil: {
    lessonPlanDetails: 'பாடத் திட்ட விவரங்கள்',
    specifyDetails: 'உங்கள் வாராந்திர திட்டத்திற்கான விவரங்களைக் குறிப்பிடவும்.',
    grade: 'தரம்',
    selectGrade: 'ஒரு தரத்தைத் தேர்ந்தெடுக்கவும்',
    subject: 'பாடம்',
    selectSubject: 'ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்',
    weekTopic: 'வாரம் / தலைப்பு',
    weekTopicPlaceholder: "எ.கா., வாரம் 5 அல்லது 'பின்னங்களின் அறிமுகம்'",
    generatePlan: 'திட்டத்தை உருவாக்கு',
    textbookResources: 'பாடநூல் ஆதாரங்கள்',
    accessNCERT: 'அதிகாரப்பூர்வ NCERT பாடநூல்களை நேரடியாக அணுகவும்.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} க்கான ஆதாரங்களைக் கண்டறியவும்.`,
    searchNCERT: 'NCERT போர்ட்டலைத் தேடு',
    goToNCERT: 'NCERT போர்ட்டலுக்குச் செல்',
    generatedLessonPlan: 'உருவாக்கப்பட்ட பாடத் திட்டம்',
    planWillBeStructured: 'உங்கள் வாராந்திர திட்டம் இங்கே கட்டமைக்கப்படும்.',
    plannerComingSoon: 'பாடத் திட்டமிடுபவர் விரைவில் வருகிறார்',
    featureUnderDevelopment: 'இந்த அம்சம் தற்போது உருவாக்கத்தில் உள்ளது.',
    toastTitle: 'அம்சம் விரைவில் வருகிறது',
    toastDescription: 'ஏஐ பாடத் திட்டமிடுபவர் உருவாக்கத்தில் உள்ளார். தயவுசெய்து பின்னர் மீண்டும் சரிபார்க்கவும்!',
    formErrors: {
      grade: 'தயவுசெய்து ஒரு தரத்தைத் தேர்ந்தெடுக்கவும்.',
      subject: 'தயவுசெய்து ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்.',
      week: 'தயவுசெய்து ஒரு வார எண் அல்லது தலைப்பை உள்ளிடவும்.',
    },
  },
  Gujarati: {
    lessonPlanDetails: 'પાઠ યોજના વિગતો',
    specifyDetails: 'તમારી સાપ્તાહિક યોજના માટે વિગતો સ્પષ્ટ કરો.',
    grade: 'ગ્રેડ',
    selectGrade: 'એક ગ્રેડ પસંદ કરો',
    subject: 'વિષય',
    selectSubject: 'એક વિષય પસંદ કરો',
    weekTopic: 'અઠવાડિયું / વિષય',
    weekTopicPlaceholder: "દા.ત., અઠવાડિયું 5 અથવા 'અપૂર્ણાંકોનો પરિચય'",
    generatePlan: 'યોજના બનાવો',
    textbookResources: 'પાઠ્યપુસ્તક સંસાધનો',
    accessNCERT: 'સત્તાવાર NCERT પાઠ્યપુસ્તકો સીધા જ મેળવો.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} માટે સંસાધનો શોધો.`,
    searchNCERT: 'NCERT પોર્ટલ શોધો',
    goToNCERT: 'NCERT પોર્ટલ પર જાઓ',
    generatedLessonPlan: 'બનાવેલ પાઠ યોજના',
    planWillBeStructured: 'તમારી સાપ્તાહિક યોજના અહીં ગોઠવવામાં આવશે.',
    plannerComingSoon: 'પાઠ યોજનાકાર ટૂંક સમયમાં આવી રહ્યું છે',
    featureUnderDevelopment: 'આ સુવિધા હાલમાં વિકાસ હેઠળ છે.',
    toastTitle: 'સુવિધા ટૂંક સમયમાં આવી રહી છે',
    toastDescription: 'એઆઈ પાઠ યોજનાકાર વિકાસ હેઠળ છે. કૃપા કરીને પછીથી ફરી તપાસો!',
    formErrors: {
      grade: 'કૃપા કરીને એક ગ્રેડ પસંદ કરો.',
      subject: 'કૃપા કરીને એક વિષય પસંદ કરો.',
      week: 'કૃપા કરીને અઠવાડિયાનો નંબર અથવા વિષય દાખલ કરો.',
    },
  },
  Malayalam: {
    lessonPlanDetails: 'പാഠ പദ്ധതി വിശദാംശങ്ങൾ',
    specifyDetails: 'നിങ്ങളുടെ പ്രതിവാര പദ്ധതിയുടെ വിശദാംശങ്ങൾ വ്യക്തമാക്കുക.',
    grade: 'ഗ്രേഡ്',
    selectGrade: 'ഒരു ഗ്രേഡ് തിരഞ്ഞെടുക്കുക',
    subject: 'വിഷയം',
    selectSubject: 'ഒരു വിഷയം തിരഞ്ഞെടുക്കുക',
    weekTopic: 'ആഴ്ച / വിഷയം',
    weekTopicPlaceholder: "ഉദാഹരണത്തിന്, ആഴ്ച 5 അല്ലെങ്കിൽ 'ഭിന്നസംഖ്യകളുടെ ആമുഖം'",
    generatePlan: 'പദ്ധതി ഉണ്ടാക്കുക',
    textbookResources: 'പാഠപുസ്തക വിഭവങ്ങൾ',
    accessNCERT: 'ഔദ്യോഗിക NCERT പാഠപുസ്തകങ്ങൾ നേരിട്ട് ആക്സസ് ചെയ്യുക.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} എന്നതിനായുള്ള വിഭവങ്ങൾ കണ്ടെത്തുക.`,
    searchNCERT: 'NCERT പോർട്ടൽ തിരയുക',
    goToNCERT: 'NCERT പോർട്ടലിലേക്ക് പോകുക',
    generatedLessonPlan: 'ഉണ്ടാക്കിയ പാഠ പദ്ധതി',
    planWillBeStructured: 'നിങ്ങളുടെ പ്രതിവാര പദ്ധതി ഇവിടെ രൂപീകരിക്കും.',
    plannerComingSoon: 'പാഠ ആസൂത്രകൻ ഉടൻ വരുന്നു',
    featureUnderDevelopment: 'ഈ ഫീച്ചർ നിലവിൽ വികസിപ്പിച്ചുകൊണ്ടിരിക്കുന്നു.',
    toastTitle: 'ഫീച്ചർ ഉടൻ വരുന്നു',
    toastDescription: 'എഐ പാഠ ആസൂത്രകൻ വികസിപ്പിച്ചുകൊണ്ടിരിക്കുന്നു. ദയവായി പിന്നീട് വീണ്ടും പരിശോധിക്കുക!',
    formErrors: {
      grade: 'ദയവായി ഒരു ഗ്രേഡ് തിരഞ്ഞെടുക്കുക.',
      subject: 'ദയവായി ഒരു വിഷയം തിരഞ്ഞെടുക്കുക.',
      week: 'ദയവായി ഒരാഴ്ചയുടെ നമ്പറോ വിഷയമോ നൽകുക.',
    },
  },
  Punjabi: {
    lessonPlanDetails: 'ਪਾਠ ਯੋਜਨਾ ਵੇਰਵੇ',
    specifyDetails: 'ਆਪਣੀ ਹਫਤਾਵਾਰੀ ਯੋਜਨਾ ਲਈ ਵੇਰਵੇ ਦੱਸੋ।',
    grade: 'ਗ੍ਰੇਡ',
    selectGrade: 'ਇੱਕ ਗ੍ਰੇਡ ਚੁਣੋ',
    subject: 'ਵਿਸ਼ਾ',
    selectSubject: 'ਇੱਕ ਵਿਸ਼ਾ ਚੁਣੋ',
    weekTopic: 'ਹਫ਼ਤਾ / ਵਿਸ਼ਾ',
    weekTopicPlaceholder: "ਜਿਵੇਂ, ਹਫ਼ਤਾ 5 ਜਾਂ 'ਭਿੰਨਾਂ ਦੀ ਜਾਣ-ਪਛਾਣ'",
    generatePlan: 'ਯੋਜਨਾ ਬਣਾਓ',
    textbookResources: 'ਪਾਠ ਪੁਸਤਕ ਸਰੋਤ',
    accessNCERT: 'ਸਿੱਧੇ ਤੌਰ ਤੇ ਅਧਿਕਾਰਤ NCERT ਪਾਠ ਪੁਸਤਕਾਂ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} ਲਈ ਸਰੋਤ ਲੱਭੋ।`,
    searchNCERT: 'NCERT ਪੋਰਟਲ ਖੋਜੋ',
    goToNCERT: 'NCERT ਪੋਰਟਲ ਤੇ ਜਾਓ',
    generatedLessonPlan: 'ਤਿਆਰ ਕੀਤੀ ਪਾਠ ਯੋਜਨਾ',
    planWillBeStructured: 'ਤੁਹਾਡੀ ਹਫਤਾਵਾਰੀ ਯੋਜਨਾ ਇੱਥੇ ਬਣਾਈ ਜਾਵੇਗੀ।',
    plannerComingSoon: 'ਪਾਠ ਯੋਜਨਾਕਾਰ ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ',
    featureUnderDevelopment: 'ਇਹ ਵਿਸ਼ੇਸ਼ਤਾ ਇਸ ਵੇਲੇ ਵਿਕਾਸ ਅਧੀਨ ਹੈ।',
    toastTitle: 'ਵਿਸ਼ੇਸ਼ਤਾ ਜਲਦੀ ਆ ਰਹੀ ਹੈ',
    toastDescription: 'ਏਆਈ ਪਾଠ ਯੋਜਨਾਕਾਰ ਵਿਕਾਸ ਅਧੀਨ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੋ!',
    formErrors: {
      grade: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਗ੍ਰੇਡ ਚੁਣੋ।',
      subject: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵਿਸ਼ਾ ਚੁਣੋ।',
      week: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਹਫ਼ਤਾ ਨੰਬਰ ਜਾਂ ਵਿਸ਼ਾ ਦਰਜ ਕਰੋ।',
    },
  },
  Odia: {
    lessonPlanDetails: 'ପାଠ ଯୋଜନା ବିବରଣୀ',
    specifyDetails: 'ଆପଣଙ୍କ ସାପ୍ତାହିକ ଯୋଜନା ପାଇଁ ବିବରଣୀ ନିର୍ଦ୍ଦିଷ୍ଟ କରନ୍ତୁ।',
    grade: 'ଶ୍ରେଣୀ',
    selectGrade: 'ଏକ ଶ୍ରେଣୀ ବାଛନ୍ତୁ',
    subject: 'ବିଷୟ',
    selectSubject: 'ଏକ ବିଷୟ ବାଛନ୍ତୁ',
    weekTopic: 'ସପ୍ତାହ / ବିଷୟ',
    weekTopicPlaceholder: "ଉଦାହରଣ ସ୍ୱରୂପ, ସପ୍ତାହ 5 କିମ୍ବା 'ଭଗ୍ନାଂଶର ପରିଚୟ'",
    generatePlan: 'ଯୋଜନା ପ୍ରସ୍ତୁତ କରନ୍ତୁ',
    textbookResources: 'ପାଠ୍ୟପୁସ୍ତକ ସମ୍ବଳ',
    accessNCERT: 'ସିଧାସଳଖ ଅଫିସିଆଲ୍ NCERT ପାଠ୍ୟପୁସ୍ତକଗୁଡ଼ିକୁ ପ୍ରବେଶ କରନ୍ତୁ।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} ପାଇଁ ସମ୍ବଳ ଖୋଜନ୍ତୁ।`,
    searchNCERT: 'NCERT ପୋର୍ଟାଲ୍ ଖୋଜନ୍ତୁ',
    goToNCERT: 'NCERT ପୋର୍ଟାଲକୁ ଯାଆନ୍ତୁ',
    generatedLessonPlan: 'ପ୍ରସ୍ତୁତ ପାଠ ଯୋଜନା',
    planWillBeStructured: 'ଆପଣଙ୍କ ସାପ୍ତାହିକ ଯୋଜନା ଏଠାରେ ଗଠନ କରାଯିବ।',
    plannerComingSoon: 'ପାଠ ଯୋଜନାକାରୀ ଶୀଘ୍ର ଆସୁଛି',
    featureUnderDevelopment: 'ଏହି ବୈଶିଷ୍ଟ୍ୟ ବର୍ତ୍ତମାନ ବିକାଶ ଅଧୀନରେ ଅଛି।',
    toastTitle: 'ବୈଶିଷ୍ଟ୍ୟ ଶୀଘ୍ର ଆସୁଛି',
    toastDescription: 'AI ପାଠ ଯୋଜନାକାରୀ ବିକାଶ ଅଧୀନରେ ଅଛି। ଦୟାକରି ପରେ ପୁଣି ଯାଞ୍ଚ କରନ୍ତୁ!',
    formErrors: {
      grade: 'ଦୟାକରି ଏକ ଶ୍ରେଣୀ ବାଛନ୍ତୁ।',
      subject: 'ଦୟାକରି ଏକ ବିଷୟ ବାଛନ୍ତୁ।',
      week: 'ଦୟାକରି ଏକ ସପ୍ତାହ ସଂଖ୍ୟା କିମ୍ବା ବିଷୟ ପ୍ରବେଶ କରନ୍ତୁ।',
    },
  },
  Assamese: {
    lessonPlanDetails: 'পাঠ পৰিকল্পনাৰ বিৱৰণ',
    specifyDetails: 'আপোনাৰ সাপ্তাহিক পৰিকল্পনাৰ বাবে বিৱৰণ নিৰ্দিষ্ট কৰক।',
    grade: 'শ্ৰেণী',
    selectGrade: 'এটা শ্ৰেণী বাছনি কৰক',
    subject: 'বিষয়',
    selectSubject: 'এটা বিষয় বাছনি কৰক',
    weekTopic: 'সপ্তাহ / বিষয়',
    weekTopicPlaceholder: "যেনে, সপ্তাহ ৫ বা 'ভগ্নাংশৰ পৰিচয়'",
    generatePlan: 'পৰিকল্পনা সৃষ্টি কৰক',
    textbookResources: 'পাঠ্যপুথিৰ সম্পদ',
    accessNCERT: 'সরাসৰি অফিচিয়েল NCERT পাঠ্যপুথি এক্সেছ কৰক।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject}ৰ বাবে সম্পদ বিচাৰক।`,
    searchNCERT: 'NCERT পৰ্টেল সন্ধান কৰক',
    goToNCERT: 'NCERT পৰ্টেললৈ যাওক',
    generatedLessonPlan: 'সৃষ্ট পাঠ পৰিকল্পনা',
    planWillBeStructured: 'আপোনাৰ সাপ্তাহিক পৰিকল্পনা ইয়াত গঠন কৰা হ’ব।',
    plannerComingSoon: 'পাঠ পৰিকল্পনাকাৰী সোনকালে আহি আছে',
    featureUnderDevelopment: 'এই বৈশিষ্ট্যটো বৰ্তমান વિકાસ હેઠળ আছে।',
    toastTitle: 'বৈশিষ্ট্য সোনকালে আহি আছে',
    toastDescription: 'এআই পাঠ পৰিকল্পনাকাৰী વિકાસ હેઠળ আছে। অনুগ্ৰহ কৰি পিছত পুনৰ পৰীক্ষা কৰক!',
    formErrors: {
      grade: 'অনুগ্ৰহ কৰি এটা শ্ৰেণী বাছনি কৰক।',
      subject: 'অনুগ্ৰহ কৰি এটা বিষয় বাছনি কৰক।',
      week: 'অনুগ্ৰহ কৰি এটা সপ্তাহৰ নম্বৰ বা বিষয় দিয়ক।',
    },
  },
  Kannada: {
    lessonPlanDetails: 'ಪಾಠ ಯೋಜನೆ ವಿವರಗಳು',
    specifyDetails: 'ನಿಮ್ಮ ಸಾಪ್ತಾಹಿಕ ಯೋಜನೆಗಾಗಿ ವಿವರಗಳನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಿ.',
    grade: 'ದರ್ಜೆ',
    selectGrade: 'ಒಂದು ದರ್ಜೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    subject: 'ವಿಷಯ',
    selectSubject: 'ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    weekTopic: 'ವಾರ / ವಿಷಯ',
    weekTopicPlaceholder: "ಉದಾ., ವಾರ 5 ಅಥವಾ 'ಭಿನ್ನರಾಶಿಗಳ ಪರಿಚಯ'",
    generatePlan: 'ಯೋಜನೆಯನ್ನು ರಚಿಸಿ',
    textbookResources: 'ಪಠ್ಯಪುಸ್ತಕ ಸಂಪನ್ಮೂಲಗಳು',
    accessNCERT: 'ಅಧಿಕೃತ NCERT ಪಠ್ಯಪುಸ್ತಕಗಳನ್ನು ನೇರವಾಗಿ ಪ್ರವೇಶಿಸಿ.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} ಗಾಗಿ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹುಡುಕಿ.`,
    searchNCERT: 'NCERT ಪೋರ್ಟಲ್ ಹುಡುಕಿ',
    goToNCERT: 'NCERT ಪೋರ್ಟಲ್‌ಗೆ ಹೋಗಿ',
    generatedLessonPlan: 'ರಚಿಸಲಾದ ಪಾಠ ಯೋಜನೆ',
    planWillBeStructured: 'ನಿಮ್ಮ ಸಾಪ್ತಾಹಿಕ ಯೋಜನೆಯನ್ನು ಇಲ್ಲಿ ರಚಿಸಲಾಗುತ್ತದೆ.',
    plannerComingSoon: 'ಪಾಠ ಯೋಜಕ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ',
    featureUnderDevelopment: 'ಈ ವೈಶಿಷ್ಟ್ಯವು ಪ್ರಸ್ತುತ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿದೆ.',
    toastTitle: 'ವೈಶಿಷ್ಟ್ಯ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ',
    toastDescription: 'ಎಐ ಪಾಠ ಯೋಜಕ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ!',
    formErrors: {
      grade: 'ದಯವಿಟ್ಟು ಒಂದು ದರ್ಜೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      subject: 'ದಯವಿಟ್ಟು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      week: 'ದಯವಿಟ್ಟು ವಾರದ ಸಂಖ್ಯೆ ಅಥವಾ ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.',
    },
  },
  Telugu: {
    lessonPlanDetails: 'పాఠ ప్రణాళిక వివరాలు',
    specifyDetails: 'మీ వారపు ప్రణాళిక కోసం వివరాలను పేర్కొనండి.',
    grade: 'గ్రేడ్',
    selectGrade: 'ఒక గ్రేడ్‌ను ఎంచుకోండి',
    subject: 'సబ్జెక్ట్',
    selectSubject: 'ఒక సబ్జెక్ట్‌ను ఎంచుకోండి',
    weekTopic: 'వారం / అంశం',
    weekTopicPlaceholder: "ఉదా., వారం 5 లేదా 'భిన్నాల పరిచయం'",
    generatePlan: 'ప్రణాళికను రూపొందించండి',
    textbookResources: 'పాఠ్యపుస్తక వనరులు',
    accessNCERT: 'అధికారిక NCERT పాఠ్యపుస్తకాలను నేరుగా యాక్సెస్ చేయండి.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} కోసం వనరులను కనుగొనండి.`,
    searchNCERT: 'NCERT పోర్టల్‌ను శోధించండి',
    goToNCERT: 'NCERT పోర్టల్‌కు వెళ్లండి',
    generatedLessonPlan: 'రూపొందించిన పాఠ ప్రణాళిక',
    planWillBeStructured: 'మీ వారపు ప్రణాళిక ఇక్కడ నిర్మాణాత్మకంగా ఉంటుంది.',
    plannerComingSoon: 'పాఠ ప్రణాళిక త్వరలో వస్తుంది',
    featureUnderDevelopment: 'ఈ ఫీచర్ ప్రస్తుతం అభివృద్ధిలో ఉంది.',
    toastTitle: 'ఫీచర్ త్వరలో వస్తుంది',
    toastDescription: 'ఏఐ పాఠ ప్రణాళిక అభివృద్ధిలో ఉంది. దయచేసి తర్వాత మళ్లీ తనిఖీ చేయండి!',
    formErrors: {
      grade: 'దయచేసి ఒక గ్రేడ్‌ను ఎంచుకోండి.',
      subject: 'దయచేసి ఒక సబ్జెక్ట్‌ను ఎంచుకోండి.',
      week: 'దయచేసి వారపు సంఖ్య లేదా అంశాన్ని నమోదు చేయండి.',
    },
  },
};

function TextbookLink({ grade, subject }: { grade: string, subject: string }) {
  const [ncertLink, setNcertLink] = useState('https://ncert.nic.in/textbook.php');
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  useEffect(() => {
    if (grade && subject) {
      // This is a simplified example. A full implementation would require a mapping
      // of grades and subjects to the specific NCERT book codes (e.g., 'aemr1').
      const baseUrl = 'https://ncert.nic.in/textbook.php';
      // A real implementation would need a more robust query builder.
      // For now, we link to the main textbook page as a fallback.
      setNcertLink(baseUrl);
    }
  }, [grade, subject]);

  if (!grade || !subject) {
    return (
       <Link href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            {t.goToNCERT}
          </Button>
        </Link>
    );
  }
  
  const gradeLabel = grades.find(g => g.value === grade)?.label;
  const subjectLabel = subjects.find(s => s.value === subject)?.label;

  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        {t.findResourcesFor(gradeLabel!, subjectLabel!)}
      </p>
      <Link href={ncertLink} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="w-full">
          <BookOpen className="mr-2 h-4 w-4" />
          {t.searchNCERT}
        </Button>
      </Link>
    </div>
  );
}


export function LessonPlannerClient() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const formSchema = z.object({
    grade: z.string().min(1, t.formErrors.grade),
    subject: z.string().min(1, t.formErrors.subject),
    week: z.string().min(1, t.formErrors.week),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: '',
      subject: '',
      week: '',
    },
  });

  const watchedGrade = useWatch({ control: form.control, name: 'grade' });
  const watchedSubject = useWatch({ control: form.control, name: 'subject' });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: t.toastTitle,
      description: t.toastDescription,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.lessonPlanDetails}</CardTitle>
            <CardDescription>{t.specifyDetails}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.grade}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectGrade} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.subject}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectSubject} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.weekTopic}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.weekTopicPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {t.generatePlan}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.textbookResources}</CardTitle>
            <CardDescription>{t.accessNCERT}</CardDescription>
          </CardHeader>
          <CardContent>
            <TextbookLink grade={watchedGrade} subject={watchedSubject} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>{t.generatedLessonPlan}</CardTitle>
            <CardDescription>{t.planWillBeStructured}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
              <CalendarCheck className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold">{t.plannerComingSoon}</h3>
              <p>{t.featureUnderDevelopment}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
