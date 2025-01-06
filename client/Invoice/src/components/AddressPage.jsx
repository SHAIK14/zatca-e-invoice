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
  const BASE_URL = `http://localhost:5000`;
  // const BASE_URL = `https://zatca-e-invoice-1.onrender.com`;

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
      await axios.delete(`http://localhost:5000/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50">
      <h1 className="text-3xl font-light mb-8 text-[#8c6e5d]">
        Manage Addresses
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-12 bg-white p-6 shadow-sm rounded-lg"
      >
        <h2 className="text-xl font-light mb-4 text-gray-700">
          Add New Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="partyIdentificationID"
            value={newAddress.partyIdentificationID}
            onChange={handleInputChange}
            placeholder="Party Identification ID"
            className="border p-2 w-full px-3 py-2  border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
          <input
            type="text"
            name="streetName"
            value={newAddress.streetName}
            onChange={handleInputChange}
            placeholder="Street Name"
            className="border p-2 w-full px-3 py-2  border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
          <input
            type="text"
            name="buildingNumber"
            value={newAddress.buildingNumber}
            onChange={handleInputChange}
            placeholder="Building Number"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
          <input
            type="text"
            name="plotIdentification"
            value={newAddress.plotIdentification}
            onChange={handleInputChange}
            placeholder="Plot Identification"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <input
            type="text"
            name="citySubdivisionName"
            value={newAddress.citySubdivisionName}
            onChange={handleInputChange}
            placeholder="City Subdivision"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <input
            type="text"
            name="cityName"
            value={newAddress.cityName}
            onChange={handleInputChange}
            placeholder="City Name"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
          <input
            type="text"
            name="postalZone"
            value={newAddress.postalZone}
            onChange={handleInputChange}
            placeholder="Postal Code"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
          <input
            type="text"
            name="countrySubentity"
            value={newAddress.countrySubentity}
            onChange={handleInputChange}
            placeholder="Country Subentity (e.g., State/Province)"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <input
            type="text"
            name="country"
            value={newAddress.country}
            onChange={handleInputChange}
            placeholder="Country"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
          <input
            type="text"
            name="companyID"
            value={newAddress.companyID}
            onChange={handleInputChange}
            placeholder="EX:300000157210003"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
          <input
            type="text"
            name="registrationName"
            value={newAddress.registrationName}
            onChange={handleInputChange}
            placeholder="Registration Name"
            className="border p-2 w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-[#8c6e5d] text-white rounded-md hover:bg-[#7c5e4d] focus:outline-none focus:ring-2 focus:ring-[#8c6e5d] focus:ring-opacity-50 transition duration-300 ease-in-out"
        >
          <svg
            className="w-5 h-5 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Address
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-[#8c6e5d]">
        Saved Addresses
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((address) => (
          <div
            key={address._id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
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
                className={`px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-300 ease-in-out ${
                  address.isSelected
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {address.isSelected ? (
                  <svg
                    className="w-4 h-4 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
                {address.isSelected ? "Selected" : "Use"}
              </button>
              <button
                onClick={() => handleDelete(address._id)}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-300 ease-in-out"
              >
                <svg
                  className="w-4 h-4 inline-block mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressPage;
