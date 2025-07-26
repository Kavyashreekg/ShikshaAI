'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  instantKnowledgeExplanation,
} from '@/ai/flows/instant-knowledge-explanation';
import { type InstantKnowledgeExplanationOutput } from '@/ai/flows/schemas/instant-knowledge-explanation.schema';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { languages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Sparkles, Volume2, ShieldAlert, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    cardTitle: 'Ask a Question',
    cardDescription: 'Get a simple explanation for any topic.',
    questionLabel: "Student's Question",
    questionPlaceholder: 'e.g., Why is the sky blue?',
    languageLabel: 'Language',
    languagePlaceholder: 'Select a language',
    explainButton: 'Explain',
    thinkingButton: 'Thinking...',
    listenButton: 'Listen to Answer',
    generatingAudioButton: 'Generating Audio...',
    clearButton: 'Clear',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The response was blocked for safety reasons. Please ask a different question.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate the explanation. Please try again.',
    audioErrorDescription: 'Failed to generate audio. Please try again.',
    explanationTitle: 'Explanation',
    explanationPlaceholder: 'The explanation will appear here.',
    analogyTitle: 'Analogy',
    analogyPlaceholder: 'A helpful analogy will appear here.',
    formErrors: {
      languageMin: 'Please select a language.',
      questionMin: 'Please enter a question of at least 10 characters.',
    },
  },
  Hindi: {
    cardTitle: 'प्रश्न पूछें',
    cardDescription: 'किसी भी विषय के लिए सरल स्पष्टीकरण प्राप्त करें।',
    questionLabel: 'छात्र का प्रश्न',
    questionPlaceholder: 'उदा., आकाश नीला क्यों है?',
    languageLabel: 'भाषा',
    languagePlaceholder: 'एक भाषा चुनें',
    explainButton: 'समझाएं',
    thinkingButton: 'सोच रहा है...',
    listenButton: 'उत्तर सुनें',
    generatingAudioButton: 'ऑडियो बना रहा है...',
    clearButton: 'साफ़ करें',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'प्रतिक्रिया को सुरक्षा कारणों से अवरुद्ध कर दिया गया था। कृपया एक अलग प्रश्न पूछें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'स्पष्टीकरण उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    audioErrorDescription: 'ऑडियो उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    explanationTitle: 'स्पष्टीकरण',
    explanationPlaceholder: 'स्पष्टीकरण यहाँ दिखाई देगा।',
    analogyTitle: 'उपमा',
    analogyPlaceholder: 'एक सहायक उपमा यहाँ दिखाई देगी।',
    formErrors: {
      languageMin: 'कृपया एक भाषा चुनें।',
      questionMin: 'कृपया कम से कम 10 वर्णों का प्रश्न दर्ज करें।',
    },
  },
  Marathi: {
    cardTitle: 'प्रश्न विचारा',
    cardDescription: 'कोणत्याही विषयासाठी सोपे स्पष्टीकरण मिळवा.',
    questionLabel: 'विद्यार्थ्याचा प्रश्न',
    questionPlaceholder: 'उदा., आकाश निळे का आहे?',
    languageLabel: 'भाषा',
    languagePlaceholder: 'एक भाषा निवडा',
    explainButton: 'स्पष्ट करा',
    thinkingButton: 'विचार करत आहे...',
    listenButton: 'उत्तर ऐका',
    generatingAudioButton: 'ऑडिओ तयार करत आहे...',
    clearButton: 'साफ करा',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव प्रतिसाद अवरोधित केला गेला. कृपया वेगळा प्रश्न विचारा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'स्पष्टीकरण तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    audioErrorDescription: 'ऑडिओ तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    explanationTitle: 'स्पष्टीकरण',
    explanationPlaceholder: 'स्पष्टीकरण येथे दिसेल.',
    analogyTitle: 'उपमा',
    analogyPlaceholder: 'एक उपयुक्त उपमा येथे दिसेल.',
    formErrors: {
      languageMin: 'कृपया एक भाषा निवडा.',
      questionMin: 'कृपया किमान १० वर्णांचा प्रश्न प्रविष्ट करा.',
    },
  },
  Kashmiri: {
    cardTitle: 'سوال پوچھیو',
    cardDescription: 'کُنہِ تہِ موضوع خٲطرٕ سادٕ وضاحت حٲصِل کریو۔',
    questionLabel: 'طالب علم سُنٛد سوال',
    questionPlaceholder: 'مثلن، آسمان چھُ نیوٗل کیازِ؟',
    languageLabel: 'زبان',
    languagePlaceholder: 'اکھ زبان ژارٕو',
    explainButton: 'وضاحت کریو',
    thinkingButton: 'سوچن...',
    listenButton: 'جواب بوزیو',
    generatingAudioButton: 'آڈیو تیار کران...',
    clearButton: 'صاف کریو',
    contentBlockedTitle: 'مواد بلاک کرنہٕ آمت',
    safetyError: 'جواب آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ اَکھ بیٛاکھ سوال پوچھیو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescription: 'وضاحت تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    audioErrorDescription: 'آڈیو تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    explanationTitle: 'وضاحت',
    explanationPlaceholder: 'وضاحت ییٚتہِ ظٲہر گژھہِ۔',
    analogyTitle: 'مثال',
    analogyPlaceholder: 'اکھ مددگار مثال ییٚتہِ ظٲہر گژھہِ۔',
    formErrors: {
      languageMin: 'مہربانی کرِتھ اکھ زبان ژارٕو۔',
      questionMin: 'مہربانی کرِتھ کم از کم 10 اَक्षरَن ہُنٛد اَکھ سوال دِیو۔',
    },
  },
  Bengali: {
    cardTitle: 'প্রশ্ন জিজ্ঞাসা করুন',
    cardDescription: 'যেকোনো বিষয়ের জন্য সহজ ব্যাখ্যা পান।',
    questionLabel: 'ছাত্রের প্রশ্ন',
    questionPlaceholder: 'যেমন, আকাশ নীল কেন?',
    languageLabel: 'ভাষা',
    languagePlaceholder: 'একটি ভাষা নির্বাচন করুন',
    explainButton: 'ব্যাখ্যা করুন',
    thinkingButton: 'ভাবছে...',
    listenButton: 'উত্তর শুনুন',
    generatingAudioButton: 'অডিও তৈরি হচ্ছে...',
    clearButton: 'পরিষ্কার করুন',
    contentBlockedTitle: 'বিষয়বস্তু অবরুদ্ধ',
    safetyError: 'নিরাপত্তার কারণে প্রতিক্রিয়াটি অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে একটি ভিন্ন প্রশ্ন জিজ্ঞাসা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescription: 'ব্যাখ্যা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    audioErrorDescription: 'অডিও তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    explanationTitle: 'ব্যাখ্যা',
    explanationPlaceholder: 'ব্যাখ্যা এখানে প্রদর্শিত হবে।',
    analogyTitle: 'উপমা',
    analogyPlaceholder: 'একটি সহায়ক উপমা এখানে প্রদর্শিত হবে।',
    formErrors: {
      languageMin: 'অনুগ্রহ করে একটি ভাষা নির্বাচন করুন।',
      questionMin: 'অনুগ্রহ করে কমপক্ষে ১০টি অক্ষরের একটি প্রশ্ন লিখুন।',
    },
  },
  Tamil: {
    cardTitle: 'கேள்வி கேளுங்கள்',
    cardDescription: 'எந்தவொரு தலைப்பிற்கும் எளிய விளக்கத்தைப் பெறுங்கள்.',
    questionLabel: 'மாணவரின் கேள்வி',
    questionPlaceholder: 'எ.கா., வானம் ஏன் நீலமாக உள்ளது?',
    languageLabel: 'மொழி',
    languagePlaceholder: 'ஒரு மொழியைத் தேர்ந்தெடுக்கவும்',
    explainButton: 'விளக்கவும்',
    thinkingButton: 'சிந்திக்கிறது...',
    listenButton: 'பதிலைக் கேட்கவும்',
    generatingAudioButton: 'ஆடியோவை உருவாக்குகிறது...',
    clearButton: 'அழிக்கவும்',
    contentBlockedTitle: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyError: 'பாதுகாப்பு காரணங்களுக்காக பதில் தடுக்கப்பட்டது। தயவுசெய்து வேறு கேள்வியைக் கேட்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescription: 'விளக்கத்தை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    audioErrorDescription: 'ஆடியோவை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    explanationTitle: 'விளக்கம்',
    explanationPlaceholder: 'விளக்கம் இங்கே தோன்றும்.',
    analogyTitle: 'ஒப்புமை',
    analogyPlaceholder: 'ஒரு பயனுள்ள ஒப்புமை இங்கே தோன்றும்.',
    formErrors: {
      languageMin: 'தயவுசெய்து ஒரு மொழியைத் தேர்ந்தெடுக்கவும்.',
      questionMin: 'தயவுசெய்து குறைந்தது 10 எழுத்துகள் கொண்ட ஒரு கேள்வியை உள்ளிடவும்.',
    },
  },
  Gujarati: {
    cardTitle: 'પ્રશ્ન પૂછો',
    cardDescription: 'કોઈપણ વિષય માટે સરળ સમજૂતી મેળવો.',
    questionLabel: 'વિદ્યાર્થીનો પ્રશ્ન',
    questionPlaceholder: 'દા.ત., આકાશ વાદળી કેમ છે?',
    languageLabel: 'ભાષા',
    languagePlaceholder: 'એક ભાષા પસંદ કરો',
    explainButton: 'સમજાવો',
    thinkingButton: 'વિચારી રહ્યું છે...',
    listenButton: 'જવાબ સાંભળો',
    generatingAudioButton: 'ઓડિયો બનાવી રહ્યું છે...',
    clearButton: 'સાફ કરો',
    contentBlockedTitle: 'સામગ્રી અવરોધિત',
    safetyError: 'જવાબ સુરક્ષા કારણોસર અવરોધિત કરવામાં આવ્યો હતો. કૃપા કરીને અલગ પ્રશ્ન પૂછો.',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescription: 'સમજૂતી બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    audioErrorDescription: 'ઓડિયો બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    explanationTitle: 'સમજૂતી',
    explanationPlaceholder: 'સમજૂતી અહીં દેખાશે.',
    analogyTitle: 'ઉપમા',
    analogyPlaceholder: 'એક મદદરૂપ ઉપમા અહીં દેખાશે.',
    formErrors: {
      languageMin: 'કૃપા કરીને એક ભાષા પસંદ કરો.',
      questionMin: 'કૃપા કરીને ઓછામાં ઓછા 10 અક્ષરોનો પ્રશ્ન દાખલ કરો.',
    },
  },
  Malayalam: {
    cardTitle: 'ചോദ്യം ചോദിക്കുക',
    cardDescription: 'ഏത് വിഷയത്തിനും ലളിതമായ വിശദീകരണം നേടുക.',
    questionLabel: 'വിദ്യാർത്ഥിയുടെ ചോദ്യം',
    questionPlaceholder: 'ഉദാഹരണത്തിന്, ആകാശം നീലയായിരിക്കുന്നത് എന്തുകൊണ്ട്?',
    languageLabel: 'ഭാഷ',
    languagePlaceholder: 'ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക',
    explainButton: 'വിശദീകരിക്കുക',
    thinkingButton: 'ചിന്തിക്കുന്നു...',
    listenButton: 'ഉത്തരം കേൾക്കുക',
    generatingAudioButton: 'ഓഡിയോ ഉണ്ടാക്കുന്നു...',
    clearButton: 'മായ്ക്കുക',
    contentBlockedTitle: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyError: 'സുരക്ഷാ കാരണങ്ങളാൽ പ്രതികരണം തടഞ്ഞിരിക്കുന്നു. ദയവായി മറ്റൊരു ചോദ്യം ചോദിക്കുക.',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescription: 'വിശദീകരണം ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    audioErrorDescription: 'ഓഡിയോ ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    explanationTitle: 'വിശദീകരണം',
    explanationPlaceholder: 'വിശദീകരണം ഇവിടെ ദൃശ്യമാകും.',
    analogyTitle: 'ഉപമ',
    analogyPlaceholder: 'സഹായകമായ ഒരു ഉപമ ഇവിടെ ദൃശ്യമാകും.',
    formErrors: {
      languageMin: 'ദയവായി ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക.',
      questionMin: 'ദയവായി കുറഞ്ഞത് 10 അക്ഷരങ്ങളുള്ള ഒരു ചോദ്യം നൽകുക.',
    },
  },
  Punjabi: {
    cardTitle: 'ਸਵਾਲ ਪੁੱਛੋ',
    cardDescription: 'ਕਿਸੇ ਵੀ ਵਿਸ਼ੇ ਲਈ ਇੱਕ ਸਧਾਰਨ ਵਿਆਖਿਆ ਪ੍ਰਾਪਤ ਕਰੋ।',
    questionLabel: 'ਵਿਦਿਆਰਥੀ ਦਾ ਸਵਾਲ',
    questionPlaceholder: 'ਜਿਵੇਂ, ਆਸਮਾਨ ਨੀਲਾ ਕਿਉਂ ਹੈ?',
    languageLabel: 'ਭਾਸ਼ਾ',
    languagePlaceholder: 'ਇੱਕ ਭਾਸ਼ਾ ਚੁਣੋ',
    explainButton: 'ਵਿਆਖਿਆ ਕਰੋ',
    thinkingButton: 'ਸੋਚ ਰਿਹਾ ਹੈ...',
    listenButton: 'ਜਵਾਬ ਸੁਣੋ',
    generatingAudioButton: 'ਆਡੀਓ ਬਣਾ ਰਿਹਾ ਹੈ...',
    clearButton: 'ਸਾਫ਼ ਕਰੋ',
    contentBlockedTitle: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyError: 'ਜਵਾਬ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰਾ ਸਵਾਲ ਪੁੱਛੋ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescription: 'ਵਿਆਖਿਆ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    audioErrorDescription: 'ਆਡੀਓ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    explanationTitle: 'ਵਿਆਖਿਆ',
    explanationPlaceholder: 'ਵਿਆਖਿਆ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ।',
    analogyTitle: 'ਉਪਮਾ',
    analogyPlaceholder: 'ਇੱਕ ਮਦਦਗਾਰ ਉਪਮਾ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ।',
    formErrors: {
      languageMin: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਭਾਸ਼ਾ ਚੁਣੋ।',
      questionMin: 'ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰਾਂ ਦਾ ਇੱਕ ਸਵਾਲ ਦਾਖਲ ਕਰੋ।',
    },
  },
  Odia: {
    cardTitle: 'ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ',
    cardDescription: 'ଯେକୌଣସି ବିଷୟ ପାଇଁ ଏକ ସରଳ ବ୍ୟାଖ୍ୟା ପାଆନ୍ତୁ।',
    questionLabel: 'ଛାତ୍ରଙ୍କ ପ୍ରଶ୍ନ',
    questionPlaceholder: 'ଉଦାହରଣ ସ୍ୱରୂପ, ଆକାଶ କାହିଁକି ନୀଳ?',
    languageLabel: 'ଭାଷା',
    languagePlaceholder: 'ଏକ ଭାଷା ବାଛନ୍ତୁ',
    explainButton: 'ବ୍ୟାଖ୍ୟା କରନ୍ତୁ',
    thinkingButton: 'ଚିନ୍ତା କରୁଛି...',
    listenButton: 'ଉତ୍ତର ଶୁଣନ୍ତୁ',
    generatingAudioButton: 'ଅଡିଓ ତିଆରି କରୁଛି...',
    clearButton: 'ସଫା କରନ୍ତୁ',
    contentBlockedTitle: 'ବିଷୟବସ୍ତୁ ଅବରୋଧିତ',
    safetyError: 'ପ୍ରତିକ୍ରିୟାକୁ ସୁରକ୍ଷା କାରଣରୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଏକ ଭିନ୍ନ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।',
    errorTitle: 'ଏକ ତ୍ରୁଟି ଘଟିଛି।',
    errorDescription: 'ବ୍ୟାଖ୍ୟା ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    audioErrorDescription: 'ଅଡିଓ ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    explanationTitle: 'ବ୍ୟାଖ୍ୟା',
    explanationPlaceholder: 'ବ୍ୟାଖ୍ୟା ଏଠାରେ ଦେଖାଯିବ।',
    analogyTitle: 'ଅନୁରୂପତା',
    analogyPlaceholder: 'ଏକ ସହାୟକ ଅନୁରୂପତା ଏଠାରେ ଦେଖାଯିବ।',
    formErrors: {
      languageMin: 'ଦୟାକରି ଏକ ଭାଷା ବାଛନ୍ତୁ।',
      questionMin: 'ଦୟାକରି ଅତିକମରେ ୧୦ଟି ଅକ୍ଷରର ଏକ ପ୍ରଶ୍ନ ପ୍ରବେଶ କରନ୍ତୁ।',
    },
  },
  Assamese: {
    cardTitle: 'প্ৰশ্ন সোধক',
    cardDescription: 'যিকোনো বিষয়ৰ বাবে সৰল ব্যাখ্যা লাভ কৰক।',
    questionLabel: 'শিক্ষাৰ্থীৰ প্ৰশ্ন',
    questionPlaceholder: 'যেনে, আকাশখন নীলা কিয়?',
    languageLabel: 'ভাষা',
    languagePlaceholder: 'এটা ভাষা বাছনি কৰক',
    explainButton: 'ব্যাখ্যা কৰক',
    thinkingButton: 'চিন্তা কৰি আছে...',
    listenButton: 'উত্তৰ শুনক',
    generatingAudioButton: 'অডিঅ’ বনাই আছে...',
    clearButton: 'পৰিষ্কাৰ কৰক',
    contentBlockedTitle: 'বিষয়বস্তু অৱৰোধিত',
    safetyError: 'সুৰক্ষাৰ কাৰণত প্ৰতিক্ৰিয়াটো অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি এটা বেলেগ প্ৰশ্ন সোধক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescription: 'ব্যাখ্যা সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    audioErrorDescription: 'অডিঅ’ সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    explanationTitle: 'ব্যাখ্যা',
    explanationPlaceholder: 'ব্যাখ্যা ইয়াত দেখা যাব।',
    analogyTitle: 'সাদৃশ্য',
    analogyPlaceholder: 'ইয়াত এটা সহায়ক সাদৃশ্য দেখা যাব।',
    formErrors: {
      languageMin: 'অনুগ্ৰহ কৰি এটা ভাষা বাছনি কৰক।',
      questionMin: 'অনুগ্ৰহ কৰি কমেও ১০টা আখৰৰ এটা প্ৰশ্ন দিয়ক।',
    },
  },
  Kannada: {
    cardTitle: 'ಪ್ರಶ್ನೆ ಕೇಳಿ',
    cardDescription: 'ಯಾವುದೇ ವಿಷಯಕ್ಕೆ ಸರಳ ವಿವರಣೆಯನ್ನು ಪಡೆಯಿರಿ.',
    questionLabel: 'ವಿದ್ಯಾರ್ಥಿಯ ಪ್ರಶ್ನೆ',
    questionPlaceholder: 'ಉದಾ., ಆಕಾಶ ಏಕೆ ನೀಲಿಯಾಗಿದೆ?',
    languageLabel: 'ಭಾಷೆ',
    languagePlaceholder: 'ಒಂದು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    explainButton: 'ವಿವರಿಸಿ',
    thinkingButton: 'ಯೋಚಿಸುತ್ತಿದೆ...',
    listenButton: 'ಉತ್ತರವನ್ನು ಆಲಿಸಿ',
    generatingAudioButton: 'ಆಡಿಯೋ ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    clearButton: 'ಅಳಿಸಿ',
    contentBlockedTitle: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyError: 'ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇರೆ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescription: 'ವಿವರಣೆಯನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    audioErrorDescription: 'ಆಡಿಯೋ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    explanationTitle: 'ವಿವರಣೆ',
    explanationPlaceholder: 'ವಿವರಣೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    analogyTitle: 'ಸಾದೃಶ್ಯ',
    analogyPlaceholder: 'ಸಹಾಯಕವಾದ ಸಾದೃಶ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    formErrors: {
      languageMin: 'ದಯವಿಟ್ಟು ಒಂದು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      questionMin: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ.',
    },
  },
  Telugu: {
    cardTitle: 'ప్రశ్న అడగండి',
    cardDescription: 'ఏదైనా అంశానికి సులభమైన వివరణను పొందండి.',
    questionLabel: 'విద్యార్థి ప్రశ్న',
    questionPlaceholder: 'ఉదా., ఆకాశం నీలంగా ఎందుకు ఉంటుంది?',
    languageLabel: 'భాష',
    languagePlaceholder: 'ఒక భాషను ఎంచుకోండి',
    explainButton: 'వివరించండి',
    thinkingButton: 'ఆలోచిస్తోంది...',
    listenButton: 'సమాధానం వినండి',
    generatingAudioButton: 'ఆడియోను సృష్టిస్తోంది...',
    clearButton: 'తొలగించు',
    contentBlockedTitle: 'కంటెంట్ బ్లాక్ చేయబడింది',
    safetyError: 'భద్రతా కారణాల వల్ల ప్రతిస్పందన బ్లాక్ చేయబడింది. దయచేసి వేరే ప్రశ్న అడగండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescription: 'వివరణను సృష్టించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    audioErrorDescription: 'ఆడియోను సృష్టించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    explanationTitle: 'వివరణ',
    explanationPlaceholder: 'వివరణ ఇక్కడ కనిపిస్తుంది.',
    analogyTitle: 'సారూప్యత',
    analogyPlaceholder: 'సహాయకరమైన సారూప్యత ఇక్కడ కనిపిస్తుంది.',
    formErrors: {
      languageMin: 'దయచేసి ఒక భాషను ఎంచుకోండి.',
      questionMin: 'దయచేసి కనీసం 10 అక్షరాల ప్రశ్నను నమోదు చేయండి.',
    },
  },
};


export function KnowledgeBaseClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InstantKnowledgeExplanationOutput | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const formSchema = z.object({
    language: z.string().min(1, t.formErrors.languageMin),
    question: z.string().min(10, t.formErrors.questionMin),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: '',
      question: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setAudioUrl(null);
    setError(null);
    try {
      const explanationResult = await instantKnowledgeExplanation(values);
      setResult(explanationResult);
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('SAFETY')) {
        setError(t.safetyError);
        setResult(null);
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

  async function handleListen() {
    if (!result) return;
    setIsSynthesizing(true);
    setAudioUrl(null);
    try {
      const fullText = `Explanation: ${result.explanation}. Analogy: ${result.analogy}`;
      const audioResult = await textToSpeech({ text: fullText });
      setAudioUrl(audioResult.audio);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t.errorTitle,
        description: t.audioErrorDescription,
      });
    } finally {
      setIsSynthesizing(false);
    }
  }

  function handleClear() {
    setResult(null);
    setAudioUrl(null);
    setError(null);
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
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.questionLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.questionPlaceholder}
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t.thinkingButton : t.explainButton}
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
            <Button onClick={handleClear} variant="outline">
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              <CardTitle>{t.explanationTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {result && <p className="whitespace-pre-wrap">{result.explanation}</p>}
            {!isLoading && !result && !error && <p className="text-muted-foreground">{t.explanationPlaceholder}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-accent" />
              <CardTitle>{t.analogyTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}
            {result && <p className="whitespace-pre-wrap">{result.analogy}</p>}
            {!isLoading && !result && !error && <p className="text-muted-foreground">{t.analogyPlaceholder}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
