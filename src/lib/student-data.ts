import * as z from 'zod';

const subjectPerformanceSchema = z.object({
  subject: z.string(),
  gpa: z.number(),
});
export type SubjectPerformance = z.infer<typeof subjectPerformanceSchema>;

const formSchema = z.object({
  id: z.number(),
  name: z.record(z.string()),
  grade: z.string().min(1, 'Please select a grade.'),
  notes: z.record(z.string()).optional(),
  subjects: z.array(subjectPerformanceSchema).optional(),
});

export type Student = z.infer<typeof formSchema>;


export const initialStudents: Student[] = [
  { 
    id: 1, 
    name: {
      English: 'Aarav Sharma',
      Hindi: 'आरव शर्मा',
      Marathi: 'आरव शर्मा',
      Kashmiri: 'آراو شرما',
      Bengali: 'আরভ শর্মা',
      Tamil: 'ஆரவ் சர்மா',
      Gujarati: 'આરવ શર્મા',
      Malayalam: 'ആരവ് ശർമ്മ',
      Punjabi: 'ਆਰਵ ਸ਼ਰਮਾ',
      Odia: 'ଆରବ ଶର୍ମା',
      Assamese: 'আৰৱ শৰ্মা',
      Kannada: 'ಆರವ್ ಶರ್ಮಾ',
      Telugu: 'ఆరవ్ శర్మ'
    },
    grade: '3', 
    notes: {
      English: 'Shows strong aptitude in Mathematics but needs practice with reading comprehension.',
    },
    subjects: [
      { subject: 'Mathematics', gpa: 3.8 },
      { subject: 'English', gpa: 2.9 },
      { subject: 'Science', gpa: 3.5 },
    ]
  },
  { 
    id: 2, 
    name: {
      English: 'Priya Singh',
      Hindi: 'प्रिया सिंह',
      Marathi: 'प्रिया सिंग',
      Kashmiri: 'پریا سنگھ',
      Bengali: 'প্রিয়া সিং',
      Tamil: 'பிரியா சிங்',
      Gujarati: 'પ્રિયા સિંહ',
      Malayalam: 'പ്രിയ സിംഗ്',
      Punjabi: 'ਪ੍ਰਿਆ ਸਿੰਘ',
      Odia: 'ପ୍ରିୟା ସିଂ',
      Assamese: 'প্ৰিয়া সিং',
      Kannada: 'ಪ್ರಿಯಾ ಸಿಂಗ್',
      Telugu: 'ప్రియా సింగ్'
    },
    grade: '4', 
    notes: {
      English: 'Excellent in Arts. Struggles with fractions. Consistently completes homework.',
    },
    subjects: [
      { subject: 'Arts', gpa: 4.0 },
      { subject: 'Mathematics', gpa: 2.5 },
      { subject: 'Social Science', gpa: 3.2 },
    ]
  },
  { 
    id: 3, 
    name: {
      English: 'Rohan Mehta',
      Hindi: 'रोहन मेहता',
      Marathi: 'रोहन मेहता',
      Kashmiri: 'روہن مہتا',
      Bengali: 'রোহান মেহতা',
      Tamil: 'ரோஹன் மேத்தா',
      Gujarati: 'રોહન મહેતા',
      Malayalam: 'രോഹൻ മേത്ത',
      Punjabi: 'ਰੋਹਨ ਮਹਿਤਾ',
      Odia: 'ରୋହନ ମେହେଟା',
      Assamese: 'ৰোহন মেহতা',
      Kannada: 'ರೋಹನ್ ಮೆಹ್ತಾ',
      Telugu: 'రోహన్ మెహతా'
    },
    grade: '3', 
    notes: {
      English: 'Very active in physical education. Has difficulty staying focused during science lessons.',
    },
    subjects: [
      { subject: 'Physical Education', gpa: 4.0 },
      { subject: 'Science', gpa: 2.2 },
      { subject: 'Hindi', gpa: 3.0 },
    ]
  },
];
