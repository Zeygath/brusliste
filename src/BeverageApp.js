import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, MinusCircle, ShoppingCart, Coffee, UserPlus, ClipboardList, Zap, BarChart2 } from 'lucide-react';

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
  };

  const confirmBeverageUpdate = async () => {
    if (selectedPerson && selectedAction) {
      const increment = selectedAction === 'add' ? 1 : -1;
      await updateBeverage(selectedPerson.id, increment, selectedBeverageType);
    }
    closeBeverageDialog();
  };

  const updateBeverage = async (id, increment, beverageType) => {
    try {
      const response = await api.post('/people', {
        name: people.find(p => p.id === id)?.name,
        beverages: increment,
        beverageType: beverageType
      });
      setPeople(response.data);
    } catch (error) {
      console.error('Feil ved oppdatering av drikke:', error);
      handleApiError(error);
    }
  };

  const openPaymentDialog = (person) => {
    setPayingPerson(person);
    setShowPaymentDialog(true);
  };

  const closePaymentDialog = () => {
    setShowPaymentDialog(false);
    setPayingPerson(null);
  };

  const resetAfterPayment = async () => {
    try {
      const response = await api.post(`/people/${payingPerson.id}/pay`);
      setPeople(response.data);
      closePaymentDialog();
    } catch (error) {
      console.error('Feil ved tilbakestilling av drikke:', error);
      handleApiError(error);
    }
  };

  const addPerson = async () => {
    if (newPersonName.trim() !== '') {
      try {
        const response = await api.post('/people', {
          name: newPersonName,
          beverages: 0
        });
        setPeople(response.data);
        setNewPersonName('');
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
          alert('Forbudt. Du har ikke tillatelse til å få tilgang til denne ressursen.');
          break;
        case 500:
          alert(`Serverfeil: ${error.response.data.details || 'Ukjent feil'}`);
          break;
        default:
          alert('Det oppstod en feil ved oppdatering av data. Vennligst prøv igjen senere.');
      }
    } else if (error.request) {
      alert('Ingen respons mottatt fra serveren. Vennligst sjekk nettverkstilkoblingen din.');
    } else {
      alert('Feil ved oppsett av forespørselen. Vennligst prøv igjen.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4 sm:p-6 md:p-8 flex flex-col">
      <div className="flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Coffee className="h-10 w-10 text-green-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Brusliste</h1>
          </div>
          <div className="flex space-x-2 items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCoffeeMode}
                onChange={(e) => setIsCoffeeMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {isCoffeeMode ? 'Kaffemodus' : 'Drikkemodus'}
              </span>
            </label>
            <button onClick={() => setShowQuickBuyDialog(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center">
              <Zap className="h-5 w-5 mr-2" /> Hurtigkjøp
            </button>
            <button onClick={fetchTransactions} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" /> Se Transaksjoner
            </button>
            <Link to="/dashboard" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center">
              <BarChart2 className="h-5 w-5 mr-2" /> Dashbord
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(isCoffeeMode ? coffeeData : people).map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
              <h2 className="text-xl font-semibold mb-2">{person.name}</h2>
              {isCoffeeMode ? (
                <>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-green-600">
                    {person.cups_consumed || 0}
                  </span>
                  <span className="text-sm text-gray-500">Kopper kaffe</span>
                  <span className="text-lg font-semibold text-blue-600 mt-2">
                    Saldo: {formatAmount(person.balance)} NOK
                  </span>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleCoffeeConsumption(person)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Ta en kopp kaffe
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPerson(person);
                        setShowCoffeePurchaseDialog(true);
                      }}
                      className="flex-1 ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Registrer kaffekjøp
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-green-600">
                    {person.beverages}
                  </span>
                  <span className="text-sm text-gray-500">{person.beverage_type || 'Drikke'}</span>
                  <span className="text-lg font-semibold text-blue-600 mt-2">
                    {formatAmount(person.beverages * PRICE_PER_BEVERAGE)} NOK
                  </span>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => openBeverageDialog(person, 'add')}
                      className="flex-1 mr-2 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md"
                    >
                      <PlusCircle className="h-5 w-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => openBeverageDialog(person, 'remove')}
                      className="flex-1 mr-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
                      disabled={person.beverages === 0}
                    >
                      <MinusCircle className="h-5 w-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => openPaymentDialog(person)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md"
                      disabled={person.beverages === 0}
                    >
                      <ShoppingCart className="h-5 w-5 mx-auto" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center">
          <input
            type="text"
            placeholder="Legg til ny person"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            className="flex-grow mr-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addPerson} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center">
            <UserPlus className="h-5 w-5 mr-2" /> Legg til person
          </button>
        </div>

        {showPaymentDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Bekreft betaling</h2>
              <p>
                Er du sikker på at du vil tilbakestille drikketellingen for {payingPerson?.name}?
              </p>
              <p className="font-bold mt-2">
                Totalt: {formatAmount((payingPerson?.beverages || 0) * PRICE_PER_BEVERAGE)} NOK
              </p>
              <div className="flex justify-end mt-4">
                <button onClick={closePaymentDialog} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">Avbryt</button>
                <button onClick={resetAfterPayment} className="px-4 py-2 bg-green-500 text-white rounded-md">Bekreft betaling</button>
              </div>
            </div>
          </div>
        )}

        {showTransactions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
              <h2 className="text-xl font-bold mb-4">Transaksjoner</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Dato</th>
                    <th className="text-left">Navn</th>
                    <th className="text-left">Drikke</th>
                    <th className="text-left">Beløp</th>
                    <th className="text-left">Type</th>
                    <th className="text-left">Drikketype</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleString()}</td>
                      <td>{transaction.name}</td>
                      <td>{transaction.beverages}</td>
                      <td>{formatAmount(transaction.amount)} NOK</td>
                      <td className="capitalize">{transaction.type}</td>
                      <td>{transaction.beverage_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button onClick={() => setShowTransactions(false)} className="px-4 py-2 bg-blue-500 text-white rounded-md">Lukk</button>
              </div>
            </div>
          </div>
        )}

        {showQuickBuyDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                <button onClick={() => setShowQuickBuyDialog(false)} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">Avbryt</button>
                <button onClick={quickBuy} className="px-4 py-2 bg-green-500 text-white rounded-md">Bekreft kjøp</button>
              </div>
            </div>
          </div>
        )}

        {showBeverageDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                <button onClick={closeBeverageDialog} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">Avbryt</button>
                <button onClick={confirmBeverageUpdate} className="px-4 py-2 bg-green-500 text-white rounded-md">Bekreft</button>
              </div>
            </div>
          </div>
        )}

        {showCoffeePurchaseDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Registrer kjøp av kaffepose</h2>
              <div className="mb-4">
                <label htmlFor="coffeeBags" className="block text-sm font-medium text-gray-700 mb-1">
                  Antall poser kaffe
                </label>
                <input
                  id="coffeeBags"
                  type="number"
                  value={coffeeBags}
                  onChange={(e) => setCoffeeBags(Number(e.target.value))}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="coffeeCost" className="block text-sm font-medium text-gray-700 mb-1">
                  Totalkostnad (NOK)
                </label>
                <input
                  id="coffeeCost"
                  type="number"
                  value={coffeeCost}
                  onChange={(e) => setCoffeeCost(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end">
                <button onClick={() => setShowCoffeePurchaseDialog(false)} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">Avbryt</button>
                <button onClick={handleCoffeePurchase} className="px-4 py-2 bg-green-500 text-white rounded-md">Bekreft kjøp</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeverageApp;

