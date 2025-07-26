'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  generateReadingAssessment,
  GenerateReadingAssessmentOutput,
} from '@/ai/flows/generate-reading-assessment';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { generateReadingFeedback, GenerateReadingFeedbackOutput } from '@/ai/flows/generate-reading-feedback';
import { grades } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Sparkles, Volume2, ShieldAlert, FileText, Languages, XCircle, Mic, StopCircle, RefreshCw, MessageSquareQuote } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    formCardTitle: 'Assessment Details',
    formCardDescription: 'Provide a topic and grade level.',
    topicLabel: 'Topic',
    topicPlaceholder: 'e.g., The Solar System, Famous Inventors',
    gradeLabel: 'Grade Level',
    gradePlaceholder: 'Select a grade',
    generateButton: 'Generate Passage',
    generatingButton: 'Generating...',
    resultsCardTitle: 'Reading Passage',
    resultsCardDescription: 'A reading passage to improve comprehension.',
    vocabCardTitle: 'Vocabulary Words',
    vocabCardDescription: 'Key words from the passage.',
    emptyState: 'Your generated passage and vocabulary will appear here.',
    listenButton: 'Listen to Passage',
    generatingAudioButton: 'Generating Audio...',
    clearButton: 'Clear',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The generated content was blocked for safety reasons. Please try a different topic.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate the reading passage. Please try again.',
    audioErrorDescription: 'Failed to generate audio. Please try again.',
    formErrors: {
      topicMin: 'Please enter a topic.',
      gradeMin: 'Please select a grade level.',
    },
    recordNow: 'Record Now',
    stopRecording: 'Stop Recording',
    replayRecording: 'Replay Recording',
    getFeedback: 'Get Feedback',
    gettingFeedback: 'Getting Feedback...',
    feedbackTitle: 'Instant Feedback',
    feedbackDescription: 'AI-powered suggestions for the student.',
    micError: 'Microphone access denied. Please enable it in your browser settings.',
    sttError: 'Could not understand the audio. Please try recording again.',
  },
  Hindi: {
    formCardTitle: 'मूल्यांकन विवरण',
    formCardDescription: 'एक विषय और ग्रेड स्तर प्रदान करें।',
    topicLabel: 'विषय',
    topicPlaceholder: 'जैसे, सौर मंडल, प्रसिद्ध आविष्कारक',
    gradeLabel: 'ग्रेड स्तर',
    gradePlaceholder: 'एक ग्रेड चुनें',
    generateButton: 'अनुच्छेद उत्पन्न करें',
    generatingButton: 'उत्पन्न हो रहा है...',
    resultsCardTitle: 'पठन अनुच्छेद',
    resultsCardDescription: 'समझ में सुधार के लिए एक पठन अनुच्छेद।',
    vocabCardTitle: 'शब्दावली',
    vocabCardDescription: 'अनुच्छेद से मुख्य शब्द।',
    emptyState: 'आपका उत्पन्न अनुच्छेद और शब्दावली यहाँ दिखाई देगी।',
    listenButton: 'अनुच्छेद सुनें',
    generatingAudioButton: 'ऑडियो बना रहा है...',
    clearButton: 'साफ़ करें',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'सुरक्षा कारणों से उत्पन्न सामग्री को अवरुद्ध कर दिया गया था। कृपया एक अलग विषय का प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'पठन अनुच्छेद उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    audioErrorDescription: 'ऑडियो उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    formErrors: {
      topicMin: 'कृपया एक विषय दर्ज करें।',
      gradeMin: 'कृपया एक ग्रेड स्तर चुनें।',
    },
    recordNow: 'अभी रिकॉर्ड करें',
    stopRecording: 'रिकॉर्डिंग बंद करें',
    replayRecording: 'रिकॉर्डिंग फिर से चलाएं',
    getFeedback: 'प्रतिक्रिया प्राप्त करें',
    gettingFeedback: 'प्रतिक्रिया मिल रही है...',
    feedbackTitle: 'तुरंत प्रतिक्रिया',
    feedbackDescription: 'छात्र के लिए एआई-संचालित सुझाव।',
    micError: 'माइक्रोफोन एक्सेस अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में इसे सक्षम करें।',
    sttError: 'ऑडियो समझ में नहीं आया। कृपया फिर से रिकॉर्ड करने का प्रयास करें।',
  },
  Marathi: {
    formCardTitle: 'मूल्यांकन तपशील',
    formCardDescription: 'एक विषय आणि श्रेणी स्तर प्रदान करा.',
    topicLabel: 'विषय',
    topicPlaceholder: 'उदा., सूर्यमाला, प्रसिद्ध शोधक',
    gradeLabel: 'इयत्ता',
    gradePlaceholder: 'एक श्रेणी निवडा',
    generateButton: 'उतारा तयार करा',
    generatingButton: 'तयार होत आहे...',
    resultsCardTitle: 'वाचन उतारा',
    resultsCardDescription: 'समजून घेण्याची क्षमता सुधारण्यासाठी एक वाचन उतारा.',
    vocabCardTitle: 'शब्दसंग्रह',
    vocabCardDescription: 'उताऱ्यातील महत्त्वाचे शब्द.',
    emptyState: 'तुमचा तयार केलेला उतारा आणि शब्दसंग्रह येथे दिसेल.',
    listenButton: 'उतारा ऐका',
    generatingAudioButton: 'ऑडिओ तयार करत आहे...',
    clearButton: 'साफ करा',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव तयार केलेली सामग्री अवरोधित केली गेली. कृपया वेगळा विषय वापरून पहा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'वाचन उतारा तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    audioErrorDescription: 'ऑडिओ तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    formErrors: {
      topicMin: 'कृपया एक विषय प्रविष्ट करा.',
      gradeMin: 'कृपया एक श्रेणी स्तर निवडा.',
    },
    recordNow: 'आता रेकॉर्ड करा',
    stopRecording: 'रेकॉर्डिंग थांबवा',
    replayRecording: 'रेकॉर्डिंग पुन्हा प्ले करा',
    getFeedback: 'अभिप्राय मिळवा',
    gettingFeedback: 'अभिप्राय मिळत आहे...',
    feedbackTitle: 'झटपट अभिप्राय',
    feedbackDescription: 'विद्यार्थ्यासाठी AI-चालित सूचना.',
    micError: 'मायक्रोफोन प्रवेश नाकारला. कृपया तुमच्या ब्राउझर सेटिंग्जमध्ये तो सक्षम करा.',
    sttError: 'ऑडिओ समजू शकला नाही. कृपया पुन्हा रेकॉर्ड करण्याचा प्रयत्न करा.',
  },
  Kashmiri: {
    formCardTitle: 'تشخیص تفصیل',
    formCardDescription: 'اَکھ موضوع تہٕ گریڈ سطح فراہم کریو۔',
    topicLabel: 'موضوع',
    topicPlaceholder: 'مثلن، شمسی نظام، مشہوٗر موجد',
    gradeLabel: 'گریڈ سطح',
    gradePlaceholder: 'اکھ گریڈ ژارٕو',
    generateButton: 'پیراگراف تیار کریو',
    generatingButton: 'تیار کران...',
    resultsCardTitle: 'پَرُن پیراگراف',
    resultsCardDescription: 'سمجھ بہتر بناونہٕ خٲطرٕ اَکھ پَرُن پیراگراف۔',
    vocabCardTitle: 'ذخیرٕ الفاظ',
    vocabCardDescription: 'پیراگرافٕک اہم الفاظ۔',
    emptyState: 'توٚہنٛد تیار کرنہٕ آمُت پیراگراف تہٕ ذخیرٕ الفاظ ییٚتہِ ظٲہر گژھہِ۔',
    listenButton: 'پیراگراف بوزیو',
    generatingAudioButton: 'آڈیو تیار کران...',
    clearButton: 'صاف کریو',
    contentBlockedTitle: 'مواد بلاک کرنہٕ آمت',
    safetyError: 'تیار کرنہٕ آمت مواد آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ اَکھ بیٛاکھ موضوع آزماو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescription: 'پَرُن پیراگراف تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    audioErrorDescription: 'آڈیو تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    formErrors: {
      topicMin: 'مہربانی کرِتھ اَکھ موضوع دِیو۔',
      gradeMin: 'مہربانی کرِتھ اَکھ گریڈ سطح ژارٕو۔',
    },
    recordNow: 'وُنی ریکارڈ کریو',
    stopRecording: 'ریکارڈنگ بند کریو',
    replayRecording: 'ریکارڈنگ دوبارٕ چلاو',
    getFeedback: 'رائے حٲصِل کریو',
    gettingFeedback: 'رائے حٲصِل کران...',
    feedbackTitle: 'فوری رائے',
    feedbackDescription: 'طالب علم خٲطرٕ AI سٟتؠ تجاویز۔',
    micError: 'مائیکروفون رسائی انکار۔ مہربانی کرِتھ پننِس برائوزر ترتیبات مَنٛز یہِ فعال کریو۔',
    sttError: 'آڈیو سمجھنہٕ آو نہٕ۔ مہربانی کرِتھ دوبارٕ ریکارڈ کریو۔',
  },
  Bengali: {
    formCardTitle: 'মূল্যায়নের বিবরণ',
    formCardDescription: 'একটি বিষয় এবং গ্রেড স্তর প্রদান করুন।',
    topicLabel: 'বিষয়',
    topicPlaceholder: 'যেমন, সৌরজগত, বিখ্যাত উদ্ভাবক',
    gradeLabel: 'গ্রেড স্তর',
    gradePlaceholder: 'একটি গ্রেড নির্বাচন করুন',
    generateButton: 'অনুচ্ছেদ তৈরি করুন',
    generatingButton: 'তৈরি হচ্ছে...',
    resultsCardTitle: 'পঠন অনুচ্ছেদ',
    resultsCardDescription: 'বোঝার উন্নতির জন্য একটি পঠন অনুচ্ছেদ।',
    vocabCardTitle: 'শব্দভান্ডার',
    vocabCardDescription: 'অনুচ্ছেদ থেকে মূল শব্দ।',
    emptyState: 'আপনার তৈরি অনুচ্ছেদ এবং শব্দভান্ডার এখানে প্রদর্শিত হবে।',
    listenButton: 'অনুচ্ছেদ শুনুন',
    generatingAudioButton: 'অডিও তৈরি হচ্ছে...',
    clearButton: 'পরিষ্কার করুন',
    contentBlockedTitle: 'বিষয়বস্তু অবরুদ্ধ',
    safetyError: 'নিরাপত্তার কারণে তৈরি করা বিষয়বস্তু অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে একটি ভিন্ন বিষয় চেষ্টা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescription: 'পঠন অনুচ্ছেদ তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    audioErrorDescription: 'অডিও তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    formErrors: {
      topicMin: 'অনুগ্রহ করে একটি বিষয় লিখুন।',
      gradeMin: 'অনুগ্রহ করে একটি গ্রেড স্তর নির্বাচন করুন।',
    },
    recordNow: 'এখনই রেকর্ড করুন',
    stopRecording: 'রেকর্ডিং বন্ধ করুন',
    replayRecording: 'রেকর্ডিং পুনরায় চালান',
    getFeedback: 'প্রতিক্রিয়া পান',
    gettingFeedback: 'প্রতিক্রিয়া পাওয়া যাচ্ছে...',
    feedbackTitle: 'তাত্ক্ষণিক প্রতিক্রিয়া',
    feedbackDescription: 'ছাত্রের জন্য এআই-চালিত পরামর্শ।',
    micError: 'মাইক্রোফোন অ্যাক্সেস अस्वीकार করা হয়েছে। অনুগ্রহ করে আপনার ব্রাউজার সেটিংসে এটি সক্ষম করুন।',
    sttError: 'অডিও বোঝা যায়নি। অনুগ্রহ করে আবার রেকর্ড করার চেষ্টা করুন।',
  },
  Tamil: {
    formCardTitle: 'மதிப்பீட்டு விவரங்கள்',
    formCardDescription: 'ஒரு தலைப்பு மற்றும் தர நிலையை வழங்கவும்.',
    topicLabel: 'தலைப்பு',
    topicPlaceholder: 'எ.கா., சூரிய மண்டலம், புகழ்பெற்ற கண்டுபிடிப்பாளர்கள்',
    gradeLabel: 'தர நிலை',
    gradePlaceholder: 'ஒரு தரத்தைத் தேர்ந்தெடுக்கவும்',
    generateButton: 'பத்தியை உருவாக்கு',
    generatingButton: 'உருவாக்குகிறது...',
    resultsCardTitle: 'வாசிப்பு பத்தி',
    resultsCardDescription: 'புரிதலை மேம்படுத்த ஒரு வாசிப்பு பத்தி.',
    vocabCardTitle: 'சொற்களஞ்சியம்',
    vocabCardDescription: 'பத்தியிலிருந்து முக்கிய வார்த்தைகள்.',
    emptyState: 'உங்களால் உருவாக்கப்பட்ட பத்தி மற்றும் சொற்களஞ்சியம் இங்கே தோன்றும்.',
    listenButton: 'பத்தியைக் கேட்கவும்',
    generatingAudioButton: 'ஆடியோவை உருவாக்குகிறது...',
    clearButton: 'அழி',
    contentBlockedTitle: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyError: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட உள்ளடக்கம் தடுக்கப்பட்டது। தயவுசெய்து வேறு தலைப்பை முயற்சிக்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescription: 'வாசிப்பு பத்தியை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    audioErrorDescription: 'ஆடியோவை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    formErrors: {
      topicMin: 'தயவுசெய்து ஒரு தலைப்பை உள்ளிடவும்.',
      gradeMin: 'தயவுசெய்து ஒரு தர நிலையைத் தேர்ந்தெடுக்கவும்.',
    },
    recordNow: 'இப்போது பதிவு செய்',
    stopRecording: 'பதிவை நிறுத்து',
    replayRecording: 'பதிவை மீண்டும் இயக்கு',
    getFeedback: 'கருத்துக்களைப் பெறு',
    gettingFeedback: 'கருத்துக்களைப் பெறுகிறது...',
    feedbackTitle: 'உடனடி கருத்து',
    feedbackDescription: 'மாணவருக்கான AI-ஆதரவு பரிந்துரைகள்.',
    micError: 'மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது। உங்கள் உலாவி அமைப்புகளில் அதை இயக்கவும்.',
    sttError: 'ஆடியோவைப் புரிந்து கொள்ள முடியவில்லை। தயவுசெய்து மீண்டும் பதிவு செய்ய முயற்சிக்கவும்.',
  },
  Gujarati: {
    formCardTitle: 'મૂલ્યાંકન વિગતો',
    formCardDescription: 'એક વિષય અને ગ્રેડ સ્તર પ્રદાન કરો.',
    topicLabel: 'વિષય',
    topicPlaceholder: 'દા.ત., સૂર્યમંડળ, પ્રખ્યાત શોધકો',
    gradeLabel: 'ગ્રેડ સ્તર',
    gradePlaceholder: 'એક ગ્રેડ પસંદ કરો',
    generateButton: 'ફકરો બનાવો',
    generatingButton: 'બનાવી રહ્યું છે...',
    resultsCardTitle: 'વાંચન ફકરો',
    resultsCardDescription: 'સમજ સુધારવા માટે એક વાંચન ફકરો.',
    vocabCardTitle: 'શબ્દભંડોળ',
    vocabCardDescription: 'ફકરામાંથી મુખ્ય શબ્દો.',
    emptyState: 'તમારો બનાવેલો ફકરો અને શબ્દભંડોળ અહીં દેખાશે.',
    listenButton: 'ફકરો સાંભળો',
    generatingAudioButton: 'ઓડિયો બનાવી રહ્યું છે...',
    clearButton: 'સાફ કરો',
    contentBlockedTitle: 'સામગ્રી અવરોધિત',
    safetyError: 'બનાવેલી સામગ્રી સુરક્ષા કારણોસર અવરોધિત કરવામાં આવી હતી. કૃપા કરીને અલગ વિષયનો પ્રયાસ કરો.',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescription: 'વાંચન ફકરો બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    audioErrorDescription: 'ઓડિયો બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    formErrors: {
      topicMin: 'કૃપા કરીને એક વિષય દાખલ કરો.',
      gradeMin: 'કૃપા કરીને એક ગ્રેડ સ્તર પસંદ કરો.',
    },
    recordNow: 'હવે રેકોર્ડ કરો',
    stopRecording: 'રેકોર્ડિંગ બંધ કરો',
    replayRecording: 'રેકોર્ડિંગ ફરીથી ચલાવો',
    getFeedback: 'પ્રતિસાદ મેળવો',
    gettingFeedback: 'પ્રતિસાદ મળી રહ્યો છે...',
    feedbackTitle: 'ત્વરિત પ્રતિસાદ',
    feedbackDescription: 'વિદ્યાર્થી માટે AI-સંચાલિત સૂચનો.',
    micError: 'માઇક્રોફોન ઍક્સેસ નકારી. કૃપા કરીને તમારા બ્રાઉઝર સેટિંગ્સમાં તેને સક્ષમ કરો.',
    sttError: 'ઓડિયો સમજી શકાયું નથી. કૃપા કરીને ફરીથી રેકોર્ડ કરવાનો પ્રયાસ કરો.',
  },
  Malayalam: {
    formCardTitle: 'വിലയിരുത്തൽ വിശദാംശങ്ങൾ',
    formCardDescription: 'ഒരു വിഷയവും ഗ്രേഡ് നിലവാരവും നൽകുക.',
    topicLabel: 'വിഷയം',
    topicPlaceholder: 'ഉദാഹരണത്തിന്, സൗരയൂഥം, പ്രശസ്ത കണ്ടുപിടുത്തക്കാർ',
    gradeLabel: 'ഗ്രേഡ് നിലവാരം',
    gradePlaceholder: 'ഒരു ഗ്രേഡ് തിരഞ്ഞെടുക്കുക',
    generateButton: 'ഖണ്ഡിക ഉണ്ടാക്കുക',
    generatingButton: 'ഉണ്ടാക്കുന്നു...',
    resultsCardTitle: 'വായനാ ഖണ്ഡിക',
    resultsCardDescription: 'ഗ്രഹണശേഷി മെച്ചപ്പെടുത്തുന്നതിനുള്ള ഒരു വായനാ ഖണ്ഡിക.',
    vocabCardTitle: 'പദാവലി',
    vocabCardDescription: 'ഖണ്ഡികയിൽ നിന്നുള്ള പ്രധാന വാക്കുകൾ.',
    emptyState: 'നിങ്ങൾ ഉണ്ടാക്കിയ ഖണ്ഡികയും പദാവലിയും ഇവിടെ ദൃശ്യമാകും.',
    listenButton: 'ഖണ്ഡിക കേൾക്കുക',
    generatingAudioButton: 'ഓഡിയോ ഉണ്ടാക്കുന്നു...',
    clearButton: 'മായ്ക്കുക',
    contentBlockedTitle: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyError: 'ഉണ്ടാക്കിയ ഉള്ളടക്കം സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. ദയവായി മറ്റൊരു വിഷയം ശ്രമിക്കുക.',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescription: 'വായനാ ഖണ്ഡിക ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    audioErrorDescription: 'ഓഡിയോ ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    formErrors: {
      topicMin: 'ദയവായി ഒരു വിഷയം നൽകുക.',
      gradeMin: 'ദയവായി ഒരു ഗ്രേഡ് നിലവാരം തിരഞ്ഞെടുക്കുക.',
    },
    recordNow: 'ഇപ്പോൾ റെക്കോർഡ് ചെയ്യുക',
    stopRecording: 'റെക്കോർഡിംഗ് നിർത്തുക',
    replayRecording: 'റെക്കോർഡിംഗ് വീണ്ടും പ്ലേ ചെയ്യുക',
    getFeedback: 'അഭിപ്രായം നേടുക',
    gettingFeedback: 'അഭിപ്രായം നേടുന്നു...',
    feedbackTitle: 'തൽക്ഷണ ഫീഡ്ബാക്ക്',
    feedbackDescription: 'വിദ്യാർത്ഥിക്ക് AI- പവർഡ് നിർദ്ദേശങ്ങൾ.',
    micError: 'മൈക്രോഫോൺ ആക്സസ് നിരസിച്ചു. ദയവായി നിങ്ങളുടെ ബ്രൗസർ ക്രമീകരണങ്ങളിൽ ഇത് പ്രവർത്തനക്ഷമമാക്കുക.',
    sttError: 'ഓഡിയോ മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും റെക്കോർഡ് ചെയ്യാൻ ശ്രമിക്കുക.',
  },
  Punjabi: {
    formCardTitle: 'ਮੁਲਾਂਕਣ ਵੇਰਵੇ',
    formCardDescription: 'ਇੱਕ ਵਿਸ਼ਾ ਅਤੇ ਗ੍ਰੇਡ ਪੱਧਰ ਪ੍ਰਦਾਨ ਕਰੋ।',
    topicLabel: 'ਵਿਸ਼ਾ',
    topicPlaceholder: 'ਜਿਵੇਂ, ਸੂਰਜੀ ਸਿਸਟਮ, ਪ੍ਰਸਿੱਧ ਖੋਜਕਰਤਾ',
    gradeLabel: 'ਗ੍ਰੇਡ ਪੱਧਰ',
    gradePlaceholder: 'ਇੱਕ ਗ੍ਰੇਡ ਚੁਣੋ',
    generateButton: 'ਪੈਰਾਗ੍ਰਾਫ ਤਿਆਰ ਕਰੋ',
    generatingButton: 'ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    resultsCardTitle: 'ਪੜ੍ਹਨ ਦਾ ਪੈਰਾਗ੍ਰਾਫ',
    resultsCardDescription: 'ਸਮਝ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਲਈ ਇੱਕ ਪੜ੍ਹਨ ਦਾ ਪੈਰਾਗ੍ਰਾਫ।',
    vocabCardTitle: 'ਸ਼ਬਦਾਵਲੀ',
    vocabCardDescription: 'ਪੈਰਾਗ੍ਰਾਫ ਤੋਂ ਮੁੱਖ ਸ਼ਬਦ।',
    emptyState: 'ਤੁਹਾਡਾ ਤਿਆਰ ਕੀਤਾ ਪੈਰਾਗ੍ਰਾਫ ਅਤੇ ਸ਼ਬਦਾਵਲੀ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ।',
    listenButton: 'ਪੈਰਾਗ੍ਰਾਫ ਸੁਣੋ',
    generatingAudioButton: 'ਆਡੀਓ ਬਣਾ ਰਿਹਾ ਹੈ...',
    clearButton: 'ਸਾਫ਼ ਕਰੋ',
    contentBlockedTitle: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyError: 'ਤਿਆਰ ਕੀਤੀ ਸਮੱਗਰੀ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰਾ ਵਿਸ਼ਾ ਅਜ਼ਮਾਓ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescription: 'ਪੜ੍ਹਨ ਦਾ ਪੈਰਾਗ੍ਰਾਫ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    audioErrorDescription: 'ਆਡੀਓ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    formErrors: {
      topicMin: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵਿਸ਼ਾ ਦਾਖਲ ਕਰੋ।',
      gradeMin: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਗ੍ਰੇਡ ਪੱਧਰ ਚੁਣੋ।',
    },
    recordNow: 'ਹੁਣੇ ਰਿਕਾਰਡ ਕਰੋ',
    stopRecording: 'ਰਿਕਾਰਡਿੰਗ ਬੰਦ ਕਰੋ',
    replayRecording: 'ਰਿਕਾਰਡਿੰਗ ਮੁੜ ਚਲਾਓ',
    getFeedback: 'ਫੀਡਬੈਕ ਪ੍ਰਾਪਤ ਕਰੋ',
    gettingFeedback: 'ਫੀਡਬੈਕ ਪ੍ਰਾਪਤ ਹੋ ਰਿਹਾ ਹੈ...',
    feedbackTitle: 'ਤੁਰੰਤ ਫੀਡਬੈਕ',
    feedbackDescription: 'ਵਿਦਿਆਰਥੀ ਲਈ AI-ਸੰਚਾਲਿਤ ਸੁਝਾਅ।',
    micError: 'ਮਾਈਕ੍ਰੋਫੋਨ ਪਹੁੰਚ ਤੋਂ ਇਨਕਾਰ ਕੀਤਾ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਇਸਨੂੰ ਆਪਣੇ ਬ੍ਰਾਊਜ਼ਰ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਸਮਰੱਥ ਕਰੋ।',
    sttError: 'ਆਡੀਓ ਨੂੰ ਸਮਝ ਨਹੀਂ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਰਿਕਾਰਡ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
  Odia: {
    formCardTitle: 'ମୂଲ୍ୟାଙ୍କନ ବିବରଣୀ',
    formCardDescription: 'ଏକ ବିଷୟ ଏବଂ ଗ୍ରେଡ୍ ସ୍ତର ପ୍ରଦାନ କରନ୍ତୁ।',
    topicLabel: 'ବିଷୟ',
    topicPlaceholder: 'ଉଦାହରଣ, ସୌରମଣ୍ଡଳ, ପ୍ରସିଦ୍ଧ ଆବିଷ୍କାରକ',
    gradeLabel: 'ଗ୍ରେଡ୍ ସ୍ତର',
    gradePlaceholder: 'ଏକ ଗ୍ରେଡ୍ ବାଛନ୍ତୁ',
    generateButton: 'ଅନୁଚ୍ଛେଦ ସୃଷ୍ଟି କରନ୍ତୁ',
    generatingButton: 'ସୃଷ୍ଟି କରୁଛି...',
    resultsCardTitle: 'ପଠନ ଅନୁଚ୍ଛେଦ',
    resultsCardDescription: 'ବୁଝିବାକୁ ଉନ୍ନତ କରିବା ପାଇଁ ଏକ ପଠନ ଅନୁଚ୍ଛେଦ।',
    vocabCardTitle: 'ଶବ୍ଦକୋଷ',
    vocabCardDescription: 'ଅନୁଚ୍ଛେଦରୁ ମୁଖ୍ୟ ଶବ୍ଦ।',
    emptyState: 'ଆପଣଙ୍କ ସୃଷ୍ଟି ହୋଇଥିବା ଅନୁଚ୍ଛେଦ ଏବଂ ଶବ୍ଦକୋଷ ଏଠାରେ ଦେଖାଯିବ।',
    listenButton: 'ଅନୁଚ୍ଛେଦ ଶୁଣନ୍ତୁ',
    generatingAudioButton: 'ଅଡିଓ ତିଆରି କରୁଛି...',
    clearButton: 'ସଫା କରନ୍ତୁ',
    contentBlockedTitle: 'ବିଷୟବସ୍ତୁ ଅବରୋଧିତ',
    safetyError: 'ସୃଷ୍ଟି ହୋଇଥିବା ବିଷୟବସ୍ତୁକୁ ସୁରକ୍ଷା କାରଣରୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଏକ ଭିନ୍ନ ବିଷୟ ଚେଷ୍ଟା କରନ୍ତୁ।',
    errorTitle: 'ଏକ ତ୍ରୁଟି ଘଟିଛି।',
    errorDescription: 'ପଠନ ଅନୁଚ୍ଛେଦ ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    audioErrorDescription: 'ଅଡିଓ ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    formErrors: {
      topicMin: 'ଦୟାକରି ଏକ ବିଷୟ ପ୍ରବେଶ କରନ୍ତୁ।',
      gradeMin: 'ଦୟାକରି ଏକ ଗ୍ରେଡ୍ ସ୍ତର ବାଛନ୍ତୁ।',
    },
    recordNow: 'ବର୍ତ୍ତମାନ ରେକର୍ଡ କରନ୍ତୁ',
    stopRecording: 'ରେକର୍ଡିଂ ବନ୍ଦ କରନ୍ତୁ',
    replayRecording: 'ରେକର୍ଡିଂ ପୁନର୍ବାର ଚଲାନ୍ତୁ',
    getFeedback: 'ଫିଡବ୍ୟାକ୍ ପାଆନ୍ତୁ',
    gettingFeedback: 'ଫିଡବ୍ୟାକ୍ ପାଉଛି...',
    feedbackTitle: 'ତୁରନ୍ତ ଫିଡବ୍ୟାକ୍',
    feedbackDescription: 'ଛାତ୍ର ପାଇଁ AI-ଚାଳିତ ପରାମର୍ଶ।',
    micError: 'ମାଇକ୍ରୋଫୋନ୍ ପ୍ରବେଶ ଅଗ୍ରାହ୍ୟ କରାଯାଇଛି। ଦୟାକରି ଏହାକୁ ଆପଣଙ୍କ ବ୍ରାଉଜର୍ ସେଟିଂସରେ ସକ୍ଷମ କରନ୍ତୁ।',
    sttError: 'ଅଡିଓ ବୁଝିହେଲା ନାହିଁ। ଦୟାକରି ପୁଣି ରେକର୍ଡ କରିବାକୁ ଚେଷ୍ଟା କରନ୍ତୁ।',
  },
  Assamese: {
    formCardTitle: 'মূল্যায়নৰ বিৱৰণ',
    formCardDescription: 'এটা বিষয় আৰু গ্ৰেড স্তৰ দিয়ক।',
    topicLabel: 'বিষয়',
    topicPlaceholder: 'যেনে, সৌৰজগত, বিখ্যাত আৱিষ্কাৰক',
    gradeLabel: 'গ্ৰেড স্তৰ',
    gradePlaceholder: 'এটা গ্ৰেড বাছনি কৰক',
    generateButton: 'অনুচ্ছেদ সৃষ্টি কৰক',
    generatingButton: 'সৃষ্টি কৰি আছে...',
    resultsCardTitle: 'পঠন অনুচ্ছেদ',
    resultsCardDescription: 'বোধশক্তি উন্নত কৰিবলৈ এটা পঠন অনুচ্ছেদ।',
    vocabCardTitle: 'শব্দভাণ্ডাৰ',
    vocabCardDescription: 'অনুচ্ছেদৰ পৰা মুখ্য শব্দ।',
    emptyState: 'আপোনাৰ সৃষ্ট অনুচ্ছেদ আৰু শব্দভাণ্ডাৰ ইয়াত দেখা যাব।',
    listenButton: 'অনুচ্ছেদ শুনক',
    generatingAudioButton: 'অডিঅ’ বনাই আছে...',
    clearButton: 'পৰিষ্কাৰ কৰক',
    contentBlockedTitle: 'বিষয়বস্তু অৱৰোধিত',
    safetyError: 'সৃষ্ট বিষয়বস্তুটো সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি এটা বেলেگ বিষয় চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescription: 'পঠন অনুচ্ছেদ সৃষ্টি কৰাত విఫল হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    audioErrorDescription: 'অডিঅ’ সৃষ্টি কৰাত విఫল হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    formErrors: {
      topicMin: 'অনুগ্ৰহ কৰি এটা বিষয় দিয়ক।',
      gradeMin: 'অনুগ্ৰহ কৰি এটা গ্ৰেড স্তৰ বাছনি কৰক।',
    },
    recordNow: 'এতিয়াই ৰেকৰ্ড কৰক',
    stopRecording: 'ৰেকৰ্ডিং বন্ধ কৰক',
    replayRecording: 'ৰেকৰ্ডিং পুনৰ প্লে’ কৰক',
    getFeedback: 'প্ৰতিক্ৰিয়া পাওক',
    gettingFeedback: 'প্ৰতিক্ৰিয়া পাই আছে...',
    feedbackTitle: 'तत्क्षण প্ৰতিক্ৰিয়া',
    feedbackDescription: 'শিক্ষাৰ্থীৰ বাবে AI-চালিত পৰামৰ্শ।',
    micError: 'মাইক্ৰ’ফোনৰ অনুমতি দিয়া হোৱা নাই। অনুগ্ৰহ কৰি আপোনাৰ ব্ৰাউজাৰ ছেটিংছত ইয়াক সক্ষম কৰক।',
    sttError: 'অডিঅ’টো বুজিব পৰা নাই। অনুগ্ৰহ কৰি পুনৰ ৰেকৰ্ড কৰিবলৈ চেষ্টা কৰক।',
  },
  Kannada: {
    formCardTitle: 'ಮೌಲ್ಯಮಾಪನ ವಿವರಗಳು',
    formCardDescription: 'ಒಂದು ವಿಷಯ ಮತ್ತು ದರ್ಜೆ ಮಟ್ಟವನ್ನು ಒದಗಿಸಿ.',
    topicLabel: 'ವಿಷಯ',
    topicPlaceholder: 'ಉದಾ., ಸೌರಮಂಡಲ, ಪ್ರಸಿದ್ಧ ಸಂಶೋಧಕರು',
    gradeLabel: 'ದರ್ಜೆ ಮಟ್ಟ',
    gradePlaceholder: 'ಒಂದು ದರ್ಜೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    generateButton: 'ಪ್ಯಾರಾಗ್ರಾಫ್ ರಚಿಸಿ',
    generatingButton: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    resultsCardTitle: 'ಓದುವಿಕೆ ಪ್ಯಾರಾಗ್ರಾಫ್',
    resultsCardDescription: 'ಗ್ರಹಿಕೆಯನ್ನು ಸುಧಾರಿಸಲು ಓದುವ ಪ್ಯಾರಾಗ್ರಾಫ್.',
    vocabCardTitle: 'ಶಬ್ದಕೋಶ',
    vocabCardDescription: 'ಪ್ಯಾರಾಗ್ರಾಫ್‌ನಿಂದ ಪ್ರಮುಖ ಪದಗಳು.',
    emptyState: 'ನಿಮ್ಮ ರಚಿಸಲಾದ ಪ್ಯಾರಾಗ್ರಾಫ್ ಮತ್ತು ಶಬ್ದಕೋಶ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    listenButton: 'ಪ್ಯಾರಾಗ್ರಾಫ್ ಆಲಿಸಿ',
    generatingAudioButton: 'ಆಡಿಯೋ ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    clearButton: 'ಅಳಿಸಿ',
    contentBlockedTitle: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyError: 'ರಚಿಸಲಾದ ವಿಷಯವನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇರೆ ವಿಷಯವನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescription: 'ಓದುವಿಕೆ ಪ್ಯಾರಾಗ್ರಾಫ್ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    audioErrorDescription: 'ಆಡಿಯೋ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    formErrors: {
      topicMin: 'ದಯವಿಟ್ಟು ಒಂದು ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.',
      gradeMin: 'ದಯವಿಟ್ಟು ಒಂದು ದರ್ಜೆ ಮಟ್ಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    },
    recordNow: 'ಈಗಲೇ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
    stopRecording: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ',
    replayRecording: 'ರೆಕಾರ್ಡಿಂಗ್ ಅನ್ನು ಮರುಪ್ಲೇ ಮಾಡಿ',
    getFeedback: 'ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಿರಿ',
    gettingFeedback: 'ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
    feedbackTitle: 'ತಕ್ಷಣದ ಪ್ರತಿಕ್ರಿಯೆ',
    feedbackDescription: 'ವಿದ್ಯಾರ್ಥಿಗಾಗಿ AI-ಚಾಲಿತ ಸಲಹೆಗಳು.',
    micError: 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅದನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.',
    sttError: 'ಆಡಿಯೋವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಲು ಪ್ರಯತ್ನಿಸಿ.',
  },
  Telugu: {
    formCardTitle: 'మూల్యాంకన వివరాలు',
    formCardDescription: 'ఒక అంశం మరియు గ్రేడ్ స్థాయిని అందించండి.',
    topicLabel: 'అంశం',
    topicPlaceholder: 'ఉదా., సౌర వ్యవస్థ, ప్రసిద్ధ ఆవిష్కర్తలు',
    gradeLabel: 'గ్రేడ్ స్థాయి',
    gradePlaceholder: 'ఒక గ్రేడ్‌ను ఎంచుకోండి',
    generateButton: 'భాగాన్ని రూపొందించండి',
    generatingButton: 'రూపొందిస్తోంది...',
    resultsCardTitle: 'పఠన భాగం',
    resultsCardDescription: 'గ్రహణశక్తిని మెరుగుపరచడానికి ఒక పఠన భాగం.',
    vocabCardTitle: 'పదజాలం',
    vocabCardDescription: 'భాగం నుండి కీలక పదాలు.',
    emptyState: 'మీరు రూపొందించిన భాగం మరియు పదజాలం ఇక్కడ కనిపిస్తుంది.',
    listenButton: 'భాగాన్ని వినండి',
    generatingAudioButton: 'ఆడియోను సృష్టిస్తోంది...',
    clearButton: 'తొలగించు',
    contentBlockedTitle: 'కంటెంట్ బ్లాక్ చేయబడింది',
    safetyError: 'భద్రతా కారణాల వల్ల సృష్టించబడిన కంటెంట్ బ్లాక్ చేయబడింది. దయచేసి వేరే అంశాన్ని ప్రయత్నించండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescription: 'పఠన భాగాన్ని రూపొందించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    audioErrorDescription: 'ఆడియోను రూపొందించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    formErrors: {
      topicMin: 'దయచేసి ఒక అంశాన్ని నమోదు చేయండి.',
      gradeMin: 'దయచేసి ఒక గ్రేడ్ స్థాయిని ఎంచుకోండి.',
    },
    recordNow: 'ఇప్పుడే రికార్డ్ చేయండి',
    stopRecording: 'రికార్డింగ్ ఆపండి',
    replayRecording: 'రికార్డింగ్‌ను మళ్లీ ప్లే చేయండి',
    getFeedback: 'అభిప్రాయం పొందండి',
    gettingFeedback: 'అభిప్రాయం పొందుతోంది...',
    feedbackTitle: 'తక్షణ అభిప్రాయం',
    feedbackDescription: 'విద్యార్థి కోసం AI-ఆధారిత సూచనలు.',
    micError: 'మైక్రోఫోన్ యాక్సెస్ నిరాకరించబడింది. దయచేసి మీ బ్రౌజర్ సెట్టింగ్‌లలో దాన్ని ప్రారంభించండి.',
    sttError: 'ఆడియోను అర్థం చేసుకోలేకపోయాము. దయచేసి మళ్లీ రికార్డ్ చేయడానికి ప్రయత్నించండి.',
  },
};

export function ReadingAssessmentClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateReadingAssessmentOutput | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [studentAudioUrl, setStudentAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<GenerateReadingFeedbackOutput | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations['English'];

  const formSchema = z.object({
    topic: z.string().min(1, t.formErrors.topicMin),
    gradeLevel: z.string().min(1, t.formErrors.gradeMin),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '',
    },
  });

  const resetAll = () => {
    form.reset();
    setIsLoading(false);
    setResult(null);
    setAudioUrl(null);
    setError(null);
    setIsRecording(false);
    setStudentAudioUrl(null);
    setIsProcessing(false);
    setFeedback(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    resetAll();
    setIsLoading(true);
    try {
      const assessmentResult = await generateReadingAssessment({ ...values, language });
      setResult(assessmentResult);
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
  };

  const handleListen = async () => {
    if (!result?.passage) return;
    setIsSynthesizing(true);
    setAudioUrl(null);
    try {
      const audioResult = await textToSpeech({ text: result.passage });
      setAudioUrl(audioResult.audio);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: t.errorTitle,
        description: t.audioErrorDescription,
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleStartRecording = async () => {
    setStudentAudioUrl(null);
    setFeedback(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setStudentAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Mic error:', error);
      toast({ variant: 'destructive', title: 'Error', description: t.micError });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!studentAudioUrl || !result?.passage) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
        const audioBlob = await fetch(studentAudioUrl).then(r => r.blob());
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const { text: studentTranscript } = await speechToText({ audioDataUri: base64Audio });
            
            if (!studentTranscript) {
                toast({ variant: 'destructive', title: 'Error', description: t.sttError });
                setIsProcessing(false);
                return;
            }

            const feedbackResult = await generateReadingFeedback({
                passage: result.passage,
                studentTranscript: studentTranscript,
                language: language
            });
            setFeedback(feedbackResult);
        }
    } catch (e: any) {
        console.error("Feedback error", e);
        if (e.message.includes('SAFETY')) {
            setError(t.safetyError);
        } else {
            toast({ variant: 'destructive', title: t.errorTitle, description: 'Could not get feedback.' });
        }
    } finally {
        setIsProcessing(false);
    }
  };


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>{t.formCardTitle}</CardTitle>
          <CardDescription>{t.formCardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.topicLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.topicPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.gradeLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.gradePlaceholder} />
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
              <Button type="submit" disabled={isLoading} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? t.generatingButton : t.generateButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        {result && (
            <div className="flex justify-end gap-2">
                <Button onClick={handleListen} disabled={isSynthesizing || isLoading}>
                    <Volume2 className="mr-2 h-4 w-4" />
                    {isSynthesizing ? t.generatingAudioButton : t.listenButton}
                </Button>
                <Button onClick={resetAll} variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    {t.clearButton}
                </Button>
            </div>
        )}

        {isSynthesizing && <Skeleton className="h-14 w-full" />}
        {audioUrl && (
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        )}

        {error && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>{t.contentBlockedTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-accent" />
                    <CardTitle>{t.resultsCardTitle}</CardTitle>
                    </div>
                    <CardDescription>{t.resultsCardDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    )}
                    {result && <p className="whitespace-pre-wrap">{result.passage}</p>}
                    {!isLoading && !result && !error && (
                        <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
                            <p>{t.emptyState}</p>
                        </div>
                    )}
                </CardContent>
                 {result && (
                    <CardFooter className="flex flex-col items-start gap-4">
                        <div className="flex items-center gap-2">
                            <Button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isProcessing}>
                                {isRecording ? <StopCircle className="mr-2 h-4 w-4 animate-pulse" /> : <Mic className="mr-2 h-4 w-4" />}
                                {isRecording ? t.stopRecording : t.recordNow}
                            </Button>
                            {studentAudioUrl && (
                                <>
                                    <audio src={studentAudioUrl} controls className="h-10"/>
                                    <Button onClick={handleGetFeedback} disabled={isProcessing}>
                                        {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareQuote className="mr-2 h-4 w-4" />}
                                        {isProcessing ? t.gettingFeedback : t.getFeedback}
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardFooter>
                 )}
            </Card>

            {feedback && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-accent" />
                            <CardTitle>{t.feedbackTitle}</CardTitle>
                        </div>
                        <CardDescription>{t.feedbackDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4" dangerouslySetInnerHTML={{ __html: feedback.feedback.replace(/\n/g, '<br />') }} />
                    </CardContent>
                </Card>
            )}

            {result && result.vocabulary.length > 0 && (
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Languages className="h-6 w-6 text-accent" />
                            <CardTitle>{t.vocabCardTitle}</CardTitle>
                        </div>
                        <CardDescription>{t.vocabCardDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.vocabulary.map((item) => (
                                <li key={item.word}>
                                    <span className="font-semibold">{item.word}:</span> {item.definition}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
