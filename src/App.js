import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BeverageApp from './BeverageApp';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BeverageApp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;