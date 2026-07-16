import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-900">
            <h1 className="text-5xl font-bold mb-4 text-white tracking-tight">
                Трекер Привычек
            </h1>
            <p className="mb-10 text-lg text-slate-400 max-w-md">
                Система самодисциплины с элементами геймификации и ИИ-коучем.
            </p>
            <Link 
                to="/habits" 
                className="bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-600 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
            >
                Начать путь
            </Link>
        </div>
    );
}