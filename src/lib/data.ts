export const languages = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Kashmiri', label: 'Kashmiri' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Malayalam', label: 'Malayalam' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Odia', label: 'Odia' },
  { value: 'Assamese', label: 'Assamese' },
];

export const grades = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Grade ${i + 1}`,
}));

export const subjects = [
  {
    value: 'english',
    label: 'English',
    chapters: ['Unit 1: First Day at School', 'Unit 2: The Bubble, the Straw, and the Shoe', 'Unit 3: Lalu and Peelu', 'Unit 4: Mittu and the Yellow Mango', 'Unit 5: The Tiger and the Mosquito'],
  },
  {
    value: 'mathematics',
    label: 'Mathematics',
    chapters: ['Chapter 1: Number Systems', 'Chapter 2: Algebra', 'Chapter 3: Geometry', 'Chapter 4: Trigonometry', 'Chapter 5: Statistics'],
  },
  {
    value: 'science',
    label: 'Science',
    chapters: ['Chapter 1: Matter', 'Chapter 2: Living World', 'Chapter 3: Motion, Force and Work', 'Chapter 4: Our Environment', 'Chapter 5: Food'],
  },
  {
    value: 'social_science',
    label: 'Social Science',
    chapters: ['Chapter 1: India and the Contemporary World', 'Chapter 2: Contemporary India', 'Chapter 3: Democratic Politics', 'Chapter 4: Economics'],
  },
  {
    value: 'arts',
    label: 'Arts',
    chapters: ['Chapter 1: Drawing', 'Chapter 2: Painting', 'Chapter 3: Sculpture', 'Chapter 4: Crafts'],
  },
  {
    value: 'sanskrit',
    label: 'Sanskrit',
    chapters: ['Chapter 1: Vyakaran', 'Chapter 2: Shabda Roop', 'Chapter 3: Dhatu Roop', 'Chapter 4: Sahitya'],
  },
  {
    value: 'physical_education',
    label: 'Physical Education',
    chapters: ['Chapter 1: Health and Fitness', 'Chapter 2: Sports Skills', 'Chapter 3: Yoga', 'Chapter 4: Games and Rules'],
  }
];
