
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
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
import { subjects, grades } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Layers, ShieldAlert, Check, ChevronsUpDown, XCircle, History, Trash2 } from 'lucide-react';
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
    viewHistoryButton: 'View History',
    historyDialogTitle: 'Stored Worksheets',
    historyDialogDescription: 'Here are the worksheets you have generated in the past. You can view, load, or delete them.',
    noHistory: 'You have not generated any worksheets yet.',
    loadWorksheetButton: 'Load Worksheets',
    deleteWorksheetButton: 'Delete',
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
    viewHistoryButton: 'इतिहास देखें',
    historyDialogTitle: 'संग्रहीत वर्कशीट',
    historyDialogDescription: 'यहाँ वे वर्कशीट हैं जो आपने अतीत में उत्पन्न की हैं। आप उन्हें देख, लोड या हटा सकते हैं।',
    noHistory: 'आपने अभी तक कोई वर्कशीट उत्पन्न नहीं की है।',
    loadWorksheetButton: 'वर्कशीट लोड करें',
    deleteWorksheetButton: 'हटाएं',
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
    viewHistoryButton: 'इतिहास पहा',
    historyDialogTitle: 'साठवलेली कार्यपत्रके',
    historyDialogDescription: 'तुम्ही पूर्वी तयार केलेली कार्यपत्रके येथे आहेत. तुम्ही ती पाहू शकता, लोड करू शकता किंवा हटवू शकता.',
    noHistory: 'तुम्ही अद्याप कोणतीही कार्यपत्रके तयार केलेली नाहीत.',
    loadWorksheetButton: 'कार्यपत्रके लोड करा',
    deleteWorksheetButton: 'हटवा',
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
    cardTitle: 'درسی کتاب ہُنٛد صفحہٕ تفصیل',
    cardDescription: 'اَکھ فوٹو اپلوڈ کریو تہٕ تفصیل دِیُو۔',
    photoLabel: 'درسی کتاب ہُنٛد صفحہٕ فوٹو',
    uploadPrompt: 'تصویر اپلوڈ کرنہٕ خٲطرٕ کلک کریو',
    gradeLevelsLabel: 'گریڈ سطح',
    selectGrades: 'گریڈ ژارٕو...',
    subjectLabel: 'مضمون',
    subjectPlaceholder: 'اکھ مضمون ژارٕو',
    chapterLabel: 'باب',
    chapterPlaceholder: 'اکھ باب ژارٕو',
    generateButton: 'ورک شیٹ تیار کریو',
    generatingButton: 'تیار کران...',
    resultsTitle: 'تیار کرنہٕ آمٕتہ ورک شیٹ',
    resultsDescription: 'پرٛتھ گریڈ سطح خٲطرٕ تیار کرنہٕ آمٕتہ ورک شیٹس ییٚتہِ ظٲہر گژھن۔',
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
    formErrors: {
      photo: 'مہربانی کرِتھ اَکھ تصویر فائل اپلوڈ کریو۔',
      gradeLevels: 'مہربانی کرِتھ کم از کم اَکھ گریڈ سطح ژارٕو۔',
      subject: 'مہربانی کرِتھ اَکھ مضمون ژارٕو۔',
      chapter: 'مہربانی کرِتھ اَکھ باب ژارٕو۔',
    },
    grades: {
        'Grade 1': 'گریڈ 1', 'Grade 2': 'گریڈ 2', 'Grade 3': 'گریڈ 3', 'Grade 4': 'گریڈ 4', 'Grade 5': 'گریڈ 5', 'Grade 6': 'گریڈ 6', 'Grade 7': 'گریڈ 7', 'Grade 8': 'گریڈ 8', 'Grade 9': 'گریڈ 9', 'Grade 10': 'گریڈ 10', 'Grade 11': 'گریڈ 11', 'Grade 12': 'گریڈ 12',
    },
    command: {
        empty: 'کانٛہہ گریڈ چھُ نہٕ لبنہٕ آمُت۔',
        placeholder: 'گریڈ ژھانڈیو...',
    }
  },
  Bengali: {
    cardTitle: 'পাঠ্যপুস্তকের পৃষ্ঠার বিবরণ',
    cardDescription: 'একটি ছবি আপলোড করুন এবং বিবরণ দিন।',
    photoLabel: 'পাঠ্যপুস্তকের পৃষ্ঠার ছবি',
    uploadPrompt: 'ছবি আপলোড করতে ক্লিক করুন',
    gradeLevelsLabel: 'শ্রেণী স্তর',
    selectGrades: 'শ্রেণী নির্বাচন করুন...',
    subjectLabel: 'বিষয়',
    subjectPlaceholder: 'একটি বিষয় নির্বাচন করুন',
    chapterLabel: 'অধ্যায়',
    chapterPlaceholder: 'একটি অধ্যায় নির্বাচন করুন',
    generateButton: 'ওয়ার্কশিট তৈরি করুন',
    generatingButton: 'তৈরি করা হচ্ছে...',
    resultsTitle: 'উত্পন্ন ওয়ার্কশিট',
    resultsDescription: 'প্রতিটি শ্রেণীর জন্য তৈরি ওয়ার্কশিট এখানে প্রদর্শিত হবে।',
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
    formErrors: {
      photo: 'অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন।',
      gradeLevels: 'অনুগ্রহ করে কমপক্ষে একটি শ্রেণী স্তর নির্বাচন করুন।',
      subject: 'অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।',
      chapter: 'অনুগ্রহ করে একটি অধ্যায় নির্বাচন করুন।',
    },
    grades: {
      'Grade 1': 'প্রথম শ্রেণী', 'Grade 2': 'দ্বিতীয় শ্রেণী', 'Grade 3': 'তৃতীয় শ্রেণী', 'Grade 4': 'চতুর্থ শ্রেণী', 'Grade 5': 'পঞ্চম শ্রেণী', 'Grade 6': 'ষষ্ঠ শ্রেণী', 'Grade 7': 'সপ্তম শ্রেণী', 'Grade 8': 'অষ্টম শ্রেণী', 'Grade 9': 'নবম শ্রেণী', 'Grade 10': 'দশম শ্রেণী', 'Grade 11': 'একাদশ শ্রেণী', 'Grade 12': 'দ্বাদশ শ্রেণী',
    },
    command: {
        empty: 'কোন শ্রেণী পাওয়া যায়নি।',
        placeholder: 'শ্রেণী অনুসন্ধান করুন...',
    }
  },
  Tamil: {
    cardTitle: 'பாடநூல் பக்க விவரங்கள்',
    cardDescription: 'ஒரு புகைப்படத்தைப் பதிவேற்றி விவரங்களை வழங்கவும்.',
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
    formErrors: {
      photo: 'தயவுசெய்து ஒரு படக் கோப்பைப் பதிவேற்றவும்.',
      gradeLevels: 'தயவுசெய்து குறைந்தது ஒரு வகுப்பு நிலையையாவது தேர்ந்தெடுக்கவும்.',
      subject: 'தயவுசெய்து ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்.',
      chapter: 'தயவுசெய்து ஒரு அத்தியாயத்தைத் தேர்ந்தெடுக்கவும்.',
    },
    grades: {
      'Grade 1': 'முதலாம் வகுப்பு', 'Grade 2': 'இரண்டாம் வகுப்பு', 'Grade 3': 'மூன்றாம் வகுப்பு', 'Grade 4': 'நான்காம் வகுப்பு', 'Grade 5': 'ஐந்தாம் வகுப்பு', 'Grade 6': 'ஆறாம் வகுப்பு', 'Grade 7': 'ஏழாம் வகுப்பு', 'Grade 8': 'எட்டாம் வகுப்பு', 'Grade 9': 'ஒன்பதாம் வகுப்பு', 'Grade 10': 'பத்தாம் வகுப்பு', 'Grade 11': 'பதினொன்றாம் வகுப்பு', 'Grade 12': 'பன்னிரண்டாம் வகுப்பு',
    },
    command: {
        empty: 'வகுப்புகள் எதுவும் இல்லை.',
        placeholder: 'வகுப்புகளைத் தேடு...',
    }
  },
  Telugu: {
    cardTitle: 'పాఠ్యపుస్తకం పేజీ వివరాలు',
    cardDescription: 'ఫోటోను అప్‌లోడ్ చేసి వివరాలు అందించండి.',
    photoLabel: 'పాఠ్యపుస్తకం పేజీ ఫోటో',
    uploadPrompt: 'చిత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి',
    gradeLevelsLabel: 'తరగతి స్థాయిలు',
    selectGrades: 'తరగతులను ఎంచుకోండి...',
    subjectLabel: 'విషయం',
    subjectPlaceholder: 'ఒక విషయాన్ని ఎంచుకోండి',
    chapterLabel: 'అధ్యాయం',
    chapterPlaceholder: 'ఒక అధ్యాయాన్ని ఎంచుకోండి',
    generateButton: 'వర్క్‌షీట్‌లను రూపొందించండి',
    generatingButton: 'రూపొందిస్తోంది...',
    resultsTitle: 'రూపొందించబడిన వర్క్‌షీట్‌లు',
    resultsDescription: 'ప్రతి తరగతి స్థాయికి అనుగుణంగా రూపొందించబడిన వర్క్‌షీట్‌లు ఇక్కడ కనిపిస్తాయి.',
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
    formErrors: {
        photo: 'దయచేసి ఒక చిత్ర ఫైల్‌ను అప్‌లోడ్ చేయండి.',
        gradeLevels: 'దయచేసి కనీసం ఒక తరగతి స్థాయిని ఎంచుకోండి.',
        subject: 'దయచేసి ఒక విషయాన్ని ఎంచుకోండి.',
        chapter: 'దయచేసి ఒక అధ్యాయాన్ని ఎంచుకోండి.',
    },
    grades: {
        'Grade 1': '1వ తరగతి', 'Grade 2': '2వ తరగతి', 'Grade 3': '3వ తరగతి', 'Grade 4': '4వ తరగతి', 'Grade 5': '5వ తరగతి', 'Grade 6': '6వ తరగతి', 'Grade 7': '7వ తరగతి', 'Grade 8': '8వ తరగతి', 'Grade 9': '9వ తరగతి', 'Grade 10': '10వ తరగతి', 'Grade 11': '11వ తరగతి', 'Grade 12': '12వ తరగతి',
    },
    command: {
        empty: 'తరగతులు ఏవీ కనుగొనబడలేదు.',
        placeholder: 'తరగతులను శోధించండి...',
    }
  },
  Kannada: {
    cardTitle: 'ಪಠ್ಯಪುಸ್ತಕ ಪುಟದ ವಿವರಗಳು',
    cardDescription: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ವಿವರಗಳನ್ನು ನೀಡಿ.',
    photoLabel: 'ಪಠ್ಯಪುಸ್ತಕ ಪುಟದ ಫೋಟೋ',
    uploadPrompt: 'ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    gradeLevelsLabel: 'ದರ್ಜೆ ಮಟ್ಟಗಳು',
    selectGrades: 'ದರ್ಜೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ...',
    subjectLabel: 'ವಿಷಯ',
    subjectPlaceholder: 'ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    chapterLabel: 'ಅಧ್ಯಾಯ',
    chapterPlaceholder: 'ಒಂದು ಅಧ್ಯಾಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    generateButton: 'ಕಾರ್ಯಪತ್ರಗಳನ್ನು ರಚಿಸಿ',
    generatingButton: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    resultsTitle: 'ರಚಿಸಲಾದ ಕಾರ್ಯಪತ್ರಗಳು',
    resultsDescription: 'ಪ್ರತಿ ದರ್ಜೆಯ ಮಟ್ಟಕ್ಕೆ ಅನುಗುಣವಾಗಿ ರಚಿಸಲಾದ ಕಾರ್ಯಪತ್ರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
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
    loadWorksheetButton: 'ಕಾರ್ಯಪತ್ರಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ',
    deleteWorksheetButton: 'ಅಳಿಸಿ',
    formErrors: {
        photo: 'ದಯವಿಟ್ಟು ಒಂದು ಚಿತ್ರ ಫೈಲ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
        gradeLevels: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ದರ್ಜೆ ಮಟ್ಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
        subject: 'ದಯವಿಟ್ಟು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
        chapter: 'ದಯವಿಟ್ಟು ಒಂದು ಅಧ್ಯಾಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    },
    grades: {
        'Grade 1': '1ನೇ ತರಗತಿ', 'Grade 2': '2ನೇ ತರಗತಿ', 'Grade 3': '3ನೇ ತರಗತಿ', 'Grade 4': '4ನೇ ತರಗತಿ', 'Grade 5': '5ನೇ ತರಗತಿ', 'Grade 6': '6ನೇ ತರಗತಿ', 'Grade 7': '7ನೇ ತರಗತಿ', 'Grade 8': '8ನೇ ತರಗತಿ', 'Grade 9': '9ನೇ ತರಗತಿ', 'Grade 10': '10ನೇ ತರಗತಿ', 'Grade 11': '11ನೇ ತರಗತಿ', 'Grade 12': '12ನೇ ತರಗತಿ',
    },
    command: {
        empty: 'ಯಾವುದೇ ದರ್ಜೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
        placeholder: 'ದರ್ಜೆಗಳನ್ನು ಹುಡುಕಿ...',
    }
  },
  Gujarati: {
    cardTitle: 'પાઠ્યપુસ્તક પૃષ્ઠ વિગતો',
    cardDescription: 'ફોટો અપલોડ કરો અને વિગતો આપો.',
    photoLabel: 'પાઠ્યપુસ્તક પૃષ્ઠ ફોટો',
    uploadPrompt: 'છબી અપલોડ કરવા માટે ક્લિક કરો',
    gradeLevelsLabel: 'ધોરણ સ્તર',
    selectGrades: 'ધોરણ પસંદ કરો...',
    subjectLabel: 'વિષય',
    subjectPlaceholder: 'એક વિષય પસંદ કરો',
    chapterLabel: 'પ્રકરણ',
    chapterPlaceholder: 'એક પ્રકરણ પસંદ કરો',
    generateButton: 'વર્કશીટ બનાવો',
    generatingButton: 'બનાવી રહ્યું છે...',
    resultsTitle: 'બનાવેલી વર્કશીટ',
    resultsDescription: 'દરેક ધોરણ સ્તર માટે બનાવેલી વર્કશીટ અહીં દેખાશે.',
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
    formErrors: {
        photo: 'કૃપા કરીને એક છબી ફાઇલ અપલોડ કરો.',
        gradeLevels: 'કૃપા કરીને ઓછામાં ઓછું એક ધોરણ સ્તર પસંદ કરો.',
        subject: 'કૃપા કરીને એક વિષય પસંદ કરો.',
        chapter: 'કૃપા કરીને એક પ્રકરણ પસંદ કરો.',
    },
    grades: {
        'Grade 1': 'ધોરણ 1', 'Grade 2': 'ધોરણ 2', 'Grade 3': 'ધોરણ 3', 'Grade 4': 'ધોરણ 4', 'Grade 5': 'ધોરણ 5', 'Grade 6': 'ધોરણ 6', 'Grade 7': 'ધોરણ 7', 'Grade 8': 'ધોરણ 8', 'Grade 9': 'ધોરણ 9', 'Grade 10': 'ધોરણ 10', 'Grade 11': 'ધોરણ 11', 'Grade 12': 'ધોરણ 12',
    },
    command: {
        empty: 'કોઈ ધોરણ મળ્યું નથી.',
        placeholder: 'ધોરણ શોધો...',
    }
  },
  Malayalam: {
    cardTitle: 'പാഠപുസ്തക പേജ് വിശദാംശങ്ങൾ',
    cardDescription: 'ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് വിശദാംശങ്ങൾ നൽകുക.',
    photoLabel: 'പാഠപുസ്തക പേജ് ഫോട്ടോ',
    uploadPrompt: 'ചിത്രം അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്കുചെയ്യുക',
    gradeLevelsLabel: 'ഗ്രേഡ് നിലവാരം',
    selectGrades: 'ഗ്രേഡുകൾ തിരഞ്ഞെടുക്കുക...',
    subjectLabel: 'വിഷയം',
    subjectPlaceholder: 'ഒരു വിഷയം തിരഞ്ഞെടുക്കുക',
    chapterLabel: 'അധ്യായം',
    chapterPlaceholder: 'ഒരു അധ്യായം തിരഞ്ഞെടുക്കുക',
    generateButton: 'വർക്ക്ഷീറ്റുകൾ ഉണ്ടാക്കുക',
    generatingButton: 'ഉണ്ടാക്കുന്നു...',
    resultsTitle: 'ഉണ്ടാക്കിയ വർക്ക്ഷീറ്റുകൾ',
    resultsDescription: 'ഓരോ ഗ്രേഡ് നിലവാരത്തിനും അനുയോജ്യമായ വർക്ക്ഷീറ്റുകൾ ഇവിടെ ദൃശ്യമാകും.',
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
    formErrors: {
        photo: 'ദയവായി ഒരു ചിത്ര ഫയൽ അപ്‌ലോഡ് ചെയ്യുക.',
        gradeLevels: 'ദയവായി കുറഞ്ഞത് ഒരു ഗ്രേഡ് നിലവാരമെങ്കിലും തിരഞ്ഞെടുക്കുക.',
        subject: 'ദയവായി ഒരു വിഷയം തിരഞ്ഞെടുക്കുക.',
        chapter: 'ദയവായി ഒരു അധ്യായം തിരഞ്ഞെടുക്കുക.',
    },
    grades: {
        'Grade 1': 'ഒന്നാം ക്ലാസ്', 'Grade 2': 'രണ്ടാം ക്ലാസ്', 'Grade 3': 'മൂന്നാം ക്ലാസ്', 'Grade 4': 'നാലാം ക്ലാസ്', 'Grade 5': 'അഞ്ചാം ക്ലാസ്', 'Grade 6': 'ആറാം ക്ലാസ്', 'Grade 7': 'ഏഴാം ക്ലാസ്', 'Grade 8': 'എട്ടാം ക്ലാസ്', 'Grade 9': 'ഒമ്പതാം ക്ലാസ്', 'Grade 10': 'പത്താം ക്ലാസ്', 'Grade 11': 'പതിനൊന്നാം ക്ലാസ്', 'Grade 12': 'പന്ത്രണ്ടാം ക്ലാസ്',
    },
    command: {
        empty: 'ഗ്രേഡുകളൊന്നും കണ്ടെത്തിയില്ല.',
        placeholder: 'ഗ്രേഡുകൾ തിരയുക...',
    }
  },
  Punjabi: {
    cardTitle: 'ਪਾਠ ਪੁਸਤਕ ਪੰਨੇ ਦੇ ਵੇਰਵੇ',
    cardDescription: 'ਇੱਕ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ ਅਤੇ ਵੇਰਵੇ ਦਿਓ।',
    photoLabel: 'ਪਾਠ ਪੁਸਤਕ ਪੰਨੇ ਦੀ ਫੋਟੋ',
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
    formErrors: {
        photo: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਚਿੱਤਰ ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ।',
        gradeLevels: 'ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਗ੍ਰੇਡ ਪੱਧਰ ਚੁਣੋ।',
        subject: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵਿਸ਼ਾ ਚੁਣੋ।',
        chapter: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਅਧਿਆਇ ਚੁਣੋ।',
    },
    grades: {
        'Grade 1': 'ਪਹਿਲੀ ਜਮਾਤ', 'Grade 2': 'ਦੂਜੀ ਜਮਾਤ', 'Grade 3': 'ਤੀਜੀ ਜਮਾਤ', 'Grade 4': 'ਚੌਥੀ ਜਮਾਤ', 'Grade 5': 'ਪੰਜਵੀਂ ਜਮਾਤ', 'Grade 6': 'ਛੇਵੀਂ ਜਮਾਤ', 'Grade 7': 'ਸੱਤਵੀਂ ਜਮਾਤ', 'Grade 8': 'ਅੱਠਵੀਂ ਜਮਾਤ', 'Grade 9': 'ਨੌਵੀਂ ਜਮਾਤ', 'Grade 10': 'ਦਸਵੀਂ ਜਮਾਤ', 'Grade 11': 'ਗਿਆਰ੍ਹਵੀਂ ਜਮਾਤ', 'Grade 12': 'ਬਾਰ੍ਹਵੀਂ ਜਮਾਤ',
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
    gradeLevelsLabel: 'ଶ୍ରେଣୀ ସ୍ତର',
    selectGrades: 'ଶ୍ରେଣୀ ବାଛନ୍ତୁ...',
    subjectLabel: 'ବିଷୟ',
    subjectPlaceholder: 'ଏକ ବିଷୟ ବାଛନ୍ତୁ',
    chapterLabel: 'ଅଧ୍ୟାୟ',
    chapterPlaceholder: 'ଏକ ଅଧ୍ୟାୟ ବାଛନ୍ତୁ',
    generateButton: 'କାର୍ଯ୍ୟପତ୍ର ସୃଷ୍ଟି କରନ୍ତୁ',
    generatingButton: 'ସୃଷ୍ଟି କରୁଛି...',
    resultsTitle: 'ସୃଷ୍ଟି ହୋଇଥିବା କାର୍ଯ୍ୟପତ୍ର',
    resultsDescription: 'ପ୍ରତ୍ୟେକ ଶ୍ରେଣୀ ସ୍ତର ପାଇଁ ପ୍ରସ୍ତୁତ କାର୍ଯ୍ୟପତ୍ର ଏଠାରେ ଦେଖାଯିବ।',
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
    formErrors: {
        photo: 'ଦୟାକରି ଏକ ପ୍ରତିଛବି ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ।',
        gradeLevels: 'ଦୟାକରି ଅତିକମରେ ଗୋଟିଏ ଶ୍ରେଣୀ ସ୍ତର ବାଛନ୍ତୁ।',
        subject: 'ଦୟାକରି ଏକ ବିଷୟ ବାଛନ୍ତୁ।',
        chapter: 'ଦୟାକରି ଏକ ଅଧ୍ୟାୟ ବାଛନ୍ତୁ।',
    },
    grades: {
        'Grade 1': 'ପ୍ରଥମ ଶ୍ରେଣୀ', 'Grade 2': 'ଦ୍ୱିତୀୟ ଶ୍ରେଣୀ', 'Grade 3': 'ତୃତୀୟ ଶ୍ରେଣୀ', 'Grade 4': 'ଚତୁର୍ଥ ଶ୍ରେଣୀ', 'Grade 5': 'ପଞ୍ଚମ ଶ୍ରେଣୀ', 'Grade 6': 'ଷଷ୍ଠ ଶ୍ରେଣୀ', 'Grade 7': 'ସପ୍ତମ ଶ୍ରେଣୀ', 'Grade 8': 'ଅଷ୍ଟମ ଶ୍ରେଣୀ', 'Grade 9': 'ନବମ ଶ୍ରେଣୀ', 'Grade 10': 'ଦଶମ ଶ୍ରେଣୀ', 'Grade 11': 'ଏକାଦଶ ଶ୍ରେଣୀ', 'Grade 12': 'ଦ୍ୱାଦଶ ଶ୍ରେଣୀ',
    },
    command: {
        empty: 'କୌଣସି ଶ୍ରେଣୀ ମିଳିଲା ନାହିଁ।',
        placeholder: 'ଶ୍ରେଣୀ ଖୋଜନ୍ତୁ...',
    }
  },
  Assamese: {
    cardTitle: 'পাঠ্যপুথিৰ পৃষ্ঠাৰ বিৱৰণ',
    cardDescription: 'এখন ফটো আপলোড কৰক আৰু বিৱৰণ দিয়ক।',
    photoLabel: 'পাঠ্যপুথিৰ পৃষ্ঠাৰ ফটো',
    uploadPrompt: 'ছবি আপলোড কৰিবলৈ ক্লিক কৰক',
    gradeLevelsLabel: 'শ্ৰেণীৰ স্তৰ',
    selectGrades: 'শ্ৰেণী বাছনি কৰক...',
    subjectLabel: 'বিষয়',
    subjectPlaceholder: 'এটা বিষয় বাছনি কৰক',
    chapterLabel: 'অধ্যায়',
    chapterPlaceholder: 'এটা অধ্যায় বাছনি কৰক',
    generateButton: 'কাৰ্যপত্ৰ সৃষ্টি কৰক',
    generatingButton: 'সৃষ্টি কৰি আছে...',
    resultsTitle: 'সৃষ্ট কাৰ্যপত্ৰ',
    resultsDescription: 'প্ৰতিটো শ্ৰেণীৰ স্তৰৰ বাবে তৈয়াৰ কৰা কাৰ্যপত্ৰ ইয়াত দেখা যাব।',
    emptyState: 'আপোনাৰ সৃষ্ট কাৰ্যপত্ৰ ইয়াত দেখা যাব।',
    noWorksheetsTitle: 'কোনো কাৰ্যপত্ৰ সৃষ্টি হোৱা নাই',
    noWorksheetsDescription: 'AI-এ প্ৰদান কৰা ছবিৰ পৰা কাৰ্যপত্ৰ সৃষ্টি কৰিব নোৱাৰিলে। অনুগ্ৰহ কৰি এখন স্পষ্ট ছবি বা বেলেগ পৃষ্ঠা চেষ্টা কৰক।',
    contentBlockedTitle: 'বিষয়বস্তু অৱৰোধিত',
    safetyError: 'সৃষ্ট বিষয়বস্তুটো সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি এখন বেলেগ পাঠ্যপুথিৰ পৃষ্ঠাৰে পুনৰ চেষ্টা কৰক।',
    errorTitle: 'এটা ত্ৰুটি হৈছে।',
    errorDescription: 'কাৰ্যপত্ৰ সৃষ্টি কৰাত విఫల হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    formErrors: {
        photo: 'অনুগ্ৰহ কৰি এখন ছবি ফাইল আপলোড কৰক।',
        gradeLevels: 'অনুগ্ৰহ কৰি কমেও এটা শ্ৰেণীৰ স্তৰ বাছনি কৰক।',
        subject: 'অনুগ্ৰহ কৰি এটা বিষয় বাছনি কৰক।',
        chapter: 'অনুগ্ৰহ কৰি এটা অধ্যায় বাছনি কৰক।',
    },
    grades: {
        'Grade 1': 'প্ৰথম শ্ৰেণী', 'Grade 2': 'দ্বিতীয় শ্ৰেণী', 'Grade 3': 'তৃতীয় শ্ৰেণী', 'Grade 4': 'চতুৰ্থ শ্ৰেণী', 'Grade 5': 'পঞ্চম শ্ৰেণী', 'Grade 6': 'ষষ্ঠ শ্ৰেণী', 'Grade 7': 'সপ্তম শ্ৰেণী', 'Grade 8': 'অষ্টম শ্ৰেণী', 'Grade 9': 'নৱম শ্ৰেণী', 'Grade 10': 'দশম শ্ৰেণী', 'Grade 11': 'একাদশ শ্ৰেণী', 'Grade 12': 'দ্বাদশ শ্ৰেণী',
    },
    command: {
        empty: 'কোনো শ্ৰেণী পোৱা নগ\'ল।',
        placeholder: 'শ্ৰেণী সন্ধান কৰক...',
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
    form.setValue('gradeLevels', worksheet.gradeLevels);
    form.setValue('subject', worksheet.subject);
    form.setValue('chapter', worksheet.chapter);
    setPreview(worksheet.preview);
    setSelectedGrades(worksheet.gradeLevels.split(',').map(s => s.trim()));
    setSelectedSubject(worksheet.subject);
    setResult({ worksheets: worksheet.worksheets });
    setError(null);
    setIsHistoryOpen(false);
  };


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
                                    <Image src={ws.preview} alt="preview" width={64} height={64} className="rounded-md border"/>
                                    <div>
                                        <CardTitle className="text-base">{ws.subject} - {ws.chapter}</CardTitle>
                                        <CardDescription>{ws.gradeLevels}</CardDescription>
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
