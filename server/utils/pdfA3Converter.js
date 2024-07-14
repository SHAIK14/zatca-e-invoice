// utils/pdfA3Converter.js
const {
  PDFDocument,
  PDFName,
  PDFHexString,
  PDFString,
  StandardFonts,
  PDFDict,
} = require("pdf-lib");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

const addMetadataToDoc = (pdfDoc, options) => {
  const metadataXML = `
  <?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
    <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26        ">
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:format>application/pdf</dc:format>
          <dc:creator>
            <rdf:Seq>
              <rdf:li>${options.author}</rdf:li>
            </rdf:Seq>
          </dc:creator>
          <dc:title>
            <rdf:Alt>
                <rdf:li xml:lang="x-default">${options.title}</rdf:li>
            </rdf:Alt>
          </dc:title>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
          <xmp:CreatorTool>PDF-Lib</xmp:CreatorTool>
          <xmp:CreateDate>${new Date().toISOString()}</xmp:CreateDate>
          <xmp:ModifyDate>${new Date().toISOString()}</xmp:ModifyDate>
          <xmp:MetadataDate>${new Date().toISOString()}</xmp:MetadataDate>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
          <pdf:Producer>PDF-Lib</pdf:Producer>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
          <pdfaid:part>3</pdfaid:part>
          <pdfaid:conformance>B</pdfaid:conformance>
        </rdf:Description>
        <rdf:Description rdf:about="" xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/">
          <pdfuaid:part>1</pdfuaid:part>
        </rdf:Description>
      </rdf:RDF>
    </x:xmpmeta>
  <?xpacket end="w"?>
  `.trim();

  const metadataStream = pdfDoc.context.stream(metadataXML, {
    Type: "Metadata",
    Subtype: "XML",
    Length: metadataXML.length,
  });

  const metadataStreamRef = pdfDoc.context.register(metadataStream);
  pdfDoc.catalog.set(PDFName.of("Metadata"), metadataStreamRef);
};

async function embedAllFonts(pdfDoc) {
  const pages = pdfDoc.getPages();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pages) {
    const resources = page.node.Resources();
    if (resources) {
      const fontDict = resources.lookup(PDFName.of("Font"));
      if (fontDict instanceof PDFDict) {
        for (const [name, font] of Object.entries(fontDict.dict)) {
          if (font instanceof PDFName) {
            const newFont = pdfDoc.context.obj({
              Type: "Font",
              Subtype: "Type0",
              BaseFont: helveticaFont.name,
              Encoding: "Identity-H",
              DescendantFonts: [
                pdfDoc.context.obj({
                  Type: "Font",
                  Subtype: "CIDFontType2",
                  BaseFont: helveticaFont.name,
                  CIDToGIDMap: "Identity",
                  CIDSystemInfo: {
                    Registry: "Adobe",
                    Ordering: "Identity",
                    Supplement: 0,
                  },
                  FontDescriptor: helveticaFont.ref,
                }),
              ],
            });
            fontDict.set(PDFName.of(name), newFont);
          }
        }
      }
    }
  }
}

const convertToPDFA3 = async (pdfBuffer, xmlString, options) => {
  try {
    let pdfDoc = await PDFDocument.load(pdfBuffer);

    pdfDoc.catalog.set(PDFName.of("Version"), PDFName.of("1.7"));

    addMetadataToDoc(pdfDoc, options);

    const hash = crypto
      .createHash("sha256")
      .update("DOCUMENTID" + new Date().toISOString())
      .digest();
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const permanentDocumentId = PDFHexString.of(hashHex);
    const changingDocumentID = permanentDocumentId;
    pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([
      permanentDocumentId,
      changingDocumentID,
    ]);

    const rootref = pdfDoc.context.obj({ Marked: true });
    pdfDoc.catalog.set(PDFName.of("MarkInfo"), rootref);

    const structTreedata = pdfDoc.context.obj({
      Type: PDFName.of("StructTreeRoot"),
    });
    const structTreeref = pdfDoc.context.register(structTreedata);
    pdfDoc.catalog.set(PDFName.of("StructTreeRoot"), structTreeref);

    // Keep OutputIntent
    const iccFilePath = path.join(__dirname, "..", "assets", "sRGB2014.icc");
    const profile = await fs.readFile(iccFilePath);
    const profileStream = pdfDoc.context.stream(profile, {
      Length: profile.length,
    });
    const profileStreamRef = pdfDoc.context.register(profileStream);

    const outputIntent = pdfDoc.context.obj({
      Type: PDFName.of("OutputIntent"),
      S: PDFName.of("GTS_PDFA1"),
      OutputConditionIdentifier: PDFString.of("sRGB IEC61966-2.1"),
      Info: PDFString.of("sRGB IEC61966-2.1"),
      RegistryName: PDFString.of("http://www.color.org"),
      DestOutputProfile: profileStreamRef,
    });

    const outputIntentRef = pdfDoc.context.register(outputIntent);
    pdfDoc.catalog.set(
      PDFName.of("OutputIntents"),
      pdfDoc.context.obj([outputIntentRef])
    );

    // Attach XML file
    const xmlBytes = Buffer.from(xmlString, "utf-8");
    await pdfDoc.attach(xmlBytes, "attachment.xml", {
      mimeType: "application/xml",
      description: "Attached XML file",
      creationDate: new Date(),
      modificationDate: new Date(),
      afRelationship: "Alternative",
    });

    await embedAllFonts(pdfDoc);

    // Set the N value to 3 for PDF/A-3b compliance
    const catalog = pdfDoc.catalog;
    const names = catalog.get(PDFName.of("Names"));
    if (names instanceof PDFDict) {
      const embeddedFiles = names.get(PDFName.of("EmbeddedFiles"));
      if (embeddedFiles instanceof PDFDict) {
        embeddedFiles.set(PDFName.of("N"), pdfDoc.context.obj(3));
      }
    }

    // Add Lang entry to the document catalog for PDF/UA compliance
    pdfDoc.catalog.set(PDFName.of("Lang"), PDFString.of("en-US"));

    // Set ViewerPreferences for PDF/UA compliance
    const viewerPreferences = pdfDoc.context.obj({
      DisplayDocTitle: true,
    });
    pdfDoc.catalog.set(PDFName.of("ViewerPreferences"), viewerPreferences);

    const pdfA3Bytes = await pdfDoc.save({ useObjectStreams: false });
    return Buffer.from(pdfA3Bytes);
  } catch (error) {
    throw error;
  }
};

module.exports = { convertToPDFA3 };
