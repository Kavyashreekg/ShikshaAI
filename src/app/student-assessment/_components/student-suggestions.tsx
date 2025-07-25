'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/lib/student-data';
import { generateStudentSuggestions } from '@/ai/flows/generate-student-suggestions';
import type { GenerateStudentSuggestionsOutput } from '@/ai/flows/generate-student-suggestions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    title: 'AI-Powered Suggestions',
    description: 'Get personalized suggestions for this student.',
    generateButton: 'Generate Suggestions',
    generatingButton: 'Generating...',
    generatePrompt: (name: string) => `Click the button to generate personalized learning suggestions for ${name}.`,
    errorTitle: 'Content Blocked',
    safetyError: 'The generated suggestions were blocked for safety reasons. Please review the student notes and try again.',
    generalError: 'Failed to generate suggestions. Please try again.',
  },
  Hindi: {
    title: 'एआई-संचालित सुझाव',
    description: 'इस छात्र के लिए व्यक्तिगत सुझाव प्राप्त करें।',
    generateButton: 'सुझाव उत्पन्न करें',
    generatingButton: 'उत्पन्न हो रहा है...',
    generatePrompt: (name: string) => `${name} के लिए व्यक्तिगत सीखने के सुझाव उत्पन्न करने के लिए बटन पर क्लिक करें।`,
    errorTitle: 'सामग्री अवरुद्ध',
    safetyError: 'उत्पन्न सुझावों को सुरक्षा कारणों से अवरुद्ध कर दिया गया था। कृपया छात्र नोट्स की समीक्षा करें और पुनः प्रयास करें।',
    generalError: 'सुझाव उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
  },
  Marathi: {
    title: 'एआय-समर्थित सूचना',
    description: 'या विद्यार्थ्यासाठी वैयक्तिकृत सूचना मिळवा.',
    generateButton: 'सूचना तयार करा',
    generatingButton: 'तयार करत आहे...',
    generatePrompt: (name: string) => `${name} साठी वैयक्तिकृत शिक्षण सूचना तयार करण्यासाठी बटणावर क्लिक करा.`,
    errorTitle: 'सामग्री अवरोधित',
    safetyError: 'तयार केलेल्या सूचना सुरक्षिततेच्या कारणास्तव अवरोधित केल्या गेल्या. कृपया विद्यार्थ्यांच्या नोंदींचे पुनरावलोकन करा आणि पुन्हा प्रयत्न करा.',
    generalError: 'सूचना तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
  },
  Kashmiri: {
    title: 'AI سٟتؠ تجاویز',
    description: 'اَتھ طالب علم خٲطرٕ شخصی تجاویز حٲصِل کریو۔',
    generateButton: 'تجاویز تیار کریو',
    generatingButton: 'تیار کران...',
    generatePrompt: (name: string) => `${name} خٲطرٕ شخصی تٲلیمی تجاویز تیار کرنہٕ خٲطرٕ بٹنس پؠٹھ کلک کریو۔`,
    errorTitle: 'مواد بلاک کرنہٕ آمت',
    safetyError: 'تیار کرنہٕ آمٕتہ تجاویز آیہِ حفاظتی وجوہاتن ہِنٛدِ بنا پؠٹھ بلاک کرنہٕ۔ مہربانی کرِتھ طالب علم سٕنٛد نوٹسن ہُنٛد جٲیزٕ نِیو تہٕ دوبارٕ کوشش کریو۔',
    generalError: 'تجاویز تیار کرنس مَنٛز ناکام۔ مہربانی کرِتھ دوبارٕ کوشش کریو۔',
  },
  Bengali: {
    title: 'এআই-চালিত পরামর্শ',
    description: 'এই ছাত্রের জন্য ব্যক্তিগতকৃত পরামর্শ পান।',
    generateButton: 'পরামর্শ তৈরি করুন',
    generatingButton: 'তৈরি করা হচ্ছে...',
    generatePrompt: (name: string) => `${name} এর জন্য ব্যক্তিগতকৃত শেখার পরামর্শ তৈরি করতে বোতামে ক্লিক করুন।`,
    errorTitle: 'বিষয়বস্তু অবরুদ্ধ',
    safetyError: 'উত্পন্ন পরামর্শগুলি সুরক্ষার কারণে অবরুদ্ধ করা হয়েছিল। অনুগ্রহ করে ছাত্রের নোট পর্যালোচনা করুন এবং আবার চেষ্টা করুন।',
    generalError: 'পরামর্শ তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  },
  Tamil: {
    title: 'AI-ஆதரவு பரிந்துரைகள்',
    description: 'இந்த மாணவருக்கான தனிப்பயனாக்கப்பட்ட பரிந்துரைகளைப் பெறுங்கள்.',
    generateButton: 'பரிந்துரைகளை உருவாக்கு',
    generatingButton: 'உருவாக்குகிறது...',
    generatePrompt: (name: string) => `${name} க்கான தனிப்பயனாக்கப்பட்ட கற்றல் பரிந்துரைகளை உருவாக்க பொத்தானைக் கிளிக் செய்யவும்.`,
    errorTitle: 'உள்ளடக்கம் தடுக்கப்பட்டது',
    safetyError: 'உருவாக்கப்பட்ட பரிந்துரைகள் பாதுகாப்பு காரணங்களுக்காக தடுக்கப்பட்டன। தயவுசெய்து மாணவர் குறிப்புகளை மதிப்பாய்வு செய்து மீண்டும் முயற்சிக்கவும்।',
    generalError: 'பரிந்துரைகளை உருவாக்கத் தவறிவிட்டது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
  },
  Gujarati: {
    title: 'AI-સંચાલિત સૂચનો',
    description: 'આ વિદ્યાર્થી માટે વ્યક્તિગત સૂચનો મેળવો.',
    generateButton: 'સૂચનો બનાવો',
    generatingButton: 'બનાવી રહ્યું છે...',
    generatePrompt: (name: string) => `${name} માટે વ્યક્તિગત શિક્ષણ સૂચનો બનાવવા માટે બટન પર ક્લિક કરો.`,
    errorTitle: 'સામગ્રી અવરોધિત',
    safetyError: 'બનાવેલા સૂચનો સુરક્ષા કારણોસર અવરોધિત કરવામાં આવ્યા હતા. કૃપા કરીને વિદ્યાર્થીની નોંધોની સમીક્ષા કરો અને ફરીથી પ્રયાસ કરો.',
    generalError: 'સૂચનો બનાવવામાં નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
  },
  Malayalam: {
    title: 'AI-പവർഡ് നിർദ്ദേശങ്ങൾ',
    description: 'ഈ വിദ്യാർത്ഥിക്കായി വ്യക്തിഗതമാക്കിയ നിർദ്ദേശങ്ങൾ നേടുക.',
    generateButton: 'നിർദ്ദേശങ്ങൾ സൃഷ്ടിക്കുക',
    generatingButton: 'സൃഷ്ടിക്കുന്നു...',
    generatePrompt: (name: string) => `${name} നുള്ള വ്യക്തിഗത പഠന നിർദ്ദേശങ്ങൾ സൃഷ്ടിക്കാൻ ബട്ടണിൽ ക്ലിക്കുചെയ്യുക.`,
    errorTitle: 'ഉള്ളടക്കം തടഞ്ഞു',
    safetyError: 'സൃഷ്ടിച്ച നിർദ്ദേശങ്ങൾ സുരക്ഷാ കാരണങ്ങളാൽ തടഞ്ഞിരിക്കുന്നു. ദയവായി വിദ്യാർത്ഥിയുടെ കുറിപ്പുകൾ അവലോകനം ചെയ്ത് വീണ്ടും ശ്രമിക്കുക.',
    generalError: 'നിർദ്ദേശങ്ങൾ സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
  },
  Punjabi: {
    title: 'AI-ਸੰਚਾਲਿਤ ਸੁਝਾਅ',
    description: 'ਇਸ ਵਿਦਿਆਰਥੀ ਲਈ ਵਿਅਕਤੀਗਤ ਸੁਝਾਅ ਪ੍ਰਾਪਤ ਕਰੋ।',
    generateButton: 'ਸੁਝਾਅ ਤਿਆਰ ਕਰੋ',
    generatingButton: 'ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    generatePrompt: (name: string) => `${name} ਲਈ ਵਿਅਕਤੀਗਤ ਸਿੱਖਣ ਦੇ ਸੁਝਾਅ ਤਿਆਰ ਕਰਨ ਲਈ ਬਟਨ ਤੇ ਕਲਿੱਕ ਕਰੋ।`,
    errorTitle: 'ਸਮੱਗਰੀ ਬਲੌਕ ਕੀਤੀ ਗਈ',
    safetyError: 'ਤਿਆਰ ਕੀਤੇ ਗਏ ਸੁਝਾਵਾਂ ਨੂੰ ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬਲੌਕ ਕੀਤਾ ਗਿਆ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਵਿਦਿਆਰਥੀ ਨੋਟਸ ਦੀ ਸਮੀਖਿਆ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    generalError: 'ਸੁਝਾਅ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
  Odia: {
    title: 'AI-ଚାଳିତ ପରାମର୍ଶ',
    description: 'ଏହି ଛାତ୍ର ପାଇଁ ବ୍ୟକ୍ତିଗତ ପରାମର୍ଶ ପାଆନ୍ତୁ।',
    generateButton: 'ପରାମର୍ଶ ସୃଷ୍ଟି କରନ୍ତୁ',
    generatingButton: 'ସୃଷ୍ଟି କରୁଛି...',
    generatePrompt: (name: string) => `${name} ପାଇଁ ବ୍ୟକ୍ତିଗତ ଶିକ୍ଷଣ ପରାମର୍ଶ ସୃଷ୍ଟି କରିବାକୁ ବଟନ୍ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ।`,
    errorTitle: 'ବିଷୟବସ୍ତୁ ଅବରୋଧିତ',
    safetyError: 'ସୃଷ୍ଟି ହୋଇଥିବା ପରାମର୍ଶଗୁଡିକ ସୁରକ୍ଷା କାରଣରୁ ଅବରୋଧ କରାଯାଇଥିଲା। ଦୟାକରି ଛାତ୍ର ନୋଟ୍ସ ସମୀକ୍ଷା କରନ୍ତୁ ଏବଂ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    generalError: 'ପରାମର୍ଶ ସୃଷ୍ଟି କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
  },
  Assamese: {
    title: 'AI-চালিত পৰামৰ্শ',
    description: 'এই শিক্ষাৰ্থীৰ বাবে ব্যক্তিগতকৃত পৰামৰ্শ লাভ কৰক।',
    generateButton: 'পৰামৰ্শ সৃষ্টি কৰক',
    generatingButton: 'সৃষ্টি কৰি আছে...',
    generatePrompt: (name: string) => `${name}ৰ বাবে ব্যক্তিগতকৃত শিক্ষণ পৰামৰ্শ সৃষ্টি কৰিবলৈ বুটামত ক্লিক কৰক।`,
    errorTitle: 'বিষয়বস্তু অৱৰোধিত',
    safetyError: 'সৃষ্টি কৰা পৰামৰ্শসমূহ সুৰক্ষাৰ কাৰণত অৱৰোধ কৰা হৈছিল। অনুগ্ৰহ কৰি শিক্ষাৰ্থীৰ টোকাসমূহ পুনৰীক্ষণ কৰক আৰু পুনৰ চেষ্টা কৰক।',
    generalError: 'পৰামৰ্শ সৃষ্টি কৰাত విఫಲ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
  },
  Kannada: {
    title: 'AI-ಚಾಲಿತ ಸಲಹೆಗಳು',
    description: 'ಈ ವಿದ್ಯಾರ್ಥಿಗಾಗಿ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
    generateButton: 'ಸಲಹೆಗಳನ್ನು ರಚಿಸಿ',
    generatingButton: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    generatePrompt: (name: string) => `${name}ಗಾಗಿ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಕಲಿಕೆಯ ಸಲಹೆಗಳನ್ನು ರಚಿಸಲು ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`,
    errorTitle: 'ವಿಷಯವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    safetyError: 'ರಚಿಸಲಾದ ಸಲಹೆಗಳನ್ನು ಸುರಕ್ಷತಾ ಕಾರಣಗಳಿಗಾಗಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿದ್ಯಾರ್ಥಿ ಟಿಪ್ಪಣಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    generalError: 'ಸಲಹೆಗಳನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
  Telugu: {
    title: 'AI-ఆధారిత సూచనలు',
    description: 'ఈ విద్యార్థికి వ్యక్తిగతీకరించిన సూచనలను పొందండి.',
    generateButton: 'సూచనలను రూపొందించండి',
    generatingButton: 'రూపొందిస్తోంది...',
    generatePrompt: (name: string) => `${name} కోసం వ్యక్తిగతీకరించిన అభ్యాస సూచనలను రూపొందించడానికి బటన్‌ను క్లిక్ చేయండి.`,
    errorTitle: 'కంటెంట్ బ్లాక్ చేయబడింది',
    safetyError: 'రూపొందించిన సూచనలు భద్రతా కారణాల వల్ల బ్లాక్ చేయబడ్డాయి. దయచేసి విద్యార్థి గమనికలను సమీక్షించి, మళ్లీ ప్రయత్నించండి.',
    generalError: 'సూచనలను రూపొందించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
  },
};

export function StudentSuggestions({ student }: { student: Student }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateStudentSuggestionsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const studentName = student.name[language] || student.name['English'];

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const suggestions = await generateStudentSuggestions({
        ...student,
        name: studentName,
        language: language,
      });
      setResult(suggestions);
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('SAFETY')) {
        setError(t.safetyError);
      } else {
        toast({
          variant: 'destructive',
          title: 'An error occurred.',
          description: t.generalError,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.errorTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {result && (
            <div className="prose prose-sm max-w-none rounded-md bg-muted/50 p-4" dangerouslySetInnerHTML={{ __html: result.suggestions.replace(/\n/g, '<br />') }} />
        )}
        {!isLoading && !result && !error && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 min-h-[150px]">
                <Sparkles className="h-12 w-12" />
                <p>{t.generatePrompt(studentName)}</p>
            </div>
        )}
      </CardContent>
      <CardContent>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? t.generatingButton : t.generateButton}
        </Button>
      </CardContent>
    </Card>
  );
}
