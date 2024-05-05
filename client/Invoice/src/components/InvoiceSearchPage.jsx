import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const InvoiceSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/invoice-form/search?invoiceLine=${searchTerm}`
      );
      //   console.log(response.data);
      //   setInvoiceData(response.data);
      const data = response.data;

      if (Array.isArray(data)) {
        if (data.length === 0) {
          setInvoiceData([]);
          alert("No invoices found for the entered invoice line.");
        } else {
          setInvoiceData(data);
        }
      } else {
        setInvoiceData([data]);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  return (
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
            className="bg-blue-500 text-white rounded-r px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
        <Link
          to="/form"
          className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Create New Record
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
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
            {invoiceData.map((invoice) => (
              <tr
                key={invoice._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {invoice.ID}
                </td>
                <td className="py-3 px-6 text-left">{invoice.UUID}</td>
                <td className="py-3 px-6 text-left">{invoice.IssueDate}</td>
                <td className="py-3 px-6 text-left">
                  {invoice.DocumentCurrencyCode}
                </td>
                <td className="py-3 px-6 text-left">
                  {invoice.TaxTotal[0]?.TaxAmount}
                </td>
                <td className="py-3 px-6 text-left">
                  {invoice.TaxTotal[0]?.TaxSubtotal?.TaxableAmount}
                </td>
                <td className="py-3 px-6 text-left">
                  {invoice.TaxTotal[0]?.TaxSubtotal?.TaxCategory?.ID}
                </td>
                <td className="py-3 px-6 text-left">
                  {invoice.TaxTotal[0]?.TaxSubtotal?.TaxCategory?.TaxScheme?.ID}
                </td>
                <td className="py-3 px-6 text-left">
                  {invoice.LegalMonetaryTotal?.LineExtensionAmount}
                </td>
                <td className="py-3 px-6 text-left">
                  {invoice.LegalMonetaryTotal?.TaxInclusiveAmount}
                </td>
                <td className="py-3 px-6 text-left">
                  {invoice.LegalMonetaryTotal?.PayableAmount}
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
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
                    <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceSearchPage;
