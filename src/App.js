import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, DollarSign, BookOpen, Plus, Trash2, Clock, Briefcase, GraduationCap, X, TrendingDown, AlertCircle, Calculator } from 'lucide-react';

// Тұрақты деректер (Constants)
const DAYS = ['Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі', 'Жексенбі'];
const TIMES = Array.from({ length: 15 }, (_, i) => i + 9); // 9:00 to 23:00

// Бастапқы деректер (Егер жад бос болса, осылар шығады)
const INITIAL_STUDENTS = [
    { 
        id: 1, 
        name: 'Алихан (Мысал)', 
        schedule: [{ day: 'Дүйсенбі', time: 15 }, { day: 'Жұма', time: 15 }], 
        paymentType: 'monthly', 
        amount: 25000,
        startDate: '2023-11-01',
        endDate: '2023-12-01'
    }
];

// Негізгі компонент
export default function MyPlanApp() {
  const [activeTab, setActiveTab] = useState('work');
  
  // --- LOCALSTORAGE ФУНКЦИЯЛАРЫ (САҚТАУ ҮШІН) ---

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('myApp_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  useEffect(() => {
    localStorage.setItem('myApp_students', JSON.stringify(students));
  }, [students]);

  const [uniTasks, setUniTasks] = useState(() => {
    const saved = localStorage.getItem('myApp_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('myApp_tasks', JSON.stringify(uniTasks));
  }, [uniTasks]);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('myApp_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('myApp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('myApp_notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('myApp_notes', JSON.stringify(notes));
  }, [notes]);

  // --- ҚАЛҒАН КОДТАР ---

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    schedule: [], 
    paymentType: 'monthly', 
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const [tempSlot, setTempSlot] = useState({ day: 'Дүйсенбі', time: '14' });
  const [newTask, setNewTask] = useState({ title: '', deadline: '' });
  const [newTransaction, setNewTransaction] = useState({ type: 'expense', amount: '', category: '' });
  const [newNote, setNewNote] = useState({ content: '', time: '' });

  // Функциялар (Handlers)

  const openConfirmModal = (message, action) => {
    setConfirmModal({
        isOpen: true,
        message,
        onConfirm: () => {
            action();
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
        }
    });
  };

  const addScheduleSlot = () => {
    const existsInCurrent = newStudent.schedule.find(s => s.day === tempSlot.day && s.time === parseInt(tempSlot.time));
    if (!existsInCurrent) {
        setNewStudent({
            ...newStudent,
            schedule: [...newStudent.schedule, { day: tempSlot.day, time: parseInt(tempSlot.time) }]
        });
    }
  };

  const removeScheduleSlot = (index) => {
    const updatedSchedule = [...newStudent.schedule];
    updatedSchedule.splice(index, 1);
    setNewStudent({ ...newStudent, schedule: updatedSchedule });
  };

  const getDayIndex = (dayName) => DAYS.indexOf(dayName);

  const addStudent = () => {
    if (!newStudent.name || !newStudent.amount || newStudent.schedule.length === 0) return;
    
    let finalStartDate = newStudent.paymentType === 'monthly' ? newStudent.startDate : '';
    let finalEndDate = newStudent.paymentType === 'monthly' ? newStudent.endDate : '';

    if (newStudent.paymentType === 'monthly' && !finalEndDate && finalStartDate) {
        const date = new Date(finalStartDate);
        date.setMonth(date.getMonth() + 1);
        finalEndDate = date.toISOString().split('T')[0];
    }

    setStudents([...students, { 
        ...newStudent, 
        id: Date.now(), 
        amount: parseInt(newStudent.amount),
        startDate: finalStartDate,
        endDate: finalEndDate
    }]);
    setIsStudentModalOpen(false);
    setNewStudent({ name: '', schedule: [], paymentType: 'monthly', amount: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
  };

  const deleteSlot = (studentId, day, time) => {
    openConfirmModal('Бұл сабақты кестеден өшіргіңіз келе ме?', () => {
        setStudents(prevStudents => prevStudents.map(student => {
            if (student.id === studentId) {
                return {
                    ...student,
                    schedule: student.schedule.filter(slot => !(slot.day === day && slot.time === time))
                };
            }
            return student;
        }).filter(student => student.schedule.length > 0));
    });
  };

  const deleteStudentCompletely = (id) => {
    openConfirmModal('Оқушыны толығымен және барлық деректерін өшіргіңіз келе ме?', () => {
        setStudents(prevStudents => prevStudents.filter(s => s.id !== id));
    });
  };

  const addTask = () => {
    if (!newTask.title) return;
    setUniTasks([...uniTasks, { ...newTask, id: Date.now(), completed: false }]);
    setNewTask({ title: '', deadline: '' });
  };

  const addTransaction = () => {
    if (!newTransaction.amount) return;
    setTransactions([...transactions, { ...newTransaction, id: Date.now(), amount: parseInt(newTransaction.amount), date: new Date().toISOString().split('T')[0] }]);
    setNewTransaction({ type: 'expense', amount: '', category: '' });
  };

  const deleteTransaction = (id) => {
    openConfirmModal('Бұл жазбаны тарихтан өшіргіңіз келе ме?', () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    });
  };

  const addNote = () => {
    if (!newNote.content) return;
    setNotes([...notes, { ...newNote, id: Date.now() }]);
    setNewNote({ content: '', time: '' });
  };

  // АЙЛЫҚ БОЛЖАМ (Мұнда бәрі қосылады: Айлық + (Апталық * 4))
  const calculateProjectedMonthlyIncome = () => {
    let total = 0;
    students.forEach(student => {
      if (student.paymentType === 'monthly') {
        total += student.amount;
      } else if (student.paymentType === 'weekly') {
        total += student.amount * 4;
      } else if (student.paymentType === 'daily') {
        const lessonsPerWeek = student.schedule.length;
        const weeklyIncome = student.amount * lessonsPerWeek;
        total += weeklyIncome * 4;
      }
    });
    return total;
  };

  // АПТАЛЫҚ БОЛЖАМ (Мұнда тек Апталық және Күнделікті қосылады)
  const calculateProjectedWeeklyIncome = () => {
    let total = 0;
    students.forEach(student => {
      // "MONTHLY" ТӨЛЕМДЕРДІ ТАЗА АЛЫП ТАСТАДЫҚ
      if (student.paymentType === 'weekly') {
        total += student.amount;
      } else if (student.paymentType === 'daily') {
        // Күнделікті төлейтіндер аптасына (Баға * Сабақ саны) әкеледі
        total += student.amount * student.schedule.length;
      }
    });
    return total;
  };

  const getCalculatedPreview = () => {
    const amt = parseInt(newStudent.amount) || 0;
    const lessonCount = newStudent.schedule.length;

    if (newStudent.paymentType === 'daily') {
        return (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mt-2 flex flex-col gap-1 border border-blue-100">
                <div className="flex justify-between">
                    <span>Сабақ саны:</span>
                    <span className="font-bold">{lessonCount} / аптасына</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                    <span>Апталық табыс:</span>
                    <span className="font-bold">{amt} ₸ x {lessonCount} сабақ = {(amt * lessonCount).toLocaleString()} ₸</span>
                </div>
                <div className="flex justify-between text-xs opacity-75">
                    <span>Айлық табыс (болжам x4):</span>
                    <span>{(amt * lessonCount * 4).toLocaleString()} ₸</span>
                </div>
            </div>
        );
    } else if (newStudent.paymentType === 'weekly') {
        return (
             <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mt-2 border border-blue-100">
                 <div className="flex justify-between">
                    <span>Айлық табыс (болжам x4):</span>
                    <span className="font-bold">{amt} ₸ x 4 апта = {(amt * 4).toLocaleString()} ₸</span>
                 </div>
             </div>
        );
    } else if (newStudent.paymentType === 'monthly') {
        return (
             <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 mt-2 border border-purple-100">
                 <div className="flex justify-between">
                    <span>Айлық табыс (Толық):</span>
                    <span className="font-bold">{amt.toLocaleString()} ₸</span>
                 </div>
             </div>
        );
    }
    return null;
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const projectedMonthlyTutorIncome = calculateProjectedMonthlyIncome();
  const projectedWeeklyTutorIncome = calculateProjectedWeeklyIncome();
  const grandTotal = totalIncome + projectedMonthlyTutorIncome - totalExpense;

  const renderSchedule = () => (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 bg-gray-50 border-b">
          <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Уақыт</div>
          {DAYS.map(day => (
            <div key={day} className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{day}</div>
          ))}
        </div>
        {TIMES.map(time => (
          <div key={time} className="grid grid-cols-8 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            <div className="p-3 text-sm font-medium text-gray-400 border-r">
              {time}:00
            </div>
            {DAYS.map(day => {
              const student = students.find(s => s.schedule.some(slot => slot.day === day && slot.time === time));
              return (
                <div key={`${day}-${time}`} className="p-1 border-r last:border-r-0 h-16 relative group">
                  {student && (
                    <div className="absolute inset-1 bg-indigo-100 text-indigo-700 rounded p-1 text-xs flex flex-col justify-between cursor-pointer hover:bg-indigo-200 transition shadow-sm border border-indigo-200">
                      <span className="font-bold truncate">{student.name}</span>
                      <div className="flex justify-between items-end h-full pb-1">
                        <span className="text-[9px] opacity-75 leading-tight">
                           {student.paymentType === 'daily' ? 'Күніне' : student.paymentType === 'weekly' ? 'Апталық' : 'Айлық'}
                        </span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteSlot(student.id, day, time);
                            }} 
                            className="text-red-500 hover:text-white hover:bg-red-500 bg-white rounded-full p-0.5 shadow-sm transition-colors z-10"
                            title="Осы сабақты алып тастау"
                        >
                          <X size={12} />
                        </button>
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col md:flex-row">
      {/* Мобильді Навигация */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 z-50 shadow-lg">
        <NavButton active={activeTab === 'work'} onClick={() => setActiveTab('work')} icon={<Briefcase size={20} />} label="Жұмыс" />
        <NavButton active={activeTab === 'uni'} onClick={() => setActiveTab('uni')} icon={<GraduationCap size={20} />} label="Универ" />
        <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20} />} label="Қаржы" />
        <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<CheckSquare size={20} />} label="Заметки" />
      </div>

      {/* Десктоп Навигация */}
      <div className="hidden md:flex flex-col w-64 bg-white h-screen border-r border-gray-200 fixed shadow-sm">
        <div className="p-6 flex items-center gap-3 text-indigo-600">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Calendar size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">My Plan</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <DesktopNavLink active={activeTab === 'work'} onClick={() => setActiveTab('work')} icon={<Briefcase size={20} />} label="Жұмыс / Репетитор" />
          <DesktopNavLink active={activeTab === 'uni'} onClick={() => setActiveTab('uni')} icon={<GraduationCap size={20} />} label="Университет" />
          <DesktopNavLink active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20} />} label="Қаржы & Есеп" />
          <DesktopNavLink active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<CheckSquare size={20} />} label="Жазбалар" />
        </nav>
        <div className="p-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs opacity-80 mb-1">Айлық Баланс (Total)</p>
                <p className="text-2xl font-bold">{grandTotal.toLocaleString()} ₸</p>
            </div>
        </div>
      </div>

      {/* Негізгі Контент */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mb-20 md:mb-0 max-w-7xl mx-auto w-full">
        
        {/* HEADER */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'work' && 'Жұмыс Кестесі'}
              {activeTab === 'uni' && 'Университет Тапсырмалары'}
              {activeTab === 'finance' && 'Қаржылық Бақылау'}
              {activeTab === 'notes' && 'Күнделікті Жазбалар'}
            </h2>
            <p className="text-gray-500 mt-1">Тиімділігіңізді арттырыңыз!</p>
          </div>
        </header>

        {/* ЖҰМЫС TAB */}
        {activeTab === 'work' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 text-sm font-medium border border-blue-100">
                        Барлық оқушы: <span className="font-bold ml-1">{students.length}</span>
                    </div>
                    {/* Айлық болжам тек осы жерде қысқаша */}
                    <div className="hidden md:block bg-green-50 px-4 py-2 rounded-lg text-green-700 text-sm font-medium border border-green-100">
                        Апталық болжам: <span className="font-bold ml-1">{projectedWeeklyTutorIncome.toLocaleString()} ₸</span>
                    </div>
                </div>
                <button onClick={() => setIsStudentModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-indigo-200 text-sm font-medium">
                    <Plus size={18} />
                    Оқушы қосу
                </button>
            </div>

            {/* Кесте (Schedule) */}
            {renderSchedule()}

            {/* Оқушылар тізімі (Table) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Оқушылар тізімі және төлемдері</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="p-4">Оқушы аты</th>
                                <th className="p-4">Кестесі</th>
                                <th className="p-4">Төлем түрі</th>
                                <th className="p-4">Бағасы</th>
                                <th className="p-4">Төлем есебі</th>
                                <th className="p-4 text-right">Әрекет</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Оқушылар тіркелмеген</td></tr>
                            ) : (
                                students.map(student => {
                                    // ЕСЕПТЕУ ЛОГИКАСЫ
                                    let displayAmount = 0;
                                    let periodLabel = '';

                                    if(student.paymentType === 'daily') {
                                        displayAmount = student.amount * student.schedule.length;
                                        periodLabel = '/апта';
                                    }
                                    else if(student.paymentType === 'weekly') {
                                        displayAmount = student.amount;
                                        periodLabel = '/апта';
                                    }
                                    else if(student.paymentType === 'monthly') {
                                        displayAmount = student.amount;
                                        periodLabel = '/ай';
                                    }

                                    return (
                                    <tr key={student.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{student.name}</div>
                                            {student.paymentType === 'monthly' && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {student.startDate} - {student.endDate}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600 text-xs">
                                            {student.schedule
                                                .sort((a, b) => getDayIndex(a.day) - getDayIndex(b.day))
                                                .map(s => <div key={`${s.day}-${s.time}`}>{s.day} {s.time}:00</div>)
                                            }
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${student.paymentType === 'monthly' ? 'bg-purple-100 text-purple-700' : 
                                                  student.paymentType === 'weekly' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {student.paymentType === 'monthly' ? 'Айлық' : 
                                                 student.paymentType === 'weekly' ? 'Апталық' : 'Күніне'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-800">
                                            {student.amount.toLocaleString()} ₸ 
                                            <span className="text-gray-400 text-xs ml-1">
                                                {student.paymentType === 'daily' ? '/сабақ' : ''}
                                            </span>
                                        </td>
                                        <td className="p-4 text-green-600 font-bold">
                                            {displayAmount.toLocaleString()} ₸ 
                                            <span className="text-xs font-normal text-gray-400 ml-1">{periodLabel}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => deleteStudentCompletely(student.id)}
                                                className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )})
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Модаль Оқушы Қосу */}
            {isStudentModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Жаңа оқушы қосу</h3>
                    <button onClick={() => setIsStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Есімі</label>
                        <input 
                          type="text" 
                          placeholder="Оқушының аты" 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                        />
                    </div>
                    
                    {/* Уақыттарды қосу */}
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <label className="block text-sm font-bold text-indigo-900 mb-2">Сабақ уақыттарын қосу:</label>
                        <div className="flex gap-2 mb-3">
                            <select 
                                className="flex-1 p-2 border border-indigo-200 rounded-lg text-sm bg-white"
                                value={tempSlot.day}
                                onChange={(e) => setTempSlot({...tempSlot, day: e.target.value})}
                            >
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select 
                                className="w-24 p-2 border border-indigo-200 rounded-lg text-sm bg-white"
                                value={tempSlot.time}
                                onChange={(e) => setTempSlot({...tempSlot, time: e.target.value})}
                            >
                                {TIMES.map(t => <option key={t} value={t}>{t}:00</option>)}
                            </select>
                            <button onClick={addScheduleSlot} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                                +
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {newStudent.schedule.length === 0 && (
                                <div className="text-center p-4 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-400 text-xs">
                                    Кесте бос.
                                </div>
                            )}
                            {newStudent.schedule
                                .sort((a, b) => getDayIndex(a.day) - getDayIndex(b.day))
                                .map((slot, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-2 pl-3 rounded-lg border border-indigo-100 text-sm shadow-sm">
                                    <span className="text-indigo-900 font-medium">{slot.day} <span className="text-gray-400 mx-1">|</span> {slot.time}:00</span>
                                    <button onClick={() => removeScheduleSlot(idx)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Төлем түрі</label>
                            <select 
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                              value={newStudent.paymentType}
                              onChange={(e) => setNewStudent({...newStudent, paymentType: e.target.value})}
                            >
                              <option value="daily">Күніне (Әр сабақ)</option>
                              <option value="weekly">Аптасына</option>
                              <option value="monthly">Айына</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Бағасы (₸)</label>
                            <input 
                                type="number" 
                                placeholder={newStudent.paymentType === 'daily' ? "Сабақ бағасы" : "Толық сома"} 
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                                value={newStudent.amount}
                                onChange={(e) => setNewStudent({...newStudent, amount: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* АВТОМАТТЫ ЕСЕПТЕУ (ПРЕВЬЮ) */}
                    {getCalculatedPreview()}

                    {/* Тек Айына (monthly) таңдалғанда ғана Дата көрсетіледі */}
                    {newStudent.paymentType === 'monthly' && (
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Басталуы</label>
                                <input 
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none"
                                    value={newStudent.startDate}
                                    onChange={(e) => setNewStudent({...newStudent, startDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Аяқталуы</label>
                                <input 
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none"
                                    value={newStudent.endDate}
                                    onChange={(e) => setNewStudent({...newStudent, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <button onClick={addStudent} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium shadow-md transition mt-2">
                        Сақтау
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scaleIn border border-gray-200">
                        <div className="flex items-center gap-3 text-red-600 mb-3">
                            <AlertCircle size={24} />
                            <h3 className="text-lg font-bold text-gray-900">Растау</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{confirmModal.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setConfirmModal({...confirmModal, isOpen: false})} 
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                                Жоқ
                            </button>
                            <button 
                                onClick={confirmModal.onConfirm} 
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium shadow-md transition"
                            >
                                Иә, өшіру
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* УНИВЕРСИТЕТ TAB */}
        {activeTab === 'uni' && (
          <div className="grid md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Тапсырмалар тізімі */}
            <div className="md:col-span-2 space-y-4">
              {uniTasks.length === 0 ? (
                 <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-green-500" size={32} />
                    </div>
                    <p className="text-gray-500">Тапсырмалар жоқ! Демалуға болады.</p>
                 </div>
              ) : (
                  uniTasks.map(task => (
                    <div key={task.id} className={`group flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md ${task.completed ? 'opacity-60 bg-gray-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setUniTasks(uniTasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-indigo-400'}`}
                        >
                          <CheckSquare size={14} strokeWidth={3} />
                        </button>
                        <div>
                          <h4 className={`font-medium text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</h4>
                          <p className={`text-sm flex items-center gap-1 ${new Date(task.deadline) < new Date() && !task.completed ? 'text-red-500' : 'text-gray-400'}`}>
                            <Clock size={12} />
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Мерзімсіз'}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setUniTasks(uniTasks.filter(t => t.id !== task.id))} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Жаңа тапсырма қосу формасы */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-indigo-600"/> 
                    Жаңа тапсырма
                </h3>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Тапсырма атауы..." 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                  <input 
                    type="date" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  />
                  <button onClick={addTask} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium shadow-md transition">
                    Қосу
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ҚАРЖЫ TAB */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Жалпы карталар */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FinanceCard title="Апталық болжам (Репетитор)" amount={projectedWeeklyTutorIncome} color="bg-blue-50 text-blue-700" icon={<Clock size={20} />} />
              <FinanceCard title="Айлық болжам (Репетитор)" amount={projectedMonthlyTutorIncome} color="bg-indigo-50 text-indigo-700" icon={<Briefcase size={20} />} />
              <FinanceCard title="Басқа кірістер" amount={totalIncome} color="bg-green-50 text-green-700" icon={<DollarSign size={20} />} />
              <FinanceCard title="Шығыстар" amount={totalExpense} color="bg-red-50 text-red-700" icon={<TrendingDown size={20} />} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Транзакция қосу */}
              <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Қолмен операция қосу</h3>
                <div className="space-y-3">
                   <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition ${newTransaction.type === 'expense' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                        onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                      >Шығыс</button>
                      <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition ${newTransaction.type === 'income' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                        onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                      >Табыс</button>
                   </div>
                   <input 
                    type="number" 
                    placeholder="Сомасы (₸)" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                   />
                   <input 
                    type="text" 
                    placeholder={newTransaction.type === 'income' ? "Табыс көзі (мысалы: Стипендия)" : "Шығыс түрі (мысалы: Жол ақысы)"}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                   />
                   <button onClick={addTransaction} className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-medium shadow-md transition">
                    {newTransaction.type === 'income' ? 'Табысты қосу' : 'Шығысты қосу'}
                   </button>
                </div>
              </div>

              {/* Тарих */}
              <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Тарих</h3>
                 </div>
                 <div className="max-h-[400px] overflow-y-auto">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                           Әзірге жазба жоқ. Сол жақтан қосыңыз.
                        </div>
                    ) : (
                        transactions.slice().reverse().map(t => (
                            <div key={t.id} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {t.type === 'income' ? <DollarSign size={18} /> : <TrendingDown size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{t.category || 'Санатсыз'}</p>
                                        <p className="text-xs text-gray-400">{t.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ₸
                                    </span>
                                    <button 
                                        onClick={() => deleteTransaction(t.id)}
                                        className="text-gray-400 hover:text-red-500 transition p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* ЖАЗБАЛАР TAB */}
        {activeTab === 'notes' && (
           <div className="animate-fadeIn grid md:grid-cols-2 gap-6">
              {/* Note Input */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Бүгінгі жоспар</h3>
                 <div className="flex gap-2 mb-4">
                    <input 
                      type="time" 
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newNote.time}
                      onChange={(e) => setNewNote({...newNote, time: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Не істеу керек?" 
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newNote.content}
                      onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && addNote()}
                    />
                    <button onClick={addNote} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg">
                        <Plus size={20} />
                    </button>
                 </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {notes.map(note => (
                    <div key={note.id} className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl shadow-sm flex justify-between items-start relative group">
                        <div className="flex gap-3">
                            <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded h-fit mt-0.5">
                                {note.time || 'Күн бойы'}
                            </span>
                            <p className="text-gray-800 font-medium leading-relaxed">{note.content}</p>
                        </div>
                        <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="text-yellow-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p>Жазбалар жоқ. Күніңізді жоспарлаңыз!</p>
                    </div>
                )}
              </div>
           </div>
        )}

      </main>
    </div>
  );
}

// Қосымша компоненттер
function NavButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition w-20 ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function DesktopNavLink({ active, onClick, icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
        >
            {icon}
            {label}
        </button>
    )
}

function FinanceCard({ title, amount, color, icon }) {
    return (
        <div className={`rounded-xl p-5 shadow-sm border border-gray-100 bg-white`}>
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                    {icon}
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{amount.toLocaleString()} ₸</p>
        </div>
    )
}