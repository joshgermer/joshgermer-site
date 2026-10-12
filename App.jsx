import { useEffect } from 'react';
import { NavLink, Link, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Life from './pages/Life.jsx';
import LifeTopic from './pages/LifeTopic.jsx';
import Projects from './pages/Projects.jsx';
import ClothingMockups from './pages/ClothingMockups.jsx';
import Companies from './pages/Companies.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="shell">
      <ScrollToTop />
      <header className="topbar">
        <Link to="/" className="brand">
          Josh Germer
          <span className="brand-tag">life · projects · ideas</span>
        </Link>
        <nav className="nav">
          <NavLink to="/life">Life</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/companies">Companies</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/life" element={<Life />} />
          <Route path="/life/:topic" element={<LifeTopic />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/clothing-mockups" element={<ClothingMockups />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Josh Germer</span>
        <span>life · projects · ideas</span>
      </footer>
    </div>
  );
}
