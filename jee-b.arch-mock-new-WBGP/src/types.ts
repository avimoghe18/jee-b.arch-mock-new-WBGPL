export interface Question {
  id: number;
  question: string;
  type?: 'normal' | 'match-pair' | 'statement';
  columnAItems?: string[];
  columnBItems?: string[];
  statement1?: string;
  statement2?: string;
  image?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export interface ShuffledQuestion extends Question {
  shuffledOptions: { text: string; originalKey: string }[];
  correctIndex: number;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  duration: number;
  questions: Question[];
  category?: 'white' | 'blue' | 'grey' | 'pyq' | 'latest';
}

export interface UserAccount {
  email: string;
  password: string;
  role: 'admin' | 'student';
}

export interface TestCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}
