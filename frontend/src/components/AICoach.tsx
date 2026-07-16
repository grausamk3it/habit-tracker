// frontend/src/components/AICoach.tsx
import { useState } from 'react';
import axios from 'axios';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export default function AICoach() {
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchAdvice = async () => {
        setIsLoading(true);
        setAdvice('');
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
        // Строгий графитовый фон с изумрудным акцентом. Никакого фиолетового!
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden">
            
            {/* Декоративное свечение (изумрудное) */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="bg-emerald-500/20 p-2.5 rounded-lg border border-emerald-500/30">
                    <Bot size={24} className="text-emerald-400" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-100">ИИ-Коуч</h3>
                    <p className="text-xs text-slate-400">Анализ прогресса и мотивация</p>
                </div>
            </div>

            {advice ? (
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm leading-relaxed text-slate-200">{advice}</p>
                </div>
            ) : (
                <p className="text-sm text-slate-400 mb-4 bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
                    Нажмите кнопку ниже, чтобы получить персональную рекомендацию на основе ваших сегодняшних задач.
                </p>
            )}

            <button
                onClick={fetchAdvice}
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-500 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
            >
                {isLoading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Анализирую данные...
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