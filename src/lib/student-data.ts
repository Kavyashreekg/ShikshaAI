import * as z from 'zod';

const formSchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  grade: z.string().min(1, 'Please select a grade.'),
  notes: z.string().optional(),
});

export type Student = z.infer<typeof formSchema>;

export const initialStudents: Student[] = [
  { id: 1, name: 'Aarav Sharma', grade: '3', notes: 'Shows strong aptitude in Mathematics but needs practice with reading comprehension.' },
  { id: 2, name: 'Priya Singh', grade: '4', notes: 'Excellent in Arts. Struggles with fractions. Consistently completes homework.' },
  { id: 3, name: 'Rohan Mehta', grade: '3', notes: 'Very active in physical education. Has difficulty staying focused during science lessons.' },
];
