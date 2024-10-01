import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, MinusCircle, ShoppingCart, Coffee, UserPlus, ClipboardList, X, Zap } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const API_URL = 'https://brusliste-backend.vercel.app/api';
const PRICE_PER_BEVERAGE = 10;

const BeverageApp = () => {
  const [people, setPeople] = useState([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payingPerson, setPayingPerson] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showQuickBuyDialog, setShowQuickBuyDialog] = useState(false)

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const response = await axios.get(`${API_URL}/people`);
      setPeople(response.data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const updateBeverage = async (id, increment) => {
    try {
      const response = await axios.post(`${API_URL}/people`, {
        name: people.find(p => p.id === id).name,
        beverages: increment
      });
      setPeople(response.data);
    } catch (error) {
      console.error('Error updating beverage count:', error);
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
      const response = await axios.post(`${API_URL}/people/${payingPerson.id}/pay`);
      setPeople(response.data);
      closePaymentDialog();
    } catch (error) {
      console.error('Error resetting beverages:', error);
    }
  };

  const addPerson = async () => {
    if (newPersonName.trim() !== '') {
      try {
        const response = await axios.post(`${API_URL}/people`, {
          name: newPersonName,
          beverages: 0
        });
        setPeople(response.data);
        setNewPersonName('');
      } catch (error) {
        console.error('Error adding person:', error);
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
      setShowTransactions(true);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const formatAmount = (amount) => {
    const numAmount = Number(amount);
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
  };

  const quickBuy = async () => {
    try {
      const response = await axios.post(`${API_URL}/quickbuy`);
      // Optionally update any relevant state here
      setShowQuickBuyDialog(false);
      alert('Quick buy successful!');
      // You might want to refresh the transaction list or update some stats here
    } catch (error) {
      console.error('Error processing quick buy:', error);
      alert('Error processing quick buy. Please try again.');
    }
  };
  
  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4 sm:p-6 md:p-8 flex flex-col">
      <div className="flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Coffee className="h-10 w-10 text-green-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Brusliste</h1>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowQuickBuyDialog(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Zap className="h-5 w-5 mr-2" /> Hurtigkjøp
              </Button>
            <Button onClick={fetchTransactions} className="bg-blue-500 hover:bg-blue-600 text-white">
              <ClipboardList className="h-5 w-5 mr-2" /> Se Transaksjoner
            </Button>
          </div>
        </div>
        
        <div className="flex-grow grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 auto-rows-fr">
          {people.map((person) => (
            <Card key={person.id} className="bg-white border-l-4 border-green-500 transition-all duration-300 hover:shadow-md flex flex-col p-4">
              <CardHeader className="flex-shrink-0 p-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-gray-700 truncate">{person.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between p-0 mt-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-green-600">
                  {person.beverages}
                  <span className="text-base sm:text-lg md:text-xl text-gray-500 ml-2">brus registrert</span>
                </span>
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" className="flex-grow mr-2 text-red-500 border-red-500 hover:bg-red-100 text-lg sm:text-xl md:text-2xl py-2 sm:py-3 md:py-4" onClick={() => updateBeverage(person.id, -1)}>
                    <MinusCircle className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                  </Button>
                  <Button variant="outline" className="flex-grow mr-2 text-green-500 border-green-500 hover:bg-green-100 text-lg sm:text-xl md:text-2xl py-2 sm:py-3 md:py-4" onClick={() => updateBeverage(person.id, 1)}>
                    <PlusCircle className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                  </Button>
                  <Button variant="outline" className="flex-grow text-blue-500 border-blue-500 hover:bg-blue-100 text-lg sm:text-xl md:text-2xl py-2 sm:py-3 md:py-4" onClick={() => openPaymentDialog(person)}>
                    <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Navn på ny person"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              className="mr-2 flex-grow text-lg"
            />
            <Button onClick={addPerson} className="bg-green-500 hover:bg-green-600 text-white text-lg py-2 px-4">
              <UserPlus className="h-6 w-6 mr-2" /> Legg til person
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog.Root open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
          <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <AlertDialog.Title className="text-green-700 m-0 text-[20px] font-semibold">
              Betaling for {payingPerson?.name}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 mt-4 mb-5 text-[15px] leading-normal">
              <p className="text-2xl font-bold text-green-600 mb-4">Å betale: {payingPerson?.beverages * PRICE_PER_BEVERAGE} NOK</p>
              <div className="bg-gray-200 w-48 h-48 mx-auto my-4 flex items-center justify-center rounded-lg shadow-inner">
                <span className="text-gray-500"><img src='https://i.imgur.com/kCr1BON.jpeg'/></span>
              </div>
            </AlertDialog.Description>
            <div className="flex justify-end gap-[15px]">
              <AlertDialog.Cancel asChild>
                <button className="text-gray-600 bg-gray-200 hover:bg-gray-300 focus:shadow-gray-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]" onClick={closePaymentDialog}>
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button className="text-white bg-green-500 hover:bg-green-600 focus:shadow-green-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]" onClick={resetAfterPayment}>
                  Done
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <AlertDialog.Root open={showQuickBuyDialog} onOpenChange={setShowQuickBuyDialog}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
            <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
              <AlertDialog.Title className="text-purple-700 m-0 text-[20px] font-semibold">
                Hurtigkjøp
              </AlertDialog.Title>
              <AlertDialog.Description className="text-gray-600 mt-4 mb-5 text-[15px] leading-normal">
                <p>Er du sikker på at du vil gjøre et hurtigkjøp?</p>
                <p className="font-bold mt-2">Pris: 10 NOK</p>
                <div className="bg-gray-200 w-48 h-48 mx-auto my-4 flex items-center justify-center rounded-lg shadow-inner">
                  <span className="text-gray-500"><img src='https://i.imgur.com/kCr1BON.jpeg'/></span>
                </div>
              </AlertDialog.Description>
              <div className="flex justify-end gap-[15px]">
                <AlertDialog.Cancel asChild>
                  <button className="text-gray-600 bg-gray-200 hover:bg-gray-300 focus:shadow-gray-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                    Avbryt
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button className="text-white bg-yellow-500 hover:bg-yellow-600 focus:shadow-yellow-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]" onClick={quickBuy}>
                    Bekreft kjøp
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

      <AlertDialog.Root open={showTransactions} onOpenChange={setShowTransactions}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
          <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none overflow-y-auto">
            <AlertDialog.Title className="text-green-700 m-0 text-[20px] font-semibold flex justify-between items-center">
              <span>Transaction History</span>
              <Button onClick={() => setShowTransactions(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 mt-4 mb-5 text-[15px] leading-normal">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antall</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">kost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.date).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.beverages}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAmount(transaction.amount)} NOK</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{transaction.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AlertDialog.Description>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default BeverageApp;