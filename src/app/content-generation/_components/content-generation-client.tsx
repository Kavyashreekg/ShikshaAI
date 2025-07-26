'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  generateLocalizedStory,
  GenerateLocalizedStoryOutput,
} from '@/ai/flows/generate-localized-story';
import { generateStoryVideo } from '@/ai/flows/generate-story-video';
import { languages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Video, ShieldAlert, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    cardTitle: 'Content Details',
    cardDescription: 'Describe what you want to create.',
    topicLabel: 'Topic',
    topicPlaceholder: 'e.g., A story about farmers and different soil types',
    languageLabel: 'Language',
    languagePlaceholder: 'Select a language',
    generating: 'Generating...',
    generateContent: 'Generate Content',
    generatedStoryTitle: 'Generated Story',
    generatedStoryDescription: 'Your culturally relevant story will appear here.',
    contentBlocked: 'Content Blocked',
    safetyErrorStory: 'The generated content was blocked for safety reasons. Please rephrase your topic and try again.',
    errorTitle: 'An error occurred.',
    errorDescriptionStory: 'Failed to generate the story. Please try again.',
    emptyState: 'Your generated content will be displayed here once you submit the form.',
    generatingVideo: 'Generating Video...',
    generateVideo: 'Generate Video Explanation',
    videoExplanationTitle: 'Video Explanation',
    videoGenerationProgress: 'Generating video, this may take a minute...',
    safetyErrorVideo: 'The generated video was blocked for safety reasons. The story might contain sensitive content. Please try generating a different story.',
    errorDescriptionVideo: 'Failed to generate the video. Please try again.',
    clearButton: 'Clear',
    formErrors: {
        languageMin: 'Please select a language.',
        topicMin: 'Please describe the topic in at least 10 characters.',
    },
  },
  Hindi: {
    cardTitle: 'सामग्री विवरण',
    cardDescription: 'आप जो बनाना चाहते हैं उसका वर्णन करें।',
    topicLabel: 'विषय',
    topicPlaceholder: 'जैसे, किसानों और विभिन्न प्रकार की मिट्टी के बारे में एक कहानी',
    languageLabel: 'भाषा',
    languagePlaceholder: 'एक भाषा चुनें',
    generating: 'उत्पन्न हो रहा है...',
    generateContent: 'सामग्री उत्पन्न करें',
    generatedStoryTitle: 'उत्पन्न कहानी',
    generatedStoryDescription: 'आपकी सांस्कृतिक रूप से प्रासंगिक कहानी यहाँ दिखाई देगी।',
    contentBlocked: 'सामग्री अवरुद्ध',
    safetyErrorStory: 'सुरक्षा कारणों से उत्पन्न सामग्री को अवरुद्ध कर दिया गया था। कृपया अपना विषय फिर से लिखें और पुनः प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescriptionStory: 'कहानी उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    emptyState: 'आपके द्वारा फ़ॉर्म जमा करने के बाद आपकी उत्पन्न सामग्री यहाँ प्रदर्शित की जाएगी।',
    generatingVideo: 'वीडियो उत्पन्न हो रहा है...',
    generateVideo: 'वीडियो स्पष्टीकरण उत्पन्न करें',
    videoExplanationTitle: 'वीडियो स्पष्टीकरण',
    videoGenerationProgress: 'वीडियो उत्पन्न हो रहा है, इसमें एक मिनट लग सकता है...',
    safetyErrorVideo: 'सुरक्षा कारणों से उत्पन्न वीडियो को अवरुद्ध कर दिया गया था। कहानी में संवेदनशील सामग्री हो सकती है। कृपया एक अलग कहानी उत्पन्न करने का प्रयास करें।',
    errorDescriptionVideo: 'वीडियो उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    clearButton: 'साफ़ करें',
     formErrors: {
        languageMin: 'कृपया एक भाषा चुनें।',
        topicMin: 'कृपया विषय का कम से कम 10 अक्षरों में वर्णन करें।',
    },
  },
  Marathi: {
    cardTitle: 'सामग्री तपशील',
    cardDescription: 'तुम्हाला काय तयार करायचे आहे त्याचे वर्णन करा.',
    topicLabel: 'विषय',
    topicPlaceholder: 'उदा., शेतकरी आणि विविध प्रकारच्या मातीबद्दलची कथा',
    languageLabel: 'भाषा',
    languagePlaceholder: 'एक भाषा निवडा',
    generating: 'तयार होत आहे...',
    generateContent: 'सामग्री तयार करा',
    generatedStoryTitle: 'तयार केलेली कथा',
    generatedStoryDescription: 'तुमची सांस्कृतिकदृष्ट्या संबंधित कथा येथे दिसेल.',
    contentBlocked: 'सामग्री अवरोधित',
    safetyErrorStory: 'सुरक्षेच्या कारणास्तव तयार केलेली सामग्री अवरोधित केली गेली. कृपया तुमचा विषय पुन्हा लिहा आणि पुन्हा प्रयत्न करा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescriptionStory: 'कथा तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    emptyState: 'तुम्ही फॉर्म सबमिट केल्यानंतर तुमची तयार केलेली सामग्री येथे प्रदर्शित केली जाईल.',
    generatingVideo: 'व्हिडिओ तयार होत आहे...',
    generateVideo: 'व्हिडिओ स्पष्टीकरण तयार करा',
    videoExplanationTitle: 'व्हिडिओ स्पष्टीकरण',
    videoGenerationProgress: 'व्हिडिओ तयार होत आहे, यास एक मिनिट लागू शकतो...',
    safetyErrorVideo: 'सुरक्षेच्या कारणास्तव तयार केलेला व्हिडिओ अवरोधित केला गेला. कथेत संवेदनशील सामग्री असू शकते. कृपया वेगळी कथा तयार करण्याचा प्रयत्न करा.',
    errorDescriptionVideo: 'व्हिडिओ तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    clearButton: 'साफ करा',
     formErrors: {
        languageMin: 'कृपया एक भाषा निवडा.',
        topicMin: 'कृपया विषयाचे किमान १० अक्षरांमध्ये वर्णन करा.',
    },
  },
  Kashmiri: {
    cardTitle: 'موادٕک تفصیل',
    cardDescription: 'بیان کریو کہ توٚہہِ کیا بنٲوُن چھُ۔',
    topicLabel: 'موضوع',
    topicPlaceholder: 'مثلاً، زمیندارن تہٕ مختلف قسمن ہنٛز مژھ متعلق اَکھ کہانی۔',
    languageLabel: 'زبان',
    languagePlaceholder: 'اکھ زبان ژارٕو',
    generating: 'تیار کران...',
    generateContent: 'مواد تیار کریو',
    generatedStoryTitle: 'تیار کرنہٕ آمٕژ کہانی',
    generatedStoryDescription: 'توٚہنٛز ثقافتی طور پٲٹھؠ متعلقہٕ کہانی ییٚتہِ ظٲہر گژھہِ۔',
    contentBlocked: 'مواد بلاک کرنہٕ آمت',
    safetyErrorStory: 'تیار کرنہٕ آمت مواد آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ پنُن موضوع بدلاو تہٕ دوبارٕ کوشش کریو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescriptionStory: 'کہانی تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    emptyState: 'فارم جمع کرنہٕ پتہٕ گژھہِ توٚہنٛد تیار کرنہٕ آمت مواد ییٚتہِ ظٲہر۔',
    generatingVideo: 'ویڈیو تیار کران...',
    generateVideo: 'ویڈیو وضاحت تیار کریو',
    videoExplanationTitle: 'ویڈیو وضاحت',
    videoGenerationProgress: 'ویڈیو تیار کران چھُ، اَتھ ہیٚکہِ اکھ مِنَٹ لگِتھ۔',
    safetyErrorVideo: 'تیار کرنہٕ آمت ویڈیو آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ کہانی مَنٛز ہیٚکہِ حساس مواد ٲسِتھ۔ مہربانی کرِتھ اَکھ بیٛاکھ کہانی تیار کریو۔',
    errorDescriptionVideo: 'ویڈیو تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    clearButton: 'صاف کریو',
     formErrors: {
        languageMin: 'مہربانی کرِتھ اکھ زبان ژارٕو۔',
        topicMin: 'مہربانی کرِتھ موضوعس کم از کم 10 اَक्षरَن مَنٛز بیان کریو۔',
    },
  },
  Bengali: {
    cardTitle: 'বিষয়বস্তুর বিবরণ',
    cardDescription: 'আপনি কী তৈরি করতে চান তা বর্ণনা করুন।',
    topicLabel: 'বিষয়',
    topicPlaceholder: 'যেমন, কৃষক এবং বিভিন্ন ধরণের মাটি নিয়ে একটি গল্প',
    languageLabel: 'ভাষা',
    languagePlaceholder: 'একটি ভাষা নির্বাচন করুন',
    generating: 'তৈরি হচ্ছে...',
    generateContent: 'বিষয়বস্তু তৈরি করুন',
    generatedStoryTitle: 'উত্পন্ন গল্প',
    generatedStoryDescription: 'আপনার সাংস্কৃতিকভাবে প্রাসঙ্গিক গল্প এখানে প্রদর্শিত হবে।',
    contentBlocked: 'বিষয়বস্তু অবরুদ্ধ',
    safetyErrorStory: 'নিরাপত্তার কারণে উত্পন্ন বিষয়বস্তু অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে আপনার বিষয় পুনরায় লিখুন এবং আবার চেষ্টা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescriptionStory: 'গল্প তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    emptyState: 'আপনি ফর্ম জমা দেওয়ার পরে আপনার উত্পন্ন বিষয়বস্তু এখানে প্রদর্শিত হবে।',
    generatingVideo: 'ভিডিও তৈরি হচ্ছে...',
    generateVideo: 'ভিডিও ব্যাখ্যা তৈরি করুন',
    videoExplanationTitle: 'ভিডিও ব্যাখ্যা',
    videoGenerationProgress: 'ভিডিও তৈরি হচ্ছে, এতে এক মিনিট সময় লাগতে পারে...',
    safetyErrorVideo: 'নিরাপত্তার কারণে উত্পন্ন ভিডিওটি অবরুদ্ধ করা হয়েছিল। গল্পে সংবেদনশীল বিষয়বস্তু থাকতে পারে। অনুগ্রহ করে একটি ভিন্ন গল্প তৈরি করার চেষ্টা করুন।',
    errorDescriptionVideo: 'ভিডিও তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    clearButton: 'পরিষ্কার করুন',
     formErrors: {
        languageMin: 'অনুগ্রহ করে একটি ভাষা নির্বাচন করুন।',
        topicMin: 'অনুগ্রহ করে বিষয়টি কমপক্ষে ১০টি অক্ষরে বর্ণনা করুন।',
    },
  },
  Tamil: {
    cardTitle: 'உள்ளடக்க விவரங்கள்',
    cardDescription: 'நீங்கள் என்ன உருவாக்க விரும்புகிறீர்கள் என்பதை விவரிக்கவும்.',
    topicLabel: 'தலைப்பு',
    topicPlaceholder: 'எ.கா., விவசாயிகள் மற்றும் பல்வேறு மண் வகைகள் பற்றிய ஒரு கதை',
    languageLabel: 'மொழி',
    languagePlaceholder: 'ஒரு மொழியைத் தேர்ந்தெடுக்கவும்',
    generating: 'உருவாக்குகிறது...',
    generateContent: 'உள்ளடக்கத்தை உருவாக்கு',
    generatedStoryTitle: 'உருவாக்கப்பட்ட கதை',
    generatedStoryDescription: 'உங்கள் கலாச்சார ரீதியாக தொடர்புடைய கதை இங்கே தோன்றும்.',
    contentBlocked: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyErrorStory: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட உள்ளடக்கம் தடுக்கப்பட்டது। தயவுசெய்து உங்கள் தலைப்பை மீண்டும் எழுதி மீண்டும் முயற்சிக்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescriptionStory: 'கதையை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    emptyState: 'நீங்கள் படிவத்தை சமர்ப்பித்தவுடன் உங்கள் உருவாக்கப்பட்ட உள்ளடக்கம் இங்கே காட்டப்படும்.',
    generatingVideo: 'வீடியோவை உருவாக்குகிறது...',
    generateVideo: 'வீடியோ விளக்கத்தை உருவாக்கு',
    videoExplanationTitle: 'வீடியோ விளக்கம்',
    videoGenerationProgress: 'வீடியோ உருவாக்கப்படுகிறது, இதற்கு ஒரு நிமிடம் ஆகலாம்...',
    safetyErrorVideo: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட வீடியோ தடுக்கப்பட்டது। கதையில் உணர்ச்சிகரமான உள்ளடக்கம் இருக்கலாம்। தயவுசெய்து வேறு கதையை உருவாக்க முயற்சிக்கவும்।',
    errorDescriptionVideo: 'வீடியோவை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    clearButton: 'அழிக்கவும்',
     formErrors: {
        languageMin: 'தயவுசெய்து ஒரு மொழியைத் தேர்ந்தெடுக்கவும்.',
        topicMin: 'தயவுசெய்து தலைப்பை குறைந்தது 10 எழுத்துக்களில் விவரிக்கவும்।',
    },
  },
  Gujarati: {
    cardTitle: 'સામગ્રી વિગતો',
    cardDescription: 'તમે શું બનાવવા માંગો છો તેનું વર્ણન કરો.',
    topicLabel: 'વિષય',
    topicPlaceholder: 'દા.ત., ખેડૂતો અને વિવિધ પ્રકારની જમીન વિશેની વાર્તા',
    languageLabel: 'ભાષા',
    languagePlaceholder: 'એક ભાષા પસંદ કરો',
    generating: 'બનાવી રહ્યું છે...',
    generateContent: 'સામગ્રી બનાવો',
    generatedStoryTitle: 'બનાવેલી વાર્તા',
    generatedStoryDescription: 'તમારી સાંસ્કૃતિક રીતે સંબંધિત વાર્તા અહીં દેખાશે.',
    contentBlocked: 'સામગ્રી અવરોધિત',
    safetyErrorStory: 'સુરક્ષા કારણોસર બનાવેલી સામગ્રીને અવરોધિત કરવામાં આવી હતી. કૃપા કરીને તમારો વિષય ફરીથી લખો અને ફરીથી પ્રયાસ કરો.',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescriptionStory: 'વાર્તા બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    emptyState: 'તમે ફોર્મ સબમિટ કર્યા પછી તમારી બનાવેલી સામગ્રી અહીં પ્રદર્શિત થશે.',
    generatingVideo: 'વિડિઓ બનાવી રહ્યું છે...',
    generateVideo: 'વિડિઓ સ્પષ્ટતા બનાવો',
    videoExplanationTitle: 'વિડિઓ સ્પષ્ટતા',
    videoGenerationProgress: 'વિડિઓ બનાવી રહ્યું છે, આમાં એક મિનિટ લાગી શકે છે...',
    safetyErrorVideo: 'સુરક્ષા કારણોસર બનાવેલી વિડિઓને અવરોધિત કરવામાં આવી હતી. વાર્તામાં સંવેદનશીલ સામગ્રી હોઈ શકે છે. કૃપા કરીને એક અલગ વાર્તા બનાવવાનો પ્રયાસ કરો.',
    errorDescriptionVideo: 'વિડિઓ બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    clearButton: 'સાફ કરો',
     formErrors: {
        languageMin: 'કૃપા કરીને એક ભાષા પસંદ કરો.',
        topicMin: 'કૃપા કરીને વિષયનું ઓછામાં ઓછું 10 અક્ષરોમાં વર્ણન કરો.',
    },
  },
  Malayalam: {
    cardTitle: 'ഉള്ളടക്ക വിവരങ്ങൾ',
    cardDescription: 'നിങ്ങൾ എന്താണ് സൃഷ്ടിക്കാൻ ആഗ്രഹിക്കുന്നതെന്ന് വിവരിക്കുക.',
    topicLabel: 'വിഷയം',
    topicPlaceholder: 'ഉദാഹരണത്തിന്, കർഷകരെയും വിവിധതരം മണ്ണിനങ്ങളെയും കുറിച്ചുള്ള ഒരു കഥ',
    languageLabel: 'ഭാഷ',
    languagePlaceholder: 'ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക',
    generating: 'സൃഷ്ടിക്കുന്നു...',
    generateContent: 'ഉള്ളടക്കം സൃഷ്ടിക്കുക',
    generatedStoryTitle: 'സൃഷ്ടിച്ച കഥ',
    generatedStoryDescription: 'നിങ്ങളുടെ സാംസ്കാരികമായി പ്രസക്തമായ കഥ ഇവിടെ ദൃശ്യമാകും.',
    contentBlocked: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyErrorStory: 'സുരക്ഷാ കാരണങ്ങളാൽ സൃഷ്ടിച്ച ഉള്ളടക്കം തടഞ്ഞിരിക്കുന്നു. ദയവായി നിങ്ങളുടെ വിഷയം മാറ്റി വീണ്ടും ശ്രമിക്കുക.',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescriptionStory: 'കഥ സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    emptyState: 'നിങ്ങൾ ഫോം സമർപ്പിച്ചുകഴിഞ്ഞാൽ നിങ്ങളുടെ സൃഷ്ടിച്ച ഉള്ളടക്കം ഇവിടെ പ്രദർശിപ്പിക്കും.',
    generatingVideo: 'വീഡിയോ സൃഷ്ടിക്കുന്നു...',
    generateVideo: 'വീഡിയോ വിശദീകരണം സൃഷ്ടിക്കുക',
    videoExplanationTitle: 'വീഡിയോ വിശദീകരണം',
    videoGenerationProgress: 'വീഡിയോ സൃഷ്ടിക്കുന്നു, ഇതിന് ഒരു മിനിറ്റ് എടുത്തേക്കാം...',
    safetyErrorVideo: 'സുരക്ഷാ കാരണങ്ങളാൽ സൃഷ്ടിച്ച വീഡിയോ തടഞ്ഞിരിക്കുന്നു. കഥയിൽ സെൻസിറ്റീവായ ഉള്ളടക്കം അടങ്ങിയിരിക്കാം. ദയവായി മറ്റൊരു കഥ സൃഷ്ടിക്കാൻ ശ്രമിക്കുക.',
    errorDescriptionVideo: 'വീഡിയോ സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    clearButton: 'മായ്ക്കുക',
     formErrors: {
        languageMin: 'ദയവായി ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക.',
        topicMin: 'ദയവായി വിഷയം കുറഞ്ഞത് 10 അക്ഷരങ്ങളിൽ വിവരിക്കുക.',
    },
  },
  Punjabi: {
    cardTitle: 'ਸਮੱਗਰੀ ਵੇਰਵੇ',
    cardDescription: 'ਤੁਸੀਂ ਜੋ ਬਣਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ ਉਸ ਦਾ ਵਰਣਨ ਕਰੋ।',
    topicLabel: 'ਵਿਸ਼ਾ',
    topicPlaceholder: 'ਜਿਵੇਂ, ਕਿਸਾਨਾਂ ਅਤੇ ਵੱਖ-ਵੱਖ ਮਿੱਟੀ ਦੀਆਂ ਕਿਸਮਾਂ ਬਾਰੇ ਇੱਕ ਕਹਾਣੀ',
    languageLabel: 'ਭਾਸ਼ਾ',
    languagePlaceholder: 'ਇੱਕ ਭਾਸ਼ਾ ਚੁਣੋ',
    generating: 'ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    generateContent: 'ਸਮੱਗਰੀ ਤਿਆਰ ਕਰੋ',
    generatedStoryTitle: 'ਤਿਆਰ ਕੀਤੀ ਕਹਾਣੀ',
    generatedStoryDescription: 'ਤੁਹਾਡੀ ਸੱਭਿਆਚਾਰਕ ਤੌਰ ਤੇ ਸੰਬੰਧਿਤ ਕਹਾਣੀ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ।',
    contentBlocked: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyErrorStory: 'ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਤਿਆਰ ਕੀਤੀ ਸਮੱਗਰੀ ਨੂੰ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਵਿਸ਼ੇ ਨੂੰ ਦੁਬਾਰਾ ਲਿਖੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescriptionStory: 'ਕਹਾਣੀ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    emptyState: 'ਤੁਹਾਡੇ ਦੁਆਰਾ ਫਾਰਮ ਜਮ੍ਹਾਂ ਕਰਨ ਤੋਂ ਬਾਅਦ ਤੁਹਾਡੀ ਤਿਆਰ ਕੀਤੀ ਸਮੱਗਰੀ ਇੱਥੇ ਪ੍ਰਦਰਸ਼ਿਤ ਕੀਤੀ ਜਾਵੇਗੀ।',
    generatingVideo: 'ਵੀਡੀਓ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    generateVideo: 'ਵੀਡੀਓ ਵਿਆਖਿਆ ਤਿਆਰ ਕਰੋ',
    videoExplanationTitle: 'ਵੀਡੀਓ ਵਿਆਖਿਆ',
    videoGenerationProgress: 'ਵੀਡੀਓ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ, ਇਸ ਵਿੱਚ ਇੱਕ ਮਿੰਟ ਲੱਗ ਸਕਦਾ ਹੈ...',
    safetyErrorVideo: 'ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਤਿਆਰ ਕੀਤੇ ਗਏ ਵੀਡੀਓ ਨੂੰ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਹਾਣੀ ਵਿੱਚ ਸੰਵੇਦਨਸ਼ੀਲ ਸਮੱਗਰੀ ਹੋ ਸਕਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰੀ ਕਹਾਣੀ ਤਿਆਰ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errorDescriptionVideo: 'ਵੀਡੀਓ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    clearButton: 'ਸਾਫ਼ ਕਰੋ',
     formErrors: {
        languageMin: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਭਾਸ਼ਾ ਚੁਣੋ।',
        topicMin: 'ਕਿਰਪਾ ਕਰਕੇ ਵਿਸ਼ੇ ਦਾ ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰਾਂ ਵਿੱਚ ਵਰਣਨ ਕਰੋ।',
    },
  },
  Odia: {
    cardTitle: 'ବିଷୟବସ୍ତୁ ବିବରଣୀ',
    cardDescription: 'ଆପଣ ଯାହା ସୃଷ୍ଟି କରିବାକୁ ଚାହୁଁଛନ୍ତି ତାହା ବର୍ଣ୍ଣନା କରନ୍ତୁ।',
    topicLabel: 'ବିଷୟ',
    topicPlaceholder: 'ଉଦାହରଣ ସ୍ୱରୂପ, ଚାଷୀ ଏବଂ ବିଭିନ୍ନ ମାଟି ପ୍ରକାର ବିଷୟରେ ଏକ କାହାଣୀ',
    languageLabel: 'ଭାଷା',
    languagePlaceholder: 'ଏକ ଭାଷା ବାଛନ୍ତୁ',
    generating: 'ସୃଷ୍ଟି କରୁଛି...',
    generateContent: 'ବିଷୟବସ୍ତୁ ସୃଷ୍ଟି କରନ୍ତୁ',
    generatedStoryTitle: 'ସୃଷ୍ଟି ହୋଇଥିବା କାହାଣୀ',
    generatedStoryDescription: 'ଆପଣଙ୍କର ସାଂସ୍କୃତିକ ଭାବରେ ପ୍ରାସଙ୍ଗିକ କାହାଣୀ ଏଠାରେ ଦେଖାଯିବ।',
    contentBlocked: 'ବିଷୟବସ୍ତୁ ଅବରୋଧିତ',
    safetyErrorStory: 'ସୁରକ୍ଷା କାରଣରୁ ସୃଷ୍ଟି ହୋଇଥିବା ବିଷୟବସ୍ତୁକୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଆପଣଙ୍କର ବିଷୟ ପୁନର୍ବାର ଲେଖନ୍ତୁ ଏବଂ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    errorTitle: 'ଏକ ତ୍ରୁଟି ଘଟିଛି।',
    errorDescriptionStory: 'କାହାଣୀ ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    emptyState: 'ଆପଣ ଫର୍ମ ଦାଖଲ କଲା ପରେ ଆପଣଙ୍କର ସୃଷ୍ଟି ହୋଇଥିବା ବିଷୟବସ୍ତୁ ଏଠାରେ ପ୍ରଦର୍ଶିତ ହେବ।',
    generatingVideo: 'ଭିଡିଓ ସୃଷ୍ଟି କରୁଛି...',
    generateVideo: 'ଭିଡିଓ ବ୍ୟାଖ୍ୟା ସୃଷ୍ଟି କରନ୍ତୁ',
    videoExplanationTitle: 'ଭିଡିଓ ବ୍ୟାଖ୍ୟା',
    videoGenerationProgress: 'ଭିଡିଓ ସୃଷ୍ଟି କରୁଛି, ଏଥିରେ ଏକ ମିନିଟ୍ ଲାଗିପାରେ...',
    safetyErrorVideo: 'ସୁରକ୍ଷା କାରଣରୁ ସୃଷ୍ଟି ହୋଇଥିବା ଭିଡିଓକୁ ଅବରୋଧ କରାଯାଇଥିଲା। କାହାଣୀରେ ସମ୍ବେଦନଶୀଳ ବିଷୟବସ୍ତୁ ଥାଇପାରେ। ଦୟାକରି ଏକ ଭିନ୍ନ କାହାଣୀ ସୃଷ୍ଟି କରିବାକୁ ଚେଷ୍ଟା କରନ୍ତୁ।',
    errorDescriptionVideo: 'ଭିଡିଓ ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    clearButton: 'ସଫା କରନ୍ତୁ',
     formErrors: {
        languageMin: 'ଦୟାକରି ଏକ ଭାଷା ବାଛନ୍ତୁ।',
        topicMin: 'ଦୟାକରି ବିଷୟକୁ ଅତିକମରେ ୧୦ଟି ଅକ୍ଷରରେ ବର୍ଣ୍ଣନା କରନ୍ତୁ।',
    },
  },
  Assamese: {
    cardTitle: 'বিষয়বস্তুৰ বিৱৰণ',
    cardDescription: 'আপুনি কি সৃষ্টি কৰিব বিচাৰে সেয়া বৰ্ণনা কৰক।',
    topicLabel: 'বিষয়',
    topicPlaceholder: 'যেনে, কৃষক আৰু বিভিন্ন প্ৰকাৰৰ মাটিৰ বিষয়ে এটা কাহিনী',
    languageLabel: 'ভাষা',
    languagePlaceholder: 'এটা ভাষা বাছনি কৰক',
    generating: 'সৃষ্টি কৰি আছে...',
    generateContent: 'বিষয়বস্তু সৃষ্টি কৰক',
    generatedStoryTitle: 'সৃষ্ট কাহিনী',
    generatedStoryDescription: 'আপোনাৰ সাংস্কৃতিকভাৱে প্ৰাসংগিক কাহিনী ইয়াত দেখা যাব।',
    contentBlocked: 'বিষয়বস্তু অৱৰোধিত',
    safetyErrorStory: 'সুৰক্ষাৰ কাৰণত সৃষ্ট বিষয়বস্তু অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি আপোনাৰ বিষয় পুনৰ লিখক আৰু পুনৰ চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescriptionStory: 'কাহিনী সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    emptyState: 'আপুনি ফৰ্ম দাখিল কৰাৰ পিছত আপোনাৰ সৃষ্ট বিষয়বস্তু ইয়াত প্ৰদৰ্শিত হ’ব।',
    generatingVideo: 'ভিডিঅ’ সৃষ্টি কৰি আছে...',
    generateVideo: 'ভিডিঅ’ ব্যাখ্যা সৃষ্টি কৰক',
    videoExplanationTitle: 'ভিডিঅ’ ব্যাখ্যা',
    videoGenerationProgress: 'ভিডিঅ’ সৃষ্টি কৰি আছে, ইয়াত এক মিনিট সময় লাগিব পাৰে...',
    safetyErrorVideo: 'সুৰক্ষাৰ কাৰণত সৃষ্ট ভিডিঅ’টো অৱৰোধ কৰা হৈছিল। কাহিনীত সংবেদনশীল বিষয়বস্তু থাকিব পাৰে। অনুগ্ৰহ কৰি এটা বেলেগ কাহিনী সৃষ্টি কৰিবলৈ চেষ্টা কৰক।',
    errorDescriptionVideo: 'ভিডিঅ’ সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰك।',
    clearButton: 'পৰিষ্কাৰ কৰক',
     formErrors: {
        languageMin: 'অনুগ্ৰহ কৰি এটা ভাষা বাছনি কৰক।',
        topicMin: 'অনুগ্ৰহ কৰি বিষয়টো কমেও ১০টা আখৰত বৰ্ণনা কৰক।',
    },
  },
  Kannada: {
    cardTitle: 'ವಿಷಯದ ವಿವರಗಳು',
    cardDescription: 'ನೀವು ಏನು ರಚಿಸಲು ಬಯಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ವಿವರಿಸಿ.',
    topicLabel: 'ವಿಷಯ',
    topicPlaceholder: 'ಉದಾ., ರೈತರು ಮತ್ತು ವಿವಿಧ ಮಣ್ಣಿನ ಪ್ರಕಾರಗಳ ಬಗ್ಗೆ ಒಂದು ಕಥೆ',
    languageLabel: 'ಭಾಷೆ',
    languagePlaceholder: 'ಒಂದು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    generating: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    generateContent: 'ವಿಷಯವನ್ನು ರಚಿಸಿ',
    generatedStoryTitle: 'ರಚಿಸಲಾದ ಕಥೆ',
    generatedStoryDescription: 'ನಿಮ್ಮ ಸಾಂಸ್ಕೃತಿಕವಾಗಿ ಸಂಬಂಧಿತ ಕಥೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    contentBlocked: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyErrorStory: 'ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ರಚಿಸಲಾದ ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿಷಯವನ್ನು ಮರುರೂಪಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescriptionStory: 'ಕಥೆಯನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    emptyState: 'ನೀವು ಫಾರ್ಮ್ ಅನ್ನು ಸಲ್ಲಿಸಿದ ನಂತರ ನಿಮ್ಮ ರಚಿಸಲಾದ ವಿಷಯ ಇಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ.',
    generatingVideo: 'ವೀಡಿಯೊವನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    generateVideo: 'ವೀಡಿಯೊ ವಿವರಣೆಯನ್ನು ರಚಿಸಿ',
    videoExplanationTitle: 'ವೀಡಿಯೊ ವಿವರಣೆ',
    videoGenerationProgress: 'ವೀಡಿಯೊವನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ, ಇದಕ್ಕೆ ಒಂದು ನಿಮಿಷ ತೆಗೆದುಕೊಳ್ಳಬಹುದು...',
    safetyErrorVideo: 'ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ರಚಿಸಲಾದ ವೀಡಿಯೊವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಕಥೆಯು ಸೂಕ್ಷ್ಮ ವಿಷಯವನ್ನು ಹೊಂದಿರಬಹುದು. ದಯವಿಟ್ಟು ಬೇರೆ ಕಥೆಯನ್ನು ರಚಿಸಲು ಪ್ರಯತ್ನಿಸಿ.',
    errorDescriptionVideo: 'ವೀಡಿಯೊವನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    clearButton: 'ಅಳಿಸಿ',
     formErrors: {
        languageMin: 'ದಯವಿಟ್ಟು ಒಂದು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
        topicMin: 'ದಯವಿಟ್ಟು ವಿಷಯವನ್ನು ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳಲ್ಲಿ ವಿವರಿಸಿ.',
    },
  },
  Telugu: {
    cardTitle: 'విషయ వివరాలు',
    cardDescription: 'మీరు ఏమి సృష్టించాలనుకుంటున్నారో వివరించండి.',
    topicLabel: 'అంశం',
    topicPlaceholder: 'ఉదా., రైతులు మరియు వివిధ నేల రకాల గురించి ఒక కథ',
    languageLabel: 'భాష',
    languagePlaceholder: 'ఒక భాషను ఎంచుకోండి',
    generating: 'సృష్టిస్తోంది...',
    generateContent: 'విషయాన్ని సృష్టించండి',
    generatedStoryTitle: 'సృష్టించబడిన కథ',
    generatedStoryDescription: 'మీ సాంస్కృతంగా సంబంధిత కథ ఇక్కడ కనిపిస్తుంది.',
    contentBlocked: 'కంటెంట్ బ్లాక్ చేయబడింది',
    safetyErrorStory: 'భద్రతా కారణాల వల్ల సృష్టించబడిన కంటెంట్ బ్లాక్ చేయబడింది. దయచేసి మీ అంశాన్ని మార్చి మళ్లీ ప్రయత్నించండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescriptionStory: 'కథను సృష్టించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    emptyState: 'మీరు ఫారమ్‌ను సమర్పించిన తర్వాత మీ సృష్టించబడిన కంటెంట్ ఇక్కడ ప్రదర్శించబడుతుంది.',
    generatingVideo: 'వీడియోను సృష్టిస్తోంది...',
    generateVideo: 'వీడియో వివరణను సృష్టించండి',
    videoExplanationTitle: 'వీడియో వివరణ',
    videoGenerationProgress: 'వీడియోను సృష్టిస్తోంది, దీనికి ఒక నిమిషం పట్టవచ్చు...',
    safetyErrorVideo: 'భద్రతా కారణాల వల్ల సృష్టించబడిన వీడియో బ్లాక్ చేయబడింది. కథలో సున్నితమైన కంటెంట్ ఉండవచ్చు. దయచేసి వేరే కథను సృష్టించడానికి ప్రయత్నించండి.',
    errorDescriptionVideo: 'వీడియోను సృష్టించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    clearButton: 'తొలగించు',
     formErrors: {
        languageMin: 'దయచేసి ఒక భాషను ఎంచుకోండి.',
        topicMin: 'దయచేసి అంశాన్ని కనీసం 10 అక్షరాలలో వివరించండి.',
    },
  },
};

export function ContentGenerationClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [result, setResult] = useState<GenerateLocalizedStoryOutput | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const storedResult = localStorage.getItem('generatedStory');
        if (storedResult) {
          setResult(JSON.parse(storedResult));
        }
      } catch (error) {
        console.error('Failed to parse generatedStory from localStorage', error);
        localStorage.removeItem('generatedStory');
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      if (result) {
        localStorage.setItem('generatedStory', JSON.stringify(result));
      } else {
        localStorage.removeItem('generatedStory');
      }
    }
  }, [result, isClient]);

  const formSchema = z.object({
    language: z.string().min(1, t.formErrors.languageMin),
    topic: z.string().min(10, t.formErrors.topicMin),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: '',
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setVideoUrl(null);
    setError(null);
    setVideoError(null);
    try {
      const storyResult = await generateLocalizedStory(values);
      setResult(storyResult);
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('SAFETY')) {
        setError(t.safetyErrorStory);
      } else {
        toast({
          variant: 'destructive',
          title: t.errorTitle,
          description: t.errorDescriptionStory,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateVideo() {
    if (!result?.story) return;
    setIsGeneratingVideo(true);
    setVideoUrl(null);
    setVideoError(null);
    try {
      const videoResult = await generateStoryVideo({ story: result.story });
      setVideoUrl(videoResult.video);
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('SAFETY')) {
        setVideoError(t.safetyErrorVideo);
      } else {
        setVideoError(e.message || t.errorDescriptionVideo);
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  }
  
  function handleClear() {
    form.reset();
    setResult(null);
    setVideoUrl(null);
    setError(null);
    setVideoError(null);
    if (isClient) {
      localStorage.removeItem('generatedStory');
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>{t.cardDescription}</CardDescription>
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
                      <Textarea
                        placeholder={t.topicPlaceholder}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.languageLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.languagePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || isGeneratingVideo} className="w-full">
                {isLoading ? t.generating : t.generateContent}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.generatedStoryTitle}</CardTitle>
              <CardDescription>{t.generatedStoryDescription}</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                {result && (
                  <Button onClick={handleClear} variant="ghost" size="icon">
                    <XCircle className="h-5 w-5" />
                    <span className="sr-only">{t.clearButton}</span>
                  </Button>
                )}
                <Sparkles className="h-6 w-6 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.contentBlocked}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4">
                {result.story}
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                <p>{t.emptyState}</p>
              </div>
            )}
          </CardContent>
          {result && (
            <CardFooter>
              <Button onClick={handleGenerateVideo} disabled={isGeneratingVideo || isLoading} className="w-full">
                <Video className="mr-2 h-4 w-4" />
                {isGeneratingVideo ? t.generatingVideo : t.generateVideo}
              </Button>
            </CardFooter>
          )}
        </Card>
        {(isGeneratingVideo || videoUrl || videoError) && (
          <Card>
            <CardHeader>
              <CardTitle>{t.videoExplanationTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {isGeneratingVideo && (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Skeleton className="h-48 w-full max-w-lg" />
                  <p className="text-center text-muted-foreground">{t.videoGenerationProgress}</p>
                </div>
              )}
               {videoError && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>{t.errorTitle}</AlertTitle>
                  <AlertDescription>{videoError}</AlertDescription>
                </Alert>
              )}
              {videoUrl && (
                <video controls src={videoUrl} className="w-full rounded-md" />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
