
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { grades, subjects } from '@/lib/data';
import { CalendarCheck, BookOpen, UploadCloud, Layers, ShieldAlert, XCircle, FileDown } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateLessonPlan, GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan';


const translations = {
  English: {
    lessonPlanDetails: 'Lesson Plan Details',
    specifyDetails: 'Specify the details for your weekly plan.',
    grade: 'Grade',
    selectGrade: 'Select a grade',
    subject: 'Subject',
    selectSubject: 'Select a subject',
    lessonName: 'Lesson Topic',
    lessonNamePlaceholder: "e.g., 'Introduction to Fractions'",
    generatePlan: 'Generate Plan',
    generatingPlan: 'Generating Plan...',
    textbookResources: 'Textbook Resources',
    accessNCERT: 'Access official NCERT textbooks directly.',
    findResourcesFor: (grade: string, subject: string) => `Find resources for ${grade}, ${subject}.`,
    searchNCERT: 'Search NCERT Portal',
    goToNCERT: 'Go to NCERT Portal',
    generatedLessonPlan: 'Generated Lesson Plan',
    planWillBeStructured: 'Your weekly plan will be structured here.',
    emptyState: 'Provide details to generate your lesson plan.',
    clearButton: 'Clear',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The generated lesson plan was blocked for safety reasons. Please try a different topic.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate the lesson plan. Please try again.',
    formErrors: {
      grade: 'Please select a grade.',
      subject: 'Please select a subject.',
      lessonName: 'Please enter a lesson topic.',
    },
    downloadPdf: 'Download PDF',
    downloading: 'Downloading...',
    pdfError: 'Could not generate PDF.'
  },
  Hindi: {
    lessonPlanDetails: 'पाठ योजना विवरण',
    specifyDetails: 'अपनी साप्ताहिक योजना के लिए विवरण निर्दिष्ट करें।',
    grade: 'ग्रेड',
    selectGrade: 'एक ग्रेड चुनें',
    subject: 'विषय',
    selectSubject: 'एक विषय चुनें',
    lessonName: 'पाठ का विषय',
    lessonNamePlaceholder: "जैसे, 'भिन्न का परिचय'",
    generatePlan: 'योजना बनाएं',
    generatingPlan: 'योजना बन रही है...',
    textbookResources: 'पाठ्यपुस्तक संसाधन',
    accessNCERT: 'आधिकारिक एनसीईआरटी पाठ्यपुस्तकें सीधे एक्सेस करें।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} के लिए संसाधन खोजें।`,
    searchNCERT: 'एनसीईआरटी पोर्टल खोजें',
    goToNCERT: 'एनसीईआरटी पोर्टल पर जाएं',
    generatedLessonPlan: 'उत्पन्न पाठ योजना',
    planWillBeStructured: 'आपकी साप्ताहिक योजना यहाँ संरचित की जाएगी।',
    emptyState: 'अपनी पाठ योजना बनाने के लिए विवरण प्रदान करें।',
    clearButton: 'साफ़ करें',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'सुरक्षा कारणों से उत्पन्न पाठ योजना को अवरुद्ध कर दिया गया था। कृपया एक अलग विषय का प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'पाठ योजना बनाने में विफल। कृपया पुनः प्रयास करें।',
    formErrors: {
      grade: 'कृपया एक ग्रेड चुनें।',
      subject: 'कृपया एक विषय चुनें।',
      lessonName: 'कृपया पाठ का विषय दर्ज करें।',
    },
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    downloading: 'डाउनलोड हो रहा है...',
    pdfError: 'पीडीएफ उत्पन्न नहीं हो सका।'
  },
  Marathi: {
    lessonPlanDetails: 'पाठ योजना तपशील',
    specifyDetails: 'तुमच्या साप्ताहिक योजनेसाठी तपशील निर्दिष्ट करा.',
    grade: 'श्रेणी',
    selectGrade: 'एक श्रेणी निवडा',
    subject: 'विषय',
    selectSubject: 'एक विषय निवडा',
    lessonName: 'पाठाचा विषय',
    lessonNamePlaceholder: "उदा., 'अपूर्णांकांची ओळख'",
    generatePlan: 'योजना तयार करा',
    generatingPlan: 'योजना तयार होत आहे...',
    textbookResources: 'पाठ्यपुस्तक संसाधने',
    accessNCERT: 'अधिकृत एनसीईआरटी पाठ्यपुस्तके थेट मिळवा.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} साठी संसाधনে शोधा.`,
    searchNCERT: 'एनसीईआरटी पोर्टल शोधा',
    goToNCERT: 'एनसीईआरटी पोर्टलवर जा',
    generatedLessonPlan: 'तयार केलेली पाठ योजना',
    planWillBeStructured: 'तुमची साप्ताहिक योजना येथे संरचित केली जाईल.',
    emptyState: 'तुमची पाठ योजना तयार करण्यासाठी तपशील द्या.',
    clearButton: 'साफ करा',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव तयार केलेली पाठ योजना अवरोधित केली गेली. कृपया वेगळा विषय वापरून पहा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'पाठ योजना तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    formErrors: {
      grade: 'कृपया एक श्रेणी निवडा.',
      subject: 'कृपया एक विषय निवडा.',
      lessonName: 'कृपया पाठाचा विषय प्रविष्ट करा.',
    },
    downloadPdf: 'पीडीएफ डाउनलोड करा',
    downloading: 'डाउनलोड करत आहे...',
    pdfError: 'पीडीएफ तयार करता आला नाही.'
  },
   Kashmiri: {
    lessonPlanDetails: 'سبق منصوبہٕ تفصیل',
    specifyDetails: 'پننہٕ ہفتہ وار منصوبہٕ خٲطرٕ تفصیل دِیُت۔',
    grade: 'گریڈ',
    selectGrade: 'اکھ گریڈ ژارٕو',
    subject: 'مضمون',
    selectSubject: 'اکھ مضمون ژارٕو',
    lessonName: 'سبقُک موضوع',
    lessonNamePlaceholder: "مثلن، 'فریکشنُک تعارُف'",
    generatePlan: 'منصوبہٕ تیار کریو',
    generatingPlan: 'منصوبہٕ تیار کران...',
    textbookResources: 'درسی کتاب وسیلہٕ',
    accessNCERT: 'سرکٲرِ NCERT درسی کتابہٕ براہ راست حٲصِل کریو۔',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} خٲطرٕ وسیلہٕ ژھانڈیو۔`,
    searchNCERT: 'NCERT پورٹل ژھانڈیو',
    goToNCERT: 'NCERT پورٹلس پؠٹھ گژھیو',
    generatedLessonPlan: 'تیار کرنہٕ آمت سبق منصوبہٕ',
    planWillBeStructured: 'توٚہنٛد ہفتہ وار منصوبہٕ ییٚتہِ ترتیٖب دِنہٕ یِیہِ۔',
    emptyState: 'پنُن سبق منصوبہٕ تیار کرنہٕ خٲطرٕ تفصیل دِیُت۔',
    clearButton: 'صاف کریو',
    contentBlockedTitle: 'مواد بلاک کرنہٕ آمت',
    safetyError: 'تیار کرنہٕ آمت سبق منصوبہٕ آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ اَکھ بیٛاکھ موضوع آزماو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescription: 'سبق منصوبہٕ تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    formErrors: {
      grade: 'مہربانی کرِتھ اکھ گریڈ ژارٕو۔',
      subject: 'مہربانی کرِتھ اکھ مضمون ژارٕو۔',
      lessonName: 'مہربانی کرِتھ سبقُک موضوع دِیو۔',
    },
    downloadPdf: 'پی ڈی ایف ڈاؤنلوڈ کریو',
    downloading: 'ڈاؤنلوڈ کران...',
    pdfError: 'پی ڈی ایف تیار کٔرِتھ نہٕ ہیوٚک۔'
  },
  Bengali: {
    lessonPlanDetails: 'পাঠ পরিকল্পনার বিবরণ',
    specifyDetails: 'আপনার সাপ্তাহিক পরিকল্পনার জন্য বিবরণ নির্দিষ্ট করুন।',
    grade: 'শ্রেণী',
    selectGrade: 'একটি শ্রেণী নির্বাচন করুন',
    subject: 'বিষয়',
    selectSubject: 'একটি বিষয় নির্বাচন করুন',
    lessonName: 'পাঠের বিষয়',
    lessonNamePlaceholder: "যেমন, 'ভগ্নাংশের ভূমিকা'",
    generatePlan: 'পরিকল্পনা তৈরি করুন',
    generatingPlan: 'পরিকল্পনা তৈরি হচ্ছে...',
    textbookResources: 'পাঠ্যপুস্তক সম্পদ',
    accessNCERT: 'সরাসরি एनसीईआरटी পাঠ্যপুস্তক অ্যাক্সেস করুন।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} এর জন্য সম্পদ খুঁজুন।`,
    searchNCERT: 'এনসিইআরটি পোর্টাল অনুসন্ধান করুন',
    goToNCERT: 'এনসিইআরটি পোর্টালে যান',
    generatedLessonPlan: 'উত্পন্ন পাঠ পরিকল্পনা',
    planWillBeStructured: 'আপনার সাপ্তাহিক পরিকল্পনা এখানে ರಚনা করা হবে।',
    emptyState: 'আপনার পাঠ পরিকল্পনা তৈরি করতে বিবরণ প্রদান করুন।',
    clearButton: 'পরিষ্কার করুন',
    contentBlockedTitle: 'বিষয়বস্তু অবরুদ্ধ',
    safetyError: 'নিরাপত্তার কারণে উত্পন্ন পাঠ পরিকল্পনাটি অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে একটি ভিন্ন বিষয় চেষ্টা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescription: 'পাঠ পরিকল্পনা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    formErrors: {
      grade: 'অনুগ্রহ করে একটি শ্রেণী নির্বাচন করুন।',
      subject: 'অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।',
      lessonName: 'অনুগ্রহ করে পাঠের বিষয় লিখুন।',
    },
    downloadPdf: 'পিডিএফ ডাউনলোড করুন',
    downloading: 'ডাউনলোড হচ্ছে...',
    pdfError: 'পিডিএফ তৈরি করা যায়নি।'
  },
  Tamil: {
    lessonPlanDetails: 'பாடத் திட்ட விவரங்கள்',
    specifyDetails: 'உங்கள் வாராந்திர திட்டத்திற்கான விவரங்களைக் குறிப்பிடவும்।',
    grade: 'தரம்',
    selectGrade: 'ஒரு தரத்தைத் தேர்ந்தெடுக்கவும்',
    subject: 'பாடம்',
    selectSubject: 'ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்',
    lessonName: 'பாடத்தின் தலைப்பு',
    lessonNamePlaceholder: "எ.கா., 'பின்னங்களின் அறிமுகம்'",
    generatePlan: 'திட்டத்தை உருவாக்கு',
    generatingPlan: 'திட்டத்தை உருவாக்குகிறது...',
    textbookResources: 'பாடநூல் வளங்கள்',
    accessNCERT: 'அதிகாரப்பூர்வ NCERT பாடநூல்களை நேரடியாக அணுகவும்।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} க்கான வளங்களைக் கண்டறியவும்।`,
    searchNCERT: 'NCERT போர்ட்டலைத் தேடு',
    goToNCERT: 'NCERT போர்ட்டலுக்குச் செல்',
    generatedLessonPlan: 'உருவாக்கப்பட்ட பாடத் திட்டம்',
    planWillBeStructured: 'உங்கள் வாராந்திர திட்டம் இங்கே கட்டமைக்கப்படும்।',
    emptyState: 'உங்கள் பாடத் திட்டத்தை உருவாக்க விவரங்களை வழங்கவும்।',
    clearButton: 'அழி',
    contentBlockedTitle: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyError: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட பாடத்திட்டம் தடுக்கப்பட்டது। தயவுசெய்து வேறு தலைப்பை முயற்சிக்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescription: 'பாடத் திட்டத்தை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    formErrors: {
      grade: 'தயவுசெய்து ஒரு தரத்தைத் தேர்ந்தெடுக்கவும்।',
      subject: 'தயவுசெய்து ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்।',
      lessonName: 'தயவுசெய்து பாடத்தின் தலைப்பை உள்ளிடவும்।',
    },
    downloadPdf: 'PDF பதிவிறக்கவும்',
    downloading: 'பதிவிறக்குகிறது...',
    pdfError: 'PDF ஐ உருவாக்க முடியவில்லை.'
  },
  Gujarati: {
    lessonPlanDetails: 'પાઠ યોજના વિગતો',
    specifyDetails: 'તમારી સાપ્તાહિક યોજના માટે વિગતો સ્પષ્ટ કરો।',
    grade: 'ધોરણ',
    selectGrade: 'એક ધોરણ પસંદ કરો',
    subject: 'વિષય',
    selectSubject: 'એક વિષય પસંદ કરો',
    lessonName: 'પાઠનો વિષય',
    lessonNamePlaceholder: "દા.ત., 'અપૂર્ણાંકોનો પરિચય'",
    generatePlan: 'યોજના બનાવો',
    generatingPlan: 'યોજના બની રહી છે...',
    textbookResources: 'પાઠ્યપુસ્તક સંસાધનો',
    accessNCERT: 'અધિકૃત NCERT પાઠ્યપુસ્તકો સીધા એક્સેસ કરો।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} માટે સંસાધનો શોધો।`,
    searchNCERT: 'NCERT પોર્ટલ શોધો',
    goToNCERT: 'NCERT પોર્ટલ પર જાઓ',
    generatedLessonPlan: 'ઉત્પન્ન પાઠ યોજના',
    planWillBeStructured: 'તમારી સાપ્તાહિક યોજના અહીં ગોઠવવામાં આવશે।',
    emptyState: 'તમારી પાઠ યોજના બનાવવા માટે વિગતો પ્રદાન કરો।',
    clearButton: 'સાફ કરો',
    contentBlockedTitle: 'સામગ્રી અવરોધિત',
    safetyError: 'બનાવેલી પાઠ યોજના સુરક્ષા કારણોસર અવરોધિત કરવામાં આવી હતી. કૃપા કરીને અલગ વિષયનો પ્રયાસ કરો।',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescription: 'પાઠ યોજના બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો।',
    formErrors: {
      grade: 'કૃપા કરીને એક ધોરણ પસંદ કરો।',
      subject: 'કૃપા કરીને એક વિષય પસંદ કરો।',
      lessonName: 'કૃપા કરીને પાઠનો વિષય દાખલ કરો।',
    },
    downloadPdf: 'પીડીએફ ડાઉનલોડ કરો',
    downloading: 'ડાઉનલોડ થઈ રહ્યું છે...',
    pdfError: 'પીડીએફ બનાવી શકાયું નથી.'
  },
  Malayalam: {
    lessonPlanDetails: 'പാഠ പദ്ധതി വിശദാംശങ്ങൾ',
    specifyDetails: 'നിങ്ങളുടെ പ്രതിവാര പ്ലാനിന്റെ വിശദാംശങ്ങൾ വ്യക്തമാക്കുക।',
    grade: 'ഗ്രേഡ്',
    selectGrade: 'ഒരു ഗ്രേഡ് തിരഞ്ഞെടുക്കുക',
    subject: 'വിഷയം',
    selectSubject: 'ഒരു വിഷയം തിരഞ്ഞെടുക്കുക',
    lessonName: 'പാഠത്തിന്റെ വിഷയം',
    lessonNamePlaceholder: "ഉദാഹരണത്തിന്, 'ഭിന്നസംഖ്യകളുടെ ആമുഖം'",
    generatePlan: 'പ്ലാൻ ഉണ്ടാക്കുക',
    generatingPlan: 'പ്ലാൻ ഉണ്ടാക്കുന്നു...',
    textbookResources: 'പാഠപുസ്തക വിഭവങ്ങൾ',
    accessNCERT: 'ഔദ്യോഗിക NCERT പാഠപുസ്തകങ്ങൾ നേരിട്ട് ആക്സസ് ചെയ്യുക।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} നുള്ള വിഭവങ്ങൾ കണ്ടെത്തുക।`,
    searchNCERT: 'NCERT പോർട്ടൽ തിരയുക',
    goToNCERT: 'NCERT പോർട്ടലിലേക്ക് പോകുക',
    generatedLessonPlan: 'ഉണ്ടാക്കിയ പാഠ പദ്ധതി',
    planWillBeStructured: 'നിങ്ങളുടെ പ്രതിവാര പ്ലാൻ ഇവിടെ ഘടനാപരമായിരിക്കും।',
    emptyState: 'നിങ്ങളുടെ പാഠ പദ്ധതി ഉണ്ടാക്കാൻ വിശദാംശങ്ങൾ നൽകുക।',
    clearButton: 'മായ്ക്കുക',
    contentBlockedTitle: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyError: 'ഉണ്ടാക്കിയ പാഠ പദ്ധതി സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. ദയവായി മറ്റൊരു വിഷയം ശ്രമിക്കുക।',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescription: 'പാഠ പദ്ധതി ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക।',
    formErrors: {
      grade: 'ദയവായി ഒരു ഗ്രേഡ് തിരഞ്ഞെടുക്കുക।',
      subject: 'ദയവായി ഒരു വിഷയം തിരഞ്ഞെടുക്കുക।',
      lessonName: 'ദയവായി പാഠത്തിന്റെ വിഷയം നൽകുക।',
    },
    downloadPdf: 'PDF ഡൗൺലോഡ് ചെയ്യുക',
    downloading: 'ഡൗൺലോഡ് ചെയ്യുന്നു...',
    pdfError: 'PDF ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല.'
  },
  Punjabi: {
    lessonPlanDetails: 'ਪਾਠ ਯੋਜਨਾ ਵੇਰਵੇ',
    specifyDetails: 'ਆਪਣੀ ਹਫਤਾਵਾਰੀ ਯੋਜਨਾ ਲਈ ਵੇਰਵੇ ਦੱਸੋ।',
    grade: 'ਗ੍ਰੇਡ',
    selectGrade: 'ਇੱਕ ਗ੍ਰੇਡ ਚੁਣੋ',
    subject: 'ਵਿਸ਼ਾ',
    selectSubject: 'ਇੱਕ ਵਿਸ਼ਾ ਚੁਣੋ',
    lessonName: 'ਪਾਠ ਦਾ ਵਿਸ਼ਾ',
    lessonNamePlaceholder: "ਜਿਵੇਂ, 'ਅੰਸ਼ਾਂ ਦੀ ਜਾਣ-ਪਛਾਣ'",
    generatePlan: 'ਯੋਜਨਾ ਬਣਾਓ',
    generatingPlan: 'ਯੋਜਨਾ ਬਣ ਰਹੀ ਹੈ...',
    textbookResources: 'ਪਾਠ ਪੁਸਤਕ ਸਰੋਤ',
    accessNCERT: 'ਅਧਿਕਾਰਤ NCERT ਪਾਠ ਪੁਸਤਕਾਂ ਸਿੱਧੇ ਐਕਸੈਸ ਕਰੋ।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} ਲਈ ਸਰੋਤ ਲੱਭੋ।`,
    searchNCERT: 'NCERT ਪੋਰਟਲ ਖੋਜੋ',
    goToNCERT: 'NCERT ਪੋਰਟਲ ਤੇ ਜਾਓ',
    generatedLessonPlan: 'ਤਿਆਰ ਕੀਤੀ ਪਾਠ ਯੋਜਨਾ',
    planWillBeStructured: 'ਤੁਹਾਡੀ ਹਫਤਾਵਾਰੀ ਯੋਜਨਾ ਇੱਥੇ ਬਣਾਈ ਜਾਵੇਗੀ।',
    emptyState: 'ਆਪਣੀ ਪਾਠ ਯੋਜਨਾ ਬਣਾਉਣ ਲਈ ਵੇਰਵੇ ਦਿਓ।',
    clearButton: 'ਸਾਫ਼ ਕਰੋ',
    contentBlockedTitle: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyError: 'ਤਿਆਰ ਕੀਤੀ ਪਾਠ ਯੋਜਨਾ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰਾ ਵਿਸ਼ਾ ਅਜ਼ਮਾਓ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescription: 'ਪਾਠ ਯੋਜਨਾ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    formErrors: {
      grade: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਗ੍ਰੇਡ ਚੁਣੋ।',
      subject: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵਿਸ਼ਾ ਚੁਣੋ।',
      lessonName: 'ਕਿਰਪਾ ਕਰਕੇ ਪਾਠ ਦਾ ਵਿਸ਼ਾ ਦਾਖਲ ਕਰੋ।',
    },
    downloadPdf: 'ਪੀਡੀਐਫ ਡਾਊਨਲੋਡ ਕਰੋ',
    downloading: 'ਡਾਊਨਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    pdfError: 'ਪੀਡੀਐਫ ਤਿਆਰ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ।'
  },
  Odia: {
    lessonPlanDetails: 'ପାଠ ଯୋଜନା ବିବରଣୀ',
    specifyDetails: 'ଆପଣଙ୍କ ସାପ୍ତାହିକ ଯୋଜନା ପାଇଁ ବିବରଣୀ ନିର୍ଦ୍ଦିଷ୍ଟ କରନ୍ତୁ।',
    grade: 'ଶ୍ରେଣୀ',
    selectGrade: 'ଏକ ଶ୍ରେଣୀ ବାଛନ୍ତୁ',
    subject: 'ବିଷୟ',
    selectSubject: 'ଏକ ବିଷୟ ବାଛନ୍ତୁ',
    lessonName: 'ପାଠର ବିଷୟ',
    lessonNamePlaceholder: "ଯେପରି, 'ଭଗ୍ନାଂଶର ପରିଚୟ'",
    generatePlan: 'ଯୋଜନା ସୃଷ୍ଟି କରନ୍ତୁ',
    generatingPlan: 'ଯୋଜନା ସୃଷ୍ଟି ହେଉଛି...',
    textbookResources: 'ପାଠ୍ୟପୁସ୍ତକ ସମ୍ବଳ',
    accessNCERT: 'ଅଧିକାରିକ NCERT ପାଠ୍ୟପୁସ୍ତକ ସିଧାସଳଖ ଆକସେସ୍ କରନ୍ତୁ।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} ପାଇଁ ସମ୍ବଳ ଖୋଜନ୍ତୁ।`,
    searchNCERT: 'NCERT ପୋର୍ଟାଲ୍ ଖୋଜନ୍ତୁ',
    goToNCERT: 'NCERT ପୋର୍ଟାଲକୁ ଯାଆନ୍ତୁ',
    generatedLessonPlan: 'ସୃଷ୍ଟି ହୋଇଥିବା ପାଠ ଯୋଜନା',
    planWillBeStructured: 'ଆପଣଙ୍କ ସାପ୍ତାହିକ ଯୋଜନା ଏଠାରେ ଗଠନ କରାଯିବ।',
    emptyState: 'ଆପଣଙ୍କ ପାଠ ଯୋଜନା ସୃଷ୍ଟି କରିବାକୁ ବିବରଣୀ ପ୍ରଦାନ କରନ୍ତୁ।',
    clearButton: 'ସଫା କରନ୍ତୁ',
    contentBlockedTitle: 'ବିଷୟବସ୍ତୁ ଅବରୋଧିତ',
    safetyError: 'ସୁରକ୍ଷା କାରଣରୁ ସୃଷ୍ଟି ହୋଇଥିବା ପାଠ ଯୋଜନାକୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଏକ ଭିନ୍ନ ବିଷୟ ଚେଷ୍ଟା କରନ୍ତୁ।',
    errorTitle: 'ଏକ ତ୍ରୁଟି ଘଟିଛି।',
    errorDescription: 'ପାଠ ଯୋଜନା ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    formErrors: {
      grade: 'ଦୟାକରି ଏକ ଶ୍ରେଣୀ ବାଛନ୍ତୁ।',
      subject: 'ଦୟାକରି ଏକ ବିଷୟ ବାଛନ୍ତୁ।',
      lessonName: 'ଦୟାକରି ପାଠର ବିଷୟ ପ୍ରବେଶ କରନ୍ତୁ।',
    },
    downloadPdf: 'ପିଡିଏଫ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    downloading: 'ଡାଉନଲୋଡ୍ କରୁଛି...',
    pdfError: 'ପିଡିଏଫ୍ ସୃଷ୍ଟି ହୋଇପାରିଲା ନାହିଁ।'
  },
  Assamese: {
    lessonPlanDetails: 'পাঠ পৰিকল্পনাৰ বিৱৰণ',
    specifyDetails: 'আপোনাৰ সাপ্তাহিক পৰিকল্পনাৰ বাবে বিৱৰণ নির্দিষ্ট কৰক।',
    grade: 'শ্রেণী',
    selectGrade: 'এটা শ্রেণী বাছনি কৰক',
    subject: 'বিষয়',
    selectSubject: 'এটা বিষয় বাছনি কৰক',
    lessonName: 'পাঠৰ বিষয়',
    lessonNamePlaceholder: "যেনে, 'ভগ্নാംগৰ পৰিচয়'",
    generatePlan: 'পৰিকল্পনা সৃষ্টি কৰক',
    generatingPlan: 'পৰিকল্পনা সৃষ্টি হৈ আছে...',
    textbookResources: 'পাঠ্যপুথিৰ সম্পদ',
    accessNCERT: 'চিধাচিধি NCERT পাঠ্যপুথি ব্যৱহাৰ কৰক।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject}ৰ বাবে সম্পদ বিচাৰক।`,
    searchNCERT: 'NCERT প’ৰ্টেল সন্ধান কৰক',
    goToNCERT: 'NCERT প’ৰ্টেললৈ যাওক',
    generatedLessonPlan: 'সৃষ্ট পাঠ পৰিকল্পনা',
    planWillBeStructured: 'আপোনাৰ সাপ্তাহিক পৰিকল্পনা ইয়াত গঠন কৰা হ’ব।',
    emptyState: 'আপোনাৰ পাঠ পৰিকল্পনা সৃষ্টি কৰিবলৈ বিৱৰণ দিয়ক।',
    clearButton: 'পৰিষ্কাৰ কৰক',
    contentBlockedTitle: 'বিষয়বস্তু অৱৰোধিত',
    safetyError: 'সৃষ্ট পাঠ পৰিকল্পনাটো সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি এটা বেলেগ বিষয় চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescription: 'পাঠ পৰিকল্পনা সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    formErrors: {
      grade: 'অনুগ্ৰহ কৰি এটা শ্রেণী বাছনি কৰক।',
      subject: 'অনুগ্ৰহ কৰি এটা বিষয় বাছনি কৰক।',
      lessonName: 'অনুগ্ৰহ কৰি পাঠৰ বিষয়টো দিয়ক।',
    },
    downloadPdf: 'পিডিএফ ডাউনল’ড কৰক',
    downloading: 'ডাউনল’ড কৰি আছে...',
    pdfError: 'পিডিএফ সৃষ্টি কৰিব পৰা নগ\'ল।'
  },
  Kannada: {
    lessonPlanDetails: 'ಪಾಠ ಯೋಜನೆ ವಿವರಗಳು',
    specifyDetails: 'ನಿಮ್ಮ ಸಾಪ್ತಾಹಿಕ ಯೋಜನೆಗಾಗಿ ವಿವರಗಳನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಿ.',
    grade: 'ದರ್ಜೆ',
    selectGrade: 'ಒಂದು ದರ್ಜೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    subject: 'ವಿಷಯ',
    selectSubject: 'ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    lessonName: 'ಪಾಠದ ವಿಷಯ',
    lessonNamePlaceholder: "ಉದಾ., 'ಭಿನ್ನರಾಶಿಗಳ ಪರಿಚಯ'",
    generatePlan: 'ಯೋಜನೆಯನ್ನು ರಚಿಸಿ',
    generatingPlan: 'ಯೋಜನೆಯನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    textbookResources: 'ಪಠ್ಯಪುಸ್ತಕ ಸಂಪನ್ಮೂಲಗಳು',
    accessNCERT: 'ಅಧಿಕೃತ NCERT ಪಠ್ಯಪುಸ್ತಕಗಳನ್ನು ನೇರವಾಗಿ ಪ್ರವೇಶಿಸಿ.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject}ಗಾಗಿ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹುಡುಕಿ.`,
    searchNCERT: 'NCERT ಪೋರ್ಟಲ್ ಹುಡುಕಿ',
    goToNCERT: 'NCERT ಪೋರ್ಟಲ್‌ಗೆ ಹೋಗಿ',
    generatedLessonPlan: 'ರಚಿಸಲಾದ ಪಾಠ ಯೋಜನೆ',
    planWillBeStructured: 'ನಿಮ್ಮ ಸಾಪ್ತಾಹಿಕ ಯೋಜನೆಯನ್ನು ಇಲ್ಲಿ ರಚಿಸಲಾಗುತ್ತದೆ.',
    emptyState: 'ನಿಮ್ಮ ಪಾಠ ಯೋಜನೆಯನ್ನು ರಚಿಸಲು ವಿವರಗಳನ್ನು ಒದಗಿಸಿ.',
    clearButton: 'ಅಳಿಸಿ',
    contentBlockedTitle: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyError: 'ರಚಿಸಲಾದ ಪಾಠ ಯೋಜನೆಯನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇರೆ ವಿಷಯವನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescription: 'ಪಾಠ ಯೋಜನೆಯನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    formErrors: {
      grade: 'ದಯವಿಟ್ಟು ಒಂದು ದರ್ಜೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      subject: 'ದಯವಿಟ್ಟು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      lessonName: 'ದಯವಿಟ್ಟು ಪಾಠದ ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.',
    },
    downloadPdf: 'PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    downloading: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    pdfError: 'PDF ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.'
  },
  Telugu: {
    lessonPlanDetails: 'పాఠ ప్రణాళిక వివరాలు',
    specifyDetails: 'మీ వారపు ప్రణాళిక కోసం వివరాలను పేర్కొనండి.',
    grade: 'గ్రేడ్',
    selectGrade: 'ఒక గ్రేడ్‌ను ఎంచుకోండి',
    subject: 'విషయం',
    selectSubject: 'ఒక విషయాన్ని ఎంచుకోండి',
    lessonName: 'పాఠం అంశం',
    lessonNamePlaceholder: "ఉదా., 'భిన్నాల పరిచయం'",
    generatePlan: 'ప్రణాళికను రూపొందించండి',
    generatingPlan: 'ప్రణాళికను రూపొందిస్తోంది...',
    textbookResources: 'పాఠ్యపుస్తక వనరులు',
    accessNCERT: 'అధికారిక NCERT పాఠ్యపుస్తకాలను నేరుగా యాక్సెస్ చేయండి.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} కోసం వనరులను కనుగొనండి.`,
    searchNCERT: 'NCERT పోర్టల్‌ను శోధించండి',
    goToNCERT: 'NCERT పోర్టల్‌కు వెళ్లండి',
    generatedLessonPlan: 'సృష్టించబడిన పాఠ ప్రణాళిక',
    planWillBeStructured: 'మీ వారపు ప్రణాళిక ఇక్కడ నిర్మాణాత్మకంగా ఉంటుంది.',
    emptyState: 'మీ పాఠ ప్రణాళికను రూపొందించడానికి వివరాలను అందించండి.',
    clearButton: 'తొలగించు',
    contentBlockedTitle: 'కంటెంట్ బ్లాక్ చేయబడింది',
    safetyError: 'భద్రతా కారణాల వల్ల సృష్టించబడిన పాఠ ప్రణాళిక బ్లాక్ చేయబడింది. దయచేసి వేరే అంశాన్ని ప్రయత్నించండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescription: 'పాఠ ప్రణాళికను రూపొందించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    formErrors: {
      grade: 'దయచేసి ఒక గ్రేడ్‌ను ఎంచుకోండి.',
      subject: 'దయచేసి ఒక విషయాన్ని ఎంచుకోండి.',
      lessonName: 'దయచేసి పాఠం అంశాన్ని నమోదు చేయండి.',
    },
    downloadPdf: 'PDFని డౌన్‌లోడ్ చేయండి',
    downloading: 'డౌన్‌లోడ్ చేస్తోంది...',
    pdfError: 'PDFని సృష్టించడం సాధ్యం కాలేదు.'
  },
};

function TextbookLink({ grade, subject }: { grade: string, subject: string }) {
  const [ncertLink, setNcertLink] = useState('https://ncert.nic.in/textbook.php');
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  useEffect(() => {
    if (grade && subject) {
      const baseUrl = 'https://ncert.nic.in/textbook.php';
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

  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<GenerateLessonPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lessonPlanRef = useRef<HTMLDivElement>(null);

  const formSchema = z.object({
    grade: z.string().min(1, t.formErrors.grade),
    subject: z.string().min(1, t.formErrors.subject),
    lessonName: z.string().min(3, t.formErrors.lessonName),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: '',
      subject: '',
      lessonName: '',
    },
  });

  const watchedGrade = useWatch({ control: form.control, name: 'grade' });
  const watchedSubject = useWatch({ control: form.control, name: 'subject' });
  const watchedLessonName = useWatch({ control: form.control, name: 'lessonName' });


  const handleClear = () => {
    form.reset();
    setResult(null);
    setError(null);
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const lessonPlanResult = await generateLessonPlan(values);
      setResult(lessonPlanResult);
    } catch (e: any) {
      console.error(e);
       if (e.message.includes('SAFETY')) {
        setError(t.safetyError);
      } else {
        toast({
          variant: 'destructive',
          title: t.errorTitle,
          description: t.errorDescription,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPDF = async () => {
    if (!result || !lessonPlanRef.current) return;
    setIsDownloading(true);

    try {
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 40;
        let y = 40;

        // Header
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(watchedLessonName, pdfWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Grade
        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        const gradeLabel = grades.find(g => g.value === watchedGrade)?.label || `${t.grade} ${watchedGrade}`;
        pdf.text(gradeLabel, pdfWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Horizontal Line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pdfWidth - margin, y);
        y += 20;

        // Content
        const lines = result.lessonPlanContent.split('\n');

        lines.forEach(line => {
            const trimmedLine = line.trim();
            const isDayHeading = /^Day \d/.test(trimmedLine);
            const isOtherHeading = /^\d+\./.test(trimmedLine) || /^\*{1,2}/.test(trimmedLine) || /learning objectives/i.test(trimmedLine) || /materials required/i.test(trimmedLine) || /assessment/i.test(trimmedLine);
            
            if (isDayHeading) {
                pdf.setFont('Helvetica', 'bold');
                pdf.setFontSize(8);
            } else if (isOtherHeading) {
                pdf.setFont('Helvetica', 'bold');
                pdf.setFontSize(10);
            } else {
                pdf.setFont('Helvetica', 'normal');
                pdf.setFontSize(10);
            }
            
            const splitText = pdf.splitTextToSize(trimmedLine, pdfWidth - margin * 2);

            splitText.forEach((textLine: string) => {
                 if (y > pdf.internal.pageSize.getHeight() - margin) {
                    pdf.addPage();
                    y = margin;
                }
                pdf.text(textLine, margin, y);
                y += 12; // line height
            });
             if (trimmedLine === '') { // Add extra space for empty lines
                y += 6;
            }
        });

        pdf.save(`${watchedLessonName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast({ variant: 'destructive', title: t.errorTitle, description: t.pdfError });
    } finally {
        setIsDownloading(false);
    }
  };


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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="lessonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lessonName}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.lessonNamePlaceholder} {...field} />
                      </FormControl>
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
                <Button type="submit" className="w-full" disabled={isLoading || isDownloading}>
                  {isLoading ? t.generatingPlan : t.generatePlan}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{t.generatedLessonPlan}</CardTitle>
                <CardDescription>{t.planWillBeStructured}</CardDescription>
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} variant="outline" size="sm" disabled={isDownloading}>
                    <FileDown className="mr-2 h-4 w-4" />
                    {isDownloading ? t.downloading : t.downloadPdf}
                </Button>
                <Button onClick={handleClear} variant="ghost" size="icon">
                  <XCircle className="h-5 w-5" />
                  <span className="sr-only">{t.clearButton}</span>
                </Button>
              </div>
            )}
          </CardHeader>
           <CardContent>
             {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.contentBlockedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <div ref={lessonPlanRef} className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
                {result.lessonPlanContent}
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <CalendarCheck className="h-16 w-16 mb-4" />
                <p>{t.emptyState}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
