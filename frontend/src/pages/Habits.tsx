// frontend/src/pages/Habits.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Plus, CheckCircle, Circle, Trophy, Star } from 'lucide-react';
import AICoach from '../components/AICoach';

interface Habit {
    id: number;
    title: string;
    description: string;
    is_completed_today: boolean;
}

interface UserData {
    level: number;
    xp: number;
}

export default function Habits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [userData, setUserData] = useState<UserData>({ level: 1, xp: 0 });
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        fetchHabits();
        fetchUserData();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/habits');
            setHabits(res.data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    };

    const fetchUserData = async () => {
        try {
            // Пока берем данные первого пользователя
            const res = await axios.get('http://localhost:3001/api/users/me'); 
            setUserData(res.data);
        } catch (error) {
            console.log('Пользователь пока не создан, используем дефолт');
        }
    };

    const addHabit = async () => {
        if (!newHabitTitle.trim()) return;
        try {
            await axios.post('http://localhost:3001/api/habits', {
                title: newHabitTitle,
                description: 'Без описания'
            });
            setNewHabitTitle('');
            fetchHabits();
        } catch (error) {
            console.error('Ошибка создания:', error);
        }
    };

    const deleteHabit = async (id: number) => {
        try {
            await axios.delete(`http://localhost:3001/api/habits/${id}`);
            fetchHabits();
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    const toggleComplete = async (habit: Habit) => {
        try {
            if (habit.is_completed_today) {
                await axios.delete(`http://localhost:3001/api/habits/${habit.id}/complete`);
            } else {
                const res = await axios.post(`http://localhost:3001/api/habits/${habit.id}/complete`);
                
                // Если пришел ответ с новыми данными пользователя
                if (res.data.user) {
                    const oldLevel = userData.level;
                    setUserData(res.data.user);
                    
                    // Если уровень повысился, показываем анимацию
                    if (res.data.user.level > oldLevel) {
                        setShowLevelUp(true);
                        setTimeout(() => setShowLevelUp(false), 3000);
                    }
                }
            }
            fetchHabits();
        } catch (error) {
            console.error('Ошибка изменения статуса:', error);
        }
    };

    // Расчет прогресса до следующего уровня
    const calculateProgress = () => {
        const base = 100;
        const multiplier = 1.5;
        const needed = Math.floor(base * Math.pow(multiplier, userData.level - 1));
        const percent = Math.min((userData.xp / needed) * 100, 100);
        return { percent, needed };
    };

    const progress = calculateProgress();

    return (
        <div className="p-8 max-w-2xl mx-auto relative">
            {/* Уведомление о повышении уровня */}
            {showLevelUp && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-6 py-3 rounded-full shadow-lg z-50 animate-bounce flex items-center gap-2">
                    <Trophy size={24} />
                    <span className="font-bold text-lg">Уровень повышен! {userData.level} lvl</span>
                </div>
            )}

            {/* Панель статистики */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Текущий уровень</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Star className="text-yellow-500 fill-yellow-500" size={28} />
                            <span className="text-3xl font-bold text-gray-800">{userData.level}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-gray-500">Опыт</span>
                        <p className="text-lg font-mono font-medium">{userData.xp} / {progress.needed} XP</p>
                    </div>
                </div>
                
                {/* Прогресс бар */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress.percent}%` }}
                    ></div>
                </div>
            </div>

            <AICoach />

            <h2 className="text-2xl font-bold mb-6">Мои привычки</h2>
            
            <div className="flex gap-2 mb-8">
                <input 
                    type="text" 
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="Например: Читать 30 минут..."
                    className="border p-3 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                />
                <button 
                    onClick={addHabit}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="space-y-4">
                {habits.map((habit) => (
                    <div 
                        key={habit.id} 
                        className={`border p-4 rounded-xl shadow-sm flex justify-between items-center transition-all cursor-pointer group ${
                            habit.is_completed_today ? 'bg-green-50 border-green-200' : 'bg-white hover:border-blue-300'
                        }`}
                        onClick={() => toggleComplete(habit)}
                    >
                        <div className="flex items-center gap-4 flex-grow">
                            {habit.is_completed_today ? (
                                <CheckCircle className="text-green-600 shrink-0" size={28} />
                            ) : (
                                <Circle className="text-gray-400 group-hover:text-blue-500 shrink-0 transition-colors" size={28} />
                            )}
                            <div>
                                <h3 className={`font-semibold text-lg transition-all ${habit.is_completed_today ? 'line-through text-gray-500' : ''}`}>
                                    {habit.title}
                                </h3>
                                <p className="text-sm text-gray-500">{habit.description}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Чтобы не сработал клик по карточке
                                deleteHabit(habit.id);
                            }}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                            title="Удалить привычку"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
                
                {habits.length === 0 && (
                    <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                        Привычек пока нет. Добавь первую!
                    </div>
                )}
            </div>
        </div>
    );
}