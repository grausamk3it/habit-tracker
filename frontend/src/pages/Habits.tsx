// frontend/src/pages/Habits.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Plus, CheckCircle, Circle } from 'lucide-react';

// Добавили поле is_completed_today
interface Habit {
    id: number;
    title: string;
    description: string;
    is_completed_today: boolean;
}

export default function Habits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabitTitle, setNewHabitTitle] = useState('');

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/habits');
            setHabits(res.data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
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

    // Новая функция: переключить статус выполнения
    const toggleComplete = async (habit: Habit) => {
        try {
            if (habit.is_completed_today) {
                // Отменяем выполнение
                await axios.delete(`http://localhost:3001/api/habits/${habit.id}/complete`);
            } else {
                // Отмечаем как выполненное
                await axios.post(`http://localhost:3001/api/habits/${habit.id}/complete`);
            }
            // Обновляем список, чтобы получить актуальный статус
            fetchHabits();
        } catch (error) {
            console.error('Ошибка изменения статуса:', error);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
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
                        className={`border p-4 rounded-xl shadow-sm flex justify-between items-center transition-all ${
                            habit.is_completed_today ? 'bg-green-50 border-green-200' : 'bg-white'
                        }`}
                    >
                        <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => toggleComplete(habit)}>
                            {habit.is_completed_today ? (
                                <CheckCircle className="text-green-600" size={28} />
                            ) : (
                                <Circle className="text-gray-400 hover:text-blue-500" size={28} />
                            )}
                            <div>
                                <h3 className={`font-semibold text-lg ${habit.is_completed_today ? 'line-through text-gray-500' : ''}`}>
                                    {habit.title}
                                </h3>
                                <p className="text-sm text-gray-500">{habit.description}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => deleteHabit(habit.id)}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
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