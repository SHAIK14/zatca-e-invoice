import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

const InvoiceSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);
  // const BASE_URL = `http://localhost:5000`;
  const BASE_URL = `https://zatca-e-invoice-1.onrender.com`;

  const navigate = useNavigate();
  const fetchUserInvoices = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/invoice-form/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      setInvoiceData(data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching user invoices:", error);
      if (error.response && error.response.status === 404) {
        setErrorMessage("You don't have any invoices. Please create one.");
      } else {
        setErrorMessage("An error occurred while fetching invoices.");
      }
    }
  }, [BASE_URL]); // BASE_URL is included in the dependency array

  useEffect(() => {
    fetchUserInvoices();
  }, [fetchUserInvoices]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "dd-MM-yyyy");
  };

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/invoice-form/search?invoiceLine=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setInvoiceData(data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      if (error.response && error.response.status === 404) {
        setErrorMessage("No invoices found for the entered invoice line.");
      } else {
        setErrorMessage("An error occurred while searching for invoices.");
      }
    }
  };

  const handleEdit = (invoice) => {
    navigate(`/form/${invoice.ID}`, { state: { invoice } });
  };

  const handleView = (invoice) => {
    navigate(`/form/${invoice.ID}`, { state: { invoice } });
  };

  // Pagination logic
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = invoiceData.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search by Invoice Line"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-l px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white rounded-r px-3 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
          <Link
            to="/form"
            className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Record
          </Link>
        </div>
        {errorMessage && (
          <div className="text-center py-8">
            <p className="text-red-500">{errorMessage}</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">UUID</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Curr. Code</th>
                <th className="py-3 px-6 text-left">Tax Amt.</th>
                <th className="py-3 px-6 text-left">Taxable Amt.</th>
                <th className="py-3 px-6 text-left">Tax ID</th>
                <th className="py-3 px-6 text-left">Tax Scheme ID</th>
                <th className="py-3 px-6 text-left">Line Ext.</th>
                <th className="py-3 px-6 text-left">Tax Incl.</th>
                <th className="py-3 px-6 text-left">Payable</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {currentInvoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.clearanceStatus}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800 whitespace-nowrap">
                    {invoice.ID}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.UUID}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {formatDate(invoice.IssueDate)}
                  </td>

                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.DocumentCurrencyCode}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.TaxTotal[0]?.TaxAmount}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.TaxTotal[0]?.TaxSubtotal?.TaxableAmount}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.TaxTotal[0]?.TaxSubtotal?.TaxCategory?.ID}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {
                      invoice.TaxTotal[0]?.TaxSubtotal?.TaxCategory?.TaxScheme
                        ?.ID
                    }
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.LegalMonetaryTotal?.LineExtensionAmount}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.LegalMonetaryTotal?.TaxInclusiveAmount}
                  </td>
                  <td className="py-3 px-6 text-left text-gray-800">
                    {invoice.LegalMonetaryTotal?.PayableAmount}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      {invoice.clearanceStatus === undefined ? (
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      ) : invoice.clearanceStatus === "CLEARED" ||
                        invoice.clearanceStatus === "REPORTED" ? (
                        <button
                          onClick={() => handleView(invoice)}
                          className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-8">
          <nav>
            <ul className="flex">
              {Array.from(
                { length: Math.ceil(invoiceData.length / invoicesPerPage) },
                (_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`${
                        currentPage === index + 1
                          ? "text-black font-bold"
                          : "text-gray-500"
                      } px-4 py-2 mx-1 rounded-md hover:text-black hover:bg-gray-200 focus:outline-none`}
                    >
                      {index + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSearchPage;
