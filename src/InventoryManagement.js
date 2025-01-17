import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://brusliste-backend.vercel.app/api';
const API_KEY = process.env.REACT_APP_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({ beverageType: '', quantity: 0 });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error('Feil ved henting av inventar:', error);
      handleApiError(error);
    }
  };

  const openInventoryDialog = () => {
    setShowInventoryDialog(true);
  };

  const closeInventoryDialog = () => {
    setShowInventoryDialog(false);
    setNewInventoryItem({ beverageType: '', quantity: 0 });
  };

  const updateInventory = async () => {
    try {
      await api.post('/inventory/update', newInventoryItem);
      fetchInventory();
      closeInventoryDialog();
    } catch (error) {
      console.error('Feil ved oppdatering av inventar:', error);
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Uautorisert tilgang. Vennligst sjekk API-nøkkelen din.');
          break;
        case 403:
          alert('Ingen tilgang. Du har ikke rettigheter til å utføre denne handlingen.');
          break;
        case 404:
          alert('Ressursen ble ikke funnet. Vennligst sjekk URL-en.');
          break;
        case 500:
          alert('Intern serverfeil. Vennligst prøv igjen senere.');
          break;
        default:
          alert(`En feil oppstod: ${error.response.data.message || 'Ukjent feil'}`);
      }
    } else if (error.request) {
      alert('Ingen respons mottatt fra serveren. Vennligst sjekk din internettforbindelse.');
    } else {
      alert(`En feil oppstod: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Inventar Administrasjon</h1>
      <button
        onClick={openInventoryDialog}
        className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        <Plus className="inline-block mr-1" /> Legg til / Oppdater inventar
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {inventory.map((item) => (
          <div key={item.beverage_type} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{item.beverage_type}</h3>
            <p>{item.quantity} på lager</p>
          </div>
        ))}
      </div>
      {showInventoryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Legg til / Oppdater inventar</h2>
            <div className="mb-4">
              <label className="block mb-2">Drikketype:</label>
              <input
                type="text"
                value={newInventoryItem.beverageType}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, beverageType: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Antall:</label>
              <input
                type="number"
                value={newInventoryItem.quantity}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button onClick={closeInventoryDialog} className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md">
                Avbryt
              </button>
              <button onClick={updateInventory} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md">
                Oppdater inventar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;

