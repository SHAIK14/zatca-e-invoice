const crypto = require("crypto");

const generateXMLFile = (formData) => {
  const {
    ProfileID,
    ID,
    UUID,
    IssueDate,
    IssueTime,
    InvoiceTypeCode,
    DocumentCurrencyCode,
    TaxCurrencyCode,
    LineCountNumeric,
    AdditionalDocumentReference,
    AccountingSupplierParty,
    AccountingCustomerParty,
    Delivery,
    PaymentMeans,
    TaxTotal,
    LegalMonetaryTotal,
    InvoiceLine,
  } = formData;

  const invoiceLineXML = InvoiceLine.map((line, index) => {
    let lineXML = `<cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${
      line.InvoicedQuantity.quantity
    }</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${
      line.LineExtensionAmount
    }</cbc:LineExtensionAmount>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="SAR">${
          line.TaxTotal.TaxAmount
        }</cbc:TaxAmount>
        <cbc:RoundingAmount currencyID="SAR">${
          line.TaxTotal.RoundingAmount
        }</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
        <cbc:Name>${line.Item.Name}</cbc:Name>
        <cac:ClassifiedTaxCategory>
            <cbc:ID>${line.Item.ClassifiedTaxCategory?.ID || ""}</cbc:ID>
            <cbc:Percent>${
              line.Item.ClassifiedTaxCategory?.Percent || ""
            }</cbc:Percent>
            <cac:TaxScheme>
                <cbc:ID>${
                  line.Item.ClassifiedTaxCategory?.TaxScheme?.ID || ""
                }</cbc:ID>
            </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>`;
    if (line.LineType === "Discount") {
      lineXML += `
            <cbc:PriceAmount currencyID="SAR">${line.LineExtensionAmount}</cbc:PriceAmount>
            <cac:AllowanceCharge>
                <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
                <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
                <cbc:Amount currencyID="SAR">0.00</cbc:Amount>
            </cac:AllowanceCharge>`;
    } else {
      lineXML += `
            <cbc:PriceAmount currencyID="SAR">${line.Price.PriceAmount}</cbc:PriceAmount>`;
    }
    lineXML += `
    </cac:Price>
    </cac:InvoiceLine>`;
    return lineXML.trim();
  }).join("");
  //-------------------------------------------
  const taxTotalXML = `
<cac:TaxTotal>
  <cbc:TaxAmount currencyID="SAR">${TaxTotal[0].TaxAmount}</cbc:TaxAmount>
  ${
    TaxTotal[0].TaxSubtotal.TaxCategory.ID === "O"
      ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${InvoiceLine.filter(
        (line) => line.TaxTotal.TaxAmount === "0.00"
      )
        .reduce((acc, line) => acc + parseFloat(line.LineExtensionAmount), 0)
        .toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">0.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.ID}</cbc:ID>
        <cbc:Percent>0.00</cbc:Percent>
        <cbc:TaxExemptionReasonCode>VATEX-SA-OOS</cbc:TaxExemptionReasonCode>
        <cbc:TaxExemptionReason>Services outside scope of tax / Not subject to VAT | التوريدات الغير خاضعة للضريبة</cbc:TaxExemptionReason>
        <cac:TaxScheme>
          <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${InvoiceLine.filter(
        (line) => line.TaxTotal.TaxAmount !== "0.00"
      )
        .reduce((acc, line) => acc + parseFloat(line.LineExtensionAmount), 0)
        .toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${InvoiceLine.filter(
        (line) => line.TaxTotal.TaxAmount !== "0.00"
      )
        .reduce((acc, line) => acc + parseFloat(line.TaxTotal.TaxAmount), 0)
        .toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${
          InvoiceLine.find((line) => line.TaxTotal.TaxAmount !== "0.00")?.Item
            .ClassifiedTaxCategory.Percent || "0.00"
        }</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  `
      : TaxTotal[0].TaxSubtotal.TaxCategory.ID === "Z"
      ? `${
          InvoiceLine.some((line) => line.TaxTotal.TaxAmount !== "0.00")
            ? `<cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="SAR">${InvoiceLine.filter(
          (line) => line.TaxTotal.TaxAmount === "0.00"
        )
          .reduce((acc, line) => acc + parseFloat(line.LineExtensionAmount), 0)
          .toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="SAR">0.00</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.ID}</cbc:ID>
          <cbc:Percent>0.00</cbc:Percent>
          <cbc:TaxExemptionReasonCode>VATEX-SA-32</cbc:TaxExemptionReasonCode>
          <cbc:TaxExemptionReason>Export of goods | صادرات السلع من المملكة</cbc:TaxExemptionReason>
          <cac:TaxScheme>
            <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="SAR">${InvoiceLine.filter(
          (line) => line.TaxTotal.TaxAmount !== "0.00"
        )
          .reduce((acc, line) => acc + parseFloat(line.LineExtensionAmount), 0)
          .toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="SAR">${InvoiceLine.filter(
          (line) => line.TaxTotal.TaxAmount !== "0.00"
        )
          .reduce((acc, line) => acc + parseFloat(line.TaxTotal.TaxAmount), 0)
          .toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${
            InvoiceLine.find((line) => line.TaxTotal.TaxAmount !== "0.00")?.Item
              .ClassifiedTaxCategory.Percent || "0.00"
          }</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    `
            : `<cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="SAR">${InvoiceLine.reduce(
          (acc, line) => acc + parseFloat(line.LineExtensionAmount),
          0
        ).toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="SAR">0.00</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.ID}</cbc:ID>
          <cbc:Percent>0.00</cbc:Percent>
          <cbc:TaxExemptionReasonCode>VATEX-SA-32</cbc:TaxExemptionReasonCode>
          <cbc:TaxExemptionReason>Export of goods | صادرات السلع من المملكة</cbc:TaxExemptionReason>
          <cac:TaxScheme>
            <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    `
        }
  `
      : ` <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${
        TaxTotal[0].TaxSubtotal.TaxableAmount
      }</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${TaxTotal[0].TaxAmount}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.ID}</cbc:ID>
        <cbc:Percent>${
          TaxTotal[0].TaxSubtotal.TaxCategory.Percent
        }</cbc:Percent>
        ${
          TaxTotal[0].TaxSubtotal.TaxCategory.ID === "E"
            ? `
          <cbc:TaxExemptionReasonCode>VATEX-SA-29-7</cbc:TaxExemptionReasonCode>
          <cbc:TaxExemptionReason>Life insurance services mentioned in Article 29 of the VAT Regulations | عقد تأمين على الحياة</cbc:TaxExemptionReason>
        `
            : ""
        }
        <cac:TaxScheme>
          <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  `
  }
</cac:TaxTotal>
<cac:TaxTotal>
  <cbc:TaxAmount currencyID="SAR">${TaxTotal[0].TaxAmount}</cbc:TaxAmount>
</cac:TaxTotal>
`;
  const paymentMeansXML = `
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${
      PaymentMeans.PaymentMeansCode
    }</cbc:PaymentMeansCode>
    ${
      InvoiceTypeCode === "381" || InvoiceTypeCode === "383"
        ? `
      <cbc:InstructionNote>CANCELLATION_OR_TERMINATION</cbc:InstructionNote>
    `
        : ""
    }
  </cac:PaymentMeans>
`;

  const allowanceChargeXML =
    InvoiceTypeCode === "381" || InvoiceTypeCode === "383"
      ? `
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    ${
      formData.InvoiceLine.some((line) => line.LineType === "Discount")
        ? `
      <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
      <cbc:Amount currencyID="SAR">${
        formData.InvoiceLine.find((line) => line.LineType === "Discount")
          ?.DiscountAmount || "0.00"
      }</cbc:Amount>
      <cac:TaxCategory>
        <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">${
          TaxTotal[0].TaxSubtotal.TaxCategory.ID
        }</cbc:ID>
        <cbc:Percent>${
          TaxTotal[0].TaxSubtotal.TaxCategory.Percent
        }</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">${
            TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID
          }</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    `
        : `
      <cbc:Amount currencyID="SAR">0.00</cbc:Amount>
      <cac:TaxCategory>
        <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.ID}</cbc:ID>
        <cbc:Percent>${TaxTotal[0].TaxSubtotal.TaxCategory.Percent}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>${TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    `
    }
  </cac:AllowanceCharge>
`
      : "";

  const billingReferenceXML =
    InvoiceTypeCode === "381" || InvoiceTypeCode === "383"
      ? `
  <cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>${formData.ID}</cbc:ID>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>
`
      : "";
  const xmlData = `<?xml version="1.0" encoding="UTF-8"?> <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
    <cbc:ProfileID>${ProfileID}</cbc:ProfileID>
    <cbc:ID>${ID}</cbc:ID>
    <cbc:UUID>${UUID}</cbc:UUID>
    <cbc:IssueDate>${IssueDate}</cbc:IssueDate>
    <cbc:IssueTime>${IssueTime}</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0100000">${InvoiceTypeCode}</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>${DocumentCurrencyCode}</cbc:DocumentCurrencyCode>
    <cbc:TaxCurrencyCode>${TaxCurrencyCode}</cbc:TaxCurrencyCode>
    <cbc:LineCountNumeric>${LineCountNumeric}</cbc:LineCountNumeric>
    ${billingReferenceXML}<cac:AdditionalDocumentReference>
    <cbc:ID>${AdditionalDocumentReference[0].ID}</cbc:ID>
    <cbc:UUID>${AdditionalDocumentReference[0].UUID}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>${AdditionalDocumentReference[1].ID}</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${AdditionalDocumentReference[1].Attachment.EmbeddedDocumentBinaryObject}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
    <cac:AccountingSupplierParty>
            <cac:Party>
                <cac:PartyIdentification>
                    <cbc:ID schemeID="CRN">${AccountingSupplierParty.PartyIdentification.ID}</cbc:ID>
                </cac:PartyIdentification>
                <cac:PostalAddress>
                    <cbc:StreetName>${AccountingSupplierParty.PostalAddress.StreetName}</cbc:StreetName>
                    <cbc:BuildingNumber>${AccountingSupplierParty.PostalAddress.BuildingNumber}</cbc:BuildingNumber>
                    <cbc:PlotIdentification>${AccountingSupplierParty.PostalAddress.PlotIdentification}</cbc:PlotIdentification>
                    <cbc:CitySubdivisionName>${AccountingSupplierParty.PostalAddress.CitySubdivisionName}</cbc:CitySubdivisionName>
                    <cbc:CityName>${AccountingSupplierParty.PostalAddress.CityName}</cbc:CityName>
                    <cbc:PostalZone>${AccountingSupplierParty.PostalAddress.PostalZone}</cbc:PostalZone>
                    <cbc:CountrySubentity>${AccountingSupplierParty.PostalAddress.CountrySubentity}</cbc:CountrySubentity>
                    <cac:Country>
                        <cbc:IdentificationCode>${AccountingSupplierParty.PostalAddress.Country.IdentificationCode}</cbc:IdentificationCode>
                    </cac:Country>
                </cac:PostalAddress>
                <cac:PartyTaxScheme>
                    <cbc:CompanyID>${AccountingSupplierParty.PartyTaxScheme.CompanyID}</cbc:CompanyID>
                    <cac:TaxScheme>
                        <cbc:ID>${AccountingSupplierParty.PartyTaxScheme.TaxScheme.ID}</cbc:ID>
                    </cac:TaxScheme>
                </cac:PartyTaxScheme>
                <cac:PartyLegalEntity>
                    <cbc:RegistrationName>${AccountingSupplierParty.PartyLegalEntity.RegistrationName}</cbc:RegistrationName>
                </cac:PartyLegalEntity>
            </cac:Party>
        </cac:AccountingSupplierParty>
        <cac:AccountingCustomerParty>
    <cac:Party>
        <cac:PartyIdentification>
            <cbc:ID schemeID="SAG">${AccountingCustomerParty.PartyIdentification.ID}</cbc:ID>
        </cac:PartyIdentification>
        <cac:PostalAddress>
            <cbc:StreetName>${AccountingCustomerParty.PostalAddress.StreetName}</cbc:StreetName>
            <cbc:BuildingNumber>${AccountingCustomerParty.PostalAddress.BuildingNumber}</cbc:BuildingNumber>
            <cbc:PlotIdentification>${AccountingCustomerParty.PostalAddress.PlotIdentification}</cbc:PlotIdentification>
            <cbc:CitySubdivisionName>${AccountingCustomerParty.PostalAddress.CitySubdivisionName}</cbc:CitySubdivisionName>
            <cbc:CityName>${AccountingCustomerParty.PostalAddress.CityName}</cbc:CityName>
            <cbc:PostalZone>${AccountingCustomerParty.PostalAddress.PostalZone}</cbc:PostalZone>
            <cbc:CountrySubentity>${AccountingCustomerParty.PostalAddress.CountrySubentity}</cbc:CountrySubentity>
            <cac:Country>
                <cbc:IdentificationCode>${AccountingCustomerParty.PostalAddress.Country.IdentificationCode}</cbc:IdentificationCode>
            </cac:Country>
        </cac:PostalAddress>
        <cac:PartyTaxScheme>
            <cac:TaxScheme>
                <cbc:ID>${AccountingCustomerParty.PartyTaxScheme.TaxScheme.ID}</cbc:ID>
            </cac:TaxScheme>
        </cac:PartyTaxScheme>
        <cac:PartyLegalEntity>
            <cbc:RegistrationName>${AccountingCustomerParty.PartyLegalEntity.RegistrationName}</cbc:RegistrationName>
        </cac:PartyLegalEntity>
    </cac:Party>
</cac:AccountingCustomerParty>
<cac:Delivery>
    <cbc:ActualDeliveryDate>${Delivery.ActualDeliveryDate}</cbc:ActualDeliveryDate>
</cac:Delivery>${paymentMeansXML}${allowanceChargeXML}${taxTotalXML}<cac:LegalMonetaryTotal>
  <cbc:LineExtensionAmount currencyID="SAR">${LegalMonetaryTotal.LineExtensionAmount}</cbc:LineExtensionAmount>
  <cbc:TaxExclusiveAmount currencyID="SAR">${LegalMonetaryTotal.TaxExclusiveAmount}</cbc:TaxExclusiveAmount>
  <cbc:TaxInclusiveAmount currencyID="SAR">${LegalMonetaryTotal.TaxInclusiveAmount}</cbc:TaxInclusiveAmount>
  <cbc:AllowanceTotalAmount currencyID="SAR">${LegalMonetaryTotal.AllowanceTotalAmount}</cbc:AllowanceTotalAmount>
  <cbc:PayableAmount currencyID="SAR">${LegalMonetaryTotal.PayableAmount}</cbc:PayableAmount>
</cac:LegalMonetaryTotal>${invoiceLineXML}</Invoice>`;

  return xmlData;
};
// async function generateHashKey(xmlData) {
//   const dataUint8Array = new TextEncoder().encode(xmlData);

//   const hashBuffer = await crypto.subtle.digest("SHA-256", dataUint8Array);

//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hashBase64 = btoa(
//     hashArray.map((byte) => String.fromCharCode(byte)).join("")
//   );

//   return hashBase64;
// }
async function generateHashKey(xmlData) {
  const hash = crypto.createHash("sha256");
  hash.update(xmlData);
  const hashBuffer = hash.digest();
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = Buffer.from(hashArray).toString("base64");
  return hashBase64;
}
async function utf8_to_b64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}
const removeXMLHeader = (xmlData) => {
  const startIndex = xmlData.indexOf("<Invoice");
  return xmlData.substring(startIndex); // Extract XML data from the root element
};
module.exports = {
  generateXMLFile,
  generateHashKey,
  utf8_to_b64,
  removeXMLHeader,
};
