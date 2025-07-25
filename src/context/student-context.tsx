'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Student, initialStudents } from '@/lib/student-data';

type StudentContextType = {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const addStudent = (student: Student) => {
    setStudents((prevStudents) => [...prevStudents, student]);
  };
    
  const updateStudent = (updatedStudent: Student) => {
    setStudents((prevStudents) => 
        prevStudents.map((student) => 
            student.id === updatedStudent.id ? updatedStudent : student
        )
    );
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
