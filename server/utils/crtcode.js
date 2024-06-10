const crypto = require("crypto");
const asn1js = require("asn1js");
const pkijs = require("pkijs");
const pvutils = require("pvutils");

const certificatePEM = `-----BEGIN CERTIFICATE-----
MIID3jCCA4SgAwIBAgITEQAAOAPF90Ajs/xcXwABAAA4AzAKBggqhkjOPQQDAjBiMRUwEwYKCZImiZPyLGQBGRYFbG9jYWwxEzARBgoJkiaJk/IsZAEZFgNnb3YxFzAVBgoJkiaJk/IsZAEZFgdleHRnYXp0MRswGQYDVQQDExJQUlpFSU5WT0lDRVNDQTQtQ0EwHhcNMjQwMTExMDkxOTMwWhcNMjkwMTA5MDkxOTMwWjB1MQswCQYDVQQGEwJTQTEmMCQGA1UEChMdTWF4aW11bSBTcGVlZCBUZWNoIFN1cHBseSBMVEQxFjAUBgNVBAsTDVJpeWFkaCBCcmFuY2gxJjAkBgNVBAMTHVRTVC04ODY0MzExNDUtMzk5OTk5OTk5OTAwMDAzMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEoWCKa0Sa9FIErTOv0uAkC1VIKXxU9nPpx2vlf4yhMejy8c02XJblDq7tPydo8mq0ahOMmNo8gwni7Xt1KT9UeKOCAgcwggIDMIGtBgNVHREEgaUwgaKkgZ8wgZwxOzA5BgNVBAQMMjEtVFNUfDItVFNUfDMtZWQyMmYxZDgtZTZhMi0xMTE4LTliNTgtZDlhOGYxMWU0NDVmMR8wHQYKCZImiZPyLGQBAQwPMzk5OTk5OTk5OTAwMDAzMQ0wCwYDVQQMDAQxMTAwMREwDwYDVQQaDAhSUlJEMjkyOTEaMBgGA1UEDwwRU3VwcGx5IGFjdGl2aXRpZXMwHQYDVR0OBBYEFEX+YvmmtnYoDf9BGbKo7ocTKYK1MB8GA1UdIwQYMBaAFJvKqqLtmqwskIFzVvpP2PxT+9NnMHsGCCsGAQUFBwEBBG8wbTBrBggrBgEFBQcwAoZfaHR0cDovL2FpYTQuemF0Y2EuZ292LnNhL0NlcnRFbnJvbGwvUFJaRUludm9pY2VTQ0E0LmV4dGdhenQuZ292LmxvY2FsX1BSWkVJTlZPSUNFU0NBNC1DQSgxKS5jcnQwDgYDVR0PAQH/BAQDAgeAMDwGCSsGAQQBgjcVBwQvMC0GJSsGAQQBgjcVCIGGqB2E0PsShu2dJIfO+xnTwFVmh/qlZYXZhD4CAWQCARIwHQYDVR0lBBYwFAYIKwYBBQUHAwMGCCsGAQUFBwMCMCcGCSsGAQQBgjcVCgQaMBgwCgYIKwYBBQUHAwMwCgYIKwYBBQUHAwIwCgYIKoZIzj0EAwIDSAAwRQIhALE/ichmnWXCUKUbca3yci8oqwaLvFdHVjQrveI9uqAbAiA9hC4M8jgMBADPSzmd2uiPJA6gKR3LE03U75eqbC/rXA==
-----END CERTIFICATE-----`;
function hexToFormattedString(hex) {
  return hex
    .match(/.{1,2}/g)
    .map((byte) => byte.toLowerCase())
    .join(":")
    .match(/.{1,47}/g)
    .join("\n");
}
async function parseCertificate(certificatePEM) {
  const pemHeader = "-----BEGIN CERTIFICATE-----";
  const pemFooter = "-----END CERTIFICATE-----";
  const pemContents = certificatePEM.substring(
    pemHeader.length,
    certificatePEM.length - pemFooter.length
  );
  const certificateBase64 = pemContents.replace(/\s+/g, "");

  const certificateBinary = Buffer.from(certificateBase64, "base64");
  const certificateArray = new Uint8Array(certificateBinary);

  const asn1 = asn1js.fromBER(certificateArray.buffer);
  if (asn1.offset === -1) {
    throw new Error("Cannot parse the certificate");
  }

  const certificate = new pkijs.Certificate({ schema: asn1.result });

  const publicKeyInfo =
    certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex;
  const publicKeyHex = pvutils.bufferToHexCodes(publicKeyInfo);
  const formattedPublicKey = hexToFormattedString(publicKeyHex);

  // Extract the public key hex code
  const publicKeyHexCode = formattedPublicKey.replace(/[\n:\s]/g, "");

  console.log("Public Key (Hex):\n" + formattedPublicKey);
  console.log("publicKeyHexCode", publicKeyHexCode);

  const signatureInfo = certificate.signatureValue.valueBlock.valueHex;
  const signatureHex = pvutils.bufferToHexCodes(signatureInfo);
  const formattedSignature = hexToFormattedString(signatureHex);
  const signatureHexCode = formattedSignature.replace(/[\n:\s]/g, "");
  const signatureBytes = new Uint8Array(
    signatureHexCode.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  const signatureBase64 = Buffer.from(signatureBytes).toString("base64");

  console.log("Signature (Hex):\n" + formattedSignature);

  return {
    publicKey: publicKeyHexCode || null,
    signature: signatureBase64,
  };
}

function getTLVForValue(tagNum, tagValue) {
  const tagBuf = Buffer.from([tagNum], "utf8");
  console.log("tagbuf:", tagBuf);
  const tagValueLenBuf = Buffer.from([tagValue.length], "utf8");
  console.log("tagValueLenBuf:", tagValueLenBuf);
  const tagValueBuf = Buffer.from(tagValue, "utf8");
  console.log("tagValueBuf:", tagValueBuf);

  const bufsArray = [tagBuf, tagValueLenBuf, tagValueBuf];
  console.log("bufsArray:", bufsArray);

  return Buffer.concat(bufsArray);
}

const generateQRCodeData = async (formData, xmlData) => {
  try {
    const {
      AccountingSupplierParty,
      IssueDate,
      IssueTime,
      LegalMonetaryTotal,
      TaxTotal,
    } = formData;

    console.log("FormData:", formData);

    const sellerName =
      AccountingSupplierParty.PartyLegalEntity.RegistrationName;
    console.log("Seller Name:", sellerName);

    const vatNumber = AccountingSupplierParty.PartyTaxScheme.CompanyID;
    console.log("VAT Number:", vatNumber);

    const timestamp = `${IssueDate}T${IssueTime}`;
    console.log("Timestamp:", timestamp);

    const invoiceTotal = LegalMonetaryTotal.TaxInclusiveAmount;
    console.log("Invoice Total:", invoiceTotal);

    const vatTotal = TaxTotal[0].TaxAmount;
    console.log("VAT Total:", vatTotal);

    const xmlHash = crypto
      .createHash("sha256")
      .update(xmlData)
      .digest("base64");
    console.log("XML Hash:", xmlHash);
    // Generate TLV buffers for each tag
    const sellerNameBuf = getTLVForValue(1, sellerName);
    console.log("Seller Name TLV Buffer:", sellerNameBuf);

    const vatNumberBuf = getTLVForValue(2, vatNumber);
    console.log("VAT Number TLV Buffer:", vatNumberBuf);

    const timestampBuf = getTLVForValue(3, timestamp);
    console.log("Timestamp TLV Buffer:", timestampBuf);

    const invoiceTotalBuf = getTLVForValue(4, invoiceTotal.toString());
    console.log("Invoice Total TLV Buffer:", invoiceTotalBuf);

    const vatTotalBuf = getTLVForValue(5, vatTotal.toString());
    console.log("VAT Total TLV Buffer:", vatTotalBuf);

    const xmlHashBuf = getTLVForValue(6, xmlHash);
    console.log("XML Hash TLV Buffer:", xmlHashBuf);

    //---------------tag7------------------//
    const privateKey = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBCne7+Bvv/deGEav/IIfjv4oQ3/MPBkBPc8WARzvBAGoAcGBSuBBAAK
oUQDQgAEtuWOfvi6Nq8mxtd0Pu4XFMDoE3aCNZGnzFni3ALSdLe9fbtbrxI9f4vY
qKfdaeOYzrM56+Iz3QC6vQAnxjrm5A==
-----END EC PRIVATE KEY-----`;

    const xmlHashHex = Buffer.from(xmlHash, "base64").toString("hex");
    console.log("XML Hash (Hexadecimal):", xmlHashHex);

    const signObj = crypto.createSign("SHA256");

    signObj.update(xmlHashHex, "hex");

    const signature = signObj.sign(privateKey, "base64");
    console.log("ECDSA Signature:", signature);

    const signatureBuf = getTLVForValue(7, signature);
    console.log("Signature TLV Buffer:", signatureBuf);
    //     //---------------tag7------------------//

    //     const privateKey = `-----BEGIN EC PRIVATE KEY-----
    // MHQCAQEEIFIeg+zz/ufiFgIECP9N3Ag385EP/f+/v7NovQo49336oAcGBSuBBAAK
    // oUQDQgAEkbP2rl8Bg2xe/c/8Px6TJqQuAzxE+PLjS8AXrZLOOPbgqVDti0X7KS5E
    // xb/rBj1B3R+eTTg8ko/oEM/6VV1wCg==
    // -----END EC PRIVATE KEY-----`;

    //     const xmlHashHex = Buffer.from(xmlHash, "base64").toString("hex");
    //     console.log("XML Hash (Hexadecimal):", xmlHashHex);

    //     const signObj = crypto.createSign("SHA256");

    //     signObj.update(xmlHashHex, "hex");

    //     const signature = signObj.sign(privateKey, "base64");
    //     console.log("ECDSA Signature:", signature);

    //     const signatureBytes = Buffer.from(signature, "base64");
    //     const signatureHash = crypto
    //       .createHash("sha256")
    //       .update(signatureBytes)
    //       .digest();
    //     const rComponent = signatureHash.slice(0, 32);
    //     console.log("rComponent", rComponent);
    //     const sComponent = signatureHash.slice(32);
    //     console.log("sComponent", sComponent);

    //     const signatureTLV = Buffer.concat([
    //       Buffer.from([0x07]),
    //       Buffer.from([rComponent.length + sComponent.length]),
    //       rComponent,
    //       sComponent,
    //     ]);
    //     console.log("Signature TLV (Hexadecimal):", signatureTLV.toString("hex"));
    //---------------tag8------------------//
    const publicKeyPEM = `-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEtuWOfvi6Nq8mxtd0Pu4XFMDoE3aCNZGn
zFni3ALSdLe9fbtbrxI9f4vYqKfdaeOYzrM56+Iz3QC6vQAnxjrm5A==
-----END PUBLIC KEY-----`;

    const publicKeyContent = publicKeyPEM
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/\s/g, "");

    console.log("Public Key Content:", publicKeyContent);
    const publicKeyContentBuf = Buffer.from(publicKeyContent, "base64");
    const publicKeyContentTLV = Buffer.concat([
      Buffer.from([0x08]),
      Buffer.from([publicKeyContentBuf.length]),
      publicKeyContentBuf,
    ]);
    console.log(
      "Public Key Content TLV (Hexadecimal):",
      publicKeyContentTLV.toString("hex")
    );

    //---------------tag9------------------//
    // const { publicKey: publicKeyBase64 } = await parseCertificate(
    //   certificatePEM
    // );
    // const publicKeyHex = Buffer.from(publicKeyBase64, "base64").toString("hex");
    // console.log("Public Key (Hexadecimal):", publicKeyHex);
    const { publicKey: publicKeyHex, signature: signatureBase64 } =
      await parseCertificate(certificatePEM);
    if (!publicKeyHex) {
      throw new Error("Failed to extract public key from the certificate");
    }

    console.log("Public Key (Hexadecimal):", publicKeyHex);
    console.log("Signature (Base64):", signatureBase64);

    const publicKeyBuf = Buffer.from(publicKeyHex, "hex");
    const publicKeyTLV = Buffer.concat([
      Buffer.from([0x09]),
      Buffer.from([publicKeyBuf.length]),
      publicKeyBuf,
    ]);
    console.log("Public Key TLV (Hexadecimal):", publicKeyTLV.toString("hex"));

    const tagsBufsArray = [
      sellerNameBuf,
      vatNumberBuf,
      timestampBuf,
      invoiceTotalBuf,
      vatTotalBuf,
      xmlHashBuf,
      signatureBuf,
      publicKeyContentTLV,
      publicKeyTLV,
    ];
    console.log("Tags Buffers Array:", tagsBufsArray);

    const qrCodeBuf = Buffer.concat(tagsBufsArray);
    console.log("QR Code Buffer:", qrCodeBuf);

    const qrCodeB64 = qrCodeBuf.toString("base64");
    console.log("QR Code Base64:", qrCodeB64);

    return {
      qrCodeB64,
      xmlHash,
      signature,
    };
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

const generateXMLFile = async (formData) => {
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
    Mode,
  } = formData;
  console.log("Form Data:", formData);

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

  const xmlDataWithoutQR = `<?xml version="1.0" encoding="UTF-8"?> <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  
    <cbc:ProfileID>${ProfileID}</cbc:ProfileID>
    <cbc:ID>${ID}</cbc:ID>
    <cbc:UUID>${UUID}</cbc:UUID>
    <cbc:IssueDate>${IssueDate}</cbc:IssueDate>
    <cbc:IssueTime>${IssueTime}</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0200000">${InvoiceTypeCode}</cbc:InvoiceTypeCode>
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
  console.log("XML Data Without QR:", xmlDataWithoutQR);

  const { qrCodeB64, xmlHash, signature } = await generateQRCodeData(
    formData,
    xmlDataWithoutQR
  );
  // const xmlHash = crypto.createHash("sha256").update(xmlData).digest("base64");
  // console.log("XML Hash near qr code data:", xmlHash);

  console.log("QR Code Base64:", qrCodeB64);
  console.log("XML Hash:", xmlHash);
  console.log("Signature:", signature);

  const qrCodeXML =
    Mode === "Simplified"
      ? `
<cac:AdditionalDocumentReference>
  <cbc:ID>QR</cbc:ID>
  <cac:Attachment>
    <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">
      ${qrCodeB64}
    </cbc:EmbeddedDocumentBinaryObject>
  </cac:Attachment>
</cac:AdditionalDocumentReference>
`
      : "";
  const signatureXML =
    Mode === "Simplified"
      ? `<cac:Signature>
      <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
      <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
</cac:Signature>`
      : "";

  const xmlData = `<?xml version="1.0" encoding="UTF-8"?> <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">${
    Mode === "Simplified"
      ? `<ext:UBLExtensions>
    <ext:UBLExtension>
        <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
        <ext:ExtensionContent>
            <sig:UBLDocumentSignatures xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2" xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2" xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">
                <sac:SignatureInformation> 
                    <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
                    <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
                    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="signature">
                        <ds:SignedInfo>
                            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
                            <ds:Reference Id="invoiceSignedData" URI="">
                                <ds:Transforms>
                                    <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                                        <ds:XPath>not(//ancestor-or-self::ext:UBLExtensions)</ds:XPath>
                                    </ds:Transform>
                                    <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                                        <ds:XPath>not(//ancestor-or-self::cac:Signature)</ds:XPath>
                                    </ds:Transform>
                                    <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                                        <ds:XPath>not(//ancestor-or-self::cac:AdditionalDocumentReference[cbc:ID='QR'])</ds:XPath>
                                    </ds:Transform>
                                    <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                                </ds:Transforms>
                                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                <ds:DigestValue>${xmlHash}</ds:DigestValue>
                            </ds:Reference>
                            <ds:Reference Type="http://www.w3.org/2000/09/xmldsig#SignatureProperties" URI="#xadesSignedProperties">
                                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                <ds:DigestValue>NTUzMzVmMjExNWRjYzZkYzRlNjI1Y2Q1NDM1NWMwYjMzZjQ4MTZiYjlhOTZlMmY5ZDkzM2Q3ZDM1ODliNjE0ZA==</ds:DigestValue>
                            </ds:Reference>
                        </ds:SignedInfo>
                        <ds:SignatureValue>${signature}</ds:SignatureValue>
                        <ds:KeyInfo>
                            <ds:X509Data>
                                <ds:X509Certificate>
                                MIID3jCCA4SgAwIBAgITEQAAOAPF90Ajs/xcXwABAAA4AzAKBggqhkjOPQQDAjBiMRUwEwYKCZImiZPyLGQBGRYFbG9jYWwxEzARBgoJkiaJk/IsZAEZFgNnb3YxFzAVBgoJkiaJk/IsZAEZFgdleHRnYXp0MRswGQYDVQQDExJQUlpFSU5WT0lDRVNDQTQtQ0EwHhcNMjQwMTExMDkxOTMwWhcNMjkwMTA5MDkxOTMwWjB1MQswCQYDVQQGEwJTQTEmMCQGA1UEChMdTWF4aW11bSBTcGVlZCBUZWNoIFN1cHBseSBMVEQxFjAUBgNVBAsTDVJpeWFkaCBCcmFuY2gxJjAkBgNVBAMTHVRTVC04ODY0MzExNDUtMzk5OTk5OTk5OTAwMDAzMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEoWCKa0Sa9FIErTOv0uAkC1VIKXxU9nPpx2vlf4yhMejy8c02XJblDq7tPydo8mq0ahOMmNo8gwni7Xt1KT9UeKOCAgcwggIDMIGtBgNVHREEgaUwgaKkgZ8wgZwxOzA5BgNVBAQMMjEtVFNUfDItVFNUfDMtZWQyMmYxZDgtZTZhMi0xMTE4LTliNTgtZDlhOGYxMWU0NDVmMR8wHQYKCZImiZPyLGQBAQwPMzk5OTk5OTk5OTAwMDAzMQ0wCwYDVQQMDAQxMTAwMREwDwYDVQQaDAhSUlJEMjkyOTEaMBgGA1UEDwwRU3VwcGx5IGFjdGl2aXRpZXMwHQYDVR0OBBYEFEX+YvmmtnYoDf9BGbKo7ocTKYK1MB8GA1UdIwQYMBaAFJvKqqLtmqwskIFzVvpP2PxT+9NnMHsGCCsGAQUFBwEBBG8wbTBrBggrBgEFBQcwAoZfaHR0cDovL2FpYTQuemF0Y2EuZ292LnNhL0NlcnRFbnJvbGwvUFJaRUludm9pY2VTQ0E0LmV4dGdhenQuZ292LmxvY2FsX1BSWkVJTlZPSUNFU0NBNC1DQSgxKS5jcnQwDgYDVR0PAQH/BAQDAgeAMDwGCSsGAQQBgjcVBwQvMC0GJSsGAQQBgjcVCIGGqB2E0PsShu2dJIfO+xnTwFVmh/qlZYXZhD4CAWQCARIwHQYDVR0lBBYwFAYIKwYBBQUHAwMGCCsGAQUFBwMCMCcGCSsGAQQBgjcVCgQaMBgwCgYIKwYBBQUHAwMwCgYIKwYBBQUHAwIwCgYIKoZIzj0EAwIDSAAwRQIhALE/ichmnWXCUKUbca3yci8oqwaLvFdHVjQrveI9uqAbAiA9hC4M8jgMBADPSzmd2uiPJA6gKR3LE03U75eqbC/rXA==
                                </ds:X509Certificate>
                            </ds:X509Data>
                        </ds:KeyInfo>
                        <ds:Object>
                            <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="signature">
                                <xades:SignedProperties Id="xadesSignedProperties">
                                    <xades:SignedSignatureProperties>
                                        <xades:SigningTime>2024-01-14T10:26:49</xades:SigningTime>
                                        <xades:SigningCertificate>
                                            <xades:Cert>
                                                <xades:CertDigest>
                                                    <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                                    <ds:DigestValue>ZDMwMmI0MTE1NzVjOTU2NTk4YzVlODhhYmI0ODU2NDUyNTU2YTVhYjhhMDFmN2FjYjk1YTA2OWQ0NjY2MjQ4NQ==</ds:DigestValue>
                                                </xades:CertDigest>
                                                <xades:IssuerSerial>
                                                    <ds:X509IssuerName>	CN = PRZEINVOICESCA4-CA,DC = extgazt,DC = gov,DC = local</ds:X509IssuerName>
                                                    <ds:X509SerialNumber>379112742831380471835263969587287663520528387</ds:X509SerialNumber>
                                                </xades:IssuerSerial>
                                            </xades:Cert>
                                        </xades:SigningCertificate>
                                    </xades:SignedSignatureProperties>
                                </xades:SignedProperties>
                            </xades:QualifyingProperties>
                        </ds:Object>
                    </ds:Signature>
                </sac:SignatureInformation>
            </sig:UBLDocumentSignatures>
        </ext:ExtensionContent>
    </ext:UBLExtension>
</ext:UBLExtensions>`
      : ""
  }
    <cbc:ProfileID>${ProfileID}</cbc:ProfileID>
    <cbc:ID>${ID}</cbc:ID>
    <cbc:UUID>${UUID}</cbc:UUID>
    <cbc:IssueDate>${IssueDate}</cbc:IssueDate>
    <cbc:IssueTime>${IssueTime}</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0200000">${InvoiceTypeCode}</cbc:InvoiceTypeCode>
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
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${
        AdditionalDocumentReference[1].Attachment.EmbeddedDocumentBinaryObject
      }</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>${qrCodeXML}${signatureXML}
    <cac:AccountingSupplierParty>
            <cac:Party>
                <cac:PartyIdentification>
                    <cbc:ID schemeID="CRN">${
                      AccountingSupplierParty.PartyIdentification.ID
                    }</cbc:ID>
                </cac:PartyIdentification>
                <cac:PostalAddress>
                    <cbc:StreetName>${
                      AccountingSupplierParty.PostalAddress.StreetName
                    }</cbc:StreetName>
                    <cbc:BuildingNumber>${
                      AccountingSupplierParty.PostalAddress.BuildingNumber
                    }</cbc:BuildingNumber>
                    <cbc:PlotIdentification>${
                      AccountingSupplierParty.PostalAddress.PlotIdentification
                    }</cbc:PlotIdentification>
                    <cbc:CitySubdivisionName>${
                      AccountingSupplierParty.PostalAddress.CitySubdivisionName
                    }</cbc:CitySubdivisionName>
                    <cbc:CityName>${
                      AccountingSupplierParty.PostalAddress.CityName
                    }</cbc:CityName>
                    <cbc:PostalZone>${
                      AccountingSupplierParty.PostalAddress.PostalZone
                    }</cbc:PostalZone>
                    <cbc:CountrySubentity>${
                      AccountingSupplierParty.PostalAddress.CountrySubentity
                    }</cbc:CountrySubentity>
                    <cac:Country>
                        <cbc:IdentificationCode>${
                          AccountingSupplierParty.PostalAddress.Country
                            .IdentificationCode
                        }</cbc:IdentificationCode>
                    </cac:Country>
                </cac:PostalAddress>
                <cac:PartyTaxScheme>
                    <cbc:CompanyID>${
                      AccountingSupplierParty.PartyTaxScheme.CompanyID
                    }</cbc:CompanyID>
                    <cac:TaxScheme>
                        <cbc:ID>${
                          AccountingSupplierParty.PartyTaxScheme.TaxScheme.ID
                        }</cbc:ID>
                    </cac:TaxScheme>
                </cac:PartyTaxScheme>
                <cac:PartyLegalEntity>
                    <cbc:RegistrationName>${
                      AccountingSupplierParty.PartyLegalEntity.RegistrationName
                    }</cbc:RegistrationName>
                </cac:PartyLegalEntity>
            </cac:Party>
        </cac:AccountingSupplierParty>
        <cac:AccountingCustomerParty>
    <cac:Party>
        <cac:PartyIdentification>
            <cbc:ID schemeID="SAG">${
              AccountingCustomerParty.PartyIdentification.ID
            }</cbc:ID>
        </cac:PartyIdentification>
        <cac:PostalAddress>
            <cbc:StreetName>${
              AccountingCustomerParty.PostalAddress.StreetName
            }</cbc:StreetName>
            <cbc:BuildingNumber>${
              AccountingCustomerParty.PostalAddress.BuildingNumber
            }</cbc:BuildingNumber>
            <cbc:PlotIdentification>${
              AccountingCustomerParty.PostalAddress.PlotIdentification
            }</cbc:PlotIdentification>
            <cbc:CitySubdivisionName>${
              AccountingCustomerParty.PostalAddress.CitySubdivisionName
            }</cbc:CitySubdivisionName>
            <cbc:CityName>${
              AccountingCustomerParty.PostalAddress.CityName
            }</cbc:CityName>
            <cbc:PostalZone>${
              AccountingCustomerParty.PostalAddress.PostalZone
            }</cbc:PostalZone>
            <cbc:CountrySubentity>${
              AccountingCustomerParty.PostalAddress.CountrySubentity
            }</cbc:CountrySubentity>
            <cac:Country>
                <cbc:IdentificationCode>${
                  AccountingCustomerParty.PostalAddress.Country
                    .IdentificationCode
                }</cbc:IdentificationCode>
            </cac:Country>
        </cac:PostalAddress>
        <cac:PartyTaxScheme>
            <cac:TaxScheme>
                <cbc:ID>${
                  AccountingCustomerParty.PartyTaxScheme.TaxScheme.ID
                }</cbc:ID>
            </cac:TaxScheme>
        </cac:PartyTaxScheme>
        <cac:PartyLegalEntity>
            <cbc:RegistrationName>${
              AccountingCustomerParty.PartyLegalEntity.RegistrationName
            }</cbc:RegistrationName>
        </cac:PartyLegalEntity>
    </cac:Party>
</cac:AccountingCustomerParty>
<cac:Delivery>
    <cbc:ActualDeliveryDate>${
      Delivery.ActualDeliveryDate
    }</cbc:ActualDeliveryDate>
</cac:Delivery>${paymentMeansXML}${allowanceChargeXML}${taxTotalXML}<cac:LegalMonetaryTotal>
  <cbc:LineExtensionAmount currencyID="SAR">${
    LegalMonetaryTotal.LineExtensionAmount
  }</cbc:LineExtensionAmount>
  <cbc:TaxExclusiveAmount currencyID="SAR">${
    LegalMonetaryTotal.TaxExclusiveAmount
  }</cbc:TaxExclusiveAmount>
  <cbc:TaxInclusiveAmount currencyID="SAR">${
    LegalMonetaryTotal.TaxInclusiveAmount
  }</cbc:TaxInclusiveAmount>
  <cbc:AllowanceTotalAmount currencyID="SAR">${
    LegalMonetaryTotal.AllowanceTotalAmount
  }</cbc:AllowanceTotalAmount>
  <cbc:PayableAmount currencyID="SAR">${
    LegalMonetaryTotal.PayableAmount
  }</cbc:PayableAmount>
</cac:LegalMonetaryTotal>${invoiceLineXML}</Invoice>`;

  return {
    xmlData,
    xmlHash,
  };
};

// async function generateHashKey(xmlData) {
//   console.log("Generating Hash Key...");
//   const hash = crypto.createHash("sha256");
//   hash.update(xmlData);
//   const hashBuffer = hash.digest();
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hashBase64 = Buffer.from(hashArray).toString("base64");
//   return hashBase64;
// }
// async function utf8_to_b64(str) {
//   return Buffer.from(str, "utf8").toString("base64");
// }
// const removeXMLHeader = (xmlData) => {
//   const startIndex = xmlData.indexOf("<Invoice");
//   return xmlData.substring(startIndex); // Extract XML data from the root element
// };
module.exports = {
  generateXMLFile,
  // generateHashKey,
  // utf8_to_b64,
  // removeXMLHeader,
};
