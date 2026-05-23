import { useState } from 'react'
import MainPage from './pages/MainPage';
import ProfileCreatePage from './pages/ProfileCreatePage';

function App() {
  const [page, setPage] = useState('main');
  const navigate = (pageName) => setPage(pageName);

  return (
    <div>
      {page === 'main' && <MainPage navigate={navigate} />}
      {page === 'profileCreate' && <ProfileCreatePage navigate={navigate} />}
    </div>
  );
}

export default App;