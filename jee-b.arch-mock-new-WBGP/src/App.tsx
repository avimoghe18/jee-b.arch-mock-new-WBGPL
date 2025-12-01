import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, User, UserPlus, Trash2, LogOut, AlertTriangle, Shield, BookOpen, Plus, Menu, X } from 'lucide-react';
import { Question, ShuffledQuestion, Test, UserAccount, TestCategory } from './types';

const ADMIN_EMAIL = 'admin@jee.com';
const ADMIN_PASSWORD = 'admin123';

const initialAccounts: UserAccount[] = [
  { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' },
  { email: 'test@gmail.com', password: 'test123', role: 'student' },
];
// Your large question pool (sampleQuestions)
const sampleQuestions: Question[] = [
// Your large question pool (sampleQuestions)
{ id: 1, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1y9-GEc4S1jDyS1WNL5OqFTRWoibym8L9&sz=w2000", optionA: "a", optionB: "d", optionC: "b", optionD: "c", correctOption: "d" },
{ id: 2, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1VypMXlWqcUFk3AHY15R5QQsr-xKhB0RZ&sz=w2000", optionA: "a", optionB: "b", optionC: "d", optionD: "c", correctOption: "d" },
{ id: 49, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1qtbOC6kN5ZVbnwI3Wo_BMthYgzats4j2&sz=w2000", optionA: "d", optionB: "c", optionC: "a", optionD: "b", correctOption: "d" },
{ id: 50, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1qxuTec8eNTT0xZ3nC5jpbv86TYP3Br6a&sz=w2000", optionA: "d", optionB: "c", optionC: "a", optionD: "b", correctOption: "d" }

  ];

const DEFAULT_TEST_DURATION = 3600;

const testCategories: TestCategory[] = [
  { id: 'white', name: 'White Mock Tests', icon: '⚪', color: 'bg-white border-gray-300', description: 'Comprehensive mock tests' },
  { id: 'blue', name: 'Blue Mock Tests', icon: '🔵', color: 'bg-blue-50 border-blue-300', description: 'Advanced practice tests' },
  { id: 'grey', name: 'Grey Mock Tests', icon: '⚫', color: 'bg-gray-50 border-gray-300', description: 'Standard difficulty tests' },
  { id: 'pyq', name: 'PYQ (2005-2025)', icon: '📚', color: 'bg-yellow-50 border-yellow-300', description: 'Previous Year Questions' },
  { id: 'latest', name: 'Latest Pattern', icon: '🆕', color: 'bg-green-50 border-green-300', description: 'New test pattern' },
];

const initialTests: Test[] = [
 //White test
  { id: 'White Mock Test 1', name: 'White Mock Test 1', description: 'Mock test based on Actual PYQ', duration: DEFAULT_TEST_DURATION, questions: sampleQuestions.slice(0, 50), category: 'white' }

];
function shuffleOptions(question: Question): ShuffledQuestion {
  const options = [
    { text: question.optionA, originalKey: 'a' },
    { text: question.optionB, originalKey: 'b' },
    { text: question.optionC, originalKey: 'c' },
    { text: question.optionD, originalKey: 'd' }
  ];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const correctIndex = shuffled.findIndex(opt => opt.originalKey === question.correctOption);
  return {
    ...question,
    shuffledOptions: shuffled,
    correctIndex
  };
}

export default function MockTestPortal() {
  const [accounts, setAccounts] = useState<UserAccount[]>(initialAccounts);
  const [tests, setTests] = useState<Test[]>(initialTests);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TEST_DURATION);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [newTestName, setNewTestName] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');
  const [newTestDuration, setNewTestDuration] = useState('10');

  const addViolation = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setViolations(prev => [...prev, `${timestamp}: ${message}`]);
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  useEffect(() => {
    if (!testStarted) return;
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation('Right-click detected');
    };
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, [testStarted]);

  useEffect(() => {
    if (!testStarted) return;
    const preventShortcuts = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        addViolation('Screenshot attempt detected');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        addViolation('Screenshot attempt detected');
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        addViolation('Screenshot attempt detected');
      }
      if (e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
        addViolation('DevTools access attempt');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        addViolation('Print attempt detected');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        addViolation('Save attempt detected');
      }
    };
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('keyup', preventShortcuts);
    return () => {
      document.removeEventListener('keydown', preventShortcuts);
      document.removeEventListener('keyup', preventShortcuts);
    };
  }, [testStarted]);

  useEffect(() => {
    if (!testStarted || testCompleted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        addViolation('Tab switched or window minimized');
      }
    };
    const handleBlur = () => {
      setTabSwitchCount(prev => prev + 1);
      addViolation('Focus lost from test window');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [testStarted, testCompleted]);

  useEffect(() => {
    if (!testStarted || testCompleted) return;
    const enterFullscreen = () => {
      if (containerRef.current && !document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {
          addViolation('Fullscreen denied by user');
          // If denied, count as an exit attempt
          setFullscreenExitCount(prev => prev + 1);
        });
      }
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && testStarted && !testCompleted) {
        setFullscreenExitCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) { // Threshold for automatic submission
            addViolation('Fullscreen exited repeatedly. Test submitted automatically.');
            setTestCompleted(true);
            setShowResults(true);
          } else {
            addViolation('Exited fullscreen mode');
          }
          return newCount;
        });
        if (!testCompleted) { // Only re-enter if test is not completed
          setTimeout(enterFullscreen, 1000);
        }
      }
    };
    enterFullscreen();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [testStarted, testCompleted]);

  useEffect(() => {
    if (!testStarted) return;
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      img {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [testStarted]);

  useEffect(() => {
    if (!testStarted) return;
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation('Copy/Cut attempt detected');
    };
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
    };
  }, [testStarted]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    const user = accounts.find(acc => acc.email.toLowerCase() === email && acc.password === password);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setAuthError('');
      if (user.role === 'admin') {
        setShowAdminPanel(true);
      }
    } else {
      setAuthError('Invalid email or password');
      setPasswordInput('');
    }
  };

  const handleAddStudent = () => {
    const email = newStudentEmail.trim().toLowerCase();
    const password = newStudentPassword.trim();
    if (!email || !password) {
      setAdminMessage('Please enter both email and password');
      return;
    }
    if (accounts.some(acc => acc.email.toLowerCase() === email)) {
      setAdminMessage('This email already exists');
      return;
    }
    const newStudent: UserAccount = { email: newStudentEmail.trim(), password, role: 'student' };
    setAccounts([...accounts, newStudent]);
    setNewStudentEmail('');
    setNewStudentPassword('');
    setAdminMessage(`Student ${email} added successfully!`);
    setTimeout(() => setAdminMessage(''), 3000);
  };

  const handleDeleteStudent = (email: string) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      setAccounts(accounts.filter(acc => acc.email !== email));
      setAdminMessage(`Student ${email} deleted successfully!`);
      setTimeout(() => setAdminMessage(''), 3000);
    }
  };

  const handleAddTest = () => {
    if (!newTestName.trim()) {
      setAdminMessage('Please enter test name');
      return;
    }
    const duration = parseInt(newTestDuration) * 60;
    if (isNaN(duration) || duration <= 0) {
        setAdminMessage('Please enter a valid duration');
        return;
    }
    // For manual slice tests, you might need a different input for start/end indices
    // For now, adding a test with the full question pool for demonstration
    const newTest: Test = {
      id: 'test' + Date.now(),
      name: newTestName.trim(),
      description: newTestDesc.trim() || 'No description',
      duration: duration,
      questions: sampleQuestions // This will use the full pool unless modified
    };
    setTests([...tests, newTest]);
    setNewTestName('');
    setNewTestDesc('');
    setNewTestDuration('10');
    setAdminMessage(`Test "${newTest.name}" added successfully!`);
    setTimeout(() => setAdminMessage(''), 3000);
  };

  const handleDeleteTest = (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      setTests(tests.filter(t => t.id !== testId));
      setAdminMessage('Test deleted successfully!');
      setTimeout(() => setAdminMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowAdminPanel(false);
    setTestStarted(false);
    setSelectedTest(null);
    setEmailInput('');
    setPasswordInput('');
    setViolations([]);
    setTabSwitchCount(0);
    setFullscreenExitCount(0); // Reset fullscreen exit count on logout
  };

  const handleSelectTest = (test: Test) => {
    setSelectedTest(test);
    setTimeLeft(test.duration);
  };

  const handleStartTest = () => {
    if (selectedTest && selectedTest.questions && selectedTest.questions.length > 0) {
      try {
        // Shuffle options for the selected questions
        const shuffled = selectedTest.questions.map(q => shuffleOptions(q));
        setQuestions(shuffled);
        setTestStarted(true);
        setCurrentQuestion(0);
        setAnswers({});
        setMarkedForReview({});
        setVisitedQuestions(new Set([0]));
        setTimeLeft(selectedTest.duration);
        setTestCompleted(false);
        setShowResults(false);
        setViolations([]);
        setTabSwitchCount(0);
        setFullscreenExitCount(0); // Reset on new test start
      } catch (error) {
        console.error("Error starting test:", error);
        alert("Error starting test. Please try again.");
      }
    } else {
      alert("No questions available for this test. Please contact administrator.");
    }
  };

  useEffect(() => {
    if (testStarted && !testCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const clearResponse = () => {
    const qId = questions[currentQuestion]?.id;
    if (qId !== undefined) {
        setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[qId];
        return newAnswers;
      });
    }
  };

  // ✅ **FIXED: Clarified status counts logic**
  const getStatusCounts = () => {
    let answered = 0;
    let visitedNotAnswered = 0; // Renamed from 'notAnswered' for clarity
    let notVisited = 0;
    let markedForReviewCount = 0;
    let answeredMarked = 0;
    questions.forEach((q, idx) => {
      const isAnswered = answers[q.id] !== undefined;
      const isMarked = markedForReview[q.id];
      const isVisited = visitedQuestions.has(idx);
      if (isAnswered && isMarked) {
        answeredMarked++;
      } else if (isAnswered) {
        answered++;
      } else if (isMarked) {
        markedForReviewCount++;
      } else if (isVisited) { // Visited but not answered
        visitedNotAnswered++; // This was previously called 'notAnswered'
      } else { // Not visited
        notVisited++;
      }
    });
    return { answered, visitedNotAnswered, notVisited, markedForReviewCount, answeredMarked };
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        if (answers[q.id] === q.correctIndex) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        unattempted++;
      }
    });
    const totalMarks = (correct * 4) - (incorrect * 1);
    const maxMarks = questions.length;
    return { correct, incorrect, unattempted, totalMarks, maxMarks };
  };

  const handleSaveAndNext = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setVisitedQuestions(prev => new Set(prev).add(nextQuestion));
    }
  };

  const handleMarkAndNext = () => {
    const qId = questions[currentQuestion]?.id;
    if (qId !== undefined) {
        setMarkedForReview(prev => ({ ...prev, [qId]: true }));
        if (currentQuestion < questions.length - 1) {
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setVisitedQuestions(prev => new Set(prev).add(nextQuestion));
      }
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const unansweredCount = questions.length - Object.keys(answers).length;
    let confirmMessage = 'Are you sure you want to submit the test?';
    if (unansweredCount > 0) {
      confirmMessage = `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`;
    }
    const confirmed = window.confirm(confirmMessage);
    if (confirmed) {
      setTestCompleted(true);
      setShowResults(true);
    }
  };

  const restartTest = () => {
    setTestStarted(false);
    setSelectedTest(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setMarkedForReview({});
    setVisitedQuestions(new Set([0]));
    setTimeLeft(DEFAULT_TEST_DURATION);
    setTestCompleted(false);
    setShowResults(false);
    setViolations([]);
    setTabSwitchCount(0);
    setFullscreenExitCount(0); // Reset on restart
  };

  const handleQuestionNavigation = (idx: number) => {
    setCurrentQuestion(idx);
    setVisitedQuestions(prev => new Set(prev).add(idx));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">JEE B.Arch</h1>
            </div>
            <p className="text-gray-600">Mock Test Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="Enter your password"
                required
              />
            </div>
            {authError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showAdminPanel && currentUser?.role === 'admin') {
    const students = accounts.filter(acc => acc.role === 'student');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-gray-600">Manage Students & Tests</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
            {adminMessage && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {adminMessage}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <UserPlus size={24} />
                  Add New Student
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Email
                    </label>
                    <input
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="student@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Set password"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddStudent}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Add Student
                </button>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Plus size={24} />
                  Add New Test
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Name
                    </label>
                    <input
                      type="text"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="e.g., Mock Test 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newTestDesc}
                      onChange={(e) => setNewTestDesc(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newTestDuration}
                      onChange={(e) => setNewTestDuration(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="10"
                      min="1"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddTest}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Add Test
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Registered Students ({students.length})
                </h2>
                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No students registered yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {students.map((student, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{student.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteStudent(student.email)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Available Tests ({tests.length})
                </h2>
                {tests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tests available</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tests.map((test) => (
                      <div key={test.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen size={18} className="text-green-600" />
                              <h3 className="font-semibold text-gray-800">{test.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{test.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>⏱️ {Math.floor(test.duration / 60)} min</span>
                              <span>📝 {test.questions.length} questions</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-sm transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTest && !testStarted) {
    const filteredTests = selectedCategory
      ? tests.filter(t => t.category === selectedCategory)
      : tests;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="lg:hidden fixed right-4 top-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row min-h-screen">
          <div className={`
            ${mobileMenuOpen ? 'block' : 'hidden'} lg:block
            w-full lg:w-64 bg-white border-r border-gray-200 overflow-y-auto
            fixed lg:relative top-0 left-0 h-full z-40 lg:z-0 pt-16 lg:pt-0
          `}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Test Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Tests
                </button>
                {testCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <div className="font-semibold text-sm">{category.name}</div>
                      <div className="text-xs opacity-75">{category.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-2xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Available Mock Tests</h1>
                    <p className="text-gray-600">
                      {selectedCategory
                        ? testCategories.find(c => c.id === selectedCategory)?.name
                        : 'Select a test to begin'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg w-full sm:w-auto">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-xs text-gray-600">Logged in as:</div>
                        <div className="text-sm font-semibold text-gray-800 truncate">{currentUser?.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition text-sm whitespace-nowrap"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>

                {filteredTests.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500">No tests available in this category</p>
                    <p className="text-sm text-gray-400 mt-2">Please select another category or check back later</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {filteredTests.map((test) => (
                      <div
                        key={test.id}
                        className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl transition transform hover:scale-105 cursor-pointer"
                        onClick={() => {
                          handleSelectTest(test);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen size={24} className="text-white" />
                          </div>
                          <h3 className="text-lg lg:text-xl font-bold text-gray-800 flex-1">{test.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-4 min-h-[48px] text-sm">{test.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={16} className="text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-medium">Duration: {Math.floor(test.duration / 60)} minutes</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <BookOpen size={16} className="text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-medium">Questions: {test.questions.length}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTest(test);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm"
                        >
                          Select Test
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    );
  }

  if (selectedTest && !testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedTest(null)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition text-sm"
              >
                ← Back to Tests
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-600">Logged in as:</div>
                  <div className="text-sm font-semibold text-gray-800">{currentUser?.email}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen size={32} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">{selectedTest.name}</h1>
            </div>
            <p className="text-gray-600 mb-6">{selectedTest.description}</p>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="text-red-600" size={32} />
                <h2 className="text-xl font-semibold text-red-900">Security Notice</h2>
              </div>
              <ul className="text-left text-red-800 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  Test will run in fullscreen mode
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  Screenshots, screen recording, and printing are disabled
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  Tab switching and window switching will be monitored
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  All security violations will be logged
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Test Instructions</h2>
              <ul className="text-left text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Total Questions: {selectedTest.questions.length}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Time Duration: {Math.floor(selectedTest.duration / 60)} minutes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Each question carries 4 marks
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Negative marking: -1 for incorrect answers
                </li>
              </ul>
            </div>
            <button
              onClick={handleStartTest}
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105"
            >
              I Agree - Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const { correct, incorrect, unattempted, totalMarks, maxMarks } = calculateScore();
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Test Results</h1>
              <p className="text-gray-600">{selectedTest?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <User size={20} className="text-gray-600" />
              <span className="text-sm text-gray-600">{currentUser?.email}</span>
            </div>
          </div>
          {violations.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-600" size={24} />
                <h3 className="text-lg font-semibold text-red-900">Security Violations Detected: {violations.length}</h3>
              </div>
              <div className="text-sm text-red-800 max-h-32 overflow-y-auto space-y-1">
                {violations.map((v, idx) => (
                  <div key={idx} className="py-1 border-b border-red-200 last:border-0">• {v}</div>
                ))}
              </div>
            </div>
          )}
          {tabSwitchCount > 0 && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
              <p className="text-orange-800 font-semibold">
                ⚠️ Tab Switches / Focus Loss: {tabSwitchCount} times
              </p>
            </div>
          )}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-8 mb-8 text-white">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Score</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{correct}</div>
                <div className="text-sm mt-1">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{incorrect}</div>
                <div className="text-sm mt-1">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{unattempted}</div>
                <div className="text-sm mt-1">Unattempted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{questions.length}</div>
                <div className="text-sm mt-1">Total</div>
              </div>
            </div>
            <div className="border-t-2 border-white/30 pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{totalMarks} / {maxMarks}</div>
                <div className="text-xl">Marks Obtained ({percentage}%)</div>
                <div className="text-sm mt-3 opacity-90">
                  Marking Scheme: +4 for correct, -1 for incorrect
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctIndex;
              const isAttempted = userAnswer !== undefined;
              return (
                <div key={q.id} className={`border-2 rounded-lg p-4 ${isCorrect ? 'border-green-300 bg-green-50' : isAttempted ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex-1">
                      Q{idx + 1}. {q.question}
                      {q.type === 'match-pair' && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Match the Pair</span>}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="text-green-600" size={24} />
                          <span className="text-green-600 font-bold text-sm">+4</span>
                        </>
                      ) : isAttempted ? (
                        <>
                          <XCircle className="text-red-600" size={24} />
                          <span className="text-red-600 font-bold text-sm">-1</span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm font-semibold">Not Answered (0)</span>
                      )}
                    </div>
                  </div>
                  {q.type === 'match-pair' && q.columnAItems && (
                    <div className="mb-3 bg-white p-3 rounded border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm font-medium text-blue-700 mb-2">Column A:</div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {q.columnAItems.map((item, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="font-semibold">{i + 1}.</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {q.columnBItems && (
                          <div>
                            <div className="text-sm font-medium text-purple-700 mb-2">Column B:</div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {q.columnBItems.map((item, i) => (
                                <div key={i}>{item}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {q.image && (
                    <div className="mb-3">
                      <img
                        src={q.image}
                        alt="Question"
                        className="max-w-xs h-auto border border-gray-300 rounded"
                      />
                    </div>
                  )}
                  <div className="ml-4 space-y-1">
                    {isAttempted && !isCorrect && (
                      <p className="text-red-600 text-sm">Your answer: <span className="font-semibold">{String.fromCharCode(65 + userAnswer)} - {q.shuffledOptions[userAnswer].text}</span></p>
                    )}
                    <p className="text-green-600 text-sm font-semibold">Correct answer: <span className="font-semibold">{String.fromCharCode(65 + q.correctIndex)} - {q.shuffledOptions[q.correctIndex].text}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center flex gap-4 justify-center">
            <button
              onClick={restartTest}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition"
            >
              <RotateCcw size={20} />
              Take Another Test
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0 || testCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading questions...</div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  if (!q) {
      return <div className="min-h-screen bg-white flex items-center justify-center">Invalid question index.</div>;
  }
  const statusCounts = getStatusCounts();
  return (
    <div ref={containerRef} className="min-h-screen bg-white relative">
      {showWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-pulse">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <AlertTriangle size={24} />
            <span className="font-bold">{warningMessage}</span>
          </div>
        </div>
      )}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded">
              <span className="text-sm font-semibold">{selectedTest?.name}</span>
            </div>
            {!isFullscreen && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={16} />
                Not in fullscreen
              </div>
            )}
          </div>
          <div className="text-right flex items-center gap-4">
            {violations.length > 0 && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={16} />
                Violations: {violations.length}
              </div>
            )}
            <div className="text-lg font-bold text-gray-800">Time Left: {formatTime(timeLeft)}</div>
          </div>
        </div>
      </div>
      <div className="flex h-[calc(100vh-70px)]">
        <div className="flex-1 overflow-auto">
          <div className="bg-blue-500 text-white px-6 py-3 font-semibold flex items-center justify-between">
            <span>Question No. {currentQuestion + 1}</span>
            {q.type === 'match-pair' && (
              <span className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full font-bold">Match the Pair</span>
            )}
          </div>
          <div className="p-6 pb-24">
            <h3 className="text-lg font-medium text-gray-800 mb-6">{q.question}</h3>
            {q.type === 'match-pair' && q.columnAItems && (
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-blue-300 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-blue-900 mb-3 text-base flex items-center gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                      Column A (Items to Match):
                    </h4>
                    <div className="space-y-2">
                      {q.columnAItems.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-white p-3 rounded shadow-sm border-l-4 border-blue-500">
                          <span className="font-bold text-blue-600 text-lg min-w-[24px]">{idx + 1}.</span>
                          <span className="text-gray-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {q.columnBItems && (
                    <div>
                      <h4 className="font-bold text-purple-900 mb-3 text-base flex items-center gap-2">
                        <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                        Column B (Match with):
                      </h4>
                      <div className="space-y-2">
                        {q.columnBItems.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-start bg-white p-3 rounded shadow-sm border-l-4 border-purple-500">
                            <span className="text-gray-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-blue-200">
                  <p className="text-sm font-semibold text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    📋 Select the correct matching combination from the options below (Format: 1-A, 2-B, 3-C, 4-D)
                  </p>
                </div>
              </div>
            )}
            {q.image && (
              <div className="mb-6 flex justify-center relative">
                <img
                  src={q.image}
                  alt="Question visual"
                  className="max-w-full h-auto max-h-96 object-contain border-2 border-gray-300 rounded-lg shadow-md"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              </div>
            )}
            <div className="space-y-3">
              {q.shuffledOptions.map((option, idx) => (
                <label
                  key={idx}
                  className="flex items-start cursor-pointer group"
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={answers[q.id] === idx}
                    onChange={() => handleAnswer(q.id, idx)}
                    className="mt-1 w-4 h-4"
                  />
                  <span className="ml-3 text-base text-gray-700">
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="fixed bottom-0 left-0 bg-white border-t-2 border-gray-200 p-4 z-50" style={{ right: '320px' }}>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={handleMarkAndNext}
                className="px-6 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-50 font-medium cursor-pointer"
              >
                Mark for Review & Next
              </button>
              <button
                type="button"
                onClick={clearResponse}
                className="px-6 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-50 font-medium cursor-pointer"
              >
                Clear Response
              </button>
              <div className="flex-1"></div>
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium cursor-pointer"
              >
                Save & Next
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 font-medium cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
        <div className="w-80 bg-gray-50 border-l-2 border-gray-200 overflow-auto">
          <div className="bg-white border-b-2 border-gray-200 p-4 flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">
              <User size={32} className="text-gray-600" />
            </div>
            <div>
              <div className="text-blue-600 font-medium">Profile</div>
              <div className="text-xs text-gray-600 truncate max-w-[180px]" title={currentUser?.email}>{currentUser?.email}</div>
            </div>
          </div>
          {violations.length > 0 && (
            <div className="bg-red-50 border-b-2 border-red-200 p-3">
              <div className="flex items-center gap-2 text-red-700 text-xs font-semibold mb-2">
                <Shield size={16} />
                Security Alerts: {violations.length}
              </div>
              <div className="text-xs text-red-600 max-h-20 overflow-y-auto">
                {violations.slice(-3).map((v, idx) => (
                  <div key={idx} className="py-1">• {v}</div>
                ))}
              </div>
            </div>
          )}
          <div className="p-4 bg-white border-b-2 border-gray-200">
            {/* ✅ **FIXED: Updated labels to reflect the corrected logic** */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {statusCounts.answered}
                </div>
                <span className="text-xs font-medium text-gray-700">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {statusCounts.visitedNotAnswered} {/* Renamed variable */}
                </div>
                <span className="text-xs font-medium text-gray-700">Visited, Not Answered</span> {/* Updated label */}
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {statusCounts.notVisited}
                </div>
                <span className="text-xs font-medium text-gray-700">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {statusCounts.markedForReviewCount}
                </div>
                <span className="text-xs font-medium text-gray-700">Marked for Review</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-green-500">
                {statusCounts.answeredMarked}
              </div>
              <span className="text-xs text-gray-700">Answered & Marked for Review</span>
            </div>
          </div>
          <div className="p-4">
            <div className="bg-blue-600 text-white text-center py-2 mb-3 font-semibold text-sm">
              {selectedTest?.name}
            </div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Choose a Question</h4>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((_, idx) => {
                const qId = questions[idx].id;
                const isAnswered = answers[qId] !== undefined;
                const isMarked = markedForReview[qId];
                const isCurrent = idx === currentQuestion;
                const isVisited = visitedQuestions.has(idx);
                let bgColor = 'bg-gray-300 text-gray-700';
                let borderClass = '';
                if (isCurrent) {
                  bgColor = 'bg-orange-500 text-white shadow-lg';
                } else if (isAnswered && isMarked) {
                  bgColor = 'bg-purple-600 text-white';
                  borderClass = 'ring-4 ring-green-500';
                } else if (isAnswered) {
                  bgColor = 'bg-green-500 text-white';
                } else if (isMarked) {
                  bgColor = 'bg-purple-600 text-white';
                } else if (isVisited) { // Visited but not answered
                  bgColor = 'bg-red-500 text-white';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuestionNavigation(idx)}
                    className={`w-12 h-12 rounded-lg font-bold text-sm ${bgColor} ${borderClass} hover:opacity-80 transition`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
