import React from 'react';

const InvoiceLineTable = ({
  invoiceLines,
  handleInvoiceLineChange,
  addInvoiceLine,
  removeInvoiceLine,
  handleImport,
  isReadOnly,
  importError
}) => {
  return (
    <div className="bg-white shadow rounded p-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold">Invoice Lines</h2>
        {!isReadOnly && (
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={addInvoiceLine}
              className="px-2 py-0.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
              disabled={isReadOnly}
            >
              Add Line
            </button>
            <label className="flex items-center px-2 py-0.5 text-xs text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      
      {importError && <div className="text-red-500 text-xs mb-1">{importError}</div>}
      
      <div className="flex-1 overflow-auto border rounded">
        <table className="w-full text-left table-fixed">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-20">Type</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-10">ID</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-16">Price</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-12">Qty</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-20">Line Amt</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-14">Tax %</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-16">Tax Amt</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b">Item Name</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-16">Discount</th>
              <th className="text-xs font-medium text-gray-700 p-1 border-b w-14">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoiceLines.map((line, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-1 border-b">
                  <select
                    value={line.LineType}
                    onChange={(e) => handleInvoiceLineChange(index, "LineType", e.target.value)}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                    required
                    disabled={isReadOnly}
                  >
                    <option value="">Select</option>
                    <option value="Item">Item</option>
                    <option value="Discount">Discount</option>
                    <option value="Exemption">Exemption</option>
                    <option value="Export">Export</option>
                    <option value="GCC">GCC</option>
                    <option value="Zero">Zero</option>
                  </select>
                </td>
                <td className="p-1 border-b">
                  <input
                    type="text"
                    value={line.ID}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                    readOnly
                  />
                </td>
                <td className="p-1 border-b">
                  <input
                    type="text"
                    value={line.Price.PriceAmount}
                    onChange={(e) => handleInvoiceLineChange(index, "Price.PriceAmount", e.target.value)}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                    disabled={isReadOnly}
                  />
                </td>
                <td className="p-1 border-b">
                  <input
                    type="text"
                    value={line.InvoicedQuantity.quantity}
                    onChange={(e) => handleInvoiceLineChange(index, "InvoicedQuantity", {
                      ...line.InvoicedQuantity,
                      quantity: e.target.value
                    })}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                    disabled={isReadOnly}
                  />
                </td>
                <td className="p-1 border-b">
                  <input
                    type="text"
                    value={line.LineExtensionAmount}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                    readOnly
                  />
                </td>
                <td className="p-1 border-b">
                  <select
                    value={line.Item.ClassifiedTaxCategory.Percent}
                    onChange={(e) => handleInvoiceLineChange(index, "Item.ClassifiedTaxCategory.Percent", e.target.value)}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                    required
                    disabled={isReadOnly}
                  >
                    <option value="">Select</option>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="15">15%</option>
                  </select>
                </td>
                <td className="p-1 border-b">
                  <input
                    type="text"
                    value={line.TaxTotal.TaxAmount}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                    readOnly
                  />
                </td>
                <td className="p-1 border-b">
                  <input
                    type="text"
                    value={line.Item.Name}
                    onChange={(e) => handleInvoiceLineChange(index, "Item.Name", e.target.value)}
                    className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                    required
                    disabled={isReadOnly}
                  />
                </td>
                <td className="p-1 border-b">
                  {line.LineType === "Discount" && (
                    <input
                      type="text"
                      value={line.DiscountAmount}
                      onChange={(e) => handleInvoiceLineChange(index, "DiscountAmount", e.target.value)}
                      className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                      disabled={isReadOnly}
                    />
                  )}
                </td>
                <td className="p-1 border-b">
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeInvoiceLine(index)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                      disabled={invoiceLines.length === 1}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceLineTable;