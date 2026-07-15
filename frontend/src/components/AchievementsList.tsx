// frontend/src/components/AchievementsList.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Footprints, Baby, Hammer, Bot, Lock, Trophy } from 'lucide-react';

// Определяем ачивки прямо здесь. Гарантированный UTF-8.
const ACHIEVEMENTS_DATA = [
    { id: 1, title: "Первые шаги", description: "Выполни свою самую первую привычку", icon: Footprints },
    { id: 2, title: "Новичок", description: "Достигни 2 уровня", icon: Baby },
    { id: 3, title: "Трудяга", description: "Выполни 5 привычек всего (суммарно)", icon: Hammer },
    { id: 4, title: "Исследователь", description: "Получи первый совет от ИИ-коуча", icon: Bot },
];

interface AchievementStatus {
    id: number;
    is_unlocked: boolean;
}

export default function AchievementsList() {
    const [statuses, setStatuses] = useState<AchievementStatus[]>([]);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/achievements');
            setStatuses(res.data);
        } catch (error) {
            console.error('Ошибка загрузки ачивок:', error);
        }
    };

    const unlockedCount = statuses.filter(a => a.is_unlocked).length;

    return (
        <div className="bg-espresso/5 backdrop-blur-sm p-6 rounded-xl border border-espresso/10 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-espresso flex items-center gap-2">
                    <Trophy className="text-espresso" /> Достижения
                </h2>
                <span className="text-sm font-semibold bg-mint text-espresso px-3 py-1 rounded-full">
                    {unlockedCount} / {ACHIEVEMENTS_DATA.length}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS_DATA.map((ach) => {
                    const status = statuses.find(s => s.id === ach.id);
                    const isUnlocked = status?.is_unlocked || false;
                    
                    return (
                        <div 
                            key={ach.id} 
                            className={`p-4 rounded-lg border transition-all flex items-start gap-4 ${
                                isUnlocked 
                                    ? 'bg-mint border-espresso/20 shadow-sm' 
                                    : 'bg-espresso/5 border-espresso/10 opacity-60 grayscale'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-espresso text-mint' : 'bg-espresso/20 text-espresso/50'}`}>
                                {isUnlocked ? <ach.icon size={24} /> : <Lock size={24} />}
                            </div>
                            <div>
                                <h3 className={`font-bold ${isUnlocked ? 'text-espresso' : 'text-espresso/70'}`}>
                                    {ach.title}
                                </h3>
                                <p className="text-xs text-espresso/70 mt-1">{ach.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}