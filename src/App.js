import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import BeverageApp from './BeverageApp';
import Dash from './Dashboard';
import { Package } from 'lucide-react';
import InventoryManagement from './InventoryManagement';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<BeverageApp />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/stats" element={<Dash />} />
        </Routes>
    </Router>
  );
}


export default App;

