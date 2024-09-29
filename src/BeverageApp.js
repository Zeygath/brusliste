import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, UserPlus, UserMinus, ShoppingCart, Coffee } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const API_URL = 'https://brusliste-backend:3001/api';

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

  const addBeverage = async (index) => {
    const person = people[index];
    try {
      const response = await axios.post(`${API_URL}/people`, {
        name: person.name,
        beverages: person.beverages + 1
      });
      setPeople(response.data);
    } catch (error) {
      console.error('Error adding beverage:', error);
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

  const removePerson = async (index) => {
    const person = people[index];
    try {
      const response = await axios.delete(`${API_URL}/people/${encodeURIComponent(person.name)}`);
      setPeople(response.data);
    } catch (error) {
      console.error('Error removing person:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <Coffee className="h-10 w-10 text-purple-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Beverage Tracker</h1>
          </div>
          
          {people.map((person, index) => (
            <Card key={index} className="mb-4 border-l-4 border-purple-500 transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-lg text-gray-700">{person.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => removePerson(index)} className="text-red-500 hover:bg-red-100">
                    <UserMinus className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-semibold text-purple-600">{person.beverages} 
                    <span className="text-sm text-gray-500 ml-1">beverages</span>
                  </span>
                  <div>
                    <Button variant="outline" size="icon" onClick={() => addBeverage(index)} className="mr-2 text-green-500 border-green-500 hover:bg-green-100">
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

          <div className="flex items-center mt-6 bg-gray-100 p-4 rounded-lg">
            <Input
              type="text"
              placeholder="New person's name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              className="mr-2 flex-grow"
            />
            <Button onClick={addPerson} className="bg-purple-500 hover:bg-purple-600 text-white">
              <UserPlus className="h-5 w-5 mr-2" /> Add Person
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog.Root open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
          <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <AlertDialog.Title className="text-purple-700 m-0 text-[20px] font-semibold">
              Payment for {payingPerson?.name}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 mt-4 mb-5 text-[15px] leading-normal">
              <p className="text-2xl font-bold text-purple-600 mb-4">Total to pay: ${payingPerson?.beverages * 2}</p>
              <div className="bg-gray-200 w-48 h-48 mx-auto my-4 flex items-center justify-center rounded-lg shadow-inner">
                <span className="text-gray-500">QR Code Placeholder</span>
              </div>
            </AlertDialog.Description>
            <div className="flex justify-end gap-[15px]">
              <AlertDialog.Cancel asChild>
                <button className="text-gray-600 bg-gray-200 hover:bg-gray-300 focus:shadow-gray-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]" onClick={closePaymentDialog}>
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button className="text-white bg-purple-500 hover:bg-purple-600 focus:shadow-purple-400 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]" onClick={resetAfterPayment}>
                  Done
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