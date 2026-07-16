// frontend/src/pages/Habits.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AICoach from '../components/AICoach';
import AchievementsList from '../components/AchievementsList';
import { Trash2, Plus, CheckCircle, Circle, Trophy, Star, Flame } from 'lucide-react';

interface Habit {
    id: number;
    title: string;
    description: string;
    is_completed_today: boolean;
    streak: number;          // <-- Добавлено
    weeklyActivity: boolean[]; // <-- Добавлено
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
                
                if (res.data.user) {
                    const oldLevel = userData.level;
                    setUserData(res.data.user);
                    
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

    const calculateProgress = () => {
        const base = 100;
        const multiplier = 1.5;
        const needed = Math.floor(base * Math.pow(multiplier, userData.level - 1));
        const percent = Math.min((userData.xp / needed) * 100, 100);
        return { percent, needed };
    };

    const progress = calculateProgress();

    return (
        <div className="min-h-screen p-8 max-w-2xl mx-auto relative text-slate-100">
            {/* Уведомление о повышении уровня (Изумрудное вместо желтого) */}
            {showLevelUp && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] z-50 animate-bounce flex items-center gap-2 border border-emerald-400">
                    <Trophy size={24} />
                    <span className="font-bold text-lg">Уровень повышен! {userData.level} lvl</span>
                </div>
            )}

            {/* Панель статистики (Темная тема) */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-sm mb-8 border border-slate-700">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Текущий уровень</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Star className="text-emerald-500 fill-emerald-500" size={28} />
                            <span className="text-3xl font-bold text-white">{userData.level}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-400">Опыт</span>
                        <p className="text-lg font-mono font-medium text-emerald-400">{userData.xp} / {progress.needed} XP</p>
                    </div>
                </div>
                
                {/* Прогресс бар (Изумрудный градиент без фиолетового) */}
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
                    <div 
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${progress.percent}%` }}
                    ></div>
                </div>
            </div>

            <AICoach />

            <h2 className="text-2xl font-bold mb-6 text-white">Мои привычки</h2>
            
            {/* Форма добавления (Темные инпуты) */}
            <div className="flex gap-2 mb-8">
                <input 
                    type="text" 
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="Например: Читать 30 минут..."
                    className="bg-slate-800 border border-slate-700 text-white p-3 rounded-lg flex-grow focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                />
                <button 
                    onClick={addHabit}
                    className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Список привычек (Явные цвета текста и фона) */}
            <div className="space-y-4">
                {habits.map((habit) => (
                    <div 
    key={habit.id} 
    className={`border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all cursor-pointer group ${
        habit.is_completed_today 
            ? 'bg-emerald-900/20 border-emerald-500/30' 
            : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50'
    }`}
    onClick={() => toggleComplete(habit)}
>
    {/* Левая часть: Иконка и Текст */}
    <div className="flex items-center gap-4 flex-grow">
        {habit.is_completed_today ? (
            <CheckCircle className="text-emerald-500 shrink-0" size={28} />
        ) : (
            <Circle className="text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" size={28} />
        )}
        <div>
            <h3 className={`font-semibold text-lg transition-all ${
                habit.is_completed_today ? 'line-through text-emerald-400/70' : 'text-slate-100'
            }`}>
                {habit.title}
            </h3>
            <p className="text-sm text-slate-400">{habit.description}</p>
        </div>
    </div>

    {/* Правая часть: Серия и Мини-график */}
    <div className="flex items-center gap-4 sm:justify-end">
        {/* Серия (Streak) */}
        <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">
            <Flame size={18} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-600"} />
            <span className={`font-bold text-sm ${habit.streak > 0 ? "text-orange-400" : "text-slate-500"}`}>
                {habit.streak}
            </span>
        </div>

        {/* Мини-график за 7 дней (Heatmap) */}
        <div className="flex gap-1" title="Активность за последние 7 дней">
            {habit.weeklyActivity.map((isDone, index) => (
                <div 
                    key={index}
                    className={`w-2.5 h-2.5 rounded-sm transition-colors ${
                        isDone ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-700'
                    }`}
                />
            ))}
        </div>

        {/* Кнопка удаления */}
        <button 
            onClick={(e) => {
                e.stopPropagation();
                deleteHabit(habit.id);
            }}
            className="text-slate-500 hover:text-red-400 p-2 hover:bg-slate-700 rounded-lg transition opacity-0 group-hover:opacity-100"
            title="Удалить привычку"
        >
            <Trash2 size={20} />
        </button>
    </div>
</div>
                ))}
                
                {habits.length === 0 && (
                    <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                        Привычек пока нет. Добавь первую!
                    </div>
                )}
            </div>

            <div className="mt-12">
                <AchievementsList />
            </div>
        </div>
    );
}