// frontend/src/components/AICoach.tsx
import { useState } from 'react';
import axios from 'axios';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export default function AICoach() {
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchAdvice = async () => {
        setIsLoading(true);
        setAdvice(''); // Очищаем предыдущий совет
        try {
            const res = await axios.get('http://localhost:3001/api/ai/coach');
            setAdvice(res.data.advice);
        } catch (error) {
            setAdvice('Не удалось получить совет. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white mb-8 relative overflow-hidden">
            {/* Декоративный элемент */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>

            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">ИИ-Коуч</h3>
                    <p className="text-xs text-indigo-100">Твой персональный мотиватор</p>
                </div>
            </div>

            {advice ? (
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm mb-4 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm leading-relaxed">{advice}</p>
                </div>
            ) : (
                <p className="text-sm text-indigo-100 mb-4">
                    Нажми на кнопку, чтобы получить персональный совет на основе твоего прогресса за сегодня.
                </p>
            )}

            <button
                onClick={fetchAdvice}
                disabled={isLoading}
                className="w-full bg-white text-indigo-600 font-semibold py-2.5 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {isLoading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Анализирую прогресс...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Получить совет
                    </>
                )}
            </button>
        </div>
    );
}