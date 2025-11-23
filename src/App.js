import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, DollarSign, Plus, Trash2, Clock, Briefcase, GraduationCap, X, TrendingDown, Sparkles, ChevronLeft, ChevronRight, Save, CheckCircle, AlertCircle, CreditCard, PieChart, RefreshCw } from 'lucide-react';

// --- ТҰРАҚТЫЛАР ---
const TIMES = Array.from({ length: 15 }, (_, i) => i + 9); // 9:00 - 23:00

// --- КӨМЕКШІ ФУНКЦИЯЛАР ---
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Дүйсенбіге туралау
  const newDate = new Date(d.setDate(diff));
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
};

const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
const getMonthName = (date) => {
  const months = ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'];
  return months[date.getMonth()];
};

const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

const WEEK_DAYS_KZ = ['Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі', 'Жексенбі'];

// --- БАСТАПҚЫ ДЕРЕКТЕР ---
const INITIAL_STUDENTS = [];

export default function App() {
  const [activeTab, setActiveTab] = useState('work');
  
  // --- ДЕРЕКТЕР (STATE) ---
  const [currentDate, setCurrentDate] = useState(new Date()); 

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('myApp_students_v4');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('myApp_completed_lessons_v4');
    return saved ? JSON.parse(saved) : {};
  });

  const [deposit, setDeposit] = useState(() => {
    const saved = localStorage.getItem('myApp_deposit_v4');
    return saved ? parseFloat(saved) : 0;
  });

  const [uniTasks, setUniTasks] = useState(() => {
    const saved = localStorage.getItem('myApp_tasks_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('myApp_transactions_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('myApp_notes_v4');
    return saved ? JSON.parse(saved) : [];
  });

  // --- LOCAL STORAGE SAVE ---
  useEffect(() => { localStorage.setItem('myApp_students_v4', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('myApp_completed_lessons_v4', JSON.stringify(completedLessons)); }, [completedLessons]);
  useEffect(() => { localStorage.setItem('myApp_deposit_v4', JSON.stringify(deposit)); }, [deposit]);
  useEffect(() => { localStorage.setItem('myApp_tasks_v4', JSON.stringify(uniTasks)); }, [uniTasks]);
  useEffect(() => { localStorage.setItem('myApp_transactions_v4', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('myApp_notes_v4', JSON.stringify(notes)); }, [notes]);

  // --- UI STATE ---
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  // Формалар
  const [newStudent, setNewStudent] = useState({ name: '', schedule: [], paymentType: 'monthly', amount: '' });
  const [tempSlot, setTempSlot] = useState({ day: 'Дүйсенбі', time: '14' });
  const [newTask, setNewTask] = useState({ title: '', deadline: '' });
  const [newTransaction, setNewTransaction] = useState({ type: 'expense', amount: '', category: '' });
  const [newNote, setNewNote] = useState({ content: '', time: '' });
  const [depositInput, setDepositInput] = useState('');

  // --- ЕСЕПТЕУ ЛОГИКАСЫ ---
  const getLessonCost = (student) => {
    const amt = parseInt(student.amount) || 0;
    const lessonsPerWeek = student.schedule.length || 1;
    if (student.paymentType === 'daily') return amt; 
    if (student.paymentType === 'weekly') return amt / lessonsPerWeek; 
    if (student.paymentType === 'monthly') return 0; 
    return 0;
  };

  const calculateRealIncome = (startDate, endDate) => {
    let total = 0;
    Object.keys(completedLessons).forEach(key => {
      const [studentId, dateStr] = key.split('_');
      
      // ТУРАЛАУ: String-ті бөлшектеп, жергілікті уақыт жасаймыз
      const [y, m, d] = dateStr.split('-').map(Number);
      const lessonDate = new Date(y, m - 1, d); 
      
      if (lessonDate >= startDate && lessonDate <= endDate && completedLessons[key]) {
        const student = students.find(s => s.id === parseInt(studentId));
        if (student) total += getLessonCost(student);
      }
    });
    return Math.round(total);
  };

  const currentWeekStart = getStartOfWeek(currentDate);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59);

  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

  // 1. АПТАЛЫҚ ЕСЕП
  const weeklyTransactions = transactions.filter(t => {
    // ТУРАЛАУ: String-ті бөлшектеп, жергілікті уақыт жасаймыз
    const [y, m, d] = t.date.split('-').map(Number);
    const tDate = new Date(y, m - 1, d);
    return tDate >= currentWeekStart && tDate <= currentWeekEnd;
  });
  const weeklyOtherIncome = weeklyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const weeklyExpenses = weeklyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const realWeeklyLessonIncome = calculateRealIncome(currentWeekStart, currentWeekEnd);
  const currentWeekBalance = realWeeklyLessonIncome + weeklyOtherIncome - weeklyExpenses;

  // 2. АЙЛЫҚ ЕСЕП
  const monthlyTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= currentMonthStart && tDate <= currentMonthEnd;
  });
  const monthlyOtherIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const realMonthlyLessonIncome = calculateRealIncome(currentMonthStart, currentMonthEnd);
  const currentMonthBalance = realMonthlyLessonIncome + monthlyOtherIncome - monthlyExpenses;

  // 3. АЙЛЫҚ ОҚУШЫЛАРДАН ТҮСКЕН АҚША
  const collectedMonthlyIncome = transactions
    .filter(t => t.type === 'income' && t.category.startsWith('Айлық') && isSameMonth(new Date(t.date), currentDate))
    .reduce((acc, t) => acc + t.amount, 0);

  // --- ФУНКЦИЯЛАР ---
  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const toggleLessonCompletion = (studentId, dateStr, time) => {
    const key = `${studentId}_${dateStr}_${time}`;
    setCompletedLessons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddDeposit = () => {
    const val = parseFloat(depositInput);
    if (val) {
      setDeposit(prev => prev + val);
      setDepositInput('');
    }
  };

  const receiveMonthlyPayment = (student) => {
      setConfirmModal({
          isOpen: true, 
          message: `${student.name} оқушысынан ${student.amount} ₸ қабылдауды растайсыз ба?`,
          onConfirm: () => {
              const newTx = {
                  id: Date.now(),
                  type: 'income',
                  amount: parseInt(student.amount),
                  category: `Айлық: ${student.name}`, 
                  date: new Date().toISOString().split('T')[0]
              };
              setTransactions(prev => [...prev, newTx]);
              setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          }
      });
  };

  const clearAllData = () => {
      if (window.confirm('Барлық деректерді (оқушылар, қаржы, жоспар) өшіріп, басынан бастайсыз ба?')) {
          localStorage.clear();
          window.location.reload();
      }
  };

  // --- САБАҚТЫ КЕСТЕДЕН ЖЕКЕ ӨШІРУ ---
  const deleteScheduleSlot = (studentId, day, time) => {
      setConfirmModal({
          isOpen: true,
          message: 'Тек осы сабақ уақытын кестеден өшіресіз бе?',
          onConfirm: () => {
              setStudents(prev => prev.map(s => {
                  if (s.id === studentId) {
                      // Сол күнгі сол уақытты ғана алып тастаймыз
                      const newSchedule = s.schedule.filter(slot => !(slot.day === day && slot.time === time));
                      return { ...s, schedule: newSchedule };
                  }
                  return s;
              }));
              setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          }
      });
  };

  const copyDataForAI = () => {
    const summary = `Сәлем! Менің қаржылық есебім (${getMonthName(currentDate)} айы):
    
    Апта: ${formatDisplayDate(currentWeekStart)} - ${formatDisplayDate(currentWeekEnd)}
    АПТАЛЫҚ БАЛАНС: ${currentWeekBalance.toLocaleString()} ₸
    АЙЛЫҚ БАЛАНС: ${currentMonthBalance.toLocaleString()} ₸
    
    Деректер:
    - Апталық сабақтар: ${realWeeklyLessonIncome.toLocaleString()} ₸
    - Осы айда жиналған айлық төлемдер: ${collectedMonthlyIncome.toLocaleString()} ₸
    - Шығыстар (Апта/Ай): ${weeklyExpenses.toLocaleString()} / ${monthlyExpenses.toLocaleString()} ₸
    - Депозит: ${deposit.toLocaleString()} ₸`;

    const copyToClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((resolve, reject) => {
                document.execCommand('copy') ? resolve() : reject();
                textArea.remove();
            });
        }
    };

    copyToClipboard(summary).then(() => {
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 3000);
    });
  };

  // CRUD
  const addStudent = () => {
    if (!newStudent.name || !newStudent.amount || newStudent.schedule.length === 0) return;
    setStudents([...students, { ...newStudent, id: Date.now(), amount: parseInt(newStudent.amount) }]);
    setIsStudentModalOpen(false);
    setNewStudent({ name: '', schedule: [], paymentType: 'monthly', amount: '' });
  };
  const deleteStudent = (id) => {
     setConfirmModal({ isOpen: true, message: 'Бұл оқушыны және оның барлық деректерін өшіресіз бе?', onConfirm: () => {
        setStudents(prev => prev.filter(s => s.id !== id));
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
    }});
  };
  const addScheduleSlot = () => {
    if (!newStudent.schedule.find(s => s.day === tempSlot.day && s.time === parseInt(tempSlot.time))) {
        setNewStudent({...newStudent, schedule: [...newStudent.schedule, { day: tempSlot.day, time: parseInt(tempSlot.time) }]});
    }
  };
  const removeScheduleSlot = (index) => {
      const updated = [...newStudent.schedule]; updated.splice(index, 1); setNewStudent({...newStudent, schedule: updated});
  };
  const addTask = () => { if (newTask.title) { setUniTasks([...uniTasks, { ...newTask, id: Date.now(), completed: false }]); setNewTask({ title: '', deadline: '' }); }};
  const addTransaction = () => { if (newTransaction.amount) { setTransactions([...transactions, { ...newTransaction, id: Date.now(), amount: parseInt(newTransaction.amount), date: new Date().toISOString().split('T')[0] }]); setNewTransaction({ type: 'expense', amount: '', category: '' }); }};
  const deleteTransaction = (id) => { setTransactions(prev => prev.filter(t => t.id !== id)); };
  
  const addNote = () => { 
      if (newNote.content) { 
          setNotes([...notes, { 
              ...newNote, id: Date.now(), date: new Date().toISOString(), completed: false, completedDate: null
          }]); 
          setNewNote({ content: '', time: '' }); 
      }
  };
  
  const toggleNoteStatus = (id) => {
      setNotes(notes.map(n => {
          if (n.id === id) {
              const isCompleting = !n.completed;
              return { ...n, completed: isCompleting, completedDate: isCompleting ? new Date().toISOString() : null };
          }
          return n;
      }));
  };

  // --- RENDER ---
  const renderSchedule = () => {
    const weekDays = getWeekDays(currentWeekStart);
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 bg-gray-50 border-b">
            <div className="p-3 text-xs font-semibold text-gray-500 uppercase flex items-center justify-center">Уақыт</div>
            {weekDays.map((date, index) => (
              <div key={index} className={`p-2 text-center border-l ${date.toDateString() === new Date().toDateString() ? 'bg-indigo-50' : ''}`}>
                <div className="text-xs font-bold text-gray-700 uppercase">{WEEK_DAYS_KZ[index]}</div>
                <div className={`text-sm font-medium ${date.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {formatDisplayDate(date)}
                </div>
              </div>
            ))}
          </div>
          {TIMES.map(time => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0 hover:bg-gray-50/50">
              <div className="p-3 text-sm font-medium text-gray-400 border-r flex items-center justify-center">{time}:00</div>
              {weekDays.map((date, index) => {
                const dayName = WEEK_DAYS_KZ[index];
                const dateStr = formatDate(date);
                const student = students.find(s => s.schedule.some(sl => sl.day === dayName && sl.time === time));
                const lessonKey = student ? `${student.id}_${dateStr}_${time}` : null;
                const isCompleted = lessonKey ? completedLessons[lessonKey] : false;
                const lessonCost = student ? getLessonCost(student) : 0;

                return (
                  <div key={`${dateStr}-${time}`} className="p-1 border-r h-20 relative group">
                    {student && (
                      <div 
                        onClick={() => toggleLessonCompletion(student.id, dateStr, time)}
                        className={`w-full h-full rounded-lg p-2 text-xs flex flex-col justify-between cursor-pointer transition-all shadow-sm border relative
                          ${isCompleted 
                            ? 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200' 
                            : 'bg-white border-indigo-100 text-gray-600 hover:border-indigo-300 hover:shadow-md'
                          }`}
                      >
                        {/* ЖЕКЕ САБАҚТЫ ӨШІРУ БАТЫРМАСЫ */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Attendance toggle істемеуі үшін
                                deleteScheduleSlot(student.id, dayName, time);
                            }}
                            className="absolute top-1 right-1 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Сабақты кестеден өшіру"
                        >
                            <X size={14} />
                        </button>

                        <div className="flex justify-between items-start pr-4">
                            <span className="font-bold truncate">{student.name}</span>
                            {isCompleted ? <CheckCircle size={14} className="text-green-600"/> : <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>}
                        </div>
                        <div className="flex justify-between items-end mt-1">
                            {student.paymentType === 'monthly' ? (
                                <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded">Айлық</span>
                            ) : (
                                <span className="text-[10px] opacity-75">{lessonCost.toLocaleString()}₸</span>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col md:flex-row">
      
      {/* TOAST */}
      {showCopyToast && (
          <div className="fixed top-5 right-5 bg-black text-white px-6 py-3 rounded-lg shadow-2xl z-[100] animate-bounce flex items-center gap-3">
              <Sparkles className="text-yellow-400" />
              <div><p className="font-bold">Деректер көшірілді!</p></div>
          </div>
      )}

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around py-3 z-50 shadow-lg">
        <NavButton active={activeTab === 'work'} onClick={() => setActiveTab('work')} icon={<Briefcase size={20} />} label="Жұмыс" />
        <NavButton active={activeTab === 'uni'} onClick={() => setActiveTab('uni')} icon={<GraduationCap size={20} />} label="Универ" />
        <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20} />} label="Қаржы" />
        <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<CheckSquare size={20} />} label="Заметки" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 bg-white h-screen border-r fixed shadow-sm flex justify-between">
        <div>
            <div className="p-6 flex items-center gap-3 text-indigo-600">
            <div className="bg-indigo-100 p-2 rounded-lg"><Calendar size={24} /></div>
            <h1 className="text-xl font-bold tracking-tight">My Plan Pro</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
            <DesktopNavLink active={activeTab === 'work'} onClick={() => setActiveTab('work')} icon={<Briefcase size={20} />} label="Кесте & Сабақ" />
            <DesktopNavLink active={activeTab === 'uni'} onClick={() => setActiveTab('uni')} icon={<GraduationCap size={20} />} label="Университет" />
            <DesktopNavLink active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20} />} label="Қаржы & Депозит" />
            <DesktopNavLink active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<CheckSquare size={20} />} label="Жазбалар" />
            </nav>
        </div>
        
        <div className="p-6 space-y-4">
            <div className="bg-gray-900 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs opacity-60 mb-1 text-gray-300">Осы аптадағы баланс</p>
                <p className="text-xl font-bold">{currentWeekBalance.toLocaleString()} ₸</p>
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-[10px] opacity-60 text-gray-300">Айлық оқушылардан:</p>
                    <p className="text-sm font-medium text-purple-300">+{collectedMonthlyIncome.toLocaleString()} ₸</p>
                </div>
            </div>
            
            <button onClick={copyDataForAI} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition font-medium text-sm">
                <Sparkles size={18} /> AI-мен ақылдасу
            </button>

            <button onClick={clearAllData} className="w-full flex items-center justify-center gap-2 text-red-400 text-xs hover:text-red-600 transition p-2">
                <RefreshCw size={14} /> Деректерді тазалау
            </button>
        </div>
      </div>

      <main className="flex-1 md:ml-64 p-4 md:p-8 mb-20 md:mb-0 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'work' && 'Кесте және Сабақтар'}
              {activeTab === 'uni' && 'Университет'}
              {activeTab === 'finance' && 'Қаржылық Бақылау'}
              {activeTab === 'notes' && 'Жазбалар'}
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Бүгін: {new Date().toLocaleDateString()}</p>
          </div>
          <button onClick={copyDataForAI} className="md:hidden bg-pink-500 text-white p-2 rounded-full shadow-lg"><Sparkles size={24} /></button>
        </header>

        {activeTab === 'work' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* КАЛЕНДАРЬ БАСҚАРУ */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border">
                    <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white hover:shadow rounded-md transition"><ChevronLeft size={20}/></button>
                    <div className="text-center min-w-[140px]">
                        <span className="block text-xs text-gray-400 uppercase font-bold">{getMonthName(currentWeekStart)}</span>
                        <span className="font-bold text-gray-800">{formatDisplayDate(currentWeekStart)} - {formatDisplayDate(currentWeekEnd)}</span>
                    </div>
                    <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white hover:shadow rounded-md transition"><ChevronRight size={20}/></button>
                </div>

                <div className="flex gap-4 items-center w-full md:w-auto">
                   <div className="bg-green-50 px-4 py-2 rounded-lg text-green-700 text-sm font-medium border border-green-100 flex-1 md:flex-none text-center">
                        Осы апта (Күн/Апта): <span className="font-bold block md:inline md:ml-1">{realWeeklyLessonIncome.toLocaleString()} ₸</span>
                    </div>
                    <button onClick={() => setIsStudentModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-indigo-200 text-sm font-medium">
                        <Plus size={18} /> <span className="hidden md:inline">Оқушы қосу</span>
                    </button>
                </div>
            </div>

            {/* КЕСТЕ */}
            {renderSchedule()}

            <div className="flex flex-col md:flex-row gap-4 text-sm">
                <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 flex items-start gap-2">
                    <Clock className="mt-0.5 flex-shrink-0" size={16} />
                    <p>Сабақ өткізген соң ұяшықты басыңыз. "Күнделікті" немесе "Апталық" оқушылардың ақшасы балансқа қосылады.</p>
                </div>
                <div className="flex-1 bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-800 flex items-start gap-2">
                    <AlertCircle className="mt-0.5 flex-shrink-0" size={16} />
                    <p>"Айлық" оқушылар үшін төмендегі тізімнен <b>"Төлем қабылдау"</b> батырмасын басыңыз. Сонда ғана ақша балансқа түседі.</p>
                </div>
            </div>
            
            {/* ТІЗІМ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-5 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">Оқушылар тізімі</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr><th className="p-4">Аты</th><th className="p-4">Кестесі</th><th className="p-4">Төлем</th><th className="p-4">1 сабақ есебі / Төлем</th><th className="p-4 text-right">Әрекет</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Оқушылар тізімі бос. "Оқушы қосу" батырмасын басыңыз.</td>
                                </tr>
                            )}
                            {students.map(s => {
                                const cost = getLessonCost(s);
                                // Осы айда төледі ме?
                                const hasPaidThisMonth = transactions.some(t => t.category === `Айлық: ${s.name}` && isSameMonth(new Date(t.date), currentDate));

                                return (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{s.name}</td>
                                        <td className="p-4 text-gray-500">{s.schedule.map(sl=>sl.day).join(', ')}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${s.paymentType === 'monthly' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>{s.paymentType === 'monthly' ? 'Айына' : s.paymentType === 'weekly' ? 'Аптасына' : 'Күніне'} | {s.amount}₸</span></td>
                                        <td className="p-4 font-bold text-gray-700">
                                            {s.paymentType === 'monthly' ? (
                                                hasPaidThisMonth ? (
                                                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded w-fit"><CheckCircle size={14}/> Төленді</span>
                                                ) : (
                                                    <button onClick={() => receiveMonthlyPayment(s)} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-purple-700 flex items-center gap-2 shadow-sm">
                                                        <CreditCard size={14}/> Төлем қабылдау
                                                    </button>
                                                )
                                            ) : (
                                                <span>{Math.round(cost)} ₸</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={()=>deleteStudent(s.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs font-medium ml-auto">
                                                <Trash2 size={14}/> Өшіру
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isStudentModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between mb-6"><h3 className="text-xl font-bold">Жаңа оқушы</h3><button onClick={()=>setIsStudentModalOpen(false)}><X/></button></div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Есімі" className="w-full p-3 border rounded-lg bg-gray-50" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name:e.target.value})}/>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex gap-2 mb-3">
                                    <select className="flex-1 p-2 rounded-lg" value={tempSlot.day} onChange={e=>setTempSlot({...tempSlot, day:e.target.value})}>{WEEK_DAYS_KZ.map(d=><option key={d} value={d}>{d}</option>)}</select>
                                    <select className="w-24 p-2 rounded-lg" value={tempSlot.time} onChange={e=>setTempSlot({...tempSlot, time:e.target.value})}>{TIMES.map(t=><option key={t} value={t}>{t}:00</option>)}</select>
                                    <button onClick={addScheduleSlot} className="bg-indigo-600 text-white px-4 rounded-lg">+</button>
                                </div>
                                {newStudent.schedule.map((sl,i)=><div key={i} className="flex justify-between bg-white p-2 rounded border mb-2"><span className="text-sm">{sl.day} | {sl.time}:00</span><button onClick={()=>removeScheduleSlot(i)} className="text-red-500"><X size={16}/></button></div>)}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select className="p-3 border rounded-lg bg-gray-50" value={newStudent.paymentType} onChange={e=>setNewStudent({...newStudent, paymentType:e.target.value})}>
                                    <option value="monthly">Айына</option><option value="weekly">Аптасына</option><option value="daily">Күніне</option>
                                </select>
                                <input type="number" placeholder="Бағасы" className="p-3 border rounded-lg bg-gray-50" value={newStudent.amount} onChange={e=>setNewStudent({...newStudent, amount:e.target.value})}/>
                            </div>
                            <button onClick={addStudent} className="w-full bg-indigo-600 text-white p-3 rounded-lg">Сақтау</button>
                        </div>
                    </div>
                </div>
            )}
            {confirmModal.isOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"><div className="bg-white p-6 rounded-xl"><p className="mb-4 text-lg">{confirmModal.message}</p><div className="flex justify-end gap-3"><button onClick={()=>setConfirmModal({...confirmModal,isOpen:false})} className="px-4 py-2 bg-gray-100 rounded">Жоқ</button><button onClick={confirmModal.onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Иә</button></div></div></div>}
          </div>
        )}

        {activeTab === 'finance' && (
            <div className="space-y-6 animate-fadeIn">
                {/* ҚАРЖЫ КАРТОЧКАЛАРЫ - ЖАҢАРТЫЛҒАН GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-xs opacity-80 uppercase mb-2">Осы аптадағы баланс</p>
                        <h3 className="text-3xl font-bold">{currentWeekBalance.toLocaleString()} ₸</h3>
                        <p className="text-xs mt-2 opacity-60">Апталық есеп</p>
                    </div>

                    {/* ЖАҢА КАРТОЧКА: АЙЛЫҚ БАЛАНС */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-2 opacity-90"><PieChart size={18}/><span className="text-xs font-bold uppercase">Осы айдағы баланс</span></div>
                        <h3 className="text-3xl font-bold">{currentMonthBalance.toLocaleString()} ₸</h3>
                        <p className="text-xs mt-2 opacity-60">{getMonthName(currentDate)} айы</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-5 shadow-sm border border-purple-100">
                        <div className="flex items-center gap-2 mb-2 text-purple-700"><Briefcase size={18}/><span className="text-xs font-bold uppercase">Айлық оқушылардан</span></div>
                        <h3 className="text-2xl font-bold text-purple-900">{collectedMonthlyIncome.toLocaleString()} ₸</h3>
                        <p className="text-xs text-purple-400 mt-1">Тек қабылданған төлемдер</p>
                    </div>

                    <div className="bg-yellow-50 rounded-xl p-5 shadow-sm border border-yellow-100">
                        <div className="flex items-center gap-2 mb-2 text-yellow-700"><Save size={18}/><span className="text-xs font-bold uppercase">Депозит (Қор)</span></div>
                        <h3 className="text-2xl font-bold text-yellow-800">{deposit.toLocaleString()} ₸</h3>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* ДЕПОЗИТ БӨЛІМІ */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                         <h3 className="font-bold mb-4 flex items-center gap-2"><Save className="text-yellow-500"/> Депозитке салу</h3>
                         <div className="flex gap-2">
                             <input type="number" placeholder="Сомасы" className="flex-1 p-3 bg-gray-50 border rounded-lg" value={depositInput} onChange={e=>setDepositInput(e.target.value)}/>
                             <button onClick={handleAddDeposit} className="bg-yellow-500 text-white px-4 rounded-lg font-medium">Салу</button>
                         </div>
                         <p className="text-xs text-gray-400 mt-2">*Бұл ақша кіріс/шығысқа әсер етпейді</p>
                    </div>

                    {/* ОПЕРАЦИЯЛАР */}
                    <div className="md:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h3 className="font-bold">Қаржы тарихы (Кіріс/Шығыс)</h3>
                            <button onClick={()=>setNewTransaction({...newTransaction, type: newTransaction.type === 'income' ? 'expense' : 'income'})} className={`text-xs px-3 py-1 rounded-full ${newTransaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{newTransaction.type === 'income' ? 'Кіріс қосу' : 'Шығыс қосу'}</button>
                        </div>
                        <div className="p-4 bg-gray-50 border-b">
                             <div className="flex gap-2">
                                <input type="number" placeholder="Сома" className="w-32 p-2 rounded border" value={newTransaction.amount} onChange={e=>setNewTransaction({...newTransaction, amount:e.target.value})}/>
                                <input type="text" placeholder="Категория (мыс: Такси)" className="flex-1 p-2 rounded border" value={newTransaction.category} onChange={e=>setNewTransaction({...newTransaction, category:e.target.value})}/>
                                <button onClick={addTransaction} className="bg-gray-900 text-white px-4 rounded">Қосу</button>
                             </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {transactions.slice().reverse().map(t=>(
                                <div key={t.id} className="flex justify-between p-4 border-b hover:bg-gray-50">
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type==='income'?'bg-green-100 text-green-600':'bg-red-100 text-red-600'}`}>{t.type==='income'?<DollarSign size={14}/>:<TrendingDown size={14}/>}</div>
                                        <div><p className="font-medium text-sm">{t.category}</p><p className="text-xs text-gray-400">{t.date}</p></div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <span className={`font-bold ${t.type==='income'?'text-green-600':'text-red-600'}`}>{t.type==='income'?'+':'-'}{t.amount.toLocaleString()} ₸</span>
                                        <button onClick={()=>deleteTransaction(t.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'uni' && (
             <div className="grid md:grid-cols-3 gap-6 animate-fadeIn">
                <div className="md:col-span-2 space-y-4">
                    {uniTasks.map(t => (
                        <div key={t.id} className={`flex justify-between p-5 bg-white rounded-xl border shadow-sm ${t.completed ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-4">
                                <button onClick={()=>setUniTasks(uniTasks.map(ut=>ut.id===t.id?{...ut,completed:!ut.completed}:ut))} className={`w-6 h-6 border-2 rounded ${t.completed?'bg-green-500 border-green-500 text-white':''}`}><CheckSquare size={14}/></button>
                                <div><h4 className={t.completed?'line-through':''}>{t.title}</h4><p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {t.deadline || 'Мерзімсіз'}</p></div>
                            </div>
                            <button onClick={()=>setUniTasks(uniTasks.filter(ut=>ut.id!==t.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
                <div className="md:col-span-1"><div className="bg-white p-6 rounded-xl border shadow-sm sticky top-4"><h3 className="font-bold mb-4">Жаңа тапсырма</h3><div className="space-y-3"><input type="text" placeholder="Атауы" className="w-full p-3 bg-gray-50 border rounded-lg" value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})}/><input type="date" className="w-full p-3 bg-gray-50 border rounded-lg" value={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.value})}/><button onClick={addTask} className="w-full bg-indigo-600 text-white p-3 rounded-lg">Қосу</button></div></div></div>
            </div>
        )}

        {activeTab === 'notes' && (
            <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-bold mb-4">Жаңа жазба</h3>
                        <div className="flex gap-2 mb-4">
                            <input type="time" className="p-3 bg-gray-50 border rounded-lg" value={newNote.time} onChange={e=>setNewNote({...newNote,time:e.target.value})}/>
                            <input type="text" placeholder="Не істеу керек?" className="flex-1 p-3 bg-gray-50 border rounded-lg" value={newNote.content} onChange={e=>setNewNote({...newNote,content:e.target.value})} onKeyPress={e=>e.key==='Enter'&&addNote()}/>
                            <button onClick={addNote} className="bg-indigo-600 text-white px-4 rounded-lg">+</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-700 mb-3">Бүгінгі жоспар (Орындалуда)</h3>
                        <div className="space-y-3">
                            {notes.filter(n => !n.completed).map(n=>(
                                <div key={n.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex justify-between group">
                                    <div className="flex gap-3 items-center">
                                        <button onClick={() => toggleNoteStatus(n.id)} className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-500 hover:bg-green-50"></button>
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded h-fit">{n.time||'--:--'}</span>
                                        <p className="text-gray-800">{n.content}</p>
                                    </div>
                                    <button onClick={()=>setNotes(notes.filter(nt=>nt.id!==n.id))} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            {notes.filter(n => !n.completed).length === 0 && <p className="text-gray-400 text-sm text-center italic">Жоспар бос</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-green-700">
                        <CheckCircle size={20}/>
                        Осы айда орындалғандар
                    </h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                         {notes.filter(n => n.completed && n.completedDate && isSameMonth(new Date(n.completedDate), currentDate)).length === 0 && (
                             <div className="text-center py-10 text-gray-400">
                                 <Sparkles className="mx-auto mb-2 opacity-50"/>
                                 <p className="text-sm">Әзірге ештеңе орындалмады</p>
                             </div>
                         )}
                         {notes
                             .filter(n => n.completed && n.completedDate && isSameMonth(new Date(n.completedDate), currentDate))
                             .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
                             .map(n => (
                                 <div key={n.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100 opacity-75 hover:opacity-100 transition">
                                     <div className="flex gap-3 items-center">
                                         <button onClick={() => toggleNoteStatus(n.id)} className="w-5 h-5 bg-green-500 border-2 border-green-500 rounded-full flex items-center justify-center text-white"><CheckSquare size={12}/></button>
                                         <div>
                                             <p className="text-gray-800 line-through decoration-gray-400 decoration-1">{n.content}</p>
                                             <p className="text-[10px] text-green-700">{new Date(n.completedDate).toLocaleDateString()} • {n.time || ''}</p>
                                         </div>
                                     </div>
                                     <button onClick={()=>setNotes(notes.filter(nt=>nt.id!==n.id))} className="text-red-300 hover:text-red-500"><Trash2 size={14}/></button>
                                 </div>
                             ))
                         }
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

// UI Components
function NavButton({ active, onClick, icon, label }) { return <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 transition ${active?'text-indigo-600':'text-gray-400 hover:text-gray-600'}`}>{icon}<span className="text-[10px] font-medium">{label}</span></button>; }
function DesktopNavLink({ active, onClick, icon, label }) { return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${active?'bg-indigo-50 text-indigo-700 shadow-sm':'text-gray-600 hover:bg-gray-50'}`}>{icon}{label}</button>; }