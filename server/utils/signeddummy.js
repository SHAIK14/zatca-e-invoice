const signXML = (unsingedXml) => {
  // Private key and certificate
  const privateKey = `-----BEGIN PRIVATE KEY-----
MHQCAQEEIBCne7+Bvv/deGEav/IIfjv4oQ3/MPBkBPc8WARzvBAGoAcGBSuBBAAK
oUQDQgAEtuWOfvi6Nq8mxtd0Pu4XFMDoE3aCNZGnzFni3ALSdLe9fbtbrxI9f4vY
qKfdaeOYzrM56+Iz3QC6vQAnxjrm5A==
-----END PRIVATE KEY-----`;

  const certificate = `-----BEGIN CERTIFICATE-----
MIICNTCCAdugAwIBAgIGAY/aMOOOMAoGCCqGSM49BAMCMBUxEzARBgNVBAMMCmVJ
bnZvaWNpbmcwHhcNMjQwNjAyMTgyMzAzWhcNMjkwNjAxMjEwMDAwWjBtMQswCQYD
VQQGEwJTQTEWMBQGA1UECwwNUml5YWRoIEJyYW5jaDEmMCQGA1UECgwdTWF4aW11
bSBTcGVlZCBUZWNoIFN1cHBseSBMVEQxHjAcBgNVBAMMFVRTVFpBVENBLUNvZGUt
U2lnbmluZzBWMBAGByqGSM49AgEGBSuBBAAKA0IABLbljn74ujavJsbXdD7uFxTA
6BN2gjWRp8xZ4twC0nS3vX27W68SPX+L2Kin3WnjmM6zOeviM90Aur0AJ8Y65uSj
gcEwgb4wDAYDVR0TAQH/BAIwADCBrQYDVR0RBIGlMIGipIGfMIGcMTswOQYDVQQE
DDIxLVRTVHwyLVRTVHwzLWVkMjJmMWQ4LWU2YTItMTExOC05YjU4LWQ5YThmMTFl
NDQ1ZjEfMB0GCgmSJomT8ixkAQEMDzM5OTk5OTk5OTkwMDAwMzENMAsGA1UEDAwE
MDEwMDERMA8GA1UEGgwIUlJSRDI5MjkxGjAYBgNVBA8MEVN1cHBseSBhY3Rpdml0
aWVzMAoGCCqGSM49BAMCA0gAMEUCIEug8+13b1lyvBMgRMByzBWc7HTHSFjUFPz2
gHaIPXC2AiEArm0xW5GlOEnUWUHl0hCQ4snw46YqT+UZJqcyd8ydP3Q=
-----END CERTIFICATE-----`;

  // Load the unsigned XML
  const unsignedXmlDoc = new DOMParser().parseFromString(
    unsingedXml,
    "application/xml"
  );

  // Create a new XML signature object
  const signatureObj = new SignedXml(unsignedXmlDoc);

  // Set the signature properties
  signatureObj.signingKey = privateKey;
  signatureObj.keyInfoProvider = null;

  const x509Certificate = certificate.replace(/(\r\n|\n|\r)/gm, "");

  signatureObj.addReference(
    "//*[local-name(.)='Invoice']",
    [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/2001/10/xml-exc-c14n#",
    ],
    "http://www.w3.org/2001/04/xmlenc#sha256",
    "",
    "",
    "",
    "invoiceSignedData"
  );

  signatureObj.addReference(
    "#xadesSignedProperties",
    ["http://www.w3.org/2001/10/xml-exc-c14n#"],
    "http://www.w3.org/2001/04/xmlenc#sha256",
    "",
    "",
    "http://www.w3.org/2000/09/xmldsig#SignatureProperties"
  );

  // Compute the signature
  signatureObj.computeSignature();

  // Append the signature to the XML document
  const xmlSignature = signatureObj.getSignatureXml();
  const signatureElement = unsignedXmlDoc.importNode(xmlSignature, true);
  unsignedXmlDoc.documentElement.appendChild(signatureElement);

  // Append the X509Certificate to the KeyInfo element
  const keyInfoElement = signatureElement.getElementsByTagName("KeyInfo")[0];
  const x509DataElement = unsignedXmlDoc.createElementNS(
    "http://www.w3.org/2000/09/xmldsig#",
    "X509Data"
  );
  const x509CertificateElement = unsignedXmlDoc.createElementNS(
    "http://www.w3.org/2000/09/xmldsig#",
    "X509Certificate"
  );
  x509CertificateElement.textContent = x509Certificate;
  x509DataElement.appendChild(x509CertificateElement);
  keyInfoElement.appendChild(x509DataElement);

  // Get the signed XML
  const signedXml = new XMLSerializer().serializeToString(unsignedXmlDoc);
  console.log("signedXml in function:", signedXml);

  return signedXml;
};
