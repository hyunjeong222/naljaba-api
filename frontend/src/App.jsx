import { useState } from 'react'
import MainPage from './pages/MainPage';
import ProfileCreatePage from './pages/ProfileCreatePage';
import CalendarPage from './pages/CalendarPage';
import DateConfirmPage from './pages/DateConfirmPage';
import ResultPage from './pages/ResultPage';

function App() {
  const [page, setPage] = useState('main');
  const navigate = (pageName) => setPage(pageName);

  return (
    <div>
      {page === 'main' && <MainPage navigate={navigate} />}
      {page === 'profileCreate' && <ProfileCreatePage navigate={navigate} />}
      {page === 'calendar' && <CalendarPage navigate={navigate} />}
      {page === 'confirm' && <DateConfirmPage navigate={navigate} />} 
      {page === 'result' && <ResultPage navigate={navigate} />}
      
    </div>
  );
}

export default App;
