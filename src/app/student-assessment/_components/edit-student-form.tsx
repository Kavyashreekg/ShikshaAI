'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Student, SubjectPerformance } from '@/lib/student-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    addSubjectFor: (name: string) => `Add Subject for ${name}`,
    dialogDescription: "Enter a new subject and the student's GPA.",
    subjectName: 'Subject Name',
    subjectPlaceholder: 'e.g., History',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'e.g., 3.5',
    cancel: 'Cancel',
    addSubject: 'Add Subject',
    toastTitle: 'Subject Added',
    toastDescription: (subject: string, name: string) => `${subject} has been added to ${name}'s records.`,
    formErrors: {
      subjectMin: 'Subject must be at least 2 characters.',
      gpaMin: 'GPA must be non-negative.',
      gpaMax: 'GPA cannot exceed 5.0.',
    },
  },
  Hindi: {
    addSubjectFor: (name: string) => `${name} के लिए विषय जोड़ें`,
    dialogDescription: 'एक नया विषय और छात्र का GPA दर्ज करें।',
    subjectName: 'विषय का नाम',
    subjectPlaceholder: 'जैसे, इतिहास',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'जैसे, 3.5',
    cancel: 'रद्द करें',
    addSubject: 'विषय जोड़ें',
    toastTitle: 'विषय जोड़ा गया',
    toastDescription: (subject: string, name: string) => `${subject} को ${name} के रिकॉर्ड में जोड़ा गया है।`,
    formErrors: {
      subjectMin: 'विषय कम से कम 2 अक्षरों का होना चाहिए।',
      gpaMin: 'GPA ऋणात्मक नहीं होना चाहिए।',
      gpaMax: 'GPA 5.0 से अधिक नहीं हो सकता।',
    },
  },
  Marathi: {
    addSubjectFor: (name: string) => `${name} साठी विषय జోडा`,
    dialogDescription: 'नवीन विषय आणि विद्यार्थ्याचा GPA प्रविष्ट करा.',
    subjectName: 'विषयाचे नाव',
    subjectPlaceholder: 'उदा., इतिहास',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'उदा., 3.5',
    cancel: 'रद्द करा',
    addSubject: 'विषय జోडा',
    toastTitle: 'विषय जोडला',
    toastDescription: (subject: string, name: string) => `${subject} ${name} च्या रेकॉर्डमध्ये जोडला गेला आहे.`,
     formErrors: {
      subjectMin: 'विषय किमान २ अक्षरांचा असावा.',
      gpaMin: 'GPA नकारात्मक असू शकत नाही.',
      gpaMax: 'GPA ५.० पेक्षा जास्त असू शकत नाही.',
    },
  },
  Kashmiri: {
    addSubjectFor: (name: string) => `${name} خٲطرٕ مضمون شٲمِل کریو`,
    dialogDescription: 'اَکھ نوٚو مضمون تہٕ طالب علم سُنٛد GPA دِیُت۔',
    subjectName: 'مضمون ناو',
    subjectPlaceholder: 'مثلن، تاریخ',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'مثلن، 3.5',
    cancel: 'منسوخ',
    addSubject: 'مضمون شٲمِل کریو',
    toastTitle: 'مضمون شٲمِل کرنہٕ آو',
    toastDescription: (subject: string, name: string) => `${subject} آو ${name} سٕنٛدِس ریکارڈس مَنٛز شٲمِل کرنہٕ۔`,
    formErrors: {
      subjectMin: 'مضمون گژھہِ کم از کم 2 اَक्षरَن ہُنٛد ٲسُن۔',
      gpaMin: 'GPA گژھہِ نہٕ منفی ٲسُن۔',
      gpaMax: 'GPA ہیٚکہِ نہٕ 5.0 کھوتہٕ زیٛادٕ ٲسِتھ۔',
    },
  },
  Bengali: {
    addSubjectFor: (name: string) => `${name} এর জন্য বিষয় যোগ করুন`,
    dialogDescription: 'একটি নতুন বিষয় এবং ছাত্রের GPA লিখুন।',
    subjectName: 'বিষয় নাম',
    subjectPlaceholder: 'যেমন, ইতিহাস',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'যেমন, 3.5',
    cancel: 'বাতিল করুন',
    addSubject: 'বিষয় যোগ করুন',
    toastTitle: 'বিষয় যোগ করা হয়েছে',
    toastDescription: (subject: string, name: string) => `${subject} ${name} এর রেকর্ডে যোগ করা হয়েছে।`,
    formErrors: {
      subjectMin: 'বিষয়টি কমপক্ষে ২ অক্ষরের হতে হবে।',
      gpaMin: 'GPA ঋণাত্মক হতে পারবে না।',
      gpaMax: 'GPA 5.0 এর বেশি হতে পারবে না।',
    },
  },
  Tamil: {
    addSubjectFor: (name: string) => `${name} க்கான பாடத்தைச் சேர்க்கவும்`,
    dialogDescription: 'ஒரு புதிய பாடம் மற்றும் மாணவர் GPA ஐ உள்ளிடவும்.',
    subjectName: 'பாடத்தின் பெயர்',
    subjectPlaceholder: 'எ.கா., வரலாறு',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'எ.கா., 3.5',
    cancel: 'ரத்துசெய்',
    addSubject: 'பாடத்தைச் சேர்',
    toastTitle: 'பாடம் சேர்க்கப்பட்டது',
    toastDescription: (subject: string, name: string) => `${subject} ${name} இன் பதிவுகளில் சேர்க்கப்பட்டுள்ளது.`,
    formErrors: {
      subjectMin: 'பாடம் குறைந்தது 2 எழுத்துகளாக இருக்க வேண்டும்.',
      gpaMin: 'GPA எதிர்மறையாக இருக்கக்கூடாது.',
      gpaMax: 'GPA 5.0 ஐ விட அதிகமாக இருக்க முடியாது.',
    },
  },
  Gujarati: {
    addSubjectFor: (name: string) => `${name} માટે વિષય ઉમેરો`,
    dialogDescription: 'એક નવો વિષય અને વિદ્યાર્થીનો GPA દાખલ કરો.',
    subjectName: 'વિષયનું નામ',
    subjectPlaceholder: 'દા.ત., ઇતિહાસ',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'દા.ત., 3.5',
    cancel: 'રદ કરો',
    addSubject: 'વિષય ઉમેરો',
    toastTitle: 'વિષય ઉમેરવામાં આવ્યો',
    toastDescription: (subject: string, name: string) => `${subject} ${name} ના રેકોર્ડમાં ઉમેરવામાં આવ્યો છે.`,
    formErrors: {
      subjectMin: 'વિષય ઓછામાં ઓછો 2 અક્ષરોનો હોવો જોઈએ.',
      gpaMin: 'GPA નકારાત્મક ન હોવો જોઈએ.',
      gpaMax: 'GPA 5.0 થી વધુ ન હોઈ શકે.',
    },
  },
  Malayalam: {
    addSubjectFor: (name: string) => `${name} നുള്ള വിഷയം ചേർക്കുക`,
    dialogDescription: 'ഒരു പുതിയ വിഷയവും വിദ്യാർത്ഥിയുടെ GPA യും നൽകുക.',
    subjectName: 'വിഷയത്തിന്റെ പേര്',
    subjectPlaceholder: 'ഉദാ., ചരിത്രം',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'ഉദാ., 3.5',
    cancel: 'റദ്ദാക്കുക',
    addSubject: 'വിഷയം ചേർക്കുക',
    toastTitle: 'വിഷയം ചേർത്തു',
    toastDescription: (subject: string, name: string) => `${subject} ${name} ന്റെ റെക്കോർഡുകളിൽ ചേർത്തു.`,
    formErrors: {
      subjectMin: 'വിഷയം കുറഞ്ഞത് 2 അക്ഷരങ്ങളെങ്കിലും ആയിരിക്കണം.',
      gpaMin: 'GPA നെഗറ്റീവ് ആകരുത്.',
      gpaMax: 'GPA 5.0-ൽ കൂടരുത്.',
    },
  },
  Punjabi: {
    addSubjectFor: (name: string) => `${name} ਲਈ ਵਿਸ਼ਾ ਸ਼ਾਮਲ ਕਰੋ`,
    dialogDescription: 'ਇੱਕ ਨਵਾਂ ਵਿਸ਼ਾ ਅਤੇ ਵਿਦਿਆਰਥੀ ਦਾ GPA ਦਾਖਲ ਕਰੋ।',
    subjectName: 'ਵਿਸ਼ੇ ਦਾ ਨਾਮ',
    subjectPlaceholder: 'ਜਿਵੇਂ, ਇਤਿਹਾਸ',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'ਜਿਵੇਂ, 3.5',
    cancel: 'ਰੱਦ ਕਰੋ',
    addSubject: 'ਵਿਸ਼ਾ ਸ਼ਾਮਲ ਕਰੋ',
    toastTitle: 'ਵਿਸ਼ਾ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ',
    toastDescription: (subject: string, name: string) => `${subject} ਨੂੰ ${name} ਦੇ ਰਿਕਾਰਡ ਵਿੱਚ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ ਹੈ।`,
    formErrors: {
      subjectMin: 'ਵਿਸ਼ਾ ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।',
      gpaMin: 'GPA ਨਕਾਰਾਤਮਕ ਨਹੀਂ ਹੋਣਾ ਚਾਹੀਦਾ।',
      gpaMax: 'GPA 5.0 ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋ ਸਕਦਾ।',
    },
  },
  Odia: {
    addSubjectFor: (name: string) => `${name} ପାଇଁ ବିଷୟ ଯୋଗ କରନ୍ତୁ`,
    dialogDescription: 'ଏକ ନୂତନ ବିଷୟ ଏବଂ ଛାତ୍ରର GPA ପ୍ରବେଶ କରନ୍ତୁ।',
    subjectName: 'ବିଷୟ ନାମ',
    subjectPlaceholder: 'ଉଦାହରଣ, ଇତିହାସ',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'ଉଦାହରଣ, 3.5',
    cancel: 'ବାତିଲ କରନ୍ତୁ',
    addSubject: 'ବିଷୟ ଯୋଗ କରନ୍ତୁ',
    toastTitle: 'ବିଷୟ ଯୋଗ କରାଗଲା',
    toastDescription: (subject: string, name: string) => `${subject} କୁ ${name} ର ରେକର୍ଡରେ ଯୋଗ କରାଯାଇଛି।`,
    formErrors: {
      subjectMin: 'ବିଷୟ ଅତିକମରେ ୨ଟି ଅକ୍ଷର ହେବା ଆବଶ୍ୟକ।',
      gpaMin: 'GPA ନକାରାତ୍ମକ ହେବା ଉଚିତ୍ ନୁହେଁ।',
      gpaMax: 'GPA 5.0 ରୁ ଅଧିକ ହୋଇପାରିବ ନାହିଁ।',
    },
  },
  Assamese: {
    addSubjectFor: (name: string) => `${name}ৰ বাবে বিষয় যোগ কৰক`,
    dialogDescription: 'এটা নতুন বিষয় আৰু শিক্ষাৰ্থীৰ GPA প্ৰবিষ্ট কৰক।',
    subjectName: 'বিষয়ৰ নাম',
    subjectPlaceholder: 'যেনে, ইতিহাস',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'যেনে, 3.5',
    cancel: 'বাতিল কৰক',
    addSubject: 'বিষয় যোগ কৰক',
    toastTitle: 'বিষয় যোগ কৰা হ’ল',
    toastDescription: (subject: string, name: string) => `${subject}ক ${name}ৰ ৰেকৰ্ডত যোগ কৰা হৈছে।`,
    formErrors: {
      subjectMin: 'বিষয়টো কমেও ২টা আখৰৰ হ’ব লাগিব।',
      gpaMin: 'GPA ঋণাত্মক হ’ব নালাগে।',
      gpaMax: 'GPA 5.0তকৈ বেছি হ’ব নোৱাৰে।',
    },
  },
   Kannada: {
    addSubjectFor: (name: string) => `${name}ಗಾಗಿ ವಿಷಯವನ್ನು ಸೇರಿಸಿ`,
    dialogDescription: 'ಹೊಸ ವಿಷಯ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಯ GPA ಅನ್ನು ನಮೂದಿಸಿ.',
    subjectName: 'ವಿಷಯದ ಹೆಸರು',
    subjectPlaceholder: 'ಉದಾ., ಇತಿಹಾಸ',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'ಉದಾ., 3.5',
    cancel: 'ರದ್ದುಮಾಡಿ',
    addSubject: 'ವಿಷಯವನ್ನು ಸೇರಿಸಿ',
    toastTitle: 'ವಿಷಯವನ್ನು ಸೇರಿಸಲಾಗಿದೆ',
    toastDescription: (subject: string, name: string) => `${subject} ಅನ್ನು ${name} ಅವರ ದಾಖಲೆಗಳಿಗೆ ಸೇರಿಸಲಾಗಿದೆ.`,
    formErrors: {
      subjectMin: 'ವಿಷಯವು ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.',
      gpaMin: 'GPA ಋಣಾತ್ಮಕವಾಗಿರಬಾರದು.',
      gpaMax: 'GPA 5.0 ಮೀರಬಾರದು.',
    },
  },
  Telugu: {
    addSubjectFor: (name: string) => `${name} కోసం సబ్జెక్ట్‌ను జోడించండి`,
    dialogDescription: 'కొత్త సబ్జెక్ట్ మరియు విద్యార్థి GPAని నమోదు చేయండి.',
    subjectName: 'సబ్జెక్ట్ పేరు',
    subjectPlaceholder: 'ఉదా., చరిత్ర',
    gpaLabel: 'GPA',
    gpaPlaceholder: 'ఉదా., 3.5',
    cancel: 'రద్దు చేయి',
    addSubject: 'సబ్జెక్ట్‌ను జోడించు',
    toastTitle: 'సబ్జెక్ట్ జోడించబడింది',
    toastDescription: (subject: string, name: string) => `${subject} ${name} యొక్క రికార్డులకు జోడించబడింది.`,
    formErrors: {
      subjectMin: 'సబ్జెక్ట్ కనీసం 2 అక్షరాలు ఉండాలి.',
      gpaMin: 'GPA రుణాత్మకంగా ఉండకూడదు.',
      gpaMax: 'GPA 5.0 మించకూడదు.',
    },
  },
};

interface EditStudentFormProps {
  student: Student;
  onUpdate: (student: Student) => void;
}

export function EditStudentForm({ student, onUpdate }: EditStudentFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const studentName = student.name[language] || student.name['English'];

  const formSchema = z.object({
    subject: z.string().min(2, t.formErrors.subjectMin),
    gpa: z.coerce.number().min(0, t.formErrors.gpaMin).max(5, t.formErrors.gpaMax),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: '', gpa: 0 },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSubject: SubjectPerformance = {
      subject: values.subject,
      gpa: values.gpa,
    };

    const updatedStudent = {
      ...student,
      subjects: [...(student.subjects || []), newSubject],
    };

    onUpdate(updatedStudent);

    form.reset();
    setIsDialogOpen(false);
    toast({ title: t.toastTitle, description: t.toastDescription(values.subject, studentName) });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Student</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.addSubjectFor(studentName)}</DialogTitle>
          <DialogDescription>{t.dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.subjectName}</FormLabel>
                  <FormControl><Input placeholder={t.subjectPlaceholder} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.gpaLabel}</FormLabel>
                  <FormControl><Input type="number" step="0.1" placeholder={t.gpaPlaceholder} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">{t.cancel}</Button>
              </DialogClose>
              <Button type="submit">{t.addSubject}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
