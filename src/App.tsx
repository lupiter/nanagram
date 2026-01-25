import { HashRouter, Routes, Route } from 'react-router-dom';
import { PageTitleProvider } from './hooks/usePageTitle';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Puzzle from './pages/Puzzle/Puzzle';
import Designer from './pages/Designer/Designer';
import Play from './pages/Play/Play';
import RandomPuzzle from './pages/RandomPuzzle/RandomPuzzle';
import Library from './pages/Library/Library';
import './App.css';

function App() {
  return (
    <HashRouter>
      <PageTitleProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="puzzle/:category/:id" element={<Puzzle />} />
            <Route path="designer/:size" element={<Designer />} />
            <Route path="play/:encoded?" element={<Play />} />
            <Route path="random" element={<RandomPuzzle />} />
            <Route path="library" element={<Library />} />
          </Route>
        </Routes>
      </PageTitleProvider>
    </HashRouter>
  );
}

export default App;
