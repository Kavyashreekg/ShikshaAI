
'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Student } from '@/lib/student-data';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentSuggestions } from '../_components/student-suggestions';
import { EditStudentForm } from '../_components/edit-student-form';
import { useLanguage } from '@/context/language-context';
import { useStudent } from '@/context/student-context';
import { EditNotesForm } from '../_components/edit-notes-form';

const pageTranslations = {
    English: {
      description: (name: string) => `Details and progress for ${name}.`,
      backToRoster: 'Back to Roster',
      teachersNotes: "Teacher's Notes",
      notesDescription: 'Observations and notes about the student.',
      noNotes: 'No notes have been added for this student yet.',
      studentInfo: 'Student Information',
      name: 'Name:',
      grade: 'Grade:',
      subjectGpa: 'Subject GPA',
      subject: 'Subject',
      gpa: 'GPA',
    },
    Hindi: {
      description: (name: string) => `${name} के लिए विवरण और प्रगति।`,
      backToRoster: 'रोस्टर पर वापस जाएं',
      teachersNotes: "शिक्षक की टिप्पणियाँ",
      notesDescription: 'छात्र के बारे में अवलोकन और नोट्स।',
      noNotes: 'इस छात्र के लिए अभी तक कोई नोट्स नहीं जोड़े गए हैं।',
      studentInfo: 'छात्र जानकारी',
      name: 'नाम:',
      grade: 'ग्रेड:',
      subjectGpa: 'विषय GPA',
      subject: 'विषय',
      gpa: 'GPA',
    },
    Marathi: {
      description: (name: string) => `${name} साठी तपशील आणि प्रगती.`,
      backToRoster: 'रोस्टरवर परत जा',
      teachersNotes: "शिक्षकांच्या नोंदी",
      notesDescription: ' विद्यार्थ्याबद्दल निरीक्षणे आणि नोंदी.',
      noNotes: 'या विद्यार्थ्यासाठी अद्याप कोणत्याही नोंदी जोडल्या गेल्या नाहीत.',
      studentInfo: 'विद्यार्थ्याची माहिती',
      name: 'नाव:',
      grade: 'श्रेणी:',
      subjectGpa: 'विषय GPA',
      subject: 'विषय',
      gpa: 'GPA',
    },
    Kashmiri: {
        description: (name: string) => `${name} خٲطرٕ تفصیلات تہٕ پیش رفت۔`,
        backToRoster: 'روسٹرس پؠٹھ واپس گژھُن',
        teachersNotes: 'استاد سُند نوٹس',
        notesDescription: 'طالب علم سٕنٛدِس بارس مَنٛز مشاہدات تہٕ نوٹس۔',
        noNotes: 'اَتھ طالب علم خٲطرٕ چھُ نہٕ وُنی تام کانٛہہ نوٹس شٲمِل کرنہٕ آمُت۔',
        studentInfo: 'طالب علم سٕنٛز معلومات',
        name: 'ناو:',
        grade: 'گریڈ:',
        subjectGpa: 'مضمون GPA',
        subject: 'مضمون',
        gpa: 'GPA',
    },
    Bengali: {
        description: (name: string) => `${name} এর জন্য বিবরণ এবং অগ্রগতি।`,
        backToRoster: 'রোস্টারে ফিরে যান',
        teachersNotes: 'শিক্ষকের নোট',
        notesDescription: 'ছাত্র সম্পর্কে পর্যবেক্ষণ এবং নোট।',
        noNotes: 'এই ছাত্রের জন্য এখনও কোন নোট যোগ করা হয়নি।',
        studentInfo: 'ছাত্রের তথ্য',
        name: 'নাম:',
        grade: 'গ্রেড:',
        subjectGpa: 'বিষয় GPA',
        subject: 'বিষয়',
        gpa: 'GPA',
    },
    Tamil: {
        description: (name: string) => `${name} க்கான விவரங்கள் மற்றும் முன்னேற்றம்.`,
        backToRoster: 'பட்டியலுக்குத் திரும்பு',
        teachersNotes: 'ஆசிரியர் குறிப்புகள்',
        notesDescription: 'மாணவர் பற்றிய கவனிப்புகள் மற்றும் குறிப்புகள்.',
        noNotes: 'இந்த மாணவருக்கு இன்னும் குறிப்புகள் எதுவும் சேர்க்கப்படவில்லை.',
        studentInfo: 'மாணவர் தகவல்',
        name: 'பெயர்:',
        grade: 'தரம்:',
        subjectGpa: 'பாடம் GPA',
        subject: 'பாடம்',
        gpa: 'GPA',
    },
    Gujarati: {
        description: (name: string) => `${name} માટે વિગતો અને પ્રગતિ.`,
        backToRoster: 'રોસ્ટર પર પાછા જાઓ',
        teachersNotes: 'શિક્ષકની નોંધો',
        notesDescription: 'વિદ્યાર્થી વિશે અવલોકનો અને નોંધો.',
        noNotes: 'આ વિદ્યાર્થી માટે હજી સુધી કોઈ નોંધ ઉમેરવામાં આવી નથી.',
        studentInfo: 'વિદ્યાર્થી માહિતી',
        name: 'નામ:',
        grade: 'ગ્રેડ:',
        subjectGpa: 'વિષય GPA',
        subject: 'વિષય',
        gpa: 'GPA',
    },
    Malayalam: {
        description: (name: string) => `${name} നുള്ള വിവരങ്ങളും പുരോഗതിയും.`,
        backToRoster: 'റോസ്റ്ററിലേക്ക് മടങ്ങുക',
        teachersNotes: 'അധ്യാപകന്റെ കുറിപ്പുകൾ',
        notesDescription: 'വിദ്യാർത്ഥിയെക്കുറിച്ചുള്ള നിരീക്ഷണങ്ങളും കുറിപ്പുകളും.',
        noNotes: 'ഈ വിദ്യാർത്ഥിക്കായി ഇതുവരെ കുറിപ്പുകളൊന്നും ചേർത്തിട്ടില്ല.',
        studentInfo: 'വിദ്യാർത്ഥി വിവരങ്ങൾ',
        name: 'പേര്:',
        grade: 'ഗ്രേഡ്:',
        subjectGpa: 'വിഷയം GPA',
        subject: 'വിഷയം',
        gpa: 'GPA',
    },
    Punjabi: {
        description: (name: string) => `${name} ਲਈ ਵੇਰਵੇ ਅਤੇ ਤਰੱਕੀ।`,
        backToRoster: 'ਰੋਸਟਰ ਤੇ ਵਾਪਸ ਜਾਓ',
        teachersNotes: 'ਅਧਿਆਪਕ ਦੇ ਨੋਟਸ',
        notesDescription: 'ਵਿਦਿਆਰਥੀ ਬਾਰੇ ਨਿਰੀਖਣ ਅਤੇ ਨੋਟਸ।',
        noNotes: 'ਇਸ ਵਿਦਿਆਰਥੀ ਲਈ ਹਾਲੇ ਤੱਕ ਕੋਈ ਨੋਟ ਨਹੀਂ ਜੋੜਿਆ ਗਿਆ ਹੈ।',
        studentInfo: 'ਵਿਦਿਆਰਥੀ ਜਾਣਕਾਰੀ',
        name: 'ਨਾਮ:',
        grade: 'ਗ੍ਰੇਡ:',
        subjectGpa: 'ਵਿਸ਼ਾ GPA',
        subject: 'ਵਿਸ਼ਾ',
        gpa: 'GPA',
    },
    Odia: {
        description: (name: string) => `${name} ପାଇଁ ବିବରଣୀ ଏବଂ ପ୍ରଗତି।`,
        backToRoster: 'ରୋଷ୍ଟରକୁ ଫେରନ୍ତୁ',
        teachersNotes: 'ଶିକ୍ଷକଙ୍କ ନୋଟ୍',
        notesDescription: 'ଛାତ୍ର ବିଷୟରେ ପର୍ଯ୍ୟବେକ୍ଷଣ ଏବଂ ନୋଟ୍।',
        noNotes: 'ଏହି ଛାତ୍ର ପାଇଁ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ନୋଟ୍ ଯୋଡାଯାଇ ନାହିଁ।',
        studentInfo: 'ଛାତ୍ର ସୂଚନା',
        name: 'ନାମ:',
        grade: 'ଗ୍ରେଡ୍:',
        subjectGpa: 'ବିଷୟ GPA',
        subject: 'ବିଷୟ',
        gpa: 'GPA',
    },
    Assamese: {
        description: (name: string) => `${name}ৰ বাবে বিৱৰণ আৰু প্ৰগতি।`,
        backToRoster: 'ৰোষ্টাৰলৈ ঘূৰি যাওк',
        teachersNotes: 'শিক্ষকৰ টোকা',
        notesDescription: 'শিক্ষাৰ্থীৰ বিষয়ে পৰ্যবেক্ষণ আৰু টোকা।',
        noNotes: 'এই শিক্ষাৰ্থীৰ বাবে এতিয়ালৈকে কোনো টোকা যোগ কৰা হোৱা নাই।',
        studentInfo: 'শিক্ষাৰ্থীৰ তথ্য',
        name: 'নাম:',
        grade: 'গ্ৰেড:',
        subjectGpa: 'বিষয় GPA',
        subject: 'বিষয়',
        gpa: 'GPA',
    },
    Kannada: {
        description: (name: string) => `${name}ಗಾಗಿ ವಿವರಗಳು ಮತ್ತು ಪ್ರಗತಿ.`,
        backToRoster: 'ರೋಸ್ಟರ್‌ಗೆ ಹಿಂತಿರುಗಿ',
        teachersNotes: 'ಶಿಕ್ಷಕರ ಟಿಪ್ಪಣಿಗಳು',
        notesDescription: 'ವಿದ್ಯಾರ್ಥಿಯ ಕುರಿತಾದ ಅವಲೋಕನಗಳು ಮತ್ತು ಟಿಪ್ಪಣಿಗಳು.',
        noNotes: 'ಈ ವಿದ್ಯಾರ್ಥಿಗೆ ಇನ್ನೂ ಯಾವುದೇ ಟಿಪ್ಪಣಿಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ.',
        studentInfo: 'ವಿದ್ಯಾರ್ಥಿ ಮಾಹಿತಿ',
        name: 'ಹೆಸರು:',
        grade: 'ದರ್ಜೆ:',
        subjectGpa: 'ವಿಷಯ GPA',
        subject: 'ವಿಷಯ',
        gpa: 'GPA',
    },
    Telugu: {
        description: (name: string) => `${name} కోసం వివరాలు మరియు పురోగతి.`,
        backToRoster: 'రోస్టర్‌కు తిరిగి వెళ్ళు',
        teachersNotes: 'ఉపాధ్యాయుని గమనికలు',
        notesDescription: 'విద్యార్థి గురించి పరిశీలనలు మరియు గమనికలు.',
        noNotes: 'ఈ విద్యార్థికి ఇంకా ఎలాంటి గమనికలు జోడించబడలేదు.',
        studentInfo: 'విద్యార్థి సమాచారం',
        name: 'పేరు:',
        grade: 'గ్రేడ్:',
        subjectGpa: 'విషయం GPA',
        subject: 'విషయం',
        gpa: 'GPA',
    },
};

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { students, updateStudent } = useStudent();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof pageTranslations;
  const pageTranslation = pageTranslations[typedLanguage] || pageTranslations['English'];

  const [student, setStudent] = useState<Student | undefined>(
    students.find((s) => s.id.toString() === studentId)
  );

  useEffect(() => {
    const updatedStudent = students.find((s) => s.id.toString() === studentId);
    setStudent(updatedStudent);
  }, [students, studentId]);

  if (!student) {
    notFound();
  }
  
  const handleUpdateStudent = (updatedStudent: Student) => {
    updateStudent(updatedStudent);
  }

  const studentName = student.name[language] || student.name['English'];
  const studentNotes = student.notes?.[language] || student.notes?.['English'];

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
            <PageHeader
              title={studentName}
              description={pageTranslation.description(studentName)}
            />
            <Button asChild variant="outline">
                <Link href="/student-assessment">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {pageTranslation.backToRoster}
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{pageTranslation.teachersNotes}</CardTitle>
                            <CardDescription>{pageTranslation.notesDescription}</CardDescription>
                        </div>
                        <EditNotesForm student={student} onUpdate={handleUpdateStudent} />
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{studentNotes || pageTranslation.noNotes}</p>
                    </CardContent>
                </Card>
                <StudentSuggestions student={student} />
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{pageTranslation.studentInfo}</CardTitle>
                        <EditStudentForm student={student} onUpdate={handleUpdateStudent} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{pageTranslation.name}</span>
                            <span className="font-medium">{studentName}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">{pageTranslation.grade}</span>
                            <span className="font-medium">{student.grade}</span>
                        </div>
                    </CardContent>
                    {student.subjects && student.subjects.length > 0 && (
                        <>
                        <CardHeader className='pt-0'>
                            <CardTitle className="text-lg">{pageTranslation.subjectGpa}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{pageTranslation.subject}</TableHead>
                                        <TableHead className="text-right">{pageTranslation.gpa}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.subjects.map((item) => (
                                        <TableRow key={item.subject}>
                                            <TableCell>{item.subject}</TableCell>
                                            <TableCell className="text-right">{item.gpa.toFixed(1)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
