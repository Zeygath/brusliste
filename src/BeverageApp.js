import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, MinusCircle, ShoppingCart, Coffee, UserPlus, ClipboardList, Zap, BarChart2, MoreVertical, Trash2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://brusliste-backend.vercel.app/api';
const API_KEY = process.env.REACT_APP_API_KEY;
const PRICE_PER_BEVERAGE = 10;
const PRICE_PER_COFFEE = 1;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

const BeverageApp = () => {
  const [people, setPeople] = useState([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payingPerson, setPayingPerson] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showQuickBuyDialog, setShowQuickBuyDialog] = useState(false);
  const [showBeverageDialog, setShowBeverageDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedBeverageType, setSelectedBeverageType] = useState('Cola Zero');
  const [isCoffeeMode, setIsCoffeeMode] = useState(false);
  const [coffeeData, setCoffeeData] = useState([]);
  const [showCoffeePurchaseDialog, setShowCoffeePurchaseDialog] = useState(false);
  const [coffeeBags, setCoffeeBags] = useState(1);
  const [coffeeCost, setCoffeeCost] = useState(0);
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    if (isCoffeeMode) {
      fetchCoffeeData();
    }
  }, [isCoffeeMode]);

  const fetchPeople = async () => {
    try {
      const response = await api.get('/people');
      setPeople(response.data);
    } catch (error) {
      console.error('Feil ved henting av personer:', error);
      handleApiError(error);
    }
  };

  const fetchCoffeeData = async () => {
    try {
      const response = await api.get('/coffee-balance');
      setCoffeeData(response.data);
    } catch (error) {
      console.error('Feil ved henting av kaffedata:', error);
      handleApiError(error);
    }
  };

  const openBeverageDialog = (person, action) => {
    setSelectedPerson(person);
    setSelectedAction(action);
    setSelectedBeverageType(person.beverage_type || 'Cola');
    setShowBeverageDialog(true);
  };

  const closeBeverageDialog = () => {
    setShowBeverageDialog(false);
    setSelectedPerson(null);
    setSelectedAction(null);
    setSelectedBeverageType('Cola');
  };

  const confirmBeverageUpdate = async () => {
    try {
      const beverages = selectedAction === 'add' ? 1 : -1;
      await api.post('/people', {
        name: selectedPerson.name,
        beverages,
        beverageType: selectedBeverageType
      });
      fetchPeople();
      closeBeverageDialog();
    } catch (error) {
      console.error('Feil ved oppdatering av drikke:', error);
      handleApiError(error);
    }
  };

  const addPerson = async () => {
    if (newPersonName.trim()) {
      try {
        await api.post('/people', { name: newPersonName, beverages: 0, beverageType: 'Cola' });
        setNewPersonName('');
        fetchPeople();
      } catch (error) {
        console.error('Feil ved tillegg av person:', error);
        handleApiError(error);
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
      setShowTransactions(true);
    } catch (error) {
      console.error('Feil ved henting av transaksjoner:', error);
      handleApiError(error);
    }
  };

  const formatAmount = (amount) => {
    return Number(amount).toFixed(2);
  };

  const quickBuy = async () => {
    try {
      await api.post('/quickbuy', { beverageType: selectedBeverageType });
      setShowQuickBuyDialog(false);
      fetchPeople();
      fetchTransactions();
    } catch (error) {
      console.error('Feil ved hurtigkjøp:', error);
      handleApiError(error);
    }
  };

  const handleCoffeeConsumption = async (person) => {
    try {
      await api.post('/coffee-tracker', {
        userId: person.id,
        cupsConsumed: 1,
        coffeePurchased: 0
      });
      fetchCoffeeData();
    } catch (error) {
      console.error('Feil ved oppdatering av kaffeforbruk:', error);
      handleApiError(error);
    }
  };

  const handleCoffeePurchase = async () => {
    try {
      await api.post('/coffee-tracker', {
        userId: selectedPerson.id,
        cupsConsumed: 0,
        coffeePurchased: coffeeCost,
        coffeeBags: coffeeBags
      });
      fetchCoffeeData();
      setShowCoffeePurchaseDialog(false);
      setCoffeeBags(1);
      setCoffeeCost(0);
    } catch (error) {
      console.error('Feil ved registrering av kaffekjøp:', error);
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

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/people/${userId}`);
      fetchPeople();
    } catch (error) {
      console.error('Feil ved sletting av bruker:', error);
      handleApiError(error);
    }
  };

  const toggleDropdown = (personId) => {
    setShowDropdown(showDropdown === personId ? null : personId);
  };


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Brusliste</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Nytt navn"
          className="border border-gray-300 p-2 mr-2 rounded"
        />
        <button onClick={addPerson} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          <UserPlus className="inline-block mr-1" /> Legg til person
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setShowQuickBuyDialog(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          <Zap className="inline-block mr-1" /> Hurtigkjøp
        </button>
        <button onClick={fetchTransactions} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
          <ClipboardList className="inline-block mr-1" /> Vis transaksjoner
        </button>
        <button onClick={() => setIsCoffeeMode(!isCoffeeMode)} className="bg-brown-500 hover:bg-brown-600 text-white font-bold py-2 px-4 rounded">
          <Coffee className="inline-block mr-1" /> {isCoffeeMode ? 'Brus modus' : 'Kaffe modus'}
        </button>
        <Link to="/dashboard" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded inline-block">
          <BarChart2 className="inline-block mr-1" /> Dashboard
        </Link>
      </div>
      {isCoffeeMode ? (
        <div>
          <h2 className="text-2xl font-bold mb-2">Kaffe forbruk</h2>
          <ul className="space-y-4">
            {coffeeData.map((person) => (
              <li key={person.id} className="mb-2 flex items-center">
                <span className="font-semibold">{person.name}: {person.coffee_balance} kopper</span>
                <div className="ml-4 space-x-2">
                  <button
                    onClick={() => handleCoffeeConsumption(person)}
                    className="bg-brown-500 hover:bg-brown-600 text-white font-bold py-1 px-2 rounded"
                  >
                    Drikk en kopp
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPerson(person);
                      setShowCoffeePurchaseDialog(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded"
                  >
                    Kjøp kaffe
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {people.map((person) => (
            <div key={person.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between relative">
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleDropdown(person.id)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <MoreVertical size={20} />
                </button>
                {showDropdown === person.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={() => openBeverageDialog(person, 'remove')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <MinusCircle className="inline-block mr-2" size={16} />
                      Fjern drikke
                    </button>
                    <button
                      onClick={() => handleDeleteUser(person.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="inline-block mr-2" size={16} />
                      Slett bruker
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{person.name}</h3>
                <p>{person.beverages} {person.beverage_type}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => openBeverageDialog(person, 'add')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex-grow mr-2"
                >
                  <PlusCircle className="inline-block mr-1" /> Legg til
                </button>
                {person.beverages > 0 && (
                  <button
                    onClick={() => {
                      setPayingPerson(person);
                      setShowPaymentDialog(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex-shrink-0"
                  >
                    <ShoppingCart className="inline-block mr-1" /> Betal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showTransactions && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-2">Transaksjoner</h2>
          <ul className="space-y-2">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="bg-white shadow-md rounded-lg p-4">
                <span className="font-semibold">{transaction.name || 'Hurtigkjøp'} - {transaction.type}: {transaction.beverages} {transaction.beverage_type} ({formatAmount(transaction.amount)} kr)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bekreft betaling</h2>
            <p className="mb-4">
              {payingPerson.name} skal betale {payingPerson.beverages * PRICE_PER_BEVERAGE} kr for {payingPerson.beverages}{' '}
              {payingPerson.beverage_type}.
            </p>
            <div className="flex justify-end">
              <button onClick={() => setShowPaymentDialog(false)} className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md">
                Avbryt
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.post(`/people/${payingPerson.id}/pay`);
                    setShowPaymentDialog(false);
                    fetchPeople();
                  } catch (error) {
                    console.error('Feil ved betaling:', error);
                    handleApiError(error);
                  }
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Bekreft betaling
              </button>
            </div>
          </div>
        </div>
      )}
      {showQuickBuyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Hurtigkjøp</h2>
            <select
              value={selectedBeverageType}
              onChange={(e) => setSelectedBeverageType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="Cola">Cola</option>
              <option value="Cola Zero">Cola Zero</option>
              <option value="Fanta">Fanta</option>
              <option value="Sprite">Sprite</option>
            </select>
            <div className="flex justify-end">
              <button onClick={() => setShowQuickBuyDialog(false)} className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md">
                Avbryt
              </button>
              <button onClick={quickBuy} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md">
                Bekreft kjøp
              </button>
            </div>
          </div>
        </div>
      )}
      {showBeverageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedAction === 'add' ? 'Legg til drikke' : 'Fjern drikke'}
            </h2>
            <select
              value={selectedBeverageType}
              onChange={(e) => setSelectedBeverageType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="Cola">Cola</option>
              <option value="Cola Zero">Cola Zero</option>
              <option value="Fanta">Fanta</option>
              <option value="Sprite">Sprite</option>
            </select>
            <div className="flex justify-end">
              <button onClick={closeBeverageDialog} className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md">
                Avbryt
              </button>
              <button onClick={confirmBeverageUpdate} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md">
                Bekreft
              </button>
            </div>
          </div>
        </div>
      )}
      {showCoffeePurchaseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrer kjøp av kaffepose</h2>
            <div className="mb-4">
              <label className="block mb-2">Antall poser:</label>
              <input
                type="number"
                value={coffeeBags}
                onChange={(e) => {
                  setCoffeeBags(parseInt(e.target.value));
                  setCoffeeCost(parseInt(e.target.value) * PRICE_PER_COFFEE);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Kostnad:</label>
              <input
                type="number"
                value={coffeeCost}
                onChange={(e) => setCoffeeCost(parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCoffeePurchaseDialog(false)}
                className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Avbryt
              </button>
              <button onClick={handleCoffeePurchase} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md">
                Bekreft kjøp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeverageApp;

