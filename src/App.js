import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { Package } from 'react-bootstrap-icons';
import InventoryManagement from './InventoryManagement';

function BeverageApp() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Beverage Management System</h1>
        <nav className="mb-4">
          <Link to="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
            Home
          </Link>
          <Link to="/inventory" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">
            <Package className="inline-block mr-1" /> Inventar
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<InventoryManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to the Beverage Management System!</h2>
      <p>This is the home page.</p>
    </div>
  );
}

export default App;

