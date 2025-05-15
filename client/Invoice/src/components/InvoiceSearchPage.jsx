import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FaPlus, FaSearch, FaEye, FaEdit, FaFileDownload } from "react-icons/fa";

const InvoiceSearchPage = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    field: "IssueDate",
    order: "desc",
  });

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // const BASE_URL = `http://localhost:8000`;


  // Fetch invoices with pagination, sorting, and filtering
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortField: sortConfig.field,
        sortOrder: sortConfig.order,
      };

      // Add search term if present
      if (searchTerm) {
        params.invoiceLine = searchTerm;
      }

      // Add status filter if not "all"
      if (activeFilter !== "all") {
        params.status = activeFilter.toUpperCase();
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/invoice-form/search`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle both old and new API response formats
      if (Array.isArray(response.data)) {
        // Old API response format
        setInvoices(response.data);
        setPagination({
          ...pagination,
          total: response.data.length,
          totalPages: Math.ceil(response.data.length / pagination.limit),
        });
      } else if (response.data.invoices) {
        // New API response format with pagination
        setInvoices(response.data.invoices);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        });
      } else {
        setInvoices([]);
        setError("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      if (error.response?.status === 404) {
        setInvoices([]);
        setError("No invoices found. Create a new invoice to get started.");
      } else {
        setError("Failed to load invoices. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortConfig, searchTerm, activeFilter, BASE_URL]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Search handler with debounce
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Full invoice fetch for view/edit
  const fetchFullInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/invoice-form/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching full invoice:", error);
      throw error;
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "dd/MM/yyyy");
  };

  // Action handlers
  const handleEdit = async (invoice) => {
    try {
      // For edit, we need the full invoice data
      const fullInvoice = await fetchFullInvoice(invoice.ID);
      navigate(`/form/${invoice.ID}`, { state: { invoice: fullInvoice } });
    } catch (error) {
      alert("Failed to load invoice details for editing");
    }
  };

  const handleView = async (invoice) => {
    try {
      // For view, we need the full invoice data
      const fullInvoice = await fetchFullInvoice(invoice.ID);
      navigate(`/form/${invoice.ID}`, { state: { invoice: fullInvoice } });
    } catch (error) {
      alert("Failed to load invoice details for viewing");
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/invoice-form/${invoice.ID}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.pdfData) {
        alert("PDF is not available for this invoice.");
        return;
      }

      // Convert base64 to Blob
      const byteCharacters = atob(response.data.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_${invoice.ID}.pdf`;
      link.click();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("An error occurred while downloading the PDF.");
    }
  };

  // Manual search button handler
  const handleSearchButton = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    fetchInvoices();
  };

  // Sort handler
  const handleSort = (field) => {
    setSortConfig((prevConfig) => ({
      field,
      order: prevConfig.field === field && prevConfig.order === "asc" ? "desc" : "asc",
    }));
  };

  // Filter handler
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Calculate pagination numbers
  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pageNumbers = [];
    
    // Logic to show a reasonable number of page buttons
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first and last page
      if (page <= 3) {
        // If current page is near the beginning
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(null); // Ellipsis
        pageNumbers.push(totalPages);
      } else if (page >= totalPages - 2) {
        // If current page is near the end
        pageNumbers.push(1);
        pageNumbers.push(null); // Ellipsis
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // If current page is in the middle
        pageNumbers.push(1);
        pageNumbers.push(null); // Ellipsis
        for (let i = page - 1; i <= page + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(null); // Ellipsis
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Render page controls
  const renderPagination = () => {
    const pageNumbers = getPageNumbers();

    return (
      <div className="flex items-center justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-3 py-1 text-indigo-600 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          &laquo;
        </button>
        
        {pageNumbers.map((number, index) => (
          number === null ? (
            <span key={`ellipsis-${index}`} className="text-gray-500">...</span>
          ) : (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded-lg ${
                pagination.page === number
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              {number}
            </button>
          )
        ))}
        
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-3 py-1 text-indigo-600 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          &raquo;
        </button>
      </div>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="border-b border-gray-100 py-3">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-indigo-900 mb-1">
            Invoice Management
          </h1>
          <p className="text-indigo-600 font-light">
            Search, view and manage your invoices
          </p>
        </div>

        {/* Search and Actions */}
     {/* Search and Actions */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
  <div className="flex w-full sm:w-auto flex-grow max-w-lg">
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search by Invoice ID"
        value={searchTerm}
        onChange={handleSearch}
        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-300 transition duration-200"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearchButton();
          }
        }}
      />
    </div>
    <button
      onClick={handleSearchButton}
      className="ml-2 bg-white text-indigo-600 border border-indigo-200 px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition duration-200 focus:outline-none"
    >
      Search
    </button>
  </div>

  <Link
    to="/form"
    className="group flex items-center justify-center bg-white text-indigo-600 border border-indigo-200 px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition duration-200 focus:outline-none w-full sm:w-auto"
  >
    <FaPlus className="mr-2 h-3.5 w-3.5" />
    <span>New Invoice</span>
  </Link>
</div>

        {/* Filter tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === "all"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("cleared")}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === "cleared"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            Cleared
          </button>
          <button
            onClick={() => handleFilterChange("reported")}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === "reported"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            Reported
          </button>
          <button
            onClick={() => handleFilterChange("pending")}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === "pending"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            Pending
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-sm p-4 border border-red-100 mb-6">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        )}

        {/* Invoices table */}
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-sm overflow-hidden border border-indigo-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-indigo-50">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => handleSort("clearanceStatus")}
                  >
                    Status
                    {sortConfig.field === "clearanceStatus" && (
                      <span className="ml-1">
                        {sortConfig.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => handleSort("ID")}
                  >
                    ID
                    {sortConfig.field === "ID" && (
                      <span className="ml-1">
                        {sortConfig.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => handleSort("IssueDate")}
                  >
                    Date
                    {sortConfig.field === "IssueDate" && (
                      <span className="ml-1">
                        {sortConfig.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  renderSkeleton()
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No invoices found. Create a new invoice to get started.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr
                      key={invoice._id || invoice.ID}
                      className="hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            invoice.clearanceStatus === "CLEARED"
                              ? "bg-green-100 text-green-800"
                              : invoice.clearanceStatus === "REPORTED"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.clearanceStatus?.toLowerCase() || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {invoice.ID}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(invoice.IssueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {invoice.LegalMonetaryTotal?.PayableAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        {invoice.clearanceStatus === "CLEARED" ||
                        invoice.clearanceStatus === "REPORTED" ? (
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Invoice"
                          >
                            <FaEye className="inline-block w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Invoice"
                          >
                            <FaEdit className="inline-block w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          className="text-indigo-600 hover:text-indigo-900 ml-3"
                          title="Download PDF"
                        >
                          <FaFileDownload className="inline-block w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && invoices.length > 0 && renderPagination()}

        {/* Page info */}
        {!loading && invoices.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {Math.min(invoices.length, 1) + (pagination.page - 1) * pagination.limit} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} invoices
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceSearchPage;