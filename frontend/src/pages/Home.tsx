import { Link } from 'react-router-dom';

export default function Home() {
    return (
        // Контейнер на всю высоту экрана, центрирует содержимое
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-mint">
            
            {/* Заголовок */}
            <h1 className="text-5xl font-bold mb-4 text-espresso tracking-tight">
                Трекер Привычек
            </h1>
            
            {/* Подзаголовок */}
            <p className="mb-10 text-lg text-espresso/80 max-w-md">
                Стань лучшей версией себя с помощью геймификации и ИИ-коуча.
            </p>
            
            {/* Кнопка */}
            <Link 
                to="/habits" 
                className="bg-espresso text-mint px-8 py-4 rounded-xl text-lg font-semibold hover:bg-espresso-light transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
            >
                Перейти к привычкам
            </Link>
            
        </div>
    );
}