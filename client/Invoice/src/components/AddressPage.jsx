/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    partyIdentificationID: "",
    streetName: "",
    buildingNumber: "",
    plotIdentification: "",
    citySubdivisionName: "",
    cityName: "",
    postalZone: "",
    countrySubentity: "",
    country: "",
    companyID: "",
    registrationName: "",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // const BASE_URL = `http://localhost:8000`;


  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };
  const handleUseAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/addresses/${addressId}/select`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAddresses(); // Refresh the address list
    } catch (error) {
      console.error("Error selecting address:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/addresses`, newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewAddress({
        partyIdentificationID: "",
        streetName: "",
        buildingNumber: "",
        plotIdentification: "",
        citySubdivisionName: "",
        cityName: "",
        postalZone: "",
        countrySubentity: "",
        country: "",
        companyID: "",
        registrationName: "",
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-indigo-900 mb-1">
            Manage Addresses
          </h1>
          <p className="text-indigo-600 font-light">
            Add and manage your business addresses
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-10 bg-white backdrop-filter backdrop-blur-lg bg-opacity-80 p-6 rounded-xl shadow-sm border border-indigo-100"
        >
          <h2 className="text-base font-medium text-gray-800 mb-4">
            Add New Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="partyIdentificationID"
              value={newAddress.partyIdentificationID}
              onChange={handleInputChange}
              placeholder="Party Identification ID"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
            <input
              type="text"
              name="streetName"
              value={newAddress.streetName}
              onChange={handleInputChange}
              placeholder="Street Name"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
            <input
              type="text"
              name="buildingNumber"
              value={newAddress.buildingNumber}
              onChange={handleInputChange}
              placeholder="Building Number"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
            <input
              type="text"
              name="plotIdentification"
              value={newAddress.plotIdentification}
              onChange={handleInputChange}
              placeholder="Plot Identification"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
            />
            <input
              type="text"
              name="citySubdivisionName"
              value={newAddress.citySubdivisionName}
              onChange={handleInputChange}
              placeholder="City Subdivision"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
            />
            <input
              type="text"
              name="cityName"
              value={newAddress.cityName}
              onChange={handleInputChange}
              placeholder="City Name"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
            <input
              type="text"
              name="postalZone"
              value={newAddress.postalZone}
              onChange={handleInputChange}
              placeholder="Postal Code"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
            <input
              type="text"
              name="countrySubentity"
              value={newAddress.countrySubentity}
              onChange={handleInputChange}
              placeholder="Country Subentity (e.g., State/Province)"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
            />
            <input
              type="text"
              name="country"
              value={newAddress.country}
              onChange={handleInputChange}
              placeholder="Country"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
            <input
              type="text"
              name="companyID"
              value={newAddress.companyID}
              onChange={handleInputChange}
              placeholder="EX:300000157210003"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
            <input
              type="text"
              name="registrationName"
              value={newAddress.registrationName}
              onChange={handleInputChange}
              placeholder="Registration Name"
              className="border p-2 w-full px-3 py-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white transition duration-200"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-5 bg-white text-indigo-600 border border-indigo-200 font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-50 transition duration-200 ease-in-out focus:outline-none"
          >
            Add Address
          </button>
        </form>

        <h2 className="text-base font-medium text-gray-800 mb-4">
          Saved Addresses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-80 p-5 rounded-xl shadow-sm border border-indigo-100 transition-all duration-300 hover:border-indigo-200"
            >
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {address.streetName}, {address.buildingNumber}
                </p>
                <p className="text-sm text-gray-600">
                  {address.cityName}, {address.postalZone}
                </p>
                <p className="text-sm text-gray-600">
                  {address.countrySubentity}, {address.country}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-500">
                  Party ID: {address.partyIdentificationID}
                </p>
                <p className="text-xs text-gray-500">
                  Company ID: {address.companyID}
                </p>
                <p className="text-xs text-gray-500">
                  Registration: {address.registrationName}
                </p>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => handleUseAddress(address._id)}
                  className={`px-3 py-1.5 rounded-lg text-sm focus:outline-none transition duration-200 ease-in-out ${
                    address.isSelected
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {address.isSelected ? "Selected" : "Use"}
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-50 focus:outline-none transition duration-200 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddressPage;