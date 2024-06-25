// utils/qrCodeUtils.js

const crypto = require("crypto");
const { Certificate } = require("@fidm/x509");
const asn1 = require("asn1.js");

const ECPublicKey = asn1.define("ECPublicKey", function () {
  this.seq().obj(
    this.key("algorithm")
      .seq()
      .obj(this.key("id").objid(), this.key("curve").objid()),
    this.key("pub").bitstr()
  );
});

const generateQRCodeData = (
  invoiceData,
  hashBase64,
  signature,
  certificatePEM
) => {
  const sellerName =
    invoiceData.AccountingSupplierParty.PartyLegalEntity.RegistrationName;
  const vatRegistrationNumber =
    invoiceData.AccountingSupplierParty.PartyTaxScheme.CompanyID;
  const timestamp = `${invoiceData.IssueDate}T${invoiceData.IssueTime}`;
  const invoiceTotal = invoiceData.LegalMonetaryTotal.TaxInclusiveAmount;
  const vatTotal = invoiceData.TaxTotal[0].TaxAmount;

  const encodeTLV = (tag, value) => {
    const valueBuffer = Buffer.from(value, "utf8");
    const length = valueBuffer.length;
    return Buffer.concat([
      Buffer.from([tag]),
      Buffer.from([length]),
      valueBuffer,
    ]);
  };

  const cert = Certificate.fromPEM(certificatePEM);

  const publicKeyRaw = cert.publicKey.keyRaw;
  const formattedPublicKey = ECPublicKey.encode(
    {
      algorithm: {
        id: [1, 2, 840, 10045, 2, 1], // ecPublicKey
        curve: [1, 3, 132, 0, 10], // secp256k1
      },
      pub: { data: publicKeyRaw },
    },
    "der"
  );
  console.log(
    "Formatted Public Key (Tag 8):",
    formattedPublicKey.toString("hex")
  );

  const certSignature = cert.signature;
  console.log("Certificate Signature (Tag 9):", certSignature.toString("hex"));

  const tlvData = Buffer.concat([
    encodeTLV(1, sellerName),
    encodeTLV(2, vatRegistrationNumber),
    encodeTLV(3, timestamp),
    encodeTLV(4, invoiceTotal),
    encodeTLV(5, vatTotal),
    encodeTLV(6, hashBase64),
    encodeTLV(7, signature),
    encodeTLV(8, formattedPublicKey),
    encodeTLV(9, certSignature),
  ]);

  const qrBase64 = tlvData.toString("base64");

  return qrBase64;
};

module.exports = {
  generateQRCodeData,
};
