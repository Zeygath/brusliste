import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import BeverageApp from './BeverageApp';
import { Package } from 'lucide-react';
import InventoryManagement from './InventoryManagement';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<BeverageApp />} />
          <Route path="/inventory" element={<InventoryManagement />} />
        </Routes>
    </Router>
  );
}


export default App;

