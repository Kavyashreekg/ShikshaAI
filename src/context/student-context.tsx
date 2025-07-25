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
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const item = window.localStorage.getItem('students');
        if (item) {
          setStudents(JSON.parse(item));
        }
      } catch (error) {
        console.error('Failed to parse students from localStorage', error);
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem('students', JSON.stringify(students));
      } catch (error) {
        console.error('Failed to save students to localStorage', error);
      }
    }
  }, [students, isClient]);

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
