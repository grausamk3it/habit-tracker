import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">🚀 Трекер Привычек</h1>
            <p className="mb-6 text-gray-600">Стань лучшей версией себя с помощью геймификации и ИИ.</p>
            <Link 
                to="/habits" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Перейти к привычкам
            </Link>
        </div>
    );
}