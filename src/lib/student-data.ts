import * as z from 'zod';

const subjectPerformanceSchema = z.object({
  subject: z.string(),
  gpa: z.number(),
});
export type SubjectPerformance = z.infer<typeof subjectPerformanceSchema>;

const formSchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  grade: z.string().min(1, 'Please select a grade.'),
  notes: z.string().optional(),
  subjects: z.array(subjectPerformanceSchema).optional(),
});

export type Student = z.infer<typeof formSchema>;


export const initialStudents: Student[] = [
  { 
    id: 1, 
    name: 'Aarav Sharma', 
    grade: '3', 
    notes: 'Shows strong aptitude in Mathematics but needs practice with reading comprehension.',
    subjects: [
      { subject: 'Mathematics', gpa: 3.8 },
      { subject: 'English', gpa: 2.9 },
      { subject: 'Science', gpa: 3.5 },
    ]
  },
  { 
    id: 2, 
    name: 'Priya Singh', 
    grade: '4', 
    notes: 'Excellent in Arts. Struggles with fractions. Consistently completes homework.',
    subjects: [
      { subject: 'Arts', gpa: 4.0 },
      { subject: 'Mathematics', gpa: 2.5 },
      { subject: 'Social Science', gpa: 3.2 },
    ]
  },
  { 
    id: 3, 
    name: 'Rohan Mehta', 
    grade: '3', 
    notes: 'Very active in physical education. Has difficulty staying focused during science lessons.',
    subjects: [
      { subject: 'Physical Education', gpa: 4.0 },
      { subject: 'Science', gpa: 2.2 },
      { subject: 'Hindi', gpa: 3.0 },
    ]
  },
];
