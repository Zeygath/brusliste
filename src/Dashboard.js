import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Coffee, ArrowLeft, Crown } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://brusliste-backend.vercel.app/api';
const API_KEY = process.env.REACT_APP_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const RankingList = ({ data }) => (
    <ul className="space-y-2">
      {data.map((item, index) => (
        <li key={item.name} className="flex items-center justify-between bg-gray-100 p-2 rounded">
          <div className="flex items-center">
            <span className="font-bold mr-2">{index + 1}.</span>
            <span>{item.name}</span>
            {index === 0 && <Crown className="text-yellow-500 ml-2" size={20} />}
          </div>
          <span className="font-semibold">{item.total_beverages} beverages</span>
        </li>
      ))}
    </ul>
  );

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  if (!stats) return <div className="p-4">Henter statistikk...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Coffee className="h-10 w-10 text-green-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Brusliste Dashboard</h1>
          </div>
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Tilbake til hovedsiden
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Leaderboard Denne Måneden</h3>
            <RankingList data={stats.currentMonthLeaderboard} />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Leaderboard All-Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.allTimeLeaderboard}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_beverages" fill="#82ca9d" name="Antall brus kjøpt" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Brusfordeling</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.beverageTypeDistribution}
                dataKey="count"
                nameKey="beverage_type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(2)}%`}
              >
                {stats.beverageTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;