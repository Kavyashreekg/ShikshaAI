'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { designVisualAid, DesignVisualAidOutput } from '@/ai/flows/design-visual-aid';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Paintbrush, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    cardTitle: 'Aid Description',
    cardDescription: 'Describe the drawing or chart you need.',
    formLabel: 'Visual Description',
    formPlaceholder: 'e.g., A simple diagram of the water cycle with labels for evaporation, condensation, and precipitation.',
    buttonText: 'Design Aid',
    buttonLoadingText: 'Designing...',
    resultsTitle: 'Generated Visual Aid',
    resultsDescription: 'A simple image you can draw on the blackboard.',
    emptyState: 'Your generated visual aid will appear here.',
    blockedTitle: 'Image Blocked',
    blockedDescription: 'The generated image was blocked for safety reasons. Please change your description and try again.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate the visual aid. Please try again.',
    formErrors: {
      descriptionMin: 'Please describe the visual aid in at least 10 characters.',
    },
  },
  Hindi: {
    cardTitle: 'सहायता विवरण',
    cardDescription: 'आपको जिस ड्राइंग या चार्ट की आवश्यकता है उसका वर्णन करें।',
    formLabel: 'दृश्य विवरण',
    formPlaceholder: 'उदा., वाष्पीकरण, संघनन और वर्षा के लिए लेबल के साथ जल चक्र का एक सरल चित्र।',
    buttonText: 'सहायता डिज़ाइन करें',
    buttonLoadingText: 'डिज़ाइन हो रहा है...',
    resultsTitle: 'उत्पन्न दृश्य सहायता',
    resultsDescription: 'एक सरल छवि जिसे आप ब्लैकबोर्ड पर बना सकते हैं।',
    emptyState: 'आपकी उत्पन्न दृश्य सहायता यहाँ दिखाई देगी।',
    blockedTitle: 'छवि अवरुद्ध',
    blockedDescription: 'सुरक्षा कारणों से उत्पन्न छवि को अवरुद्ध कर दिया गया था। कृपया अपना विवरण बदलें और पुनः प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'दृश्य सहायता उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    formErrors: {
      descriptionMin: 'कृपया कम से कम 10 वर्णों में दृश्य सहायता का वर्णन करें।',
    },
  },
  Marathi: {
    cardTitle: 'मदत वर्णन',
    cardDescription: 'तुम्हाला आवश्यक असलेल्या रेखाचित्र किंवा चार्टचे वर्णन करा.',
    formLabel: 'दृश्यक वर्णन',
    formPlaceholder: 'उदा., बाष्पीभवन, संघनन आणि पर्जन्यवृष्टीसाठी लेबल्स असलेले जलचक्राचे एक साधे चित्र.',
    buttonText: 'मदत डिझाइन करा',
    buttonLoadingText: 'डिझाइन करत आहे...',
    resultsTitle: 'तयार केलेली दृश्यक मदत',
    resultsDescription: 'एक साधी प्रतिमा जी तुम्ही फळ्यावर काढू शकता.',
    emptyState: 'तुमची तयार केलेली दृश्यक मदत येथे दिसेल.',
    blockedTitle: 'प्रतिमा अवरोधित',
    blockedDescription: 'सुरक्षेच्या कारणास्तव तयार केलेली प्रतिमा अवरोधित केली गेली. कृपया तुमचे वर्णन बदला आणि पुन्हा प्रयत्न करा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'दृश्यक मदत तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    formErrors: {
      descriptionMin: 'कृपया दृश्यक मदतीचे किमान १० वर्णांमध्ये वर्णन करा.',
    },
  },
  Kashmiri: {
    cardTitle: 'امدادٕچ تفصیل',
    cardDescription: 'اَتھ ڈرائنگ یا چارٹٕچ تفصیل دِیُت یُس توٚہہِ ضرورت چھُ۔',
    formLabel: 'بصری تفصیل',
    formPlaceholder: 'مثلن، بخارات، کنڈنسیشن، تہٕ پریسیپٹیشن خٲطرٕ لیبل سٟتؠ آب چکرُک اَکھ سادٕ ڈایاگرام۔',
    buttonText: 'امداد ڈیزائن کریو',
    buttonLoadingText: 'ڈیزائن کران...',
    resultsTitle: 'تیار کرنہٕ آمٕژ بصری امداد',
    resultsDescription: 'اَکھ سادٕ تصویر یۄس توہہِ بلیک بورڈس پؠٹھ بَناوِتھ ہیٚکِو۔',
    emptyState: 'توٚہنٛز تیار کرنہٕ آمٕژ بصری امداد ییٚتہِ ظٲہر گژھہِ۔',
    blockedTitle: 'تصویر بلاک کرنہٕ آمٕژ',
    blockedDescription: 'تیار کرنہٕ آمٕژ تصویر آیہِ حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ پنُن تفصیل بدلاو تہٕ دوبارٕ کوشش کریو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescription: 'بصری امداد تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    formErrors: {
      descriptionMin: 'مہربانی کرِتھ بصری امدادٕچ کم از کم 10 اَक्षरَن مَنٛز وضاحت کریو۔',
    },
  },
  Bengali: {
    cardTitle: 'সহায়তার বিবরণ',
    cardDescription: 'আপনার প্রয়োজনীয় অঙ্কন বা চার্ট বর্ণনা করুন।',
    formLabel: 'ভিজ্যুয়াল বর্ণনা',
    formPlaceholder: 'যেমন, বাষ্পীভবন, ঘনীভবন এবং বৃষ্টিপাতের জন্য লেবেল সহ জলচক্রের একটি সহজ চিত্র।',
    buttonText: 'সহায়তা ডিজাইন করুন',
    buttonLoadingText: 'ডিজাইন করা হচ্ছে...',
    resultsTitle: 'উত্পন্ন ভিজ্যুয়াল সহায়তা',
    resultsDescription: 'একটি সাধারণ ছবি যা আপনি ব্ল্যাকবোর্ডে আঁকতে পারেন।',
    emptyState: 'আপনার উত্পন্ন ভিজ্যুয়াল সহায়তা এখানে প্রদর্শিত হবে।',
    blockedTitle: 'ছবি অবরুদ্ধ',
    blockedDescription: 'নিরাপত্তার কারণে উত্পন্ন ছবিটি অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে আপনার বর্ণনা পরিবর্তন করুন এবং আবার চেষ্টা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescription: 'ভিজ্যুয়াল সহায়তা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    formErrors: {
      descriptionMin: 'অনুগ্রহ করে কমপক্ষে ১০টি অক্ষরে ভিজ্যুয়াল সহায়তা বর্ণনা করুন।',
    },
  },
  Tamil: {
    cardTitle: 'உதவி விளக்கம்',
    cardDescription: 'உங்களுக்குத் தேவையான வரைபடம் அல்லது விளக்கப்படத்தை விவரிக்கவும்.',
    formLabel: 'காட்சி விளக்கம்',
    formPlaceholder: 'எ.கா., ஆவியாதல், ஒடுக்கம் மற்றும் மழைப்பொழிவுக்கான லேபிள்களுடன் நீர் சுழற்சியின் ஒரு எளிய வரைபடம்.',
    buttonText: 'உதவியை வடிவமை',
    buttonLoadingText: 'வடிவமைக்கிறது...',
    resultsTitle: 'உருவாக்கப்பட்ட காட்சி உதவி',
    resultsDescription: 'நீங்கள் கரும்பலகையில் வரையக்கூடிய ஒரு எளிய படம்.',
    emptyState: 'உங்களால் உருவாக்கப்பட்ட காட்சி உதவி இங்கே தோன்றும்.',
    blockedTitle: 'படம் தடுக்கப்பட்டது',
    blockedDescription: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட படம் தடுக்கப்பட்டது। உங்கள் விளக்கத்தை மாற்றி மீண்டும் முயற்சிக்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescription: 'காட்சி உதவியை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    formErrors: {
      descriptionMin: 'தயவுசெய்து காட்சி உதவியை குறைந்தது 10 எழுத்துக்களில் விவரிக்கவும்.',
    },
  },
  Gujarati: {
    cardTitle: 'સહાય વર્ણન',
    cardDescription: 'તમને જોઈતા ચિત્ર અથવા ચાર્ટનું વર્ણન કરો.',
    formLabel: 'દ્રશ્ય વર્ણન',
    formPlaceholder: 'દા.ત., બાષ્પીભવન, ઘનીકરણ અને વરસાદ માટે લેબલ સાથે જળ ચક્રનો એક સરળ આકૃતિ.',
    buttonText: 'સહાય ડિઝાઇન કરો',
    buttonLoadingText: 'ડિઝાઇન કરી રહ્યું છે...',
    resultsTitle: 'ઉત્પન્ન દ્રશ્ય સહાય',
    resultsDescription: 'એક સરળ છબી જે તમે બ્લેકબોર્ડ પર દોરી શકો છો.',
    emptyState: 'તમારી ઉત્પન્ન દ્રશ્ય સહાય અહીં દેખાશે.',
    blockedTitle: 'છબી અવરોધિત',
    blockedDescription: 'ઉત્પન્ન છબી સુરક્ષા કારણોસર અવરોધિત કરવામાં આવી હતી. કૃપા કરીને તમારું વર્ણન બદલો અને ફરીથી પ્રયાસ કરો.',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescription: 'દ્રશ્ય સહાય બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    formErrors: {
      descriptionMin: 'કૃપા કરીને દ્રશ્ય સહાયનું ઓછામાં ઓછું 10 અક્ષરોમાં વર્ણન કરો.',
    },
  },
  Malayalam: {
    cardTitle: 'സഹായ വിവരണം',
    cardDescription: 'നിങ്ങൾക്ക് ആവശ്യമുള്ള ചിത്രം അല്ലെങ്കിൽ ചാർട്ട് വിവരിക്കുക.',
    formLabel: 'ദൃശ്യ വിവരണം',
    formPlaceholder: 'ഉദാഹരണത്തിന്, ബാഷ്പീകരണം, ഘനീകരണം, മഴ എന്നിവയ്ക്കുള്ള ലേബലുകളുള്ള ജലചക്രത്തിന്റെ ലളിതമായ ഒരു രേഖാചിത്രം.',
    buttonText: 'സഹായം രൂപകൽപ്പന ചെയ്യുക',
    buttonLoadingText: 'രൂപകൽപ്പന ചെയ്യുന്നു...',
    resultsTitle: 'സൃഷ്ടിച്ച ദൃശ്യ സഹായം',
    resultsDescription: 'ബ്ലാക്ക്ബോർഡിൽ നിങ്ങൾക്ക് വരയ്ക്കാൻ കഴിയുന്ന ഒരു ലളിതമായ ചിത്രം.',
    emptyState: 'നിങ്ങൾ സൃഷ്ടിച്ച ദൃശ്യ സഹായം ഇവിടെ ദൃശ്യമാകും.',
    blockedTitle: 'ചിത്രം തടഞ്ഞു',
    blockedDescription: 'സൃഷ്ടിച്ച ചിത്രം സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. ദയവായി നിങ്ങളുടെ വിവരണം മാറ്റി വീണ്ടും ശ്രമിക്കുക.',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescription: 'ദൃശ്യ സഹായം സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    formErrors: {
      descriptionMin: 'ദയവായി ദൃശ്യ സഹായം കുറഞ്ഞത് 10 അക്ഷരങ്ങളിൽ വിവരിക്കുക.',
    },
  },
  Punjabi: {
    cardTitle: 'ਸਹਾਇਤਾ ਵੇਰਵਾ',
    cardDescription: 'ਤੁਹਾਨੂੰ ਲੋੜੀਂਦੀ ਡਰਾਇੰਗ ਜਾਂ ਚਾਰਟ ਦਾ ਵਰਣਨ ਕਰੋ।',
    formLabel: 'ਵਿਜ਼ੂਅਲ ਵੇਰਵਾ',
    formPlaceholder: 'ਜਿਵੇਂ, ਵਾਸ਼ਪੀਕਰਨ, ਸੰਘਣਾਪਣ ਅਤੇ ਵਰਖਾ ਲਈ ਲੇਬਲ ਵਾਲਾ ਪਾਣੀ ਦੇ ਚੱਕਰ ਦਾ ਇੱਕ ਸਧਾਰਨ ਚਿੱਤਰ।',
    buttonText: 'ਸਹਾਇਤਾ ਡਿਜ਼ਾਈਨ ਕਰੋ',
    buttonLoadingText: 'ਡਿਜ਼ਾਈਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    resultsTitle: 'ਤਿਆਰ ਕੀਤੀ ਵਿਜ਼ੂਅਲ ਸਹਾਇਤਾ',
    resultsDescription: 'ਇੱਕ ਸਧਾਰਨ ਚਿੱਤਰ ਜਿਸਨੂੰ ਤੁਸੀਂ ਬਲੈਕਬੋਰਡ ਤੇ ਬਣਾ ਸਕਦੇ ਹੋ।',
    emptyState: 'ਤੁਹਾਡੀ ਤਿਆਰ ਕੀਤੀ ਵਿਜ਼ੂਅਲ ਸਹਾਇਤਾ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ।',
    blockedTitle: 'ਚਿੱਤਰ ਬਲੌਕ ਕੀਤਾ ਗਿਆ',
    blockedDescription: 'ਤਿਆਰ ਕੀਤੇ ਗਏ ਚਿੱਤਰ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਵੇਰਵਾ ਬਦਲੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescription: 'ਵਿਜ਼ੂਅਲ ਸਹਾਇਤਾ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    formErrors: {
      descriptionMin: 'ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰਾਂ ਵਿੱਚ ਵਿਜ਼ੂਅਲ ਸਹਾਇਤਾ ਦਾ ਵਰਣਨ ਕਰੋ।',
    },
  },
  Odia: {
    cardTitle: 'ସହାୟତା ବିବରଣୀ',
    cardDescription: 'ଆପଣ ଆବଶ୍ୟକ କରୁଥିବା ଚିତ୍ର କିମ୍ବା ଚାର୍ଟ ବର୍ଣ୍ଣନା କରନ୍ତୁ।',
    formLabel: 'ଭିଜୁଆଲ୍ ବିବରଣୀ',
    formPlaceholder: 'ଉଦାହରଣ ସ୍ୱରୂପ, ବାଷ୍ପୀକରଣ, ଘନୀକରଣ, ଏବଂ ବର୍ଷା ପାଇଁ ଲେବଲ୍ ସହିତ ଜଳ ଚକ୍ରର ଏକ ସରଳ ଚିତ୍ର।',
    buttonText: 'ସହାୟତା ଡିଜାଇନ୍ କରନ୍ତୁ',
    buttonLoadingText: 'ଡିଜାଇନ୍ କରୁଛି...',
    resultsTitle: 'ସୃଷ୍ଟି ହୋଇଥିବା ଭିଜୁଆଲ୍ ସହାୟତା',
    resultsDescription: 'ଏକ ସରଳ ପ୍ରତିଛବି ଯାହାକୁ ଆପଣ ବ୍ଲାକବୋର୍ଡରେ ଆଙ୍କିପାରିବେ।',
    emptyState: 'ଆପଣଙ୍କର ସୃଷ୍ଟି ହୋଇଥିବା ଭିଜୁଆଲ୍ ସହାୟତା ଏଠାରେ ଦେଖାଯିବ।',
    blockedTitle: 'ପ୍ରତିଛବି ଅବରୋଧିତ',
    blockedDescription: 'ସୁରକ୍ଷା କାରଣରୁ ସୃଷ୍ଟି ହୋଇଥିବା ପ୍ରତିଛବିକୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଆପଣଙ୍କର ବର୍ଣ୍ଣନା ପରିବର୍ତ୍ତନ କରନ୍ତୁ ଏବଂ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    errorTitle: 'ଏକ ତ୍ରୁଟି ଘଟିଛି।',
    errorDescription: 'ଭିଜୁଆଲ୍ ସହାୟତା ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    formErrors: {
      descriptionMin: 'ଦୟାକରି ଭିଜୁଆଲ୍ ସହାୟତାକୁ ଅତିକମରେ ୧୦ଟି ଅକ୍ଷରରେ ବର୍ଣ୍ଣନା କରନ୍ତୁ।',
    },
  },
  Assamese: {
    cardTitle: 'সহায়ৰ বিৱৰণ',
    cardDescription: 'আপুনি বিচৰা ছবি বা চাৰ্টখন বৰ্ণনা কৰক।',
    formLabel: 'ভিজুৱেল বিৱৰণ',
    formPlaceholder: 'যেনে, বাষ্পীভৱন, ঘনীভৱন আৰু বৰষুণৰ বাবে লেবেল থকা জলচক্ৰৰ এটা সৰল চিত্ৰ।',
    buttonText: 'সহায় ডিজাইন কৰক',
    buttonLoadingText: 'ডিজাইন কৰি আছে...',
    resultsTitle: 'সৃষ্ট ভিজুৱেল সহায়',
    resultsDescription: 'এখন সৰল ছবি যিখন আপুনি ব্লেকব’ৰ্ডত আঁকিব পাৰে।',
    emptyState: 'আপোনাৰ সৃষ্ট ভিজুৱেল সহায় ইয়াত দেখা যাব।',
    blockedTitle: 'ছবি অৱৰোধিত',
    blockedDescription: 'সৃষ্ট ছবিখন সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি আপোনাৰ বিৱৰণ সলনি কৰক আৰু পুনৰ চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescription: 'ভিজুৱেল সহায় সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    formErrors: {
      descriptionMin: 'অনুগ্ৰহ কৰি ভিজুৱেল সহায়ৰ বিষয়ে কমেও ১০টা আখৰত বৰ্ণনা কৰক।',
    },
  },
  Kannada: {
    cardTitle: 'ಸಹಾಯ ವಿವರಣೆ',
    cardDescription: 'ನಿಮಗೆ ಬೇಕಾದ ಚಿತ್ರ ಅಥವಾ ಚಾರ್ಟ್ ಅನ್ನು ವಿವರಿಸಿ.',
    formLabel: 'ದೃಶ್ಯ ವಿವರಣೆ',
    formPlaceholder: 'ಉದಾ., ಬಾಷ್ಪೀಕರಣ, ಸಾಂದ್ರೀಕರಣ ಮತ್ತು ಮಳೆಗಾಗಿ ಲೇಬಲ್‌ಗಳೊಂದಿಗೆ ಜಲ ಚಕ್ರದ ಸರಳ ರೇಖಾಚಿತ್ರ.',
    buttonText: 'ಸಹಾಯವನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸಿ',
    buttonLoadingText: 'ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗುತ್ತಿದೆ...',
    resultsTitle: 'ರಚಿಸಲಾದ ದೃಶ್ಯ ಸಹಾಯ',
    resultsDescription: 'ನೀವು ಕಪ್ಪು ಹಲಗೆಯ ಮೇಲೆ ಚಿತ್ರಿಸಬಹುದಾದ ಸರಳ ಚಿತ್ರ.',
    emptyState: 'ನಿಮ್ಮ ರಚಿಸಲಾದ ದೃಶ್ಯ ಸಹಾಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    blockedTitle: 'ಚಿತ್ರವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    blockedDescription: 'ರಚಿಸಲಾದ ಚಿತ್ರವನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಣೆಯನ್ನು ಬದಲಾಯಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescription: 'ದೃಶ್ಯ ಸಹಾಯವನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    formErrors: {
      descriptionMin: 'ದಯವಿಟ್ಟು ದೃಶ್ಯ ಸಹಾಯವನ್ನು ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳಲ್ಲಿ ವಿವರಿಸಿ.',
    },
  },
  Telugu: {
    cardTitle: 'సహాయం వివరణ',
    cardDescription: 'మీకు అవసరమైన డ్రాయింగ్ లేదా చార్ట్‌ను వివరించండి.',
    formLabel: 'దృశ్య వివరణ',
    formPlaceholder: 'ఉదా., బాష్పీభవనం, ఘనీభవనం మరియు అవపాతం కోసం లేబుల్‌లతో నీటి చక్రం యొక్క సాధారణ రేఖాచిత్రం.',
    buttonText: 'సహాయాన్ని డిజైన్ చేయండి',
    buttonLoadingText: 'డిజైన్ చేస్తోంది...',
    resultsTitle: 'సృష్టించబడిన దృశ్య సహాయం',
    resultsDescription: 'మీరు నల్లబల్లపై గీయగల సాధారణ చిత్రం.',
    emptyState: 'మీరు సృష్టించిన దృశ్య సహాయం ఇక్కడ కనిపిస్తుంది.',
    blockedTitle: 'చిత్రం బ్లాక్ చేయబడింది',
    blockedDescription: 'భద్రతా కారణాల వల్ల సృష్టించబడిన చిత్రం బ్లాక్ చేయబడింది. దయచేసి మీ వివరణను మార్చి మళ్లీ ప్రయత్నించండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescription: 'దృశ్య సహాయాన్ని సృష్టించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    formErrors: {
      descriptionMin: 'దయచేసి దృశ్య సహాయాన్ని కనీసం 10 అక్షరాలలో వివరించండి.',
    },
  },
};

export function VisualAidClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DesignVisualAidOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const formSchema = z.object({
    description: z.string().min(10, t.formErrors.descriptionMin),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const visualAidResult = await designVisualAid(values);
      setResult(visualAidResult);
    } catch (e: any) {
      console.error(e);
       if (e.message.includes('SAFETY')) {
        setError(t.blockedDescription);
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.formLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.formPlaceholder}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t.buttonLoadingText : t.buttonText}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>{t.resultsTitle}</CardTitle>
            <CardDescription>{t.resultsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {isLoading && <Skeleton className="h-80 w-full" />}
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.blockedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && result.visualAid && (
              <Image
                src={result.visualAid}
                alt="Generated visual aid"
                width={500}
                height={500}
                className="rounded-lg border object-contain"
                data-ai-hint="diagram drawing"
              />
            )}
            {!isLoading && !result && !error && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <Paintbrush className="h-16 w-16 mb-4" />
                <p>{t.emptyState}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
