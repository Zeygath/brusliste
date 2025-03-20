"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import {
  PlusCircle,
  MinusCircle,
  ShoppingCart,
  Coffee,
  UserPlus,
  ClipboardList,
  Zap,
  BarChart2,
  MoreVertical,
  Trash2,
  MapPin,
} from "lucide-react"

const API_URL = process.env.REACT_APP_API_URL || "https://brusliste-backend.vercel.app/api"
const API_KEY = process.env.REACT_APP_API_KEY
const PRICE_PER_BEVERAGE = 10
const PRICE_PER_COFFEE = 1

// Get the location ID from URL parameter or localStorage
const getLocationId = () => {
  const params = new URLSearchParams(window.location.search)
  const locationId = params.get("location_id")

  if (locationId) {
    localStorage.setItem("locationId", locationId)
    return Number.parseInt(locationId)
  }

  return Number.parseInt(localStorage.getItem("locationId") || "1")
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
    "X-Location-Id": getLocationId().toString(),
  },
  withCredentials: false,
})

const BeverageApp = () => {
  const [people, setPeople] = useState([])
  const [newPersonName, setNewPersonName] = useState("")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [payingPerson, setPayingPerson] = useState(null)
  const [showTransactions, setShowTransactions] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [showQuickBuyDialog, setShowQuickBuyDialog] = useState(false)
  const [showBeverageDialog, setShowBeverageDialog] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [selectedBeverageType, setSelectedBeverageType] = useState("Cola Zero")
  const [isCoffeeMode, setIsCoffeeMode] = useState(false)
  const [coffeeData, setCoffeeData] = useState([])
  const [showCoffeePurchaseDialog, setShowCoffeePurchaseDialog] = useState(false)
  const [coffeeBags, setCoffeeBags] = useState(1)
  const [coffeeCost, setCoffeeCost] = useState(0)
  const [showDropdown, setShowDropdown] = useState(null)
  const [locations, setLocations] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchPeople()
    fetchLocations()
  }, [])

  useEffect(() => {
    if (isCoffeeMode) {
      fetchCoffeeData()
    }
  }, [isCoffeeMode])

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/locations`, {
        headers: { "X-API-Key": API_KEY },
      })
      setLocations(response.data)

      // Find current location
      const locationId = getLocationId()
      const location = response.data.find((loc) => loc.id === locationId)
      setCurrentLocation(location)
    } catch (error) {
      console.error("Feil ved henting av lokasjoner:", error)
      handleApiError(error)
    }
  }

  const changeLocation = (locationId) => {
    localStorage.setItem("locationId", locationId.toString())
    window.location.href = `?location_id=${locationId}`
  }

  const fetchPeople = async () => {
    try {
      const response = await api.get("/people")
      setPeople(response.data)
    } catch (error) {
      console.error("Feil ved henting av personer:", error)
      handleApiError(error)
    }
  }

  const fetchCoffeeData = async () => {
    try {
      const response = await api.get("/coffee-balance")
      setCoffeeData(response.data)
    } catch (error) {
      console.error("Feil ved henting av kaffedata:", error)
      handleApiError(error)
    }
  }

  const openBeverageDialog = (person, action) => {
    setSelectedPerson(person)
    setSelectedAction(action)
    setSelectedBeverageType(person.beverage_type || "Cola")
    setShowBeverageDialog(true)
  }

  const closeBeverageDialog = () => {
    setShowBeverageDialog(false)
    setSelectedPerson(null)
    setSelectedAction(null)
  }

  const confirmBeverageUpdate = async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      const beverages = selectedAction === "add" ? 1 : -1

      // Send request to backend first
      await api.post("/people", {
        name: selectedPerson.name,
        beverages,
        beverageType: selectedBeverageType,
      })

      // Update UI after backend confirms
      closeBeverageDialog()
      fetchPeople()
    } catch (error) {
      console.error("Feil ved oppdatering av drikke:", error)
      handleApiError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const addPerson = async () => {
    if (newPersonName.trim() && !isLoading) {
      try {
        setIsLoading(true)
        const nameToAdd = newPersonName
        setNewPersonName("")

        // Send request to backend
        await api.post("/people", {
          name: nameToAdd,
          beverages: 0,
          beverageType: "Cola",
        })

        // Update UI after backend confirms
        fetchPeople()
      } catch (error) {
        console.error("Feil ved tillegg av person:", error)
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions")
      setTransactions(response.data)
      setShowTransactions(true)
    } catch (error) {
      console.error("Feil ved henting av transaksjoner:", error)
      handleApiError(error)
    }
  }

  const formatAmount = (amount) => {
    return Number(amount).toFixed(2)
  }

  const quickBuy = async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      setShowQuickBuyDialog(false)

      // Send request to backend
      await api.post("/quickbuy", { beverageType: selectedBeverageType })

      // Refresh data
      fetchPeople()
    } catch (error) {
      console.error("Feil ved hurtigkjøp:", error)
      handleApiError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCoffeeConsumption = async (person) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)

      // Send request to backend
      await api.post("/coffee-tracker", {
        userId: person.id,
        cupsConsumed: 1,
        coffeePurchased: 0,
      })

      // Refresh data
      fetchCoffeeData()
    } catch (error) {
      console.error("Feil ved oppdatering av kaffeforbruk:", error)
      handleApiError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCoffeePurchase = async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      setShowCoffeePurchaseDialog(false)

      // Send request to backend
      await api.post("/coffee-tracker", {
        userId: selectedPerson.id,
        cupsConsumed: 0,
        coffeePurchased: coffeeCost,
        coffeeBags: coffeeBags,
      })

      // Reset state and refresh data
      setCoffeeBags(1)
      setCoffeeCost(0)
      fetchCoffeeData()
    } catch (error) {
      console.error("Feil ved registrering av kaffekjøp:", error)
      handleApiError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApiError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert("Uautorisert tilgang. Vennligst sjekk API-nøkkelen din.")
          break
        case 403:
          alert("Ingen tilgang. Du har ikke rettigheter til å utføre denne handlingen.")
          break
        case 404:
          alert("Ressursen ble ikke funnet. Vennligst sjekk URL-en.")
          break
        case 500:
          alert("Intern serverfeil. Vennligst prøv igjen senere.")
          break
        default:
          alert(`En feil oppstod: ${error.response.data.message || "Ukjent feil"}`)
      }
    } else if (error.request) {
      alert("Ingen respons mottatt fra serveren. Vennligst sjekk din internettforbindelse.")
    } else {
      alert(`En feil oppstod: ${error.message}`)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      setShowDropdown(null)

      // Send request to backend
      await api.delete(`/people/${userId}`)

      // Refresh data
      fetchPeople()
    } catch (error) {
      console.error("Feil ved sletting av bruker:", error)
      handleApiError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async (person) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      setShowPaymentDialog(false)

      // Send request to backend
      await api.post(`/people/${person.id}/pay`)

      // Refresh data
      fetchPeople()
    } catch (error) {
      console.error("Feil ved betaling:", error)
      handleApiError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleDropdown = (personId) => {
    setShowDropdown(showDropdown === personId ? null : personId)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-center">Brusliste</h1>
      {currentLocation && (
        <div className="text-center mb-4">
          <button
            onClick={() => setShowLocationDialog(true)}
            className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800"
          >
            <MapPin className="inline-block mr-1" size={16} />
            {currentLocation.name}
          </button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Nytt navn"
          className="border border-gray-300 p-2 mr-2 rounded"
          disabled={isLoading}
        />
        <button
          onClick={addPerson}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading || !newPersonName.trim()}
        >
          <UserPlus className="inline-block mr-1" /> Legg til person
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setShowQuickBuyDialog(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          disabled={isProcessing}
        >
          <Zap className="inline-block mr-1" /> Hurtigkjøp
        </button>
        <button
          onClick={fetchTransactions}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
        >
          <ClipboardList className="inline-block mr-1" /> Vis transaksjoner
        </button>
        <button
          onClick={() => setIsCoffeeMode(!isCoffeeMode)}
          className="bg-brown-500 hover:bg-brown-600 text-white font-bold py-2 px-4 rounded"
        >
          <Coffee className="inline-block mr-1" /> {isCoffeeMode ? "Brus modus" : "Kaffe modus"}
        </button>
        <Link
          to="/dashboard"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded inline-block"
        >
          <BarChart2 className="inline-block mr-1" /> Dashboard
        </Link>
      </div>
      {isCoffeeMode ? (
        <div>
          <h2 className="text-2xl font-bold mb-2">Kaffe forbruk</h2>
          <ul className="space-y-4">
            {coffeeData.map((person) => (
              <li key={person.id} className="mb-2 flex items-center">
                <span className="font-semibold">
                  {person.name}: {person.coffee_balance} kopper
                </span>
                <div className="ml-4 space-x-2">
                  <button
                    onClick={() => handleCoffeeConsumption(person)}
                    className="bg-brown-500 hover:bg-brown-600 text-white font-bold py-1 px-2 rounded"
                    disabled={isProcessing}
                  >
                    Drikk en kopp
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPerson(person)
                      setShowCoffeePurchaseDialog(true)
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded"
                    disabled={isProcessing}
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
                  disabled={isProcessing}
                >
                  <MoreVertical size={20} />
                </button>
                {showDropdown === person.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={() => openBeverageDialog(person, "remove")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={isProcessing}
                    >
                      <MinusCircle className="inline-block mr-2" size={16} />
                      Fjern drikke
                    </button>
                    <button
                      onClick={() => handleDeleteUser(person.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      disabled={isProcessing}
                    >
                      <Trash2 className="inline-block mr-2" size={16} />
                      Slett bruker
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{person.name}</h3>
                <p>
                  {person.beverages} {person.beverage_type}
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => openBeverageDialog(person, "add")}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex-grow mr-2"
                  disabled={isProcessing}
                >
                  <PlusCircle className="inline-block mr-1" /> Legg til
                </button>
                {person.beverages > 0 && (
                  <button
                    onClick={() => {
                      setPayingPerson(person)
                      setShowPaymentDialog(true)
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex-shrink-0"
                    disabled={isProcessing}
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
                <span className="font-semibold">
                  {transaction.name || "Hurtigkjøp"} - {transaction.type}: {transaction.beverages}{" "}
                  {transaction.beverage_type} ({formatAmount(transaction.amount)} kr)
                </span>
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
              {payingPerson.name} skal betale {payingPerson.beverages * PRICE_PER_BEVERAGE} kr for{" "}
              {payingPerson.beverages} {payingPerson.beverage_type}.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Avbryt
              </button>
              <button
                onClick={() => handlePayment(payingPerson)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                disabled={isProcessing}
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
              <button
                onClick={() => setShowQuickBuyDialog(false)}
                className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Avbryt
              </button>
              <button
                onClick={quickBuy}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                disabled={isProcessing}
              >
                Bekreft kjøp
              </button>
            </div>
          </div>
        </div>
      )}
      {showBeverageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{selectedAction === "add" ? "Legg til drikke" : "Fjern drikke"}</h2>
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
              <button
                onClick={confirmBeverageUpdate}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                disabled={isProcessing}
              >
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
                  setCoffeeBags(Number.parseInt(e.target.value))
                  setCoffeeCost(Number.parseInt(e.target.value) * PRICE_PER_COFFEE)
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Kostnad:</label>
              <input
                type="number"
                value={coffeeCost}
                onChange={(e) => setCoffeeCost(Number.parseFloat(e.target.value))}
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
              <button
                onClick={handleCoffeePurchase}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                disabled={isProcessing}
              >
                Bekreft kjøp
              </button>
            </div>
          </div>
        </div>
      )}

      {showLocationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Velg lokasjon</h2>
            <div className="space-y-2">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    changeLocation(location.id)
                    setShowLocationDialog(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded ${
                    location.id === currentLocation?.id ? "bg-blue-100 border border-blue-500" : "hover:bg-gray-100"
                  }`}
                >
                  {location.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLocationDialog(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BeverageApp

