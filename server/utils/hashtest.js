// Import the crypto module (works in Node.js environment)
const crypto = require("crypto");
const { Module } = require("module");

// The provided XML content
const xmlContent = async (xml) => {
  const xmlContent = `${xml}`;

  console.log("templeate litteral xml in the hashtest:", xmlContent);
  const hashHex = crypto
    .createHash("sha256")
    .update(xmlContent, "utf8")
    .digest("hex");
  console.log("hashhex:", hashHex);

  // Convert the hash from hex to a buffer
  const hashBuffer = Buffer.from(hashHex, "hex");
  console.log("hashBuffer:", hashBuffer);

  // Convert the buffer to a Base64 string
  const hashBase64 = hashBuffer.toString("base64");
  return hashBase64;
};

// Create a SHA-256 hash of the XML content
// const hash = crypto
//   .createHash("sha256")
//   .update(xmlContent, "utf8")
//   .digest("hex");

// Output the hash

////////////////////////-----------------

// Create a SHA-256 hash of the XML content

// Convert the hash from hex to a buffer

// Output the Base64 encoded hash

module.exports = { xmlContent };
