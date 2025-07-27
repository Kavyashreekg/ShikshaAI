
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import jsPDF from 'jspdf';
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
  createDifferentiatedWorksheet,
  CreateDifferentiatedWorksheetOutput,
  CreateDifferentiatedWorksheetInput,
} from '@/ai/flows/create-differentiated-worksheet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Layers, ShieldAlert, Check, ChevronsUpDown, XCircle, History, Trash2, FileDown } from 'lucide-react';
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

type StoredWorksheet = CreateDifferentiatedWorksheetOutput & Omit<CreateDifferentiatedWorksheetInput, 'photoDataUri'> & { id: string, preview: string };

const difficultyLevels = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
];

const translations = {
  English: {
    cardTitle: 'Textbook Page Details',
    cardDescription: 'Upload a photo and select difficulty levels.',
    photoLabel: 'Textbook Page Photo',
    uploadPrompt: 'Click to upload image',
    difficultyLevelsLabel: 'Difficulty Levels',
    selectDifficulties: 'Select difficulties...',
    generateButton: 'Generate Worksheets',
    generatingButton: 'Generating...',
    resultsTitle: 'Generated Worksheets',
    resultsDescription: 'Worksheets tailored for each level will appear here.',
    emptyState: 'Your generated worksheets will appear here.',
    noWorksheetsTitle: 'No worksheets generated',
    noWorksheetsDescription: 'The AI could not generate worksheets from the provided image. Please try a clearer image or different page.',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The generated content was blocked for safety reasons. Please try again with a different textbook page.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate worksheets. Please try again.',
    clearButton: 'Clear',
    viewHistoryButton: 'View History',
    historyDialogTitle: 'Stored Worksheets',
    historyDialogDescription: 'Here are the worksheets you have generated in the past. You can view, load, or delete them.',
    noHistory: 'You have not generated any worksheets yet.',
    loadWorksheetButton: 'Load Worksheets',
    deleteWorksheetButton: 'Delete',
    downloadPdf: 'Download PDF',
    downloading: 'Downloading...',
    pdfError: 'Could not generate PDF.',
    formErrors: {
      photo: 'Please upload an image file.',
      difficultyLevels: 'Please select at least one difficulty level.',
    },
    difficulties: {
      Beginner: 'Beginner',
      Intermediate: 'Intermediate',
      Advanced: 'Advanced',
    },
    command: {
        empty: 'No levels found.',
        placeholder: 'Search levels...',
    }
  },
  Hindi: {
    cardTitle: 'पाठ्यपुस्तक पृष्ठ विवरण',
    cardDescription: 'एक तस्वीर अपलोड करें और कठिनाई स्तर चुनें।',
    photoLabel: 'पाठ्यपुस्तक पृष्ठ फोटो',
    uploadPrompt: 'छवि अपलोड करने के लिए क्लिक करें',
    difficultyLevelsLabel: 'कठिनाई स्तर',
    selectDifficulties: 'कठिनाई स्तर चुनें...',
    generateButton: 'वर्कशीट उत्पन्न करें',
    generatingButton: 'उत्पन्न हो रहा है...',
    resultsTitle: 'उत्पन्न वर्कशीट',
    resultsDescription: 'प्रत्येक स्तर के लिए बनाई गई वर्कशीट यहाँ दिखाई देंगी।',
    emptyState: 'आपकी उत्पन्न वर्कशीट यहाँ दिखाई देंगी।',
    noWorksheetsTitle: 'कोई वर्कशीट उत्पन्न नहीं हुई',
    noWorksheetsDescription: 'एआई प्रदान की गई छवि से वर्कशीट उत्पन्न नहीं कर सका। कृपया एक स्पष्ट छवि या अलग पृष्ठ का प्रयास करें।',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'उत्पन्न सामग्री को सुरक्षा कारणों से अवरुद्ध कर दिया गया था। कृपया एक अलग पाठ्यपुस्तक पृष्ठ के साथ पुनः प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'वर्कशीट उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    clearButton: 'साफ़ करें',
    viewHistoryButton: 'इतिहास देखें',
    historyDialogTitle: 'संग्रहीत वर्कशीट',
    historyDialogDescription: 'यहाँ वे वर्कशीट हैं जो आपने अतीत में उत्पन्न की हैं। आप उन्हें देख, लोड या हटा सकते हैं।',
    noHistory: 'आपने अभी तक कोई वर्कशीट उत्पन्न नहीं की है।',
    loadWorksheetButton: 'वर्कशीट लोड करें',
    deleteWorksheetButton: 'हटाएं',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    downloading: 'डाउनलोड हो रहा है...',
    pdfError: 'पीडीएफ उत्पन्न नहीं हो सका।',
    formErrors: {
      photo: 'कृपया एक छवि फ़ाइल अपलोड करें।',
      difficultyLevels: 'कृपया कम से-कम एक कठिनाई स्तर चुनें।',
    },
    difficulties: {
      Beginner: 'शुरुआती',
      Intermediate: 'मध्यवर्ती',
      Advanced: 'उन्नत',
    },
    command: {
        empty: 'कोई स्तर नहीं मिला।',
        placeholder: 'स्तर खोजें...',
    }
  },
  Marathi: {
    cardTitle: 'पाठ्यपुस्तक पृष्ठ तपशील',
    cardDescription: 'एक फोटो अपलोड करा आणि अडचण पातळी निवडा.',
    photoLabel: 'पाठ्यपुस्तक पृष्ठ फोटो',
    uploadPrompt: 'प्रतिमा अपलोड करण्यासाठी क्लिक करा',
    difficultyLevelsLabel: 'अडचण पातळी',
    selectDifficulties: 'अडचण पातळी निवडा...',
    generateButton: 'कार्यपत्रके तयार करा',
    generatingButton: 'तयार होत आहे...',
    resultsTitle: 'तयार कार्यपत्रके',
    resultsDescription: 'प्रत्येक पातळीसाठी तयार केलेली कार्यपत्रके येथे दिसतील.',
    emptyState: 'तुमची तयार केलेली कार्यपत्रके येथे दिसतील.',
    noWorksheetsTitle: 'कोणतीही कार्यपत्रके तयार झाली नाहीत',
    noWorksheetsDescription: 'दिलेल्या प्रतिमेमधून AI कार्यपत्रके तयार करू शकले नाही. कृपया अधिक स्पष्ट प्रतिमा किंवा वेगळे पृष्ठ वापरून पहा.',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव तयार केलेली सामग्री अवरोधित केली गेली. कृपया वेगळ्या पाठ्यपुस्तक पृष्ठासह पुन्हा प्रयत्न करा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'कार्यपत्रके तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    clearButton: 'साफ करा',
    viewHistoryButton: 'इतिहास पहा',
    historyDialogTitle: 'साठवलेली कार्यपत्रके',
    historyDialogDescription: 'तुम्ही पूर्वी तयार केलेली कार्यपत्रके येथे आहेत. तुम्ही ती पाहू शकता, लोड करू शकता किंवा हटवू शकता.',
    noHistory: 'तुम्ही अद्याप कोणतीही कार्यपत्रके तयार केलेली नाहीत.',
    loadWorksheetButton: 'कार्यपत्रके लोड करा',
    deleteWorksheetButton: 'हटवा',
    downloadPdf: 'पीडीएफ डाउनलोड करा',
    downloading: 'डाउनलोड करत आहे...',
    pdfError: 'पीडीएफ तयार करता आला नाही.',
    formErrors: {
      photo: 'कृपया एक प्रतिमा फाइल अपलोड करा.',
      difficultyLevels: 'कृपया किमान एक अडचण पातळी निवडा.',
    },
    difficulties: {
      Beginner: 'सुरुवात',
      Intermediate: 'मध्यम',
      Advanced: 'प्रगत',
    },
    command: {
        empty: 'कोणतीही पातळी आढळली नाही.',
        placeholder: 'पातळी शोधा...',
    }
  },
  Kashmiri: {
    cardTitle: 'درسی کتاب ہُنٛد صفحہٕ تفصیل',
    cardDescription: 'اَکھ فوٹو اپلوڈ کریو تہٕ مشکل سطح ژارٕو۔',
    photoLabel: 'درسی کتاب ہُنٛد صفحہٕ فوٹو',
    uploadPrompt: 'تصویر اپلوڈ کرنہٕ خٲطرٕ کلک کریو',
    difficultyLevelsLabel: 'مشکل سطح',
    selectDifficulties: 'مشکل سطح ژارٕو...',
    generateButton: 'ورک شیٹ تیار کریو',
    generatingButton: 'تیار کران...',
    resultsTitle: 'تیار کرنہٕ آمٕتہ ورک شیٹ',
    resultsDescription: 'پرٛتھ سطح خٲطرٕ تیار کرنہٕ آمٕتہ ورک شیٹس ییٚتہِ ظٲہر گژھن۔',
    emptyState: 'توٚہنٛز تیار کرنہٕ آمٕتہ ورک شیٹس ییٚتہِ ظٲہر گژھن۔',
    noWorksheetsTitle: 'کانٛہہ ورک شیٹ چھُ نہٕ تیار کرنہٕ آمُت',
    noWorksheetsDescription: 'AI ہیوٚک نہٕ فراہم کرنہٕ آمٕژ تصویر پؠٹھ ورک شیٹس تیار کٔرِتھ۔ مہربانی کرِتھ اَکھ صاف تصویر یا بیٛاکھ صفحہٕ آزماو۔',
    contentBlockedTitle: 'مواد بلاک کرنہٕ آمت',
    safetyError: 'تیار کرنہٕ آمت مواد آو حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ اَکھ بیٛاکھ درسی کتاب ہُنٛد صفحہٕ آزماو۔',
    errorTitle: 'اکھ خرٲبی گیہِ۔',
    errorDescription: 'ورک شیٹس تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
    clearButton: 'صاف کریو',
    viewHistoryButton: 'تَوٲریٖخ وُچھِو',
    historyDialogTitle: 'ذخیٖرٕ کرنہٕ آمٕتہ ورک شیٹس',
    historyDialogDescription: 'ییٚتہِ چھِ اہ ورک شیٹس یم توہہِ ماضی مَنٛز تیار کٔرؠ مٕتؠ چھِ۔ توہہِ ہیٚکِو یِم وُچھِتھ، لوڈ کرِتھ، یا ہٹاوِتھ۔',
    noHistory: 'توہہِ چھُ نہٕ وُنی تام کانٛہہ ورک شیٹ تیار کٔرؠ مٕژ۔',
    loadWorksheetButton: 'ورک شیٹ لوڈ کریو',
    deleteWorksheetButton: 'ہٹاو',
    downloadPdf: 'پی ڈی ایف ڈاؤنلوڈ کریو',
    downloading: 'ڈاؤنلوڈ کران...',
    pdfError: 'پی ڈی ایف تیار کٔرِتھ نہٕ ہیوٚک۔',
    formErrors: {
      photo: 'مہربانی کرِتھ اَکھ تصویر فائل اپلوڈ کریو۔',
      difficultyLevels: 'مہربانی کرِتھ کم از کم اَکھ مشکل سطح ژارٕو۔',
    },
    difficulties: {
        Beginner: 'ابتدائی',
        Intermediate: 'درمیانہ',
        Advanced: 'اعلیٰ',
    },
    command: {
        empty: 'کانٛہہ سطح چھُ نہٕ لبنہٕ آمُت۔',
        placeholder: 'سطح ژھانڈیو...',
    }
  },
  Bengali: {
    cardTitle: 'পাঠ্যপুস্তকের পৃষ্ঠার বিবরণ',
    cardDescription: 'একটি ছবি আপলোড করুন এবং অসুবিধার স্তর নির্বাচন করুন।',
    photoLabel: 'পাঠ্যপুস্তকের পৃষ্ঠার ছবি',
    uploadPrompt: 'ছবি আপলোড করতে ক্লিক করুন',
    difficultyLevelsLabel: 'অসুবিধার স্তর',
    selectDifficulties: 'অসুবিধার স্তর নির্বাচন করুন...',
    generateButton: 'ওয়ার্কশিট তৈরি করুন',
    generatingButton: 'তৈরি করা হচ্ছে...',
    resultsTitle: 'উত্পন্ন ওয়ার্কশিট',
    resultsDescription: 'প্রতিটি স্তরের জন্য তৈরি ওয়ার্কশিট এখানে প্রদর্শিত হবে।',
    emptyState: 'আপনার তৈরি ওয়ার্কশিট এখানে প্রদর্শিত হবে।',
    noWorksheetsTitle: 'কোন ওয়ার্কশিট তৈরি হয়নি',
    noWorksheetsDescription: 'প্রদত্ত ছবি থেকে AI ওয়ার্কশিট তৈরি করতে পারেনি। অনুগ্রহ করে একটি পরিষ্কার ছবি বা অন্য পৃষ্ঠা চেষ্টা করুন।',
    contentBlockedTitle: 'বিষয়বস্তু অবরুদ্ধ',
    safetyError: 'তৈরি করা বিষয়বস্তু নিরাপত্তার কারণে অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে একটি ভিন্ন পাঠ্যপুস্তকের পৃষ্ঠা দিয়ে আবার চেষ্টা করুন।',
    errorTitle: 'একটি ত্রুটি ঘটেছে।',
    errorDescription: 'ওয়ার্কশিট তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    clearButton: 'পরিষ্কার করুন',
    viewHistoryButton: 'ইতিহাস দেখুন',
    historyDialogTitle: 'সংরক্ষিত ওয়ার্কশিট',
    historyDialogDescription: 'আপনি অতীতে যে ওয়ার্কশিটগুলি তৈরি করেছেন সেগুলি এখানে রয়েছে। আপনি সেগুলি দেখতে, লোড করতে বা মুছতে পারেন।',
    noHistory: 'আপনি এখনও কোন ওয়ার্কশিট তৈরি করেননি।',
    loadWorksheetButton: 'ওয়ার্কশিট লোড করুন',
    deleteWorksheetButton: 'মুছুন',
    downloadPdf: 'পিডিএফ ডাউনলোড করুন',
    downloading: 'ডাউনলোড হচ্ছে...',
    pdfError: 'পিডিএফ তৈরি করা যায়নি।',
    formErrors: {
      photo: 'অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন।',
      difficultyLevels: 'অনুগ্রহ করে কমপক্ষে একটি অসুবিধার স্তর নির্বাচন করুন।',
    },
    difficulties: {
      Beginner: 'শিক্ষানবিশ',
      Intermediate: 'মধ্যবর্তী',
      Advanced: 'উন্নত',
    },
    command: {
        empty: 'কোন স্তর পাওয়া যায়নি।',
        placeholder: 'স্তর অনুসন্ধান করুন...',
    }
  },
  Tamil: {
    cardTitle: 'பாடநூல் பக்க விவரங்கள்',
    cardDescription: 'ஒரு புகைப்படத்தைப் பதிவேற்றி சிரம நிலைகளைத் தேர்ந்தெடுக்கவும்.',
    photoLabel: 'பாடநூல் பக்க புகைப்படம்',
    uploadPrompt: 'படத்தை பதிவேற்ற கிளிக் செய்யவும்',
    difficultyLevelsLabel: 'சிரம நிலைகள்',
    selectDifficulties: 'சிரம நிலைகளைத் தேர்ந்தெடுக்கவும்...',
    generateButton: 'பணித்தாள்களை உருவாக்கு',
    generatingButton: 'உருவாக்குகிறது...',
    resultsTitle: 'உருவாக்கப்பட்ட பணித்தாள்கள்',
    resultsDescription: 'ஒவ்வொரு நிலைக்கும் ஏற்றவாறு உருவாக்கப்பட்ட பணித்தாள்கள் இங்கே தோன்றும்.',
    emptyState: 'உங்களால் உருவாக்கப்பட்ட பணித்தாள்கள் இங்கே தோன்றும்.',
    noWorksheetsTitle: 'பணித்தாள்கள் எதுவும் உருவாக்கப்படவில்லை',
    noWorksheetsDescription: 'வழங்கப்பட்ட படத்திலிருந்து AI ஆல் பணித்தாள்களை உருவாக்க முடியவில்லை. தெளிவான படம் அல்லது வேறு பக்கத்தை முயற்சிக்கவும்.',
    contentBlockedTitle: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyError: 'பாதுகாப்பு காரணங்களுக்காக உருவாக்கப்பட்ட உள்ளடக்கம் தடுக்கப்பட்டது। வேறு பாடநூல் பக்கத்துடன் மீண்டும் முயற்சிக்கவும்।',
    errorTitle: 'ஒரு பிழை ஏற்பட்டது.',
    errorDescription: 'பணித்தாள்களை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
    clearButton: 'அழி',
    viewHistoryButton: 'வரலாற்றைக் காண்க',
    historyDialogTitle: 'சேமிக்கப்பட்ட பணித்தாள்கள்',
    historyDialogDescription: 'நீங்கள் கடந்த காலத்தில் உருவாக்கிய பணித்தாள்கள் இங்கே உள்ளன। நீங்கள் அவற்றைப் பார்க்கலாம், ஏற்றலாம் அல்லது நீக்கலாம்।',
    noHistory: 'நீங்கள் இதுவரை எந்த பணித்தாள்களையும் உருவாக்கவில்லை.',
    loadWorksheetButton: 'பணித்தாள்களை ஏற்று',
    deleteWorksheetButton: 'நீக்கு',
    downloadPdf: 'PDF பதிவிறக்கவும்',
    downloading: 'பதிவிறக்குகிறது...',
    pdfError: 'PDF ஐ உருவாக்க முடியவில்லை.',
    formErrors: {
      photo: 'தயவுசெய்து ஒரு படக் கோப்பைப் பதிவேற்றவும்.',
      difficultyLevels: 'தயவுசெய்து குறைந்தது ஒரு சிரம நிலையையாவது தேர்ந்தெடுக்கவும்.',
    },
    difficulties: {
      Beginner: 'தொடக்க',
      Intermediate: 'இடைநிலை',
      Advanced: 'மேம்பட்ட',
    },
    command: {
        empty: 'நிலைகள் எதுவும் இல்லை.',
        placeholder: 'நிலைகளைத் தேடு...',
    }
  },
  Gujarati: {
    cardTitle: 'પાઠ્યપુસ્તક પૃષ્ઠ વિગતો',
    cardDescription: 'ફોટો અપલોડ કરો અને મુશ્કેલી સ્તર પસંદ કરો.',
    photoLabel: 'પાઠ્યપુસ્તક પૃષ્ઠ ફોટો',
    uploadPrompt: 'છબી અપલોડ કરવા માટે ક્લિક કરો',
    difficultyLevelsLabel: 'મુશ્કેલી સ્તર',
    selectDifficulties: 'મુશ્કેલી સ્તર પસંદ કરો...',
    generateButton: 'વર્કશીટ બનાવો',
    generatingButton: 'બનાવી રહ્યું છે...',
    resultsTitle: 'બનાવેલી વર્કશીટ',
    resultsDescription: 'દરેક સ્તર માટે બનાવેલી વર્કશીટ અહીં દેખાશે.',
    emptyState: 'તમારી બનાવેલી વર્કશીટ અહીં દેખાશે.',
    noWorksheetsTitle: 'કોઈ વર્કશીટ બનાવવામાં આવી નથી',
    noWorksheetsDescription: 'આપેલ છબીમાંથી AI વર્કશીટ બનાવી શક્યું નથી. કૃપા કરીને સ્પષ્ટ છબી અથવા અલગ પૃષ્ઠનો પ્રયાસ કરો.',
    contentBlockedTitle: 'સામગ્રી અવરોધિત',
    safetyError: 'બનાવેલી સામગ્રી સુરક્ષા કારણોસર અવરોધિત કરવામાં આવી હતી. કૃપા કરીને અલગ પાઠ્યપુસ્તક પૃષ્ઠ સાથે ફરી પ્રયાસ કરો.',
    errorTitle: 'એક ભૂલ થઈ.',
    errorDescription: 'વર્કશીટ બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    clearButton: 'સાફ કરો',
    viewHistoryButton: 'ઇતિહાસ જુઓ',
    historyDialogTitle: 'સંગ્રહિત વર્કશીટ',
    historyDialogDescription: 'તમે ભૂતકાળમાં બનાવેલી વર્કશીટ અહીં છે. તમે તેમને જોઈ, લોડ કરી અથવા કાઢી શકો છો.',
    noHistory: 'તમે હજી સુધી કોઈ વર્કશીટ બનાવી નથી.',
    loadWorksheetButton: 'વર્કશીટ લોડ કરો',
    deleteWorksheetButton: 'કાઢી નાખો',
    downloadPdf: 'પીડીએફ ડાઉનલોડ કરો',
    downloading: 'ડાઉનલોડ થઈ રહ્યું છે...',
    pdfError: 'પીડીએફ બનાવી શકાયું નથી.',
    formErrors: {
      photo: 'કૃપા કરીને એક છબી ફાઇલ અપલોડ કરો.',
      difficultyLevels: 'કૃપા કરીને ઓછામાં ઓછું એક મુશ્કેલી સ્તર પસંદ કરો.',
    },
    difficulties: {
        Beginner: 'પ્રારંભિક',
        Intermediate: 'મધ્યવર્તી',
        Advanced: 'ઉન્નત',
    },
    command: {
        empty: 'કોઈ સ્તર મળ્યું નથી.',
        placeholder: 'સ્તર શોધો...',
    }
  },
  Malayalam: {
    cardTitle: 'പാഠപുസ്തക പേജ് വിശദാംശങ്ങൾ',
    cardDescription: 'ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് പ്രയാസ നിലവാരം തിരഞ്ഞെടുക്കുക.',
    photoLabel: 'പാഠപുസ്തക പേജ് ഫോട്ടോ',
    uploadPrompt: 'ചിത്രം അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്കുചെയ്യുക',
    difficultyLevelsLabel: 'പ്രയാസ നിലവാരം',
    selectDifficulties: 'പ്രയാസ നിലവാരം തിരഞ്ഞെടുക്കുക...',
    generateButton: 'വർക്ക്ഷീറ്റുകൾ ഉണ്ടാക്കുക',
    generatingButton: 'ഉണ്ടാക്കുന്നു...',
    resultsTitle: 'ഉണ്ടാക്കിയ വർക്ക്ഷീറ്റുകൾ',
    resultsDescription: 'ഓരോ നിലവാരത്തിനും അനുയോജ്യമായ വർക്ക്ഷീറ്റുകൾ ഇവിടെ ദൃശ്യമാകും.',
    emptyState: 'നിങ്ങൾ ഉണ്ടാക്കിയ വർക്ക്ഷീറ്റുകൾ ഇവിടെ ദൃശ്യമാകും.',
    noWorksheetsTitle: 'വർക്ക്ഷീറ്റുകളൊന്നും ഉണ്ടാക്കിയില്ല',
    noWorksheetsDescription: 'നൽകിയിട്ടുള്ള ചിത്രത്തിൽ നിന്ന് AI-ക്ക് വർക്ക്ഷീറ്റുകൾ ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വ്യക്തമായ ഒരു ചിത്രം അല്ലെങ്കിൽ മറ്റൊരു പേജ് ശ്രമിക്കുക.',
    contentBlockedTitle: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyError: 'ഉണ്ടാക്കിയ ഉള്ളടക്കം സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. ദയവായി മറ്റൊരു പാഠപുസ്തക പേജ് ഉപയോഗിച്ച് വീണ്ടും ശ്രമിക്കുക.',
    errorTitle: 'ഒരു പിശക് സംഭവിച്ചു.',
    errorDescription: 'വർക്ക്ഷീറ്റുകൾ ഉണ്ടാക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    clearButton: 'മായ്ക്കുക',
    viewHistoryButton: 'ചരിത്രം കാണുക',
    historyDialogTitle: 'സംഭരിച്ച വർക്ക്ഷീറ്റുകൾ',
    historyDialogDescription: 'നിങ്ങൾ മുൻപ് ഉണ്ടാക്കിയ വർക്ക്ഷീറ്റുകൾ ഇവിടെയുണ്ട്. നിങ്ങൾക്ക് അവ കാണാനും ലോഡുചെയ്യാനും ഇല്ലാതാക്കാനും കഴിയും.',
    noHistory: 'നിങ്ങൾ ഇതുവരെ വർക്ക്ഷീറ്റുകളൊന്നും ഉണ്ടാക്കിയിട്ടില്ല.',
    loadWorksheetButton: 'വർക്ക്ഷീറ്റുകൾ ലോഡുചെയ്യുക',
    deleteWorksheetButton: 'ഇല്ലാതാക്കുക',
    downloadPdf: 'PDF ഡൗൺലോഡ് ചെയ്യുക',
    downloading: 'ഡൗൺലോഡ് ചെയ്യുന്നു...',
    pdfError: 'PDF ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല.',
    formErrors: {
        photo: 'ദയവായി ഒരു ചിത്ര ഫയൽ അപ്‌ലോഡ് ചെയ്യുക.',
        difficultyLevels: 'ദയവായി കുറഞ്ഞത് ഒരു പ്രയാസ നിലവാരമെങ്കിലും തിരഞ്ഞെടുക്കുക.',
    },
    difficulties: {
        Beginner: 'തുടക്കക്കാരൻ',
        Intermediate: 'ഇടത്തരം',
        Advanced: 'വിദഗ്ദ്ധൻ',
    },
    command: {
        empty: 'നിലവാരങ്ങളൊന്നും കണ്ടെത്തിയില്ല.',
        placeholder: 'നിലവാരങ്ങൾ തിരയുക...',
    }
  },
  Punjabi: {
    cardTitle: 'ਪਾਠ ਪੁਸਤਕ ਪੰਨੇ ਦੇ ਵੇਰਵੇ',
    cardDescription: 'ਇੱਕ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ ਅਤੇ ਮੁਸ਼ਕਲ ਪੱਧਰ ਚੁਣੋ।',
    photoLabel: 'ਪਾਠ ਪੁਸਤਕ ਪੰਨੇ ਦੀ ਫੋਟੋ',
    uploadPrompt: 'ਚਿੱਤਰ ਅੱਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
    difficultyLevelsLabel: 'ਮੁਸ਼ਕਲ ਪੱਧਰ',
    selectDifficulties: 'ਮੁਸ਼ਕਲ ਪੱਧਰ ਚੁਣੋ...',
    generateButton: 'ਵਰਕਸ਼ੀਟਾਂ ਬਣਾਓ',
    generatingButton: 'ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...',
    resultsTitle: 'ਬਣਾਈਆਂ ਗਈਆਂ ਵਰਕਸ਼ੀਟਾਂ',
    resultsDescription: 'ਹਰੇਕ ਪੱਧਰ ਲਈ ਬਣਾਈਆਂ ਗਈਆਂ ਵਰਕਸ਼ੀਟਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ।',
    emptyState: 'ਤੁਹਾਡੀਆਂ ਬਣਾਈਆਂ ਗਈਆਂ ਵਰਕਸ਼ੀਟਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ।',
    noWorksheetsTitle: 'ਕੋਈ ਵਰਕਸ਼ੀਟ ਨਹੀਂ ਬਣਾਈ ਗਈ',
    noWorksheetsDescription: 'ਦਿੱਤੀ ਗਈ ਤਸਵੀਰ ਤੋਂ AI ਵਰਕਸ਼ੀਟਾਂ ਨਹੀਂ ਬਣਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸਾਫ਼ ਤਸਵੀਰ ਜਾਂ ਵੱਖਰਾ ਪੰਨਾ ਅਜ਼ਮਾਓ।',
    contentBlockedTitle: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyError: 'ਬਣਾਈ ਗਈ ਸਮੱਗਰੀ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰੇ ਪਾਠ ਪੁਸਤਕ ਪੰਨੇ ਨਾਲ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errorTitle: 'ਇੱਕ ਗਲਤੀ ਹੋਈ।',
    errorDescription: 'ਵਰਕਸ਼ੀਟਾਂ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    clearButton: 'ਸਾਫ਼ ਕਰੋ',
    viewHistoryButton: 'ਇਤਿਹਾਸ ਵੇਖੋ',
    historyDialogTitle: 'ਸਟੋਰ ਕੀਤੀਆਂ ਵਰਕਸ਼ੀਟਾਂ',
    historyDialogDescription: 'ਇੱਥੇ ਉਹ ਵਰਕਸ਼ੀਟਾਂ ਹਨ ਜੋ ਤੁਸੀਂ ਪਿਛਲੇ ਸਮੇਂ ਵਿੱਚ ਬਣਾਈਆਂ ਹਨ। ਤੁਸੀਂ ਉਹਨਾਂ ਨੂੰ ਵੇਖ ਸਕਦੇ ਹੋ, ਲੋਡ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ ਮਿਟਾ ਸਕਦੇ ਹੋ।',
    noHistory: 'ਤੁਸੀਂ ਹਾਲੇ ਤੱਕ ਕੋਈ ਵਰਕਸ਼ੀਟ ਨਹੀਂ ਬਣਾਈ ਹੈ।',
    loadWorksheetButton: 'ਵਰਕਸ਼ੀਟਾਂ ਲੋਡ ਕਰੋ',
    deleteWorksheetButton: 'ਮਿਟਾਓ',
    downloadPdf: 'ਪੀਡੀਐਫ ਡਾਊਨਲੋਡ ਕਰੋ',
    downloading: 'ਡਾਊਨਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    pdfError: 'ਪੀਡੀਐਫ ਤਿਆਰ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ।',
    formErrors: {
        photo: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਚਿੱਤਰ ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ।',
        difficultyLevels: 'ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਮੁਸ਼ਕਲ ਪੱਧਰ ਚੁਣੋ।',
    },
    difficulties: {
        Beginner: 'ਸ਼ੁਰੂਆਤੀ',
        Intermediate: 'ਵਿਚਕਾਰਲਾ',
        Advanced: 'ਉੱਨਤ',
    },
    command: {
        empty: 'ਕੋਈ ਪੱਧਰ ਨਹੀਂ ਮਿਲਿਆ।',
        placeholder: 'ਪੱਧਰ ਖੋਜੋ...',
    }
  },
  Odia: {
    cardTitle: 'ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠା ବିବରଣୀ',
    cardDescription: 'ଏକ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ ଏବଂ କଠିନତା ସ୍ତର ବାଛନ୍ତୁ।',
    photoLabel: 'ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠା ଫଟୋ',
    uploadPrompt: 'ପ୍ରତିଛବି ଅପଲୋଡ୍ କରିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ',
    difficultyLevelsLabel: 'କଠିନତା ସ୍ତର',
    selectDifficulties: 'କଠିନତା ସ୍ତର ବାଛନ୍ତୁ...',
    generateButton: 'କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରନ୍ତୁ',
    generatingButton: 'ସୃଷ୍ଟି କରୁଛି...',
    resultsTitle: 'ସୃଷ୍ଟି ହୋଇଥିବା କାର୍ଯ୍ୟପତ୍ର',
    resultsDescription: 'ପ୍ରତ୍ୟେକ ସ୍ତର ପାଇଁ ପ୍ରସ୍ତୁତ କାର୍ଯ୍ୟପତ୍ର ଏଠାରେ ଦେଖାଯିବ।',
    emptyState: 'ଆପଣଙ୍କର ସୃଷ୍ଟି ହୋଇଥିବା କାର୍ଯ୍ୟପତ୍ର ଏଠାରେ ଦେଖାଯିବ।',
    noWorksheetsTitle: 'କୌଣସି କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି ହୋଇନାହିଁ',
    noWorksheetsDescription: 'AI ପ୍ରଦାନ କରାଯାଇଥିବା ପ୍ରତିଛବିରୁ କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରିପାରିଲା ନାହିଁ। ଦୟାକରି ଏକ ସ୍ପଷ୍ଟ ପ୍ରତିଛବି କିମ୍ବା ଭିନ୍ନ ପୃଷ୍ଠା ଚେଷ୍ଟା କରନ୍ତୁ।',
    contentBlockedTitle: 'ବିଷୟବସ୍ତୁ ଅବରୋଧିତ',
    safetyError: 'ସୁରକ୍ଷା କାରଣରୁ ସୃଷ୍ଟି ହୋଇଥିବା ବିଷୟବସ୍ତୁକୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଏକ ଭିନ୍ନ ପାଠ୍ୟପୁସ୍ତକ ପୃଷ୍ଠା ସହିତ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    errorTitle: 'ଏକ ତ୍ରୁଟି ଘଟିଛି।',
    errorDescription: 'କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    clearButton: 'ସଫା କରନ୍ତୁ',
    viewHistoryButton: 'ଇତିହାସ ଦେଖନ୍ତୁ',
    historyDialogTitle: 'ସଂରକ୍ଷିତ କାର୍ଯ୍ୟପତ୍ର',
    historyDialogDescription: 'ଏଠାରେ ସେହି କାର୍ଯ୍ୟପତ୍ରଗୁଡିକ ଅଛି ଯାହା ଆପଣ ଅତୀତରେ ସୃଷ୍ଟି କରିଛନ୍ତି। ଆପଣ ସେଗୁଡିକୁ ଦେଖିପାରିବେ, ଲୋଡ୍ କରିପାରିବେ କିମ୍ବା ବିଲୋପ କରିପାରିବେ।',
    noHistory: 'ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରିନାହାଁନ୍ତି।',
    loadWorksheetButton: 'କାର୍ଯ୍ୟପତ୍ର ଲୋଡ୍ କରନ୍ତୁ',
    deleteWorksheetButton: 'ବିଲୋପ କରନ୍ତୁ',
    downloadPdf: 'ପିଡିଏଫ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    downloading: 'ଡାଉନଲୋଡ୍ କରୁଛି...',
    pdfError: 'ପିଡିଏଫ୍ ସୃଷ୍ଟି ହୋଇପାରିଲା ନାହିଁ।',
    formErrors: {
        photo: 'ଦୟାକରି ଏକ ପ୍ରତିଛବି ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ।',
        difficultyLevels: 'ଦୟାକରି ଅତିକମରେ ଗୋଟିଏ କଠିନତା ସ୍ତର ବାଛନ୍ତୁ।',
    },
    difficulties: {
        Beginner: 'ପ୍ରାରମ୍ଭିକ',
        Intermediate: 'ମଧ୍ୟମ',
        Advanced: 'ଉନ୍ନତ',
    },
    command: {
        empty: 'କୌଣସି ସ୍ତର ମିଳିଲା ନାହିଁ।',
        placeholder: 'ସ୍ତର ଖୋଜନ୍ତୁ...',
    }
  },
  Assamese: {
    cardTitle: 'পাঠ্যপুথিৰ পৃষ্ঠাৰ বিৱৰণ',
    cardDescription: 'এখন ফটো আপলোড কৰক আৰু কঠিনতাৰ স্তৰ বাছনি কৰক।',
    photoLabel: 'পাঠ্যপুথিৰ পৃষ্ঠাৰ ফটো',
    uploadPrompt: 'ছবি আপলোড কৰিবলৈ ক্লিক কৰক',
    difficultyLevelsLabel: 'কঠিনতাৰ স্তৰ',
    selectDifficulties: 'কঠিনতাৰ স্তৰ বাছনি কৰক...',
    generateButton: 'কাৰ্যপত্ৰ সৃষ্টি কৰক',
    generatingButton: 'সৃষ্টি কৰি আছে...',
    resultsTitle: 'সৃষ্ট কাৰ্যপত্ৰ',
    resultsDescription: 'প্ৰতিটো স্তৰৰ বাবে তৈয়াৰ কৰা কাৰ্যপত্ৰ ইয়াত দেখা যাব।',
    emptyState: 'আপোনাৰ সৃষ্ট কাৰ্যপত্ৰ ইয়াত দেখা যাব।',
    noWorksheetsTitle: 'কোনো কাৰ্যপত্ৰ সৃষ্টি হোৱা নাই',
    noWorksheetsDescription: 'AI-এ প্ৰদান কৰা ছবিৰ পৰা কাৰ্যপত্ৰ সৃষ্টি কৰিব নোৱাৰিলে। অনুগ্ৰহ কৰি এখন স্পষ্ট ছবি বা বেলেগ পৃষ্ঠা চেষ্টা কৰক।',
    contentBlockedTitle: 'বিষয়বস্তু অৱৰোধিত',
    safetyError: 'সৃষ্ট বিষয়বস্তুটো সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি এখন বেলেগ পাঠ্যপুথিৰ পৃষ্ঠাৰে পুনৰ চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescription: 'কাৰ্যপত্ৰ সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    downloadPdf: 'পিডিএফ ডাউনল’ড কৰক',
    downloading: 'ডাউনল’ড কৰি আছে...',
    pdfError: 'পিডিএফ সৃষ্টি কৰিব পৰা নগ\'ল।',
    formErrors: {
        photo: 'অনুগ্ৰহ কৰি এখন ছবি ফাইল আপলোড কৰক।',
        difficultyLevels: 'অনুগ্ৰহ কৰি কমেও এটা কঠিনতাৰ স্তৰ বাছনি কৰক।',
    },
    difficulties: {
        Beginner: 'আৰম্ভণি',
        Intermediate: 'মধ্যম',
        Advanced: 'উন্নত',
    },
    command: {
        empty: 'কোনো স্তৰ পোৱা নগ\'ল।',
        placeholder: 'স্তৰ সন্ধান কৰক...',
    }
  },
  Telugu: {
    cardTitle: 'పాఠ్యపుస్తకం పేజీ వివరాలు',
    cardDescription: 'ఫోటోను అప్‌లోడ్ చేసి కష్టతర స్థాయిలను ఎంచుకోండి.',
    photoLabel: 'పాఠ్యపుస్తకం పేజీ ఫోటో',
    uploadPrompt: 'చిత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి',
    difficultyLevelsLabel: 'కష్టతర స్థాయిలు',
    selectDifficulties: 'కష్టతర స్థాయిలను ఎంచుకోండి...',
    generateButton: 'వర్క్‌షీట్‌లను రూపొందించండి',
    generatingButton: 'రూపొందిస్తోంది...',
    resultsTitle: 'రూపొందించబడిన వర్క్‌షీట్‌లు',
    resultsDescription: 'ప్రతి స్థాయికి అనుగుణంగా రూపొందించబడిన వర్క్‌షీట్‌లు ఇక్కడ కనిపిస్తాయి.',
    emptyState: 'మీరు రూపొందించిన వర్క్‌షీట్‌లు ఇక్కడ కనిపిస్తాయి.',
    noWorksheetsTitle: 'వర్క్‌షీట్‌లు ఏవీ రూపొందించబడలేదు',
    noWorksheetsDescription: 'AI అందించిన చిత్రం నుండి వర్క్‌షీట్‌లను రూపొందించలేకపోయింది. దయచేసి స్పష్టమైన చిత్రం లేదా వేరే పేజీని ప్రయత్నించండి.',
    contentBlockedTitle: 'కంటెంట్ బ్లాక్ చేయబడింది',
    safetyError: 'భద్రతా కారణాల వల్ల రూపొందించబడిన కంటెంట్ బ్లాక్ చేయబడింది. దయచేసి వేరే పాఠ్యపుస్తకం పేజీతో మళ్లీ ప్రయత్నించండి.',
    errorTitle: 'ఒక లోపం సంభవించింది.',
    errorDescription: 'వర్క్‌షీట్‌లను రూపొందించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    clearButton: 'తొలగించు',
    viewHistoryButton: 'చరిత్రను వీక్షించండి',
    historyDialogTitle: 'నిల్వ చేసిన వర్క్‌షీట్‌లు',
    historyDialogDescription: 'మీరు గతంలో రూపొందించిన వర్క్‌షీట్‌లు ఇక్కడ ఉన్నాయి. మీరు వాటిని వీక్షించవచ్చు, లోడ్ చేయవచ్చు లేదా తొలగించవచ్చు.',
    noHistory: 'మీరు ఇంకా ఏ వర్క్‌షీట్‌లను రూపొందించలేదు.',
    loadWorksheetButton: 'వర్క్‌షీట్‌లను లోడ్ చేయండి',
    deleteWorksheetButton: 'తొలగించు',
    downloadPdf: 'PDFని డౌన్‌లోడ్ చేయండి',
    downloading: 'డౌన్‌లోడ్ చేస్తోంది...',
    pdfError: 'PDFని సృష్టించడం సాధ్యం కాలేదు.',
    formErrors: {
        photo: 'దయచేసి ఒక చిత్ర ఫైల్‌ను అప్‌లోడ్ చేయండి.',
        difficultyLevels: 'దయచేసి కనీసం ఒక కష్టతర స్థాయిని ఎంచుకోండి.',
    },
    difficulties: {
        Beginner: 'ప్రారంభ',
        Intermediate: 'మధ్యస్థ',
        Advanced: 'ఉన్నత',
    },
    command: {
        empty: 'స్థాయిలు ఏవీ కనుగొనబడలేదు.',
        placeholder: 'స్థాయిలను శోధించండి...',
    }
  },
  Kannada: {
    cardTitle: 'ಪಠ್ಯಪುಸ್ತಕ ಪುಟದ ವಿವರಗಳು',
    cardDescription: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಕಷ್ಟದ ಮಟ್ಟಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    photoLabel: 'ಪಠ್ಯಪುಸ್ತಕ ಪುಟದ ಫೋಟೋ',
    uploadPrompt: 'ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    difficultyLevelsLabel: 'ಕಷ್ಟದ ಮಟ್ಟಗಳು',
    selectDifficulties: 'ಕಷ್ಟದ ಮಟ್ಟಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ...',
    generateButton: 'ಕಾರ್ಯಪತ್ರಗಳನ್ನು ರಚಿಸಿ',
    generatingButton: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    resultsTitle: 'ರಚಿಸಲಾದ ಕಾರ್ಯಪತ್ರಗಳು',
    resultsDescription: 'ಪ್ರತಿ ಮಟ್ಟಕ್ಕೆ ಅನುಗುಣವಾಗಿ ರಚಿಸಲಾದ ಕಾರ್ಯಪತ್ರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
    emptyState: 'ನಿಮ್ಮ ರಚಿಸಲಾದ ಕಾರ್ಯಪತ್ರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
    noWorksheetsTitle: 'ಯಾವುದೇ ಕಾರ್ಯಪತ್ರಗಳನ್ನು ರಚಿಸಲಾಗಿಲ್ಲ',
    noWorksheetsDescription: 'ನೀಡಲಾದ ಚಿತ್ರದಿಂದ AI ಕಾರ್ಯಪತ್ರಗಳನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಚಿತ್ರ ಅಥವಾ ಬೇರೆ ಪುಟವನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
    contentBlockedTitle: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyError: 'ರಚಿಸಲಾದ ವಿಷಯವನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇರೆ ಪಠ್ಯಪುಸ್ತಕ ಪುಟದೊಂದಿಗೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorTitle: 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ.',
    errorDescription: 'ಕಾರ್ಯಪತ್ರಗಳನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    clearButton: 'ಅಳಿಸಿ',
    viewHistoryButton: 'ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ',
    historyDialogTitle: 'ಸಂಗ್ರಹಿಸಲಾದ ಕಾರ್ಯಪತ್ರಗಳು',
    historyDialogDescription: 'ನೀವು ಹಿಂದೆ ರಚಿಸಿದ ಕಾರ್ಯಪತ್ರಗಳು ಇಲ್ಲಿವೆ. ನೀವು ಅವುಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು, ಲೋಡ್ ಮಾಡಬಹುದು ಅಥವಾ ಅಳಿಸಬಹುದು.',
    noHistory: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಕಾರ್ಯಪತ್ರಗಳನ್ನು ರಚಿಸಿಲ್ಲ.',
    loadWorksheetButton: 'ಕಾರ্যಪತ್ರಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ',
    deleteWorksheetButton: 'ಅಳಿಸಿ',
    downloadPdf: 'PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    downloading: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    pdfError: 'PDF ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
    formErrors: {
        photo: 'ದಯವಿಟ್ಟು ಒಂದು ಚಿತ್ರ ಫೈಲ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
        difficultyLevels: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಕಷ್ಟದ ಮಟ್ಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    },
    difficulties: {
        Beginner: 'ಆರಂಭಿಕ',
        Intermediate: 'ಮಧ್ಯಂತರ',
        Advanced: 'ಮುಂದುವರಿದ',
    },
    command: {
        empty: 'ಯಾವುದೇ ಮಟ್ಟಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
        placeholder: 'ಮಟ್ಟಗಳನ್ನು ಹುಡುಕಿ...',
    }
  },
};

export function WorksheetClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<CreateDifferentiatedWorksheetOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [history, setHistory] = useState<StoredWorksheet[]>([]);
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
      const storedHistory = localStorage.getItem('worksheetHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse worksheetHistory from localStorage', error);
      localStorage.removeItem('worksheetHistory');
    }
  };

  const saveToHistory = (newWorksheet: StoredWorksheet) => {
    const updatedHistory = [newWorksheet, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('worksheetHistory', JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (worksheetId: string) => {
    const updatedHistory = history.filter(ws => ws.id !== worksheetId);
    setHistory(updatedHistory);
    localStorage.setItem('worksheetHistory', JSON.stringify(updatedHistory));
  };
  
  const loadFromHistory = (worksheet: StoredWorksheet) => {
    form.setValue('photoDataUri', worksheet.preview);
    form.setValue('difficultyLevels', worksheet.difficultyLevels);
    setPreview(worksheet.preview);
    setSelectedDifficulties(worksheet.difficultyLevels.split(',').map(s => s.trim()));
    setResult({ worksheets: worksheet.worksheets });
    setError(null);
    setIsHistoryOpen(false);
  };


  const formSchema = z.object({
    photoDataUri: z.string().refine((val) => val.startsWith('data:image/') || val.startsWith('data:application/pdf'), {
      message: t.formErrors.photo,
    }),
    difficultyLevels: z.string().min(1, t.formErrors.difficultyLevels),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: '',
      difficultyLevels: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('photoDataUri', dataUri);
        if (file.type.startsWith('image/')) {
            setPreview(dataUri);
        } else {
            setPreview('/pdf_icon.png');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDifficultySelect = (difficultyValue: string) => {
    const newSelectedDifficulties = selectedDifficulties.includes(difficultyValue)
      ? selectedDifficulties.filter((d) => d !== difficultyValue)
      : [...selectedDifficulties, difficultyValue];
    setSelectedDifficulties(newSelectedDifficulties);
    form.setValue('difficultyLevels', newSelectedDifficulties.join(','));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const worksheetResult = await createDifferentiatedWorksheet(values);
      setResult(worksheetResult);
       if (worksheetResult.worksheets.length > 0) {
        const { photoDataUri, ...otherValues } = values;
        saveToHistory({
          ...otherValues,
          ...worksheetResult,
          id: new Date().toISOString(),
          preview: photoDataUri,
        });
      } else {
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
  
  const handleDownloadPDF = async (content: string, level: string) => {
    if (!content) return;
    setIsDownloading(true);
    try {
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 40;
        let y = 40;

        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(`Worksheet: ${level}`, pdfWidth / 2, y, { align: 'center' });
        y += 25;
        
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pdfWidth - margin, y);
        y += 20;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(11);
        
        const lines = content.split('\n');
        lines.forEach(line => {
            const splitText = pdf.splitTextToSize(line, pdfWidth - margin * 2);
            splitText.forEach((textLine: string) => {
                if (y > pdf.internal.pageSize.getHeight() - margin) {
                    pdf.addPage();
                    y = margin;
                }
                pdf.text(textLine, margin, y);
                y += 15;
            });
        });

        pdf.save(`Worksheet-${level}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast({ variant: 'destructive', title: t.errorTitle, description: t.pdfError });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleClear = () => {
    form.reset();
    setResult(null);
    setError(null);
    setPreview(null);
    setSelectedDifficulties([]);
  };

  const typedDifficultyTranslations = t.difficulties as Record<string, string>;

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
                        <Input id="file-upload" type="file" accept="image/*,application/pdf" className="sr-only" onChange={handleFileChange} />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficultyLevels"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t.difficultyLevelsLabel}</FormLabel>
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
                                    {selectedDifficulties.length > 0
                                        ? selectedDifficulties.map(d => typedDifficultyTranslations[d] || d).join(', ')
                                        : t.selectDifficulties}
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
                                        {difficultyLevels.map((level) => (
                                            <CommandItem
                                                value={level.label}
                                                key={level.value}
                                                onSelect={() => {
                                                    handleDifficultySelect(level.value);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedDifficulties.includes(level.value) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {typedDifficultyTranslations[level.label] || level.label}
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
               <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? t.generatingButton : t.generateButton}
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
                            history.map(ws => (
                                <Card key={ws.id}>
                                <CardHeader className="flex-row items-center gap-4 space-y-0">
                                    <Image src={ws.preview.startsWith('data:image') ? ws.preview : '/pdf_icon.png'} alt="preview" width={64} height={64} className="rounded-md border"/>
                                    <div>
                                        <CardTitle className="text-base">{ws.difficultyLevels}</CardTitle>
                                        <CardDescription>{new Date(ws.id).toLocaleDateString()}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter className="gap-2">
                                    <Button size="sm" onClick={() => loadFromHistory(ws)}>
                                        {t.loadWorksheetButton}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteFromHistory(ws.id)}>
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
              <Tabs defaultValue={result.worksheets[0].difficultyLevel} className="w-full">
                <TabsList>
                  {result.worksheets.map(w => <TabsTrigger key={w.difficultyLevel} value={w.difficultyLevel}>{typedDifficultyTranslations[w.difficultyLevel] || w.difficultyLevel}</TabsTrigger>)}
                </TabsList>
                {result.worksheets.map(w => (
                  <TabsContent key={w.difficultyLevel} value={w.difficultyLevel}>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
                      {w.worksheetContent}
                    </div>
                     <div className="mt-4 flex justify-end">
                      <Button onClick={() => handleDownloadPDF(w.worksheetContent, w.difficultyLevel)} disabled={isDownloading}>
                        <FileDown className="mr-2 h-4 w-4" />
                        {isDownloading ? t.downloading : t.downloadPdf}
                      </Button>
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
