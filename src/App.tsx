import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Puzzle from './pages/Puzzle';
import Designer from './pages/Designer';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="puzzle/:category/:id" element={<Puzzle />} />
          <Route path="designer" element={<Designer />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
