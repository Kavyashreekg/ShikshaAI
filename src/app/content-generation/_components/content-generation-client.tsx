
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  generateLocalizedStory
} from '@/ai/flows/generate-localized-story';
import { type GenerateLocalizedStoryOutput, type GenerateLocalizedStoryInput } from '@/ai/flows/schemas/generate-localized-story.schema';
import { generateStoryVideo } from '@/ai/flows/generate-story-video';
import { languages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Video, ShieldAlert, XCircle, History, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

type StoredStory = GenerateLocalizedStoryOutput & GenerateLocalizedStoryInput & { id: string };

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
    billingErrorVideo: 'Video generation requires a Google Cloud Platform project with billing enabled. Please check your account settings.',
    clearButton: 'Clear',
    viewHistoryButton: 'View History',
    historyDialogTitle: 'Stored Stories',
    historyDialogDescription: 'Here are the stories you have generated in the past. You can view, load, or delete them.',
    noHistory: 'You have not generated any stories yet.',
    loadStoryButton: 'Load Story',
    deleteStoryButton: 'Delete',
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
    billingErrorVideo: 'वीडियो बनाने के लिए बिलिंग सक्षम Google क्लाउड प्लेटफ़ॉर्म प्रोजेक्ट की आवश्यकता है। कृपया अपनी खाता सेटिंग जांचें।',
    clearButton: 'साफ़ करें',
    viewHistoryButton: 'इतिहास देखें',
    historyDialogTitle: 'संग्रहीत कहानियाँ',
    historyDialogDescription: 'यहाँ वे कहानियाँ हैं जो आपने अतीत में उत्पन्न की हैं। आप उन्हें देख, लोड या हटा सकते हैं।',
    noHistory: 'आपने अभी तक कोई कहानी उत्पन्न नहीं की है।',
    loadStoryButton: 'कहानी लोड करें',
    deleteStoryButton: 'हटाएं',
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
    billingErrorVideo: 'व्हिडिओ निर्मितीसाठी बिलिंग सक्षम असलेले Google क्लाउड प्लॅटफॉर्म प्रकल्प आवश्यक आहे. कृपया तुमची खाते सेटिंग्ज तपासा.',
    clearButton: 'साफ करा',
    viewHistoryButton: 'इतिहास पहा',
    historyDialogTitle: 'साठवलेल्या कथा',
    historyDialogDescription: 'तुम्ही पूर्वी तयार केलेल्या कथा येथे आहेत. तुम्ही त्या पाहू शकता, लोड करू शकता किंवा हटवू शकता.',
    noHistory: 'तुम्ही अद्याप कोणतीही कथा तयार केलेली नाही.',
    loadStoryButton: 'कथा लोड करा',
    deleteStoryButton: 'हटवा',
     formErrors: {
        languageMin: 'कृपया एक भाषा निवडा.',
        topicMin: 'कृपया विषयाचे किमान १० अक्षरांमध्ये वर्णन करा.',
    },
  },
  Kashmiri: {
    cardTitle: 'موادٕچ تفصیل',
    cardDescription: 'بیان کریو کہ توہہ کیا بنوُن چھُ۔',
    topicLabel: 'موضوع',
    topicPlaceholder: 'مثلن، زمیندارن تہٕ مختلف قسمن ہنٛز مژھن متعلق اَکھ کہانی',
    languageLabel: 'زبان',
    languagePlaceholder: 'اکھ زبان ژارٕو',
    generating: 'تیار کران...',
    generateContent: 'مواد تیار کریو',
    generatedStoryTitle: 'تیار کرنہٕ آمٕژ کہانی',
    generatedStoryDescription: 'توٚہنٛز ثقافتی طور پٲٹھؠ متعلقہٕ کہانی ییٚتہِ ظٲہر گژھہِ۔',
    contentBlocked: 'مواد بلاک کرنہٕ آمت',
    safetyErrorStory: 'تیار کرنہٕ آمت مواد آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ پنُن موضوع دوبارٕ لِکھیو تہٕ دوبارٕ کوشش کریو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescriptionStory: 'کہانی تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    emptyState: 'توٚہنٛد تیار کرنہٕ آمت مواد ییٚتہِ ظٲہر گژھہِ ییٚلہِ توہہِ فارم جمع کریو۔',
    generatingVideo: 'ویڈیو تیار کران...',
    generateVideo: 'ویڈیو وضاحت تیار کریو',
    videoExplanationTitle: 'ویڈیو وضاحت',
    videoGenerationProgress: 'ویڈیو تیار کران، اَتھ ہیٚکہِ اَکھ منٹ لَگِتھ...',
    safetyErrorVideo: 'تیار کرنہٕ آمت ویڈیو آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ کہانی مَنٛز ہیٚکہِ حساس مواد ٲسِتھ۔ مہربانی کرِتھ اَکھ بیٛاکھ کہانی تیار کریو۔',
    errorDescriptionVideo: 'ویڈیو تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    billingErrorVideo: 'ویڈیو جنریشن خٲطرٕ چھُ بلنگ فعال سٟتؠ اَکھ گوگل کلاؤڈ پلیٹ فارم پروجیکٹ ضۆروٗری۔ مہربانی کرِتھ پنٕنؠ اکاؤنٹ ترتیبات چیک کریو۔',
    clearButton: 'صاف کریو',
    viewHistoryButton: 'تَوٲریٖخ وُچھِو',
    historyDialogTitle: 'ذخیٖرٕ کرنہٕ آمٕتہ کہانی',
    historyDialogDescription: 'ییٚتہِ چھِ اہ کہانی یم توہہِ ماضی مَنٛز تیار کٔرؠ مٕتؠ چھِ۔ توہہِ ہیٚکِو یِم وُچھِتھ، لوڈ کرِتھ، یا ہٹاوِتھ۔',
    noHistory: 'توہہِ چھُ نہٕ وُنی تام کانٛہہ کہانی تیار کٔرؠ مٕژ۔',
    loadStoryButton: 'کہانی لوڈ کریو',
    deleteStoryButton: 'ہٹاو',
    formErrors: {
      languageMin: 'مہربانی کرِتھ اکھ زبان ژارٕو۔',
      topicMin: 'مہربانی کرِتھ کم از کم 10 اَक्षरَن ہُنٛد اَکھ موضوع بیان کریو۔',
    },
  },
  Bengali: {
    cardTitle: 'বিষয়বস্তুর বিবরণ',
    cardDescription: 'আপনি যা তৈরি করতে চান তা বর্ণনা করুন।',
    topicLabel: 'বিষয়',
    topicPlaceholder: 'যেমন, কৃষক এবং বিভিন্ন ধরণের মাটি নিয়ে একটি গল্প',
    languageLabel: 'ভাষা',
    languagePlaceholder: 'একটি ভাষা নির্বাচন করুন',
    generating: 'তৈরি হচ্ছে...',
    generateContent: 'বিষয়বস্তু তৈরি করুন',
    generatedStoryTitle: 'উত্পন্ন গল্প',
    generatedStoryDescription: 'আপনার সাংস্কৃতিকভাবে প্রাসঙ্গিক গল্পটি এখানে উপস্থিত হবে।',
    contentBlocked: 'বিষয়বস্তু অবরুদ্ধ',
    safetyErrorStory: 'নিরাপত্তার কারণে উত্পন্ন বিষয়বস্তু অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে আপনার বিষয় পুনরায় লিখুন এবং আবার চেষ্টা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescriptionStory: 'গল্প তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    emptyState: 'আপনি ফর্ম জমা দেওয়ার পরে আপনার উত্পন্ন বিষয়বস্তু এখানে প্রদর্শিত হবে।',
    generatingVideo: 'ভিডিও তৈরি হচ্ছে...',
    generateVideo: 'ভিডিও ব্যাখ্যা তৈরি করুন',
    videoExplanationTitle: 'ভিডিও ব্যাখ্যা',
    videoGenerationProgress: 'ভিডিও তৈরি হচ্ছে, এতে এক মিনিট সময় লাগতে পারে...',
    safetyErrorVideo: 'নিরাপত্তার কারণে উত্পন্ন ভিডিওটি অবরুদ্ধ করা হয়েছে। গল্পে সংবেদনশীল বিষয়বস্তু থাকতে পারে। অনুগ্রহ করে একটি ভিন্ন গল্প তৈরি করার চেষ্টা করুন।',
    errorDescriptionVideo: 'ভিডিও তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    billingErrorVideo: 'ভিডিও তৈরির জন্য বিলিং সক্ষম সহ একটি গুগল ক্লাউড প্ল্যাটফর্ম প্রকল্প প্রয়োজন। অনুগ্রহ করে আপনার অ্যাকাউন্ট সেটিংস পরীক্ষা করুন।',
    clearButton: 'পরিষ্কার করুন',
    viewHistoryButton: 'ইতিহাস দেখুন',
    historyDialogTitle: 'সংরক্ষিত গল্প',
    historyDialogDescription: 'আপনি অতীতে যে গল্পগুলি তৈরি করেছেন সেগুলি এখানে রয়েছে। আপনি সেগুলি দেখতে, লোড করতে বা মুছতে পারেন।',
    noHistory: 'আপনি এখনও কোন গল্প তৈরি করেননি।',
    loadStoryButton: 'গল্প লোড করুন',
    deleteStoryButton: 'মুছুন',
    formErrors: {
      languageMin: 'অনুগ্রহ করে একটি ভাষা নির্বাচন করুন।',
      topicMin: 'অনুগ্রহ করে কমপক্ষে ১০টি অক্ষরে বিষয়টি বর্ণনা করুন।',
    },
  },
  Tamil: {
    cardTitle: 'உள்ளடக்க விவரங்கள்',
    cardDescription: 'நீங்கள் உருவாக்க விரும்புவதை விவரிக்கவும்.',
    topicLabel: 'தலைப்பு',
    topicPlaceholder: 'எ.கா., விவசாயிகள் மற்றும் பல்வேறு மண் வகைகள் பற்றிய ஒரு கதை',
    languageLabel: 'மொழி',
    languagePlaceholder: 'ஒரு மொழியைத் தேர்ந்தெடுக்கவும்',
    generating: 'உருவாக்குகிறது...',
    generateContent: 'உள்ளடக்கத்தை உருவாக்கு',
    generatedStoryTitle: 'உருவாக்கப்பட்ட கதை',
    generatedStoryDescription: 'உங்கள் கலாச்சார ரீதியாக பொருத்தமான கதை இங்கே தோன்றும்.',
    contentBlocked: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyErrorStory: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட உள்ளடக்கம் தடுக்கப்பட்டது। உங்கள் தலைப்பை மாற்றி மீண்டும் முயற்சிக்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescriptionStory: 'கதையை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    emptyState: 'நீங்கள் படிவத்தை சமர்ப்பித்தவுடன் உங்கள் உருவாக்கப்பட்ட உள்ளடக்கம் இங்கே காட்டப்படும்.',
    generatingVideo: 'வீடியோவை உருவாக்குகிறது...',
    generateVideo: 'வீடியோ விளக்கத்தை உருவாக்கு',
    videoExplanationTitle: 'வீடியோ விளக்கம்',
    videoGenerationProgress: 'வீடியோவை உருவாக்குகிறது, இதற்கு ஒரு நிமிடம் ஆகலாம்...',
    safetyErrorVideo: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட வீடியோ தடுக்கப்பட்டது। கதையில் உணர்ச்சிகரமான உள்ளடக்கம் இருக்கலாம்। தயவுசெய்து வேறு கதையை உருவாக்க முயற்சிக்கவும்।',
    errorDescriptionVideo: 'வீடியோவை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    billingErrorVideo: 'வீடியோ உருவாக்கத்திற்கு பில்லிங் இயக்கப்பட்ட Google Cloud Platform திட்டம் தேவை। உங்கள் கணக்கு அமைப்புகளைச் சரிபார்க்கவும்।',
    clearButton: 'அழி',
    viewHistoryButton: 'வரலாற்றைக் காண்க',
    historyDialogTitle: 'சேமிக்கப்பட்ட கதைகள்',
    historyDialogDescription: 'நீங்கள் கடந்த காலத்தில் உருவாக்கிய கதைகள் இங்கே உள்ளன। நீங்கள் அவற்றைப் பார்க்கலாம், ஏற்றலாம் அல்லது நீக்கலாம்।',
    noHistory: 'நீங்கள் இதுவரை எந்தக் கதையையும் உருவாக்கவில்லை।',
    loadStoryButton: 'கதையை ஏற்று',
    deleteStoryButton: 'நீக்கு',
    formErrors: {
      languageMin: 'தயவுசெய்து ஒரு மொழியைத் தேர்ந்தெடுக்கவும்.',
      topicMin: 'தயவுசெய்து தலைப்பை குறைந்தது 10 எழுத்துக்களில் விவரிக்கவும்.',
    },
  },
  Gujarati: {
    cardTitle: 'સામગ્રી વિગતો',
    cardDescription: 'તમે શું બનાવવા માંગો છો તેનું વર્ણન કરો.',
    topicLabel: 'વિષય',
    topicPlaceholder: 'દા.ત., ખેડૂતો અને વિવિધ માટીના પ્રકારો વિશેની વાર્તા',
    languageLabel: 'ભાષા',
    languagePlaceholder: 'એક ભાષા પસંદ કરો',
    generating: 'બનાવી રહ્યું છે...',
    generateContent: 'સામગ્રી બનાવો',
    generatedStoryTitle: 'બનાવેલી વાર્તા',
    generatedStoryDescription: 'તમારી સાંસ્કૃતિક રીતે સંબંધિત વાર્તા અહીં દેખાશે.',
    contentBlocked: 'સામગ્રી અવરોધિત',
    safetyErrorStory: 'બનાવેલી સામગ્રી સુરક્ષા કારણોસર અવરોધિત કરવામાં આવી હતી. કૃપા કરીને તમારો વિષય ફરીથી લખો અને ફરી પ્રયાસ કરો.',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescriptionStory: 'વાર્તા બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    emptyState: 'તમે ફોર્મ સબમિટ કર્યા પછી તમારી બનાવેલી સામગ્રી અહીં પ્રદર્શિત થશે.',
    generatingVideo: 'વિડિઓ બનાવી રહ્યું છે...',
    generateVideo: 'વિડિઓ સમજૂતી બનાવો',
    videoExplanationTitle: 'વિડિઓ સમજૂતી',
    videoGenerationProgress: 'વિડિઓ બનાવી રહ્યું છે, આમાં એક મિનિટ લાગી શકે છે...',
    safetyErrorVideo: 'બનાવેલ વિડિઓ સુરક્ષા કારણોસર અવરોધિત કરવામાં આવી હતી. વાર્તામાં સંવેદનશીલ સામગ્રી હોઈ શકે છે. કૃપા કરીને અલગ વાર્તા બનાવવાનો પ્રયાસ કરો.',
    errorDescriptionVideo: 'વિડિઓ બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    billingErrorVideo: 'વિડિઓ બનાવવા માટે બિલિંગ સક્ષમ કરેલ Google ક્લાઉડ પ્લેટફોર્મ પ્રોજેક્ટની જરૂર છે. કૃપા કરીને તમારી એકાઉન્ટ સેટિંગ્સ તપાસો.',
    clearButton: 'સાફ કરો',
    viewHistoryButton: 'ઇતિહાસ જુઓ',
    historyDialogTitle: 'સંગ્રહિત વાર્તાઓ',
    historyDialogDescription: 'તમે ભૂતકાળમાં બનાવેલી વાર્તાઓ અહીં છે. તમે તેમને જોઈ, લોડ કરી અથવા કાઢી શકો છો.',
    noHistory: 'તમે હજી સુધી કોઈ વાર્તાઓ બનાવી નથી.',
    loadStoryButton: 'વાર્તા લોડ કરો',
    deleteStoryButton: 'કાઢી નાખો',
    formErrors: {
      languageMin: 'કૃપા કરીને એક ભાષા પસંદ કરો.',
      topicMin: 'કૃપા કરીને ઓછામાં ઓછા 10 અક્ષરોમાં વિષયનું વર્ણન કરો.',
    },
  },
  Malayalam: {
    cardTitle: 'ഉള്ളടക്ക വിശദാംശങ്ങൾ',
    cardDescription: 'നിങ്ങൾ സൃഷ്ടിക്കാൻ ആഗ്രഹിക്കുന്നത് വിവരിക്കുക.',
    topicLabel: 'വിഷയം',
    topicPlaceholder: 'ഉദാഹരണത്തിന്, കർഷകരെയും വിവിധതരം മണ്ണിനെയും കുറിച്ചുള്ള ഒരു കഥ',
    languageLabel: 'ഭാഷ',
    languagePlaceholder: 'ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക',
    generating: 'സൃഷ്ടിക്കുന്നു...',
    generateContent: 'ഉള്ളടക്കം സൃഷ്ടിക്കുക',
    generatedStoryTitle: 'സൃഷ്ടിച്ച കഥ',
    generatedStoryDescription: 'നിങ്ങളുടെ സാംസ്കാരികമായി പ്രസക്തമായ കഥ ഇവിടെ ദൃശ്യമാകും.',
    contentBlocked: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyErrorStory: 'സൃഷ്ടിച്ച ഉള്ളടക്കം സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. ദയവായി നിങ്ങളുടെ വിഷയം മാറ്റി വീണ്ടും ശ്രമിക്കുക.',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescriptionStory: 'കഥ സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    emptyState: 'നിങ്ങൾ ഫോം സമർപ്പിച്ചുകഴിഞ്ഞാൽ നിങ്ങളുടെ സൃഷ്ടിച്ച ഉള്ളടക്കം ഇവിടെ പ്രദർശിപ്പിക്കും.',
    generatingVideo: 'വീഡിയോ സൃഷ്ടിക്കുന്നു...',
    generateVideo: 'വീഡിയോ വിശദീകരണം സൃഷ്ടിക്കുക',
    videoExplanationTitle: 'വീഡിയോ വിശദീകരണം',
    videoGenerationProgress: 'വീഡിയോ സൃഷ്ടിക്കുന്നു, ഇതിന് ഒരു മിനിറ്റ് എടുത്തേക്കാം...',
    safetyErrorVideo: 'സൃഷ്ടിച്ച വീഡിയോ സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. കഥയിൽ സെൻസിറ്റീവ് ഉള്ളടക്കം അടങ്ങിയിരിക്കാം. ദയവായി മറ്റൊരു കഥ സൃഷ്ടിക്കാൻ ശ്രമിക്കുക.',
    errorDescriptionVideo: 'വീഡിയോ സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    billingErrorVideo: 'വീഡിയോ നിർമ്മാണത്തിന് ബില്ലിംഗ് പ്രവർത്തനക്ഷമമാക്കിയ ഒരു ഗൂഗിൾ ക്ലൗഡ് പ്ലാറ്റ്ഫോം പ്രോജക്റ്റ് ആവശ്യമാണ്. ദയവായി നിങ്ങളുടെ അക്കൗണ്ട് ക്രമീകരണങ്ങൾ പരിശോധിക്കുക.',
    clearButton: 'മായ്ക്കുക',
    viewHistoryButton: 'ചരിത്രം കാണുക',
    historyDialogTitle: 'സംഭരിച്ച കഥകൾ',
    historyDialogDescription: 'നിങ്ങൾ മുൻപ് സൃഷ്ടിച്ച കഥകൾ ഇവിടെയുണ്ട്. നിങ്ങൾക്ക് അവ കാണാനും ലോഡുചെയ്യാനും ഇല്ലാതാക്കാനും കഴിയും.',
    noHistory: 'നിങ്ങൾ ഇതുവരെ കഥകളൊന്നും സൃഷ്ടിച്ചിട്ടില്ല.',
    loadStoryButton: 'കഥ ലോഡുചെയ്യുക',
    deleteStoryButton: 'ഇല്ലാതാക്കുക',
    formErrors: {
      languageMin: 'ദയവായി ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക.',
      topicMin: 'ദയവായി കുറഞ്ഞത് 10 പ്രതീകങ്ങളിൽ വിഷയം വിവരിക്കുക.',
    },
  },
  Punjabi: {
    cardTitle: 'ਸਮੱਗਰੀ ਦੇ ਵੇਰਵੇ',
    cardDescription: 'ਦੱਸੋ ਕਿ ਤੁਸੀਂ ਕੀ ਬਣਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ।',
    topicLabel: 'ਵਿਸ਼ਾ',
    topicPlaceholder: 'ਜਿਵੇਂ, ਕਿਸਾਨਾਂ ਅਤੇ ਵੱਖ-ਵੱਖ ਮਿੱਟੀ ਦੀਆਂ ਕਿਸਮਾਂ ਬਾਰੇ ਇੱਕ ਕਹਾਣੀ',
    languageLabel: 'ਭਾਸ਼ਾ',
    languagePlaceholder: 'ਇੱਕ ਭਾਸ਼ਾ ਚੁਣੋ',
    generating: 'ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    generateContent: 'ਸਮੱਗਰੀ ਤਿਆਰ ਕਰੋ',
    generatedStoryTitle: 'ਤਿਆਰ ਕੀਤੀ ਕਹਾਣੀ',
    generatedStoryDescription: 'ਤੁਹਾਡੀ ਸੱਭਿਆਚਾਰਕ ਤੌਰ ਤੇ ਸੰਬੰਧਿਤ ਕਹਾਣੀ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ।',
    contentBlocked: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyErrorStory: 'ਤਿਆਰ ਕੀਤੀ ਸਮੱਗਰੀ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਵਿਸ਼ੇ ਨੂੰ ਦੁਬਾਰਾ ਲਿਖੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescriptionStory: 'ਕਹਾਣੀ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    emptyState: 'ਤੁਹਾਡੇ ਦੁਆਰਾ ਫਾਰਮ ਜਮ੍ਹਾਂ ਕਰਨ ਤੋਂ ਬਾਅਦ ਤੁਹਾਡੀ ਤਿਆਰ ਕੀਤੀ ਸਮੱਗਰੀ ਇੱਥੇ ਪ੍ਰਦਰਸ਼ਿਤ ਕੀਤੀ ਜਾਵੇਗੀ।',
    generatingVideo: 'ਵੀਡੀਓ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    generateVideo: 'ਵੀਡੀਓ ਵਿਆਖਿਆ ਤਿਆਰ ਕਰੋ',
    videoExplanationTitle: 'ਵੀਡੀਓ ਵਿਆਖਿਆ',
    videoGenerationProgress: 'ਵੀਡੀਓ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ, ਇਸ ਵਿੱਚ ਇੱਕ ਮਿੰਟ ਲੱਗ ਸਕਦਾ ਹੈ...',
    safetyErrorVideo: 'ਤਿਆਰ ਕੀਤੇ ਗਏ ਵੀਡੀਓ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਹਾਣੀ ਵਿੱਚ ਸੰਵੇਦਨਸ਼ੀਲ ਸਮੱਗਰੀ ਹੋ ਸਕਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰੀ ਕਹਾਣੀ ਤਿਆਰ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errorDescriptionVideo: 'ਵੀਡੀਓ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    billingErrorVideo: 'ਵੀਡੀਓ ਬਣਾਉਣ ਲਈ ਬਿਲਿੰਗ ਸਮਰਥਿਤ Google ਕਲਾਉਡ ਪਲੇਟਫਾਰਮ ਪ੍ਰੋਜੈਕਟ ਦੀ ਲੋੜ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਦੀ ਜਾਂਚ ਕਰੋ।',
    clearButton: 'ਸਾਫ਼ ਕਰੋ',
    viewHistoryButton: 'ਇਤਿਹਾਸ ਵੇਖੋ',
    historyDialogTitle: 'ਸਟੋਰ ਕੀਤੀਆਂ ਕਹਾਣੀਆਂ',
    historyDialogDescription: 'ਇੱਥੇ ਉਹ ਕਹਾਣੀਆਂ ਹਨ ਜੋ ਤੁਸੀਂ ਪਿਛਲੇ ਸਮੇਂ ਵਿੱਚ ਤਿਆਰ ਕੀਤੀਆਂ ਹਨ। ਤੁਸੀਂ ਉਹਨਾਂ ਨੂੰ ਵੇਖ ਸਕਦੇ ਹੋ, ਲੋਡ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ ਮਿਟਾ ਸਕਦੇ ਹੋ।',
    noHistory: 'ਤੁਸੀਂ ਹਾਲੇ ਤੱਕ ਕੋਈ ਕਹਾਣੀ ਨਹੀਂ ਬਣਾਈ ਹੈ।',
    loadStoryButton: 'ਕਹਾਣੀ ਲੋਡ ਕਰੋ',
    deleteStoryButton: 'ਮਿਟਾਓ',
    formErrors: {
      languageMin: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਭਾਸ਼ਾ ਚੁਣੋ।',
      topicMin: 'ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰਾਂ ਵਿੱਚ ਵਿਸ਼ੇ ਦਾ ਵਰਣਨ ਕਰੋ।',
    },
  },
  Odia: {
    cardTitle: 'ବିଷୟବସ୍ତୁ ବିବରଣୀ',
    cardDescription: 'ଆପଣ କଣ ସୃଷ୍ଟି କରିବାକୁ ଚାହୁଁଛନ୍ତି ତାହା ବର୍ଣ୍ଣନା କରନ୍ତୁ।',
    topicLabel: 'ବିଷୟ',
    topicPlaceholder: 'ଉଦାହରଣ ସ୍ୱରୂପ, କୃଷକ ଏବଂ ବିଭିନ୍ନ ପ୍ରକାରର ମାଟି ବିଷୟରେ ଏକ କାହାଣୀ',
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
    billingErrorVideo: 'ଭିଡିଓ ସୃଷ୍ଟି ପାଇଁ ବିଲିଂ ସକ୍ଷମ ଥିବା ଏକ ଗୁଗୁଲ୍ କ୍ଲାଉଡ୍ ପ୍ଲାଟଫର୍ମ ପ୍ରୋଜେକ୍ଟ ଆବଶ୍ୟକ। ଦୟାକରି ଆପଣଙ୍କର ଆକାଉଣ୍ଟ୍ ସେଟିଂସ ଯାଞ୍ଚ କରନ୍ତୁ।',
    clearButton: 'ସଫା କରନ୍ତୁ',
    viewHistoryButton: 'ଇତିହାସ ଦେଖନ୍ତୁ',
    historyDialogTitle: 'ସଂରକ୍ଷିତ କାହାଣୀ',
    historyDialogDescription: 'ଏଠାରେ ସେହି କାହାଣୀଗୁଡିକ ଅଛି ଯାହା ଆପଣ ଅତୀତରେ ସୃଷ୍ଟି କରିଛନ୍ତି। ଆପଣ ସେଗୁଡିକୁ ଦେଖିପାରିବେ, ଲୋଡ୍ କରିପାରିବେ କିମ୍ବା ବିଲୋପ କରିପାରିବେ।',
    noHistory: 'ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି କାହାଣୀ ସୃଷ୍ଟି କରିନାହାଁନ୍ତି।',
    loadStoryButton: 'କାହାଣୀ ଲୋଡ୍ କରନ୍ତୁ',
    deleteStoryButton: 'ବିଲୋପ କରନ୍ତୁ',
    formErrors: {
      languageMin: 'ଦୟାକରି ଏକ ଭାଷା ବାଛନ୍ତୁ।',
      topicMin: 'ଦୟାକରି ଅତିକମରେ ୧୦ଟି ଅକ୍ଷରରେ ବିଷୟ ବର୍ଣ୍ଣନା କରନ୍ତୁ।',
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
    generatedStoryDescription: 'আপোনাৰ সাংস্কৃতিকভাৱে প্ৰাসংগিক কাহিনীটো ইয়াত দেখা যাব।',
    contentBlocked: 'বিষয়বস্তু অৱৰোধিত',
    safetyErrorStory: 'সৃষ্ট বিষয়বস্তুটো সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি আপোনাৰ বিষয়টো পুনৰ লিখক আৰু পুনৰ চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescriptionStory: 'কাহিনী সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    emptyState: 'আপুনি ফৰ্মখন দাখিল কৰাৰ পিছত আপোনাৰ সৃষ্ট বিষয়বস্তু ইয়াত প্ৰদৰ্শিত হ’ব।',
    generatingVideo: 'ভিডিঅ’ সৃষ্টি কৰি আছে...',
    generateVideo: 'ভিডিঅ’ ব্যাখ্যা সৃষ্টি কৰক',
    videoExplanationTitle: 'ভিডিঅ’ ব্যাখ্যা',
    videoGenerationProgress: 'ভিডিঅ’ সৃষ্টি কৰি আছে, ইয়াত এক মিনিট সময় লাগিব পাৰে...',
    safetyErrorVideo: 'সৃষ্ট ভিডিঅ’টো সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। কাহিনীটোত সংবেদনশীল বিষয়বস্তু থাকিব পাৰে। অনুগ্ৰহ কৰি এটা বেলেগ কাহিনী সৃষ্টি কৰিবলৈ চেষ্টা কৰক।',
    errorDescriptionVideo: 'ভিডিঅ’ সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    billingErrorVideo: 'ভিডিঅ’ সৃষ্টিৰ বাবে বিলিং সক্ষম থকা এটা গুগল ক্লাউড প্লেটফৰ্ম প্ৰকল্পৰ প্ৰয়োজন। অনুগ্ৰহ কৰি আপোনাৰ একাউণ্ট ছেটিংছ পৰীক্ষা কৰক।',
    clearButton: 'পৰিষ্কাৰ কৰক',
    viewHistoryButton: 'ইতিহাস চাওক',
    historyDialogTitle: 'সংৰক্ষিত কাহিনী',
    historyDialogDescription: 'ইয়াত সেইবোৰ কাহিনী আছে যিবোৰ আপুনি অতীতত সৃষ্টি কৰিছে। আপুনি সেইবোৰ চাব, লোড কৰিব বা মচি পেলাব পাৰে।',
    noHistory: 'আপুনি এতিয়ালৈকে কোনো কাহিনী সৃষ্টি কৰা নাই।',
    loadStoryButton: 'কাহিনী লোড কৰক',
    deleteStoryButton: 'মচি পেলাওক',
    formErrors: {
      languageMin: 'অনুগ্ৰহ কৰি এটা ভাষা বাছনি কৰক।',
      topicMin: 'অনুগ্ৰহ কৰি বিষয়টো কমেও ১০টা আখৰত বৰ্ণনা কৰক।',
    },
  },
  Kannada: {
    cardTitle: 'ವಿಷಯದ ವಿವರಗಳು',
    cardDescription: 'ನೀವು ಏನನ್ನು ರಚಿಸಲು ಬಯಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ವಿವರಿಸಿ.',
    topicLabel: 'ವಿಷಯ',
    topicPlaceholder: 'ಉದಾ., ರೈತರು ಮತ್ತು ವಿವಿಧ ಮಣ್ಣಿನ ಪ್ರಕಾರಗಳ ಬಗ್ಗೆ ಒಂದು ಕಥೆ',
    languageLabel: 'ಭಾಷೆ',
    languagePlaceholder: 'ಒಂದು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    generating: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    generateContent: 'ವಿಷಯವನ್ನು ರಚಿಸಿ',
    generatedStoryTitle: 'ರಚಿಸಲಾದ ಕಥೆ',
    generatedStoryDescription: 'ನಿಮ್ಮ ಸಾಂಸ್ಕೃತಿಕವಾಗಿ ಸಂಬಂಧಿತ ಕಥೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    contentBlocked: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyErrorStory: 'ರಚಿಸಲಾದ ವಿಷಯವನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿಷಯವನ್ನು ಮರುರೂಪಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescriptionStory: 'ಕಥೆಯನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    emptyState: 'ನೀವು ಫಾರ್ಮ್ ಅನ್ನು ಸಲ್ಲಿಸಿದ ನಂತರ ನಿಮ್ಮ ರಚಿಸಲಾದ ವಿಷಯ ಇಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ.',
    generatingVideo: 'ವೀಡಿಯೊವನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    generateVideo: 'ವೀಡಿಯೊ ವಿವರಣೆಯನ್ನು ರಚಿಸಿ',
    videoExplanationTitle: 'ವೀಡಿಯೊ ವಿವರಣೆ',
    videoGenerationProgress: 'ವೀಡಿಯೊವನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ, ಇದಕ್ಕೆ ಒಂದು ನಿಮಿಷ ತೆಗೆದುಕೊಳ್ಳಬಹುದು...',
    safetyErrorVideo: 'ರಚಿಸಲಾದ ವೀಡಿಯೊವನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಕಥೆಯಲ್ಲಿ ಸೂಕ್ಷ್ಮ ವಿಷಯವಿರಬಹುದು. ದಯವಿಟ್ಟು ಬೇರೆ ಕಥೆಯನ್ನು ರಚಿಸಲು ಪ್ರಯತ್ನಿಸಿ.',
    errorDescriptionVideo: 'ವೀಡಿಯೊವನ್ನು ರಚಿಸಲು విఫలವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    billingErrorVideo: 'ವೀಡಿಯೊ ರಚನೆಗೆ ಬಿಲ್ಲಿಂಗ್ ಸಕ್ರಿಯಗೊಳಿಸಿದ Google Cloud Platform ಯೋಜನೆ ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    clearButton: 'ಅಳಿಸಿ',
    viewHistoryButton: 'ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ',
    historyDialogTitle: 'ಸಂಗ್ರಹಿಸಲಾದ ಕಥೆಗಳು',
    historyDialogDescription: 'ನೀವು ಹಿಂದೆ ರಚಿಸಿದ ಕಥೆಗಳು ಇಲ್ಲಿವೆ. ನೀವು ಅವುಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು, ಲೋಡ್ ಮಾಡಬಹುದು ಅಥವಾ ಅಳಿಸಬಹುದು.',
    noHistory: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಕಥೆಗಳನ್ನು ರಚಿಸಿಲ್ಲ.',
    loadStoryButton: 'ಕಥೆಯನ್ನು ಲೋಡ್ ಮಾಡಿ',
    deleteStoryButton: 'ಅಳಿಸಿ',
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
    generatedStoryDescription: 'మీ సాంస్కృతికంగా సంబంధిత కథ ఇక్కడ కనిపిస్తుంది.',
    contentBlocked: 'విషయం బ్లాక్ చేయబడింది',
    safetyErrorStory: 'భద్రతా కారణాల వల్ల సృష్టించబడిన విషయం బ్లాక్ చేయబడింది. దయచేసి మీ అంశాన్ని తిరిగి వ్రాసి మళ్లీ ప్రయత్నించండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescriptionStory: 'కథను సృష్టించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    emptyState: 'మీరు ఫారమ్‌ను సమర్పించిన తర్వాత మీ సృష్టించబడిన విషయం ఇక్కడ ప్రదర్శించబడుతుంది.',
    generatingVideo: 'వీడియోను సృష్టిస్తోంది...',
    generateVideo: 'వీడియో వివరణను సృష్టించండి',
    videoExplanationTitle: 'వీడియో వివరణ',
    videoGenerationProgress: 'వీడియోను సృష్టిస్తోంది, దీనికి ఒక నిమిషం పట్టవచ్చు...',
    safetyErrorVideo: 'భద్రతా కారణాల వల్ల సృష్టించబడిన వీడియో బ్లాక్ చేయబడింది. కథలో సున్నితమైన విషయం ఉండవచ్చు. దయచేసి వేరే కథను సృష్టించడానికి ప్రయత్నించండి.',
    errorDescriptionVideo: 'వీడియోను సృష్టించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    billingErrorVideo: 'వీడియో సృష్టికి బిల్లింగ్ ప్రారంభించబడిన Google Cloud Platform ప్రాజెక్ట్ అవసరం. దయచేసి మీ ఖాతా సెట్టింగ్‌లను తనిఖీ చేయండి.',
    clearButton: 'తొలగించు',
    viewHistoryButton: 'చరిత్రను వీక్షించండి',
    historyDialogTitle: 'నిల్వ చేసిన కథలు',
    historyDialogDescription: 'మీరు గతంలో సృష్టించిన కథలు ఇక్కడ ఉన్నాయి. మీరు వాటిని వీక్షించవచ్చు, లోడ్ చేయవచ్చు లేదా తొలగించవచ్చు.',
    noHistory: 'మీరు ఇంకా ఏ కథలను సృష్టించలేదు.',
    loadStoryButton: 'కథను లోడ్ చేయండి',
    deleteStoryButton: 'తొలగించు',
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
  const [history, setHistory] = useState<StoredStory[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
      loadHistory();
    }
  }, [isClient]);
  
  const loadHistory = () => {
    try {
      const storedHistory = localStorage.getItem('storyHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse storyHistory from localStorage', error);
      localStorage.removeItem('storyHistory');
    }
  };

  const saveToHistory = (newStory: StoredStory) => {
    const updatedHistory = [newStory, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('storyHistory', JSON.stringify(updatedHistory));
  };
  
  const deleteFromHistory = (storyId: string) => {
    const updatedHistory = history.filter(story => story.id !== storyId);
    setHistory(updatedHistory);
    localStorage.setItem('storyHistory', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (story: StoredStory) => {
    form.setValue('topic', story.topic);
    form.setValue('language', story.language);
    setResult({ story: story.story });
    setVideoUrl(null);
    setError(null);
    setVideoError(null);
    setIsHistoryOpen(false);
  };

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
      saveToHistory({ ...values, ...storyResult, id: new Date().toISOString() });
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
       if (e.message.includes('billing enabled')) {
        setVideoError(t.billingErrorVideo);
      } else if (e.message.includes('SAFETY')) {
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
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isLoading || isGeneratingVideo} className="w-full">
                  {isLoading ? t.generating : t.generateContent}
                </Button>
                 <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <History className="mr-2 h-4 w-4" /> {t.viewHistoryButton}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                        <DialogTitle>{t.historyDialogTitle}</DialogTitle>
                        <DialogDescription>{t.historyDialogDescription}</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                        <div className="space-y-4 pr-4">
                            {history.length > 0 ? (
                            history.map(story => (
                                <Card key={story.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{story.topic}</CardTitle>
                                    <CardDescription>{story.language}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground line-clamp-2">
                                    {story.story}
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button size="sm" onClick={() => loadFromHistory(story)}>
                                        {t.loadStoryButton}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteFromHistory(story.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                                </Card>
                            ))
                            ) : (
                            <p className="text-center text-muted-foreground">{t.noHistory}</p>
                            )}
                        </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
              </div>
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

    

    