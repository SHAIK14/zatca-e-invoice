const InvoiceFormSections = ({
  formData,
  handleChange,
  handleCustomerChange,
  handleTaxTotalChange,
  handleLegalMonetaryTotalChange,
  setFormData,
  qrCodeUrl,
  clearanceStatus
}) => {
  return (
    <div className="grid grid-cols-12 gap-1 h-full">
      {/* General Info - Left Column */}
      <div className="col-span-5 bg-white shadow rounded p-2">
        <h2 className="text-sm font-bold mb-1">General Info</h2>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <label className="block text-gray-700 text-xs font-medium">ID</label>
            <input
              type="text"
              name="ID"
              value={formData.ID}
              onChange={handleChange}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Mode</label>
            <select
              name="Mode"
              value={formData.Mode}
              onChange={handleChange}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            >
              <option value="" disabled>Select Mode</option>
              <option value="Standard">Standard</option>
              <option value="Simplified">Simplified</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Issue Date</label>
            <input
              type="date"
              name="IssueDate"
              value={formData.IssueDate ? formData.IssueDate.split("T")[0] : ""}
              onChange={handleChange}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Issue Time</label>
            <input
              type="time"
              name="IssueTime"
              value={formData.IssueTime}
              onChange={handleChange}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Invoice Type</label>
            <select
              name="InvoiceTypeCode"
              value={formData.InvoiceTypeCode}
              onChange={handleChange}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            >
              <option value="388">Standard - 388</option>
              <option value="381">Credit - 381</option>
              <option value="383">Debit - 383</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Doc Currency</label>
            <select
              name="DocumentCurrencyCode"
              value={formData.DocumentCurrencyCode}
              onChange={handleChange}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            >
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-xs font-medium">Tax Currency</label>
            <select
              name="TaxCurrencyCode"
              value={formData.TaxCurrencyCode}
              onChange={handleChange}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            >
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Info - Middle Column */}
      <div className="col-span-5 bg-white shadow rounded p-2">
        <h2 className="text-sm font-bold mb-1">Customer Info</h2>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <label className="block text-gray-700 text-xs font-medium">Party ID</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PartyIdentification.ID}
              onChange={(e) => handleCustomerChange("PartyIdentification.ID", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Registration</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PartyLegalEntity.RegistrationName}
              onChange={(e) => handleCustomerChange("PartyLegalEntity.RegistrationName", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Street</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.StreetName}
              onChange={(e) => handleCustomerChange("PostalAddress.StreetName", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Building</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.BuildingNumber}
              onChange={(e) => handleCustomerChange("PostalAddress.BuildingNumber", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Plot ID</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.PlotIdentification}
              onChange={(e) => handleCustomerChange("PostalAddress.PlotIdentification", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Subdivision</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.CitySubdivisionName}
              onChange={(e) => handleCustomerChange("PostalAddress.CitySubdivisionName", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">City</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.CityName}
              onChange={(e) => handleCustomerChange("PostalAddress.CityName", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Postal Zone</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.PostalZone}
              onChange={(e) => handleCustomerChange("PostalAddress.PostalZone", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Country Sub</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.CountrySubentity}
              onChange={(e) => handleCustomerChange("PostalAddress.CountrySubentity", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Country</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.Country.IdentificationCode}
              onChange={(e) => handleCustomerChange("PostalAddress.Country.IdentificationCode", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-xs font-medium">Tax Scheme</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PartyTaxScheme.TaxScheme.ID}
              onChange={(e) => handleCustomerChange("PartyTaxScheme.TaxScheme.ID", e.target.value)}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Status & Other - Right Column */}
      <div className="col-span-2 space-y-1">
        {/* Status/QR Code */}
        <div className="bg-white shadow rounded p-2">
          <h2 className="text-sm font-bold mb-1">Status</h2>
          {clearanceStatus ? (
            <div className="text-center">
              <p className={`font-medium text-xs mb-1 inline-block px-2 py-0.5 rounded-full ${
                clearanceStatus === "CLEARED" ? "bg-green-100 text-green-800" :
                clearanceStatus === "REPORTED" ? "bg-blue-100 text-blue-800" :
                clearanceStatus === "PENDING_SUBMISSION" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {clearanceStatus === "PENDING_SUBMISSION" ? "Pending" : clearanceStatus}
              </p>
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl.startsWith("data:") ? qrCodeUrl : `data:image/png;base64,${qrCodeUrl}`}
                  alt="QR Code"
                  className="mx-auto"
                  style={{ maxHeight: '70px', maxWidth: '70px' }}
                />
              )}
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 mx-auto"></div>
          )}
        </div>

        {/* Delivery & Payment */}
        <div className="bg-white shadow rounded p-2">
          <h2 className="text-sm font-bold mb-1">Delivery & Payment</h2>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Delivery Date</label>
            <input
              type="date"
              value={formData.Delivery.ActualDeliveryDate ? formData.Delivery.ActualDeliveryDate.split("T")[0] : ""}
              onChange={(e) => setFormData(prevData => ({
                ...prevData,
                Delivery: { ...prevData.Delivery, ActualDeliveryDate: e.target.value }
              }))}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
              required
            />
          </div>
          <div className="mt-1">
            <label className="block text-gray-700 text-xs font-medium">Payment Code</label>
            <input
              type="text"
              value={formData.PaymentMeans.PaymentMeansCode}
              onChange={(e) => setFormData(prevData => ({
                ...prevData,
                PaymentMeans: { ...prevData.PaymentMeans, PaymentMeansCode: e.target.value }
              }))}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="col-span-6 bg-white shadow rounded p-2">
        <h2 className="text-sm font-bold mb-1">Legal Monetary Total</h2>
        <div className="grid grid-cols-3 gap-1">
          <div>
            <label className="block text-gray-700 text-xs font-medium">Line Extension</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.LineExtensionAmount}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Tax Exclusive</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.TaxExclusiveAmount}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Tax Inclusive</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.TaxInclusiveAmount}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Allowance</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.AllowanceTotalAmount}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-xs font-medium">Payable Amount</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.PayableAmount}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="col-span-6 bg-white shadow rounded p-2">
        <h2 className="text-sm font-bold mb-1">Tax Total</h2>
        <div className="grid grid-cols-3 gap-1">
          <div>
            <label className="block text-gray-700 text-xs font-medium">Tax Amount</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxAmount}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Taxable Amount</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxSubtotal.TaxableAmount}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Tax Category</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.ID}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium">Tax %</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.Percent}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-xs font-medium">Tax Scheme</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}
              className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormSections;