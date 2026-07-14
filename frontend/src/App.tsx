import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Habits from './pages/Habits';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/habits" element={<Habits />} />
            </Routes>
        </Router>
    );
}

export default App;