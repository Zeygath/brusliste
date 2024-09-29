import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, MinusCircle, ShoppingCart, Coffee, UserPlus } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const API_URL = 'https://brusliste-backend.vercel.app/api';

const BeverageApp = () => {
  const [people, setPeople] = useState([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payingPerson, setPayingPerson] = useState(null);

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

  const updateBeverage = async (index, increment) => {
    const person = people[index];
    const newBeverageCount = Math.max(0, person.beverages + increment);
    try {
      const response = await axios.post(`${API_URL}/people`, {
        name: person.name,
        beverages: newBeverageCount
      });
      setPeople(response.data);
    } catch (error) {
      console.error('Error updating beverage count:', error);
    }
  };

  const openPaymentDialog = (index) => {
    setPayingPerson(people[index]);
    setShowPaymentDialog(true);
  };

  const closePaymentDialog = () => {
    setShowPaymentDialog(false);
    setPayingPerson(null);
  };

  const resetAfterPayment = async () => {
    try {
      const response = await axios.post(`${API_URL}/people`, {
        name: payingPerson.name,
        beverages: 0
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <Coffee className="h-10 w-10 text-green-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">Brusliste</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {people.map((person, index) => (
            <Card key={index} className="border-l-4 border-green-500 transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-gray-700 truncate">{person.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-semibold text-green-600">{person.beverages} 
                    <span className="text-sm text-gray-500 ml-1">brus registrert</span>
                  </span>
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={() => updateBeverage(index, -1)} className="mr-2 text-red-500 border-red-500 hover:bg-red-100">
                      <MinusCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => updateBeverage(index, 1)} className="mr-2 text-green-500 border-green-500 hover:bg-green-100">
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openPaymentDialog(index)} className="text-blue-500 border-blue-500 hover:bg-blue-100">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Navn på ny person"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              className="mr-2 flex-grow"
            />
            <Button onClick={addPerson} className="bg-green-500 hover:bg-green-600 text-white">
              <UserPlus className="h-5 w-5 mr-2" /> Legg til person
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
              <p className="text-2xl font-bold text-green-600 mb-4">A betale: {payingPerson?.beverages * 10} NOK</p>
              <div className="bg-gray-200 w-48 h-48 mx-auto my-4 flex items-center justify-center rounded-lg shadow-inner">
                <span className="text-gray-500">https://i.imgur.com/kCr1BON.jpeg</span>
              </div>
            </AlertDialog.Description>
            <div className="flex justify-end gap-[15px]">
              <AlertDialog.Cancel asChild>
                <button className="text-gray-600 bg-gray-200 hover:bg-gray-300 focus:shadow-gray-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]" onClick={closePaymentDialog}>
                  Avbryt
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button className="text-white bg-green-500 hover:bg-green-600 focus:shadow-green-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]" onClick={resetAfterPayment}>
                  Ferdig
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default BeverageApp;