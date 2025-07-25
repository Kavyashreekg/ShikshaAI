'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Student, initialStudents } from '@/lib/student-data';

type StudentContextType = {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  removeStudent: (studentId: number) => void;
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => {
    // This function now runs only on the client side to initialize state.
    if (typeof window === 'undefined') {
      return initialStudents;
    }
    try {
      const item = window.localStorage.getItem('students');
      return item ? JSON.parse(item) : initialStudents;
    } catch (error) {
      console.error('Failed to parse students from localStorage', error);
      return initialStudents;
    }
  });

  useEffect(() => {
    // This effect runs whenever the students state changes, saving it to localStorage.
    try {
      window.localStorage.setItem('students', JSON.stringify(students));
    } catch (error) {
      console.error('Failed to save students to localStorage', error);
    }
  }, [students]);

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
  
  const removeStudent = (studentId: number) => {
    setStudents((prevStudents) =>
      prevStudents.filter((student) => student.id !== studentId)
    );
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, removeStudent }}>
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
