'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import {
  createDifferentiatedWorksheet,
  CreateDifferentiatedWorksheetOutput,
} from '@/ai/flows/create-differentiated-worksheet';
import { subjects, grades } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Layers, ShieldAlert, Check, ChevronsUpDown, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';


const translations = {
  English: {
    cardTitle: 'Textbook Page Details',
    cardDescription: 'Upload a photo and provide details.',
    photoLabel: 'Textbook Page Photo',
    uploadPrompt: 'Click to upload image',
    gradeLevelsLabel: 'Grade Levels',
    selectGrades: 'Select grades...',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Select a subject',
    chapterLabel: 'Chapter',
    chapterPlaceholder: 'Select a chapter',
    generateButton: 'Generate Worksheets',
    generatingButton: 'Generating...',
    resultsTitle: 'Generated Worksheets',
    resultsDescription: 'Worksheets tailored for each grade level will appear here.',
    emptyState: 'Your generated worksheets will appear here.',
    noWorksheetsTitle: 'No worksheets generated',
    noWorksheetsDescription: 'The AI could not generate worksheets from the provided image. Please try a clearer image or different page.',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The generated content was blocked for safety reasons. Please try again with a different textbook page.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate worksheets. Please try again.',
    clearButton: 'Clear',
    formErrors: {
      photo: 'Please upload an image file.',
      gradeLevels: 'Please select at least one grade level.',
      subject: 'Please select a subject.',
      chapter: 'Please select a chapter.',
    },
    grades: {
      'Grade 1': 'Grade 1', 'Grade 2': 'Grade 2', 'Grade 3': 'Grade 3', 'Grade 4': 'Grade 4', 'Grade 5': 'Grade 5', 'Grade 6': 'Grade 6', 'Grade 7': 'Grade 7', 'Grade 8': 'Grade 8', 'Grade 9': 'Grade 9', 'Grade 10': 'Grade 10', 'Grade 11': 'Grade 11', 'Grade 12': 'Grade 12',
    },
    command: {
        empty: 'No grades found.',
        placeholder: 'Search grades...',
    }
  },
  Hindi: {
    cardTitle: 'पाठ्यपुस्तक पृष्ठ विवरण',
    cardDescription: 'एक तस्वीर अपलोड करें और विवरण प्रदान करें।',
    photoLabel: 'पाठ्यपुस्तक पृष्ठ फोटो',
    uploadPrompt: 'छवि अपलोड करने के लिए क्लिक करें',
    gradeLevelsLabel: 'ग्रेड स्तर',
    selectGrades: 'ग्रेड चुनें...',
    subjectLabel: 'विषय',
    subjectPlaceholder: 'एक विषय चुनें',
    chapterLabel: 'अध्याय',
    chapterPlaceholder: 'एक अध्याय चुनें',
    generateButton: 'वर्कशीट उत्पन्न करें',
    generatingButton: 'उत्पन्न हो रहा है...',
    resultsTitle: 'उत्पन्न वर्कशीट',
    resultsDescription: 'प्रत्येक ग्रेड स्तर के लिए बनाई गई वर्कशीट यहाँ दिखाई देंगी।',
    emptyState: 'आपकी उत्पन्न वर्कशीट यहाँ दिखाई देंगी।',
    noWorksheetsTitle: 'कोई वर्कशीट उत्पन्न नहीं हुई',
    noWorksheetsDescription: 'एआई प्रदान की गई छवि से वर्कशीट उत्पन्न नहीं कर सका। कृपया एक स्पष्ट छवि या अलग पृष्ठ का प्रयास करें।',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'उत्पन्न सामग्री को सुरक्षा कारणों से अवरुद्ध कर दिया गया था। कृपया एक अलग पाठ्यपुस्तक पृष्ठ के साथ पुनः प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'वर्कशीट उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    clearButton: 'साफ़ करें',
     formErrors: {
      photo: 'कृपया एक छवि फ़ाइल अपलोड करें।',
      gradeLevels: 'कृपया कम से-कम एक ग्रेड स्तर चुनें।',
      subject: 'कृपया एक विषय चुनें।',
      chapter: 'कृपया एक अध्याय चुनें।',
    },
    grades: {
      'Grade 1': 'ग्रेड 1', 'Grade 2': 'ग्रेड 2', 'Grade 3': 'ग्रेड 3', 'Grade 4': 'ग्रेड 4', 'Grade 5': 'ग्रेड 5', 'Grade 6': 'ग्रेड 6', 'Grade 7': 'ग्रेड 7', 'Grade 8': 'ग्रेड 8', 'Grade 9': 'ग्रेड 9', 'Grade 10': 'ग्रेड 10', 'Grade 11': 'ग्रेड 11', 'Grade 12': 'ग्रेड 12',
    },
    command: {
        empty: 'कोई ग्रेड नहीं मिला।',
        placeholder: 'ग्रेड खोजें...',
    }
  },
  Marathi: {
    cardTitle: 'पाठ्यपुस्तक पृष्ठ तपशील',
    cardDescription: 'एक फोटो अपलोड करा आणि तपशील द्या.',
    photoLabel: 'पाठ्यपुस्तक पृष्ठ फोटो',
    uploadPrompt: 'प्रतिमा अपलोड करण्यासाठी क्लिक करा',
    gradeLevelsLabel: 'इयत्ता स्तर',
    selectGrades: 'इयत्ता निवडा...',
    subjectLabel: 'विषय',
    subjectPlaceholder: 'एक विषय निवडा',
    chapterLabel: 'धडा',
    chapterPlaceholder: 'एक धडा निवडा',
    generateButton: 'कार्यपत्रके तयार करा',
    generatingButton: 'तयार होत आहे...',
    resultsTitle: 'तयार कार्यपत्रके',
    resultsDescription: 'प्रत्येक इयत्ता स्तरासाठी तयार केलेली कार्यपत्रके येथे दिसतील.',
    emptyState: 'तुमची तयार केलेली कार्यपत्रके येथे दिसतील.',
    noWorksheetsTitle: 'कोणतीही कार्यपत्रके तयार झाली नाहीत',
    noWorksheetsDescription: 'दिलेल्या प्रतिमेमधून AI कार्यपत्रके तयार करू शकले नाही. कृपया अधिक स्पष्ट प्रतिमा किंवा वेगळे पृष्ठ वापरून पहा.',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव तयार केलेली सामग्री अवरोधित केली गेली. कृपया वेगळ्या पाठ्यपुस्तक पृष्ठासह पुन्हा प्रयत्न करा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'कार्यपत्रके तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    clearButton: 'साफ करा',
    formErrors: {
      photo: 'कृपया एक प्रतिमा फाइल अपलोड करा.',
      gradeLevels: 'कृपया किमान एक इयत्ता स्तर निवडा.',
      subject: 'कृपया एक विषय निवडा.',
      chapter: 'कृपया एक धडा निवडा.',
    },
    grades: {
      'Grade 1': 'इयत्ता १', 'Grade 2': 'इयत्ता २', 'Grade 3': 'इयत्ता ३', 'Grade 4': 'इयत्ता ४', 'Grade 5': 'इयत्ता ५', 'Grade 6': 'इयत्ता ६', 'Grade 7': 'इयत्ता ७', 'Grade 8': 'इयत्ता ८', 'Grade 9': 'इयत्ता ९', 'Grade 10': 'इयत्ता १०', 'Grade 11': 'इयत्ता ११', 'Grade 12': 'इयत्ता १२',
    },
    command: {
        empty: 'कोणतीही श्रेणी आढळली नाही.',
        placeholder: 'श्रेणी शोधा...',
    }
  },
  Kashmiri: {
    cardTitle: 'درسی کتابچہِ ہُنٛد تفصیل',
    cardDescription: 'اکھ تصویر اپلوڈ کریو تہٕ تفصیل دِیو۔',
    photoLabel: 'درسی کتابچہِ ہُنٛد تصویر',
    uploadPrompt: 'تصویر اپلوڈ کرنہٕ خٲطرٕ کلک کریو',
    gradeLevelsLabel: 'گریڈ سطح',
    selectGrades: 'گریڈ ژارٕو...',
    subjectLabel: 'مضمون',
    subjectPlaceholder: 'اکھ مضمون ژارٕو',
    chapterLabel: 'باب',
    chapterPlaceholder: 'اکھ باب ژارٕو',
    generateButton: 'ورک شیٹس تیار کریو',
    generatingButton: 'تیار کران...',
    resultsTitle: 'تیار کرنہٕ آمٕتہ ورک شیٹس',
    resultsDescription: 'پرٛتھ گریڈ سطح خٲطرٕ تیار کرنہٕ آمٕتہ ورک شیٹس ییٚتہِ ظٲہر گژھن۔',
    emptyState: 'توٚہنٛز تیار کرنہٕ آمٕتہ ورک شیٹس ییٚتہِ ظٲہر گژھن۔',
    noWorksheetsTitle: 'کاہِنہ ورک شیٹ تیار نہٕ آیہِ',
    noWorksheetsDescription: 'AI ہیوٚک نہٕ فراہم کرنہٕ آمٕژ تصویر پؠٹھہٕ ورک شیٹس تیار کٔرِتھ۔ مہربانی کرِتھ اَکھ صاف تصویر یا بیٛاکھ صفحہٕ آزماو۔',
    contentBlockedTitle: 'مواد بلاک کرنہٕ آمت',
    safetyError: 'تیار کرنہٕ آمت مواد آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ اَکھ بیٛاکھ درسی کتابچہِ صفحہٕ سٟتؠ دوبارٕ کوشش کریو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescription: 'ورک شیٹس تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    clearButton: 'صاف کریو',
     formErrors: {
      photo: 'مہربانی کرِتھ اَکھ تصویر فائل اپلوڈ کریو۔',
      gradeLevels: 'مہربانی کرِتھ کم از کم اَکھ گریڈ سطح ژارٕو۔',
      subject: 'مہربانی کرِتھ اَکھ مضمون ژارٕو۔',
      chapter: 'مہربانی کرِتھ اَکھ باب ژارٕو۔',
    },
    grades: {
      'Grade 1': 'گریڈ ۱', 'Grade 2': 'گریڈ ۲', 'Grade 3': 'گریڈ ۳', 'Grade 4': 'گریڈ ۴', 'Grade 5': 'گریڈ ۵', 'Grade 6': 'گریڈ ۶', 'Grade 7': 'گریڈ ۷', 'Grade 8': 'گریڈ ۸', 'Grade 9': 'گریڈ ۹', 'Grade 10': 'گریڈ ۱۰', 'Grade 11': 'گریڈ ۱۱', 'Grade 12': 'گریڈ ۱۲',
    },
    command: {
        empty: 'کانٛہہ گریڈ نہٕ ملیو۔',
        placeholder: 'گریڈ ژھارٕو...',
    }
  },
  Bengali: {
    cardTitle: 'পাঠ্যপুস্তকের পৃষ্ঠার বিবরণ',
    cardDescription: 'একটি ছবি আপলোড করুন এবং বিবরণ দিন।',
    photoLabel: 'পাঠ্যপুস্তকের পৃষ্ঠার ছবি',
    uploadPrompt: 'ছবি আপলোড করতে ক্লিক করুন',
    gradeLevelsLabel: 'গ্রেড স্তর',
    selectGrades: 'গ্রেড নির্বাচন করুন...',
    subjectLabel: 'বিষয়',
    subjectPlaceholder: 'একটি বিষয় নির্বাচন করুন',
    chapterLabel: 'অধ্যায়',
    chapterPlaceholder: 'একটি অধ্যায় নির্বাচন করুন',
    generateButton: 'ওয়ার্কশিট তৈরি করুন',
    generatingButton: 'তৈরি হচ্ছে...',
    resultsTitle: 'উত্পন্ন ওয়ার্কশিট',
    resultsDescription: 'প্রতিটি গ্রেড স্তরের জন্য তৈরি ওয়ার্কশিট এখানে উপস্থিত হবে।',
    emptyState: 'আপনার উত্পন্ন ওয়ার্কশিট এখানে উপস্থিত হবে।',
    noWorksheetsTitle: 'কোনো ওয়ার্কশিট তৈরি হয়নি',
    noWorksheetsDescription: 'AI প্রদত্ত ছবি থেকে ওয়ার্কশিট তৈরি করতে পারেনি। অনুগ্রহ করে একটি পরিষ্কার ছবি বা অন্য পৃষ্ঠা চেষ্টা করুন।',
    contentBlockedTitle: 'বিষয়বস্তু অবরুদ্ধ',
    safetyError: 'উত্পন্ন বিষয়বস্তু নিরাপত্তার কারণে অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে একটি ভিন্ন পাঠ্যপুস্তক পৃষ্ঠা দিয়ে আবার চেষ্টা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescription: 'ওয়ার্কশিট তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    clearButton: 'পরিষ্কার করুন',
    formErrors: {
      photo: 'অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন।',
      gradeLevels: 'অনুগ্রহ করে কমপক্ষে একটি গ্রেড স্তর নির্বাচন করুন।',
      subject: 'অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।',
      chapter: 'অনুগ্রহ করে একটি অধ্যায় নির্বাচন করুন।',
    },
    grades: {
      'Grade 1': 'গ্রেড ১', 'Grade 2': 'গ্রেড ২', 'Grade 3': 'গ্রেড ৩', 'Grade 4': 'গ্রেড ৪', 'Grade 5': 'গ্রেড ৫', 'Grade 6': 'গ্রেড ৬', 'Grade 7': 'গ্রেড ৭', 'Grade 8': 'গ্রেড ৮', 'Grade 9': 'গ্রেড ৯', 'Grade 10': 'গ্রেড ১০', 'Grade 11': 'গ্রেড ১১', 'Grade 12': 'গ্রেড ১২',
    },
    command: {
        empty: 'কোন গ্রেড পাওয়া যায়নি।',
        placeholder: 'গ্রেড অনুসন্ধান করুন...',
    }
  },
  Tamil: {
    cardTitle: 'பாடநூல் பக்க விவரங்கள்',
    cardDescription: 'ஒரு புகைப்படத்தை பதிவேற்றி விவரங்களை வழங்கவும்.',
    photoLabel: 'பாடநூல் பக்க புகைப்படம்',
    uploadPrompt: 'படத்தை பதிவேற்ற கிளிக் செய்யவும்',
    gradeLevelsLabel: 'வகுப்பு நிலைகள்',
    selectGrades: 'வகுப்புகளைத் தேர்ந்தெடுக்கவும்...',
    subjectLabel: 'பாடம்',
    subjectPlaceholder: 'ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்',
    chapterLabel: 'அத்தியாயம்',
    chapterPlaceholder: 'ஒரு அத்தியாயத்தைத் தேர்ந்தெடுக்கவும்',
    generateButton: 'பணித்தாள்களை உருவாக்கு',
    generatingButton: 'உருவாக்குகிறது...',
    resultsTitle: 'உருவாக்கப்பட்ட பணித்தாள்கள்',
    resultsDescription: 'ஒவ்வொரு வகுப்பு நிலைக்கும் ஏற்றவாறு உருவாக்கப்பட்ட பணித்தாள்கள் இங்கே தோன்றும்.',
    emptyState: 'நீங்கள் உருவாக்கிய பணித்தாள்கள் இங்கே தோன்றும்.',
    noWorksheetsTitle: 'பணித்தாள்கள் எதுவும் உருவாக்கப்படவில்லை',
    noWorksheetsDescription: 'வழங்கப்பட்ட படத்திலிருந்து AI ஆல் பணித்தாள்களை உருவாக்க முடியவில்லை. தெளிவான படம் அல்லது வேறு பக்கத்தை முயற்சிக்கவும்.',
    contentBlockedTitle: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyError: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட உள்ளடக்கம் தடுக்கப்பட்டது। வேறு பாடநூல் பக்கத்துடன் மீண்டும் முயற்சிக்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescription: 'பணித்தாள்களை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    clearButton: 'அழிக்கவும்',
     formErrors: {
      photo: 'தயவுசெய்து ஒரு படக் கோப்பை பதிவேற்றவும்.',
      gradeLevels: 'தயவுசெய்து குறைந்தது ஒரு வகுப்பு நிலையையாவது தேர்ந்தெடுக்கவும்.',
      subject: 'தயவுசெய்து ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்.',
      chapter: 'தயவுசெய்து ஒரு அத்தியாயத்தைத் தேர்ந்தெடுக்கவும்.',
    },
    grades: {
      'Grade 1': 'வகுப்பு 1', 'Grade 2': 'வகுப்பு 2', 'Grade 3': 'வகுப்பு 3', 'Grade 4': 'வகுப்பு 4', 'Grade 5': 'வகுப்பு 5', 'Grade 6': 'வகுப்பு 6', 'Grade 7': 'வகுப்பு 7', 'Grade 8': 'வகுப்பு 8', 'Grade 9': 'வகுப்பு 9', 'Grade 10': 'வகுப்பு 10', 'Grade 11': 'வகுப்பு 11', 'Grade 12': 'வகுப்பு 12',
    },
    command: {
        empty: 'வகுப்புகள் எதுவும் கிடைக்கவில்லை.',
        placeholder: 'வகுப்புகளைத் தேடு...',
    }
  },
  Gujarati: {
    cardTitle: 'પાઠ્યપુસ્તક પૃષ્ઠ વિગતો',
    cardDescription: 'એક ફોટો અપલોડ કરો અને વિગતો પ્રદાન કરો.',
    photoLabel: 'પાઠ્યપુસ્તક પૃષ્ઠ ફોટો',
    uploadPrompt: 'છબી અપલોડ કરવા માટે ક્લિક કરો',
    gradeLevelsLabel: 'ગ્રેડ સ્તર',
    selectGrades: 'ગ્રેડ પસંદ કરો...',
    subjectLabel: 'વિષય',
    subjectPlaceholder: 'એક વિષય પસંદ કરો',
    chapterLabel: 'પ્રકરણ',
    chapterPlaceholder: 'એક પ્રકરણ પસંદ કરો',
    generateButton: 'વર્કશીટ બનાવો',
    generatingButton: 'બનાવી રહ્યું છે...',
    resultsTitle: 'બનાવેલી વર્કશીટ',
    resultsDescription: 'દરેક ગ્રેડ સ્તર માટે બનાવેલી વર્કશીટ અહીં દેખાશે.',
    emptyState: 'તમારી બનાવેલી વર્કશીટ અહીં દેખાશે.',
    noWorksheetsTitle: 'કોઈ વર્કશીટ બનાવવામાં આવી નથી',
    noWorksheetsDescription: 'AI પ્રદાન કરેલી છબીમાંથી વર્કશીટ બનાવી શક્યું નથી. કૃપા કરીને સ્પષ્ટ છબી અથવા અલગ પૃષ્ઠનો પ્રયાસ કરો.',
    contentBlockedTitle: 'સામગ્રી અવરોધિત',
    safetyError: 'બનાવેલી સામગ્રીને સુરક્ષા કારણોસર અવરોધિત કરવામાં આવી હતી. કૃપા કરીને અલગ પાઠ્યપુસ્તક પૃષ્ઠ સાથે ફરીથી પ્રયાસ કરો.',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescription: 'વર્કશીટ બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    clearButton: 'સાફ કરો',
     formErrors: {
      photo: 'કૃપા કરીને એક છબી ફાઇલ અપલોડ કરો.',
      gradeLevels: 'કૃપા કરીને ઓછામાં ઓછું એક ગ્રેડ સ્તર પસંદ કરો.',
      subject: 'કૃપા કરીને એક વિષય પસંદ કરો.',
      chapter: 'કૃપા કરીને એક પ્રકરણ પસંદ કરો.',
    },
    grades: {
      'Grade 1': 'ગ્રેડ 1', 'Grade 2': 'ગ્રેડ 2', 'Grade 3': 'ગ્રેડ 3', 'Grade 4': 'ગ્રેડ 4', 'Grade 5': 'ગ્રેડ 5', 'Grade 6': 'ગ્રેડ 6', 'Grade 7': 'ગ્રેડ 7', 'Grade 8': 'ગ્રેડ 8', 'Grade 9': 'ગ્રેડ 9', 'Grade 10': 'ગ્રેડ 10', 'Grade 11': 'ગ્રેડ 11', 'Grade 12': 'ગ્રેડ 12',
    },
    command: {
        empty: 'કોઈ ગ્રેડ મળ્યો નથી.',
        placeholder: 'ગ્રેડ શોધો...',
    }
  },
  Malayalam: {
    cardTitle: 'പാഠപുസ്തക പേജ് വിവരങ്ങൾ',
    cardDescription: 'ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് വിവരങ്ങൾ നൽകുക.',
    photoLabel: 'പാഠപുസ്തക പേജ് ഫോട്ടോ',
    uploadPrompt: 'ചിത്രം അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്കുചെയ്യുക',
    gradeLevelsLabel: 'ഗ്രേഡ് നിലകൾ',
    selectGrades: 'ഗ്രേഡുകൾ തിരഞ്ഞെടുക്കുക...',
    subjectLabel: 'വിഷയം',
    subjectPlaceholder: 'ഒരു വിഷയം തിരഞ്ഞെടുക്കുക',
    chapterLabel: 'അദ്ധ്യായം',
    chapterPlaceholder: 'ഒരു അദ്ധ്യായം തിരഞ്ഞെടുക്കുക',
    generateButton: 'വർക്ക്ഷീറ്റുകൾ ഉണ്ടാക്കുക',
    generatingButton: 'ഉണ്ടാക്കുന്നു...',
    resultsTitle: 'ഉണ്ടാക്കിയ വർക്ക്ഷീറ്റുകൾ',
    resultsDescription: 'ഓരോ ഗ്രേഡ് നിലയ്ക്കും അനുയോജ്യമായ വർക്ക്ഷീറ്റുകൾ ഇവിടെ ദൃശ്യമാകും.',
    emptyState: 'നിങ്ങൾ ഉണ്ടാക്കിയ വർക്ക്ഷീറ്റുകൾ ഇവിടെ ദൃശ്യമാകും.',
    noWorksheetsTitle: 'വർക്ക്ഷീറ്റുകളൊന്നും ഉണ്ടാക്കിയില്ല',
    noWorksheetsDescription: 'നൽകിയിട്ടുള്ള ചിത്രത്തിൽ നിന്ന് AI-ക്ക് വർക്ക്ഷീറ്റുകൾ ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വ്യക്തമായ ചിത്രമോ മറ്റൊരു പേജോ ശ്രമിക്കുക.',
    contentBlockedTitle: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyError: 'ഉണ്ടാക്കിയ ഉള്ളടക്കം സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. ദയവായി മറ്റൊരു പാഠപുസ്തക പേജ് ഉപയോഗിച്ച് വീണ്ടും ശ്രമിക്കുക.',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescription: 'വർക്ക്ഷീറ്റുകൾ ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    clearButton: 'മായ്ക്കുക',
     formErrors: {
      photo: 'ദയവായി ഒരു ചിത്ര ഫയൽ അപ്‌ലോഡ് ചെയ്യുക.',
      gradeLevels: 'ദയവായി കുറഞ്ഞത് ഒരു ഗ്രേഡ് നിലയെങ്കിലും തിരഞ്ഞെടുക്കുക.',
      subject: 'ദയവായി ഒരു വിഷയം തിരഞ്ഞെടുക്കുക.',
      chapter: 'ദയവായി ഒരു അദ്ധ്യായം തിരഞ്ഞെടുക്കുക.',
    },
    grades: {
      'Grade 1': 'ഗ്രേഡ് 1', 'Grade 2': 'ഗ്രേഡ് 2', 'Grade 3': 'ഗ്രേഡ് 3', 'Grade 4': 'ഗ്രേഡ് 4', 'Grade 5': 'ഗ്രേഡ് 5', 'Grade 6': 'ഗ്രേഡ് 6', 'Grade 7': 'ഗ്രേഡ് 7', 'Grade 8': 'ഗ്രേഡ് 8', 'Grade 9': 'ഗ്രേഡ് 9', 'Grade 10': 'ഗ്രേഡ് 10', 'Grade 11': 'ഗ്രേഡ് 11', 'Grade 12': 'ഗ്രേഡ് 12',
    },
    command: {
        empty: 'ഗ്രേഡുകളൊന്നും കണ്ടെത്തിയില്ല.',
        placeholder: 'ഗ്രേഡുകൾ തിരയുക...',
    }
  },
  Punjabi: {
    cardTitle: 'ਪਾਠ ਪੁਸਤਕ ਪੰਨਾ ਵੇਰਵੇ',
    cardDescription: 'ਇੱਕ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ ਅਤੇ ਵੇਰਵੇ ਦਿਓ।',
    photoLabel: 'ਪਾਠ ਪੁਸਤਕ ਪੰਨਾ ਫੋਟੋ',
    uploadPrompt: 'ਚਿੱਤਰ ਅੱਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
    gradeLevelsLabel: 'ਗ੍ਰੇਡ ਪੱਧਰ',
    selectGrades: 'ਗ੍ਰੇਡ ਚੁਣੋ...',
    subjectLabel: 'ਵਿਸ਼ਾ',
    subjectPlaceholder: 'ਇੱਕ ਵਿਸ਼ਾ ਚੁਣੋ',
    chapterLabel: 'ਅਧਿਆਇ',
    chapterPlaceholder: 'ਇੱਕ ਅਧਿਆਇ ਚੁਣੋ',
    generateButton: 'ਵਰਕਸ਼ੀਟਾਂ ਬਣਾਓ',
    generatingButton: 'ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...',
    resultsTitle: 'ਬਣਾਈਆਂ ਗਈਆਂ ਵਰਕਸ਼ੀਟਾਂ',
    resultsDescription: 'ਹਰੇਕ ਗ੍ਰੇਡ ਪੱਧਰ ਲਈ ਬਣਾਈਆਂ ਗਈਆਂ ਵਰਕਸ਼ੀਟਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ।',
    emptyState: 'ਤੁਹਾਡੀਆਂ ਬਣਾਈਆਂ ਗਈਆਂ ਵਰਕਸ਼ੀਟਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ।',
    noWorksheetsTitle: 'ਕੋਈ ਵਰਕਸ਼ੀਟ ਨਹੀਂ ਬਣਾਈ ਗਈ',
    noWorksheetsDescription: 'AI ਦਿੱਤੀ ਗਈ ਤਸਵੀਰ ਤੋਂ ਵਰਕਸ਼ੀਟਾਂ ਨਹੀਂ ਬਣਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸਾਫ ਤਸਵੀਰ ਜਾਂ ਵੱਖਰਾ ਪੰਨਾ ਅਜ਼ਮਾਓ।',
    contentBlockedTitle: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyError: 'ਬਣਾਈ ਗਈ ਸਮੱਗਰੀ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰੇ ਪਾਠ ਪੁਸਤਕ ਪੰਨੇ ਨਾਲ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescription: 'ਵਰਕਸ਼ੀਟਾਂ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    clearButton: 'ਸਾਫ਼ ਕਰੋ',
     formErrors: {
      photo: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਚਿੱਤਰ ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ।',
      gradeLevels: 'ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਗ੍ਰੇਡ ਪੱਧਰ ਚੁਣੋ।',
      subject: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵਿਸ਼ਾ ਚੁਣੋ।',
      chapter: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਅਧਿਆਇ ਚੁਣੋ।',
    },
    grades: {
      'Grade 1': 'ਗ੍ਰੇਡ 1', 'Grade 2': 'ਗ੍ਰੇਡ 2', 'Grade 3': 'ਗ੍ਰੇਡ 3', 'Grade 4': 'ਗ੍ਰੇਡ 4', 'Grade 5': 'ਗ੍ਰੇਡ 5', 'Grade 6': 'ਗ੍ਰੇਡ 6', 'Grade 7': 'ਗ੍ਰੇਡ 7', 'Grade 8': 'ਗ੍ਰੇਡ 8', 'Grade 9': 'ਗ੍ਰੇਡ 9', 'Grade 10': 'ਗ੍ਰੇਡ 10', 'Grade 11': 'ਗ੍ਰੇਡ 11', 'Grade 12': 'ਗ੍ਰੇਡ 12',
    },
    command: {
        empty: 'ਕੋਈ ਗ੍ਰੇਡ ਨਹੀਂ ਮਿਲਿਆ।',
        placeholder: 'ਗ੍ਰੇਡ ਖੋਜੋ...',
    }
  },
  Odia: {
    cardTitle: 'ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠା ବିବରଣୀ',
    cardDescription: 'ଏକ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ ଏବଂ ବିବରଣୀ ପ୍ରଦାନ କରନ୍ତୁ।',
    photoLabel: 'ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠା ଫଟୋ',
    uploadPrompt: 'ପ୍ରତିଛବି ଅପଲୋଡ୍ କରିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ',
    gradeLevelsLabel: 'ଗ୍ରେଡ୍ ସ୍ତର',
    selectGrades: 'ଗ୍ରେଡ୍ ବାଛନ୍ତୁ...',
    subjectLabel: 'ବିଷୟ',
    subjectPlaceholder: 'ଏକ ବିଷୟ ବାଛନ୍ତୁ',
    chapterLabel: 'ଅଧ୍ୟାୟ',
    chapterPlaceholder: 'ଏକ ଅଧ୍ୟାୟ ବାଛନ୍ତୁ',
    generateButton: 'କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରନ୍ତୁ',
    generatingButton: 'ସୃଷ୍ଟି କରୁଛି...',
    resultsTitle: 'ସୃଷ୍ଟି ହୋଇଥିବା କାର୍ଯ୍ୟପତ୍ର',
    resultsDescription: 'ପ୍ରତ୍ୟେକ ଗ୍ରେଡ୍ ସ୍ତର ପାଇଁ ସୃଷ୍ଟି ହୋଇଥିବା କାର୍ଯ୍ୟପତ୍ର ଏଠାରେ ଦେଖାଯିବ।',
    emptyState: 'ଆପଣଙ୍କର ସୃଷ୍ଟି ହୋଇଥିବା କାର୍ଯ୍ୟପତ୍ର ଏଠାରେ ଦେଖାଯିବ।',
    noWorksheetsTitle: 'କୌଣସି କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି ହୋଇନାହିଁ',
    noWorksheetsDescription: 'AI ପ୍ରଦାନ କରାଯାଇଥିବା ପ୍ରତିଛବିରୁ କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରିପାରିଲା ନାହିଁ। ଦୟାକରି ଏକ ସ୍ପଷ୍ଟ ପ୍ରତିଛବି କିମ୍ବା ଅନ୍ୟ ପୃଷ୍ଠା ଚେଷ୍ଟା କରନ୍ତୁ।',
    contentBlockedTitle: 'ବିଷୟବସ୍ତୁ ଅବରୋଧିତ',
    safetyError: 'ସୃଷ୍ଟି ହୋଇଥିବା ବିଷୟବସ୍ତୁକୁ ସୁରକ୍ଷା କାରଣରୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଏକ ଭିନ୍ନ ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠା ସହିତ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    errorTitle: 'ଏକ ତ୍ରୁଟି ଘଟିଛି।',
    errorDescription: 'କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    clearButton: 'ସଫା କରନ୍ତୁ',
    formErrors: {
      photo: 'ଦୟାକରି ଏକ ପ୍ରତିଛବି ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ।',
      gradeLevels: 'ଦୟାକରି ଅତିକମରେ ଗୋଟିଏ ଗ୍ରେଡ୍ ସ୍ତର ଚୟନ କରନ୍ତୁ।',
      subject: 'ଦୟାକରି ଏକ ବିଷୟ ବାଛନ୍ତୁ।',
      chapter: 'ଦୟାକରି ଏକ ଅଧ୍ୟାୟ ବାଛନ୍ତୁ।',
    },
    grades: {
      'Grade 1': 'ଗ୍ରେଡ୍ 1', 'Grade 2': 'ଗ୍ରେଡ୍ 2', 'Grade 3': 'ଗ୍ରେଡ୍ 3', 'Grade 4': 'ଗ୍ରେଡ୍ 4', 'Grade 5': 'ଗ୍ରେଡ୍ 5', 'Grade 6': 'ଗ୍ରେଡ୍ 6', 'Grade 7': 'ଗ୍ରେଡ୍ 7', 'Grade 8': 'ଗ୍ରେଡ୍ 8', 'Grade 9': 'ଗ୍ରେଡ୍ 9', 'Grade 10': 'ଗ୍ରେଡ୍ 10', 'Grade 11': 'ଗ୍ରେଡ୍ 11', 'Grade 12': 'ଗ୍ରେଡ୍ 12',
    },
    command: {
        empty: 'କୌଣସି ଗ୍ରେଡ୍ ମିଳିଲା ନାହିଁ।',
        placeholder: 'ଗ୍ରେଡ୍ ଖୋଜନ୍ତୁ...',
    }
  },
  Assamese: {
    cardTitle: 'পাঠ্যপুথিৰ পৃষ্ঠাৰ বিৱৰণ',
    cardDescription: 'এখন ফটো আপলোড কৰক আৰু বিৱৰণ দিয়ক।',
    photoLabel: 'পাঠ্যপুথিৰ পৃষ্ঠাৰ ফটো',
    uploadPrompt: 'ছবি আপলোড কৰিবলৈ ক্লিক কৰক',
    gradeLevelsLabel: 'গ্ৰেড স্তৰ',
    selectGrades: 'গ্ৰেড বাছনি কৰক...',
    subjectLabel: 'বিষয়',
    subjectPlaceholder: 'এটা বিষয় বাছনি কৰক',
    chapterLabel: 'অধ্যায়',
    chapterPlaceholder: 'এটা অধ্যায় বাছনি কৰক',
    generateButton: 'কাৰ্যপত্ৰ সৃষ্টি কৰক',
    generatingButton: 'সৃষ্টি কৰি আছে...',
    resultsTitle: 'সৃষ্ট কাৰ্যপত্ৰ',
    resultsDescription: 'প্ৰতিটো গ্ৰেড স্তৰৰ বাবে তৈয়াৰ কৰা কাৰ্যপত্ৰ ইয়াত দেখা যাব।',
    emptyState: 'আপোনাৰ সৃষ্ট কাৰ্যপত্ৰ ইয়াত প্ৰদৰ্শিত হ’ব।',
    noWorksheetsTitle: 'কোনো কাৰ্যপত্ৰ সৃষ্টি হোৱা নাই',
    noWorksheetsDescription: 'AI এ প্ৰদান কৰা ছবিৰ পৰা কাৰ্যপত্ৰ সৃষ্টি কৰিব নোৱাৰিলে। অনুগ্ৰহ কৰি এখন স্পষ্ট ছবি বা বেলেগ পৃষ্ঠা চেষ্টা কৰক।',
    contentBlockedTitle: 'বিষয়বস্তু অৱৰোধিত',
    safetyError: 'সৃষ্ট বিষয়বস্তু সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি এখন বেলেগ পাঠ্যপুথিৰ পৃষ্ঠাৰে পুনৰ চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescription: 'কাৰ্যপত্ৰ সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    clearButton: 'পৰিষ্কাৰ কৰক',
    formErrors: {
      photo: 'অনুগ্ৰহ কৰি এখন ছবি ফাইল আপলোড কৰক।',
      gradeLevels: 'অনুগ্ৰহ কৰি কমেও এটা গ্ৰেড স্তৰ বাছনি কৰক।',
      subject: 'অনুগ্ৰহ কৰি এটা বিষয় বাছনি কৰক।',
      chapter: 'অনুগ্ৰহ কৰি এটা অধ্যায় বাছনি কৰক।',
    },
    grades: {
      'Grade 1': 'গ্ৰেড ১', 'Grade 2': 'গ্ৰেড ২', 'Grade 3': 'গ্ৰেড ৩', 'Grade 4': 'গ্ৰেড ৪', 'Grade 5': 'গ্ৰেড ৫', 'Grade 6': 'গ্ৰেড ৬', 'Grade 7': 'গ্ৰেড ৭', 'Grade 8': 'গ্ৰেড ৮', 'Grade 9': 'গ্ৰেড ৯', 'Grade 10': 'গ্ৰেড ১০', 'Grade 11': 'গ্ৰেড ১১', 'Grade 12': 'গ্ৰেড ১২',
    },
    command: {
        empty: 'কোনো গ্ৰেড পোৱা ন’গ’ল।',
        placeholder: 'গ্ৰেড সন্ধান কৰক...',
    }
  },
  Kannada: {
    cardTitle: 'ಪಠ್ಯಪುಸ್ತಕ ಪುಟದ ವಿವರಗಳು',
    cardDescription: 'ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ವಿವರಗಳನ್ನು ಒದಗಿಸಿ.',
    photoLabel: 'ಪಠ್ಯಪುಸ್ತಕ ಪುಟದ ಫೋಟೋ',
    uploadPrompt: 'ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    gradeLevelsLabel: 'ದರ್ಜೆ ಮಟ್ಟಗಳು',
    selectGrades: 'ದರ್ಜೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ...',
    subjectLabel: 'ವಿಷಯ',
    subjectPlaceholder: 'ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    chapterLabel: 'ಅಧ್ಯಾಯ',
    chapterPlaceholder: 'ಒಂದು ಅಧ್ಯಾಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    generateButton: 'ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ರಚಿಸಿ',
    generatingButton: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    resultsTitle: 'ರಚಿಸಲಾದ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು',
    resultsDescription: 'ಪ್ರತಿ ದರ್ಜೆಯ ಮಟ್ಟಕ್ಕೆ ತಕ್ಕಂತೆ ರಚಿಸಲಾದ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    emptyState: 'ನಿಮ್ಮ ರಚಿಸಲಾದ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    noWorksheetsTitle: 'ಯಾವುದೇ ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ರಚಿಸಲಾಗಿಲ್ಲ',
    noWorksheetsDescription: 'ನೀಡಲಾದ ಚಿತ್ರದಿಂದ AI ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಚಿತ್ರ ಅಥವಾ ಬೇರೆ ಪುಟವನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
    contentBlockedTitle: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyError: 'ರಚಿಸಲಾದ ವಿಷಯವನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇರೆ ಪಠ್ಯಪುಸ್ತಕ ಪುಟದೊಂದಿಗೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescription: 'ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    clearButton: 'ಅಳಿಸಿ',
    formErrors: {
      photo: 'ದಯವಿಟ್ಟು ಚಿತ್ರದ ಫೈಲ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      gradeLevels: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ದರ್ಜೆ ಮಟ್ಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      subject: 'ದಯವಿಟ್ಟು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      chapter: 'ದಯವಿಟ್ಟು ಒಂದು ಅಧ್ಯಾಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    },
    grades: {
      'Grade 1': 'ದರ್ಜೆ 1', 'Grade 2': 'ದರ್ಜೆ 2', 'Grade 3': 'ದರ್ಜೆ 3', 'Grade 4': 'ದರ್ಜೆ 4', 'Grade 5': 'ದರ್ಜೆ 5', 'Grade 6': 'ದರ್ಜೆ 6', 'Grade 7': 'ದರ್ಜೆ 7', 'Grade 8': 'ದರ್ಜೆ 8', 'Grade 9': 'ದರ್ಜೆ 9', 'Grade 10': 'ದರ್ಜೆ 10', 'Grade 11': 'ದರ್ಜೆ 11', 'Grade 12': 'ದರ್ಜೆ 12',
    },
    command: {
        empty: 'ಯಾವುದೇ ದರ್ಜೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
        placeholder: 'ದರ್ಜೆಗಳನ್ನು ಹುಡುಕಿ...',
    }
  },
  Telugu: {
    cardTitle: 'పాఠ్యపుస్తక పేజీ వివరాలు',
    cardDescription: 'ఒక ఫోటోను అప్‌లోడ్ చేసి వివరాలు అందించండి.',
    photoLabel: 'పాఠ్యపుస్తక పేజీ ఫోటో',
    uploadPrompt: 'చిత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి',
    gradeLevelsLabel: 'గ్రేడ్ స్థాయిలు',
    selectGrades: 'గ్రేడ్‌లను ఎంచుకోండి...',
    subjectLabel: 'సబ్జెక్ట్',
    subjectPlaceholder: 'ఒక సబ్జెక్ట్‌ను ఎంచుకోండి',
    chapterLabel: 'అధ్యాయం',
    chapterPlaceholder: 'ఒక అధ్యాయాన్ని ఎంచుకోండి',
    generateButton: 'వర్క్‌షీట్‌లను రూపొందించండి',
    generatingButton: 'రూపొందిస్తోంది...',
    resultsTitle: 'రూపొందించిన వర్క్‌షీట్‌లు',
    resultsDescription: 'ప్రతి గ్రేడ్ స్థాయికి అనుగుణంగా రూపొందించిన వర్క్‌షీట్‌లు ఇక్కడ కనిపిస్తాయి.',
    emptyState: 'మీరు రూపొందించిన వర్క్‌షీట్‌లు ఇక్కడ కనిపిస్తాయి.',
    noWorksheetsTitle: 'వర్క్‌షీట్‌లు ఏవీ రూపొందించబడలేదు',
    noWorksheetsDescription: 'అందించిన చిత్రం నుండి AI వర్క్‌షీట్‌లను రూపొందించలేకపోయింది. దయచేసి స్పష్టమైన చిత్రం లేదా వేరే పేజీని ప్రయత్నించండి.',
    contentBlockedTitle: 'కంటెంట్ బ్లాక్ చేయబడింది',
    safetyError: 'భద్రతా కారణాల వల్ల సృష్టించబడిన కంటెంట్ బ్లాక్ చేయబడింది. దయచేసి వేరే పాఠ్యపుస్తక పేజీతో మళ్లీ ప్రయత్నించండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescription: 'వర్క్‌షీట్‌లను రూపొందించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    clearButton: 'తొలగించు',
    formErrors: {
      photo: 'దయచేసి ఒక చిత్ర ఫైల్‌ను అప్‌లోడ్ చేయండి.',
      gradeLevels: 'దయచేసి కనీసం ఒక గ్రేడ్ స్థాయిని ఎంచుకోండి.',
      subject: 'దయచేసి ఒక సబ్జెక్ట్‌ను ఎంచుకోండి.',
      chapter: 'దయచేసి ఒక అధ్యాయాన్ని ఎంచుకోండి.',
    },
    grades: {
      'Grade 1': 'గ్రేడ్ 1', 'Grade 2': 'గ్రేడ్ 2', 'Grade 3': 'గ్రేడ్ 3', 'Grade 4': 'గ్రేడ్ 4', 'Grade 5': 'గ్రేడ్ 5', 'Grade 6': 'గ్రేడ్ 6', 'Grade 7': 'గ్రేడ్ 7', 'Grade 8': 'గ్రేడ్ 8', 'Grade 9': 'గ్రేడ్ 9', 'Grade 10': 'గ్రేడ్ 10', 'Grade 11': 'గ్రేడ్ 11', 'Grade 12': 'గ్రేడ్ 12',
    },
    command: {
        empty: 'గ్రేడ్‌లు ఏవీ కనుగొనబడలేదు.',
        placeholder: 'గ్రేడ్‌లను శోధించండి...',
    }
  },
};

export function WorksheetClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateDifferentiatedWorksheetOutput | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
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
        const storedResult = localStorage.getItem('generatedWorksheets');
        if (storedResult) {
          setResult(JSON.parse(storedResult));
        }
      } catch (error) {
        console.error('Failed to parse generatedWorksheets from localStorage', error);
        localStorage.removeItem('generatedWorksheets');
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      if (result) {
        localStorage.setItem('generatedWorksheets', JSON.stringify(result));
      } else {
        localStorage.removeItem('generatedWorksheets');
      }
    }
  }, [result, isClient]);


  const formSchema = z.object({
    photoDataUri: z.string().refine((val) => val.startsWith('data:image/'), {
      message: t.formErrors.photo,
    }),
    gradeLevels: z.string().min(1, t.formErrors.gradeLevels),
    subject: z.string().min(1, t.formErrors.subject),
    chapter: z.string().min(1, t.formErrors.chapter),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: '',
      gradeLevels: '',
      subject: '',
      chapter: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('photoDataUri', dataUri);
        setPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGradeSelect = (gradeValue: string) => {
    const newSelectedGrades = selectedGrades.includes(gradeValue)
      ? selectedGrades.filter((g) => g !== gradeValue)
      : [...selectedGrades, gradeValue];
    setSelectedGrades(newSelectedGrades);
    form.setValue('gradeLevels', newSelectedGrades.join(', '));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const worksheetResult = await createDifferentiatedWorksheet(values);
      setResult(worksheetResult);
      if (worksheetResult.worksheets.length === 0) {
        toast({
          variant: 'default',
          title: t.noWorksheetsTitle,
          description: t.noWorksheetsDescription,
        });
      }
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

  const handleClear = () => {
    form.reset();
    setResult(null);
    setError(null);
    setPreview(null);
    setSelectedGrades([]);
  };

  const chaptersForSelectedSubject = subjects.find(s => s.value === selectedSubject)?.chapters || [];
  const typedGradeTranslations = t.grades as Record<string, string>;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>{t.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="photoDataUri"
                render={() => (
                  <FormItem>
                    <FormLabel>{t.photoLabel}</FormLabel>
                    <FormControl>
                      <label htmlFor="file-upload" className="relative block w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                        {preview ? (
                          <Image src={preview} alt="Textbook page preview" layout="fill" objectFit="contain" className="rounded-lg p-1" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <UploadCloud className="w-8 h-8 mb-2" />
                            <span>{t.uploadPrompt}</span>
                          </div>
                        )}
                        <Input id="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevels"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t.gradeLevelsLabel}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {selectedGrades.length > 0
                                        ? selectedGrades.map(g => typedGradeTranslations[grades.find(grade => grade.value === g)?.label || ''] || `Grade ${g}`).join(', ')
                                        : t.selectGrades}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder={t.command.placeholder} />
                                <CommandList>
                                    <CommandEmpty>{t.command.empty}</CommandEmpty>
                                    <CommandGroup>
                                        {grades.map((grade) => (
                                            <CommandItem
                                                value={grade.label}
                                                key={grade.value}
                                                onSelect={() => {
                                                    handleGradeSelect(grade.value);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedGrades.includes(grade.value) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {typedGradeTranslations[grade.label] || grade.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.subjectLabel}</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setSelectedSubject(value); form.setValue('chapter', ''); }} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t.subjectPlaceholder} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.chapterLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedSubject}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t.chapterPlaceholder} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {chaptersForSelectedSubject.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t.generatingButton : t.generateButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.resultsTitle}</CardTitle>
              <CardDescription>{t.resultsDescription}</CardDescription>
            </div>
             {result && (
              <Button onClick={handleClear} variant="ghost" size="icon">
                <XCircle className="h-5 w-5" />
                <span className="sr-only">{t.clearButton}</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-48 w-full" /></div>}
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.contentBlockedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && result.worksheets.length > 0 && (
              <Tabs defaultValue={result.worksheets[0].gradeLevel} className="w-full">
                <TabsList>
                  {result.worksheets.map(w => <TabsTrigger key={w.gradeLevel} value={w.gradeLevel}>{typedGradeTranslations[grades.find(g => g.value === w.gradeLevel)?.label || ''] || `Grade ${w.gradeLevel}`}</TabsTrigger>)}
                </TabsList>
                {result.worksheets.map(w => (
                  <TabsContent key={w.gradeLevel} value={w.gradeLevel}>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
                      {w.worksheetContent}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
            {!isLoading && !result && !error && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <Layers className="h-16 w-16 mb-4" />
                <p>{t.emptyState}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
