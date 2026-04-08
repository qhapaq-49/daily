import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import HomeScreen from './screens/HomeScreen';
import ChildScreen from './screens/ChildScreen';
import BookScreen from './screens/BookScreen';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/child/:childId" element={<ChildScreen />} />
          <Route path="/book/:bookId" element={<BookScreen />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
