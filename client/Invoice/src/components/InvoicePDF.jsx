/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  qrCode: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    margin: "10 0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    alignItems: "center",
    height: 24,
    fontSize: 12,
    textAlign: "center",
  },
  column: {
    flexDirection: "column",
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableCellHeader: {
    margin: "auto",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    margin: "auto",
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

const InvoicePDF = ({ invoiceData, qrCodeUrl }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Debit Note</Text>
          <Text style={styles.subtitle}>
            Invoice Reference Number: {invoiceData.ID}
          </Text>
        </View>
        <Image style={styles.qrCode} src={qrCodeUrl} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seller Information</Text>
        <Text style={styles.text}>
          Name:{" "}
          {
            invoiceData.AccountingSupplierParty.PartyLegalEntity
              .RegistrationName
          }
        </Text>
        <Text style={styles.text}>
          VAT Number:{" "}
          {invoiceData.AccountingSupplierParty.PartyTaxScheme.CompanyID}
        </Text>
        <Text style={styles.text}>
          Address:{" "}
          {invoiceData.AccountingSupplierParty.PostalAddress.StreetName},{" "}
          {invoiceData.AccountingSupplierParty.PostalAddress.BuildingNumber}
        </Text>
        <Text style={styles.text}>
          {invoiceData.AccountingSupplierParty.PostalAddress.CityName},{" "}
          {invoiceData.AccountingSupplierParty.PostalAddress.PostalZone}
        </Text>
        <Text style={styles.text}>
          {
            invoiceData.AccountingSupplierParty.PostalAddress.Country
              .IdentificationCode
          }
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <Text style={styles.text}>Issue Date: {invoiceData.IssueDate}</Text>
        <Text style={styles.text}>Due Date: {invoiceData.DueDate}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Items</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Unit Price</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>
          {invoiceData.InvoiceLine.map((line, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{line.Item.Name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {line.InvoicedQuantity.quantity}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {line.Price.PriceAmount} SAR
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {line.LineExtensionAmount} SAR
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.row}>
          <Text style={styles.text}>Subtotal:</Text>
          <Text style={styles.text}>
            {invoiceData.LegalMonetaryTotal.TaxExclusiveAmount} SAR
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>
            VAT ({invoiceData.TaxTotal[0].TaxSubtotal.TaxCategory.Percent}%):
          </Text>
          <Text style={styles.text}>
            {invoiceData.TaxTotal[0].TaxAmount} SAR
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Total:</Text>
          <Text style={styles.text}>
            {invoiceData.LegalMonetaryTotal.TaxInclusiveAmount} SAR
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>
          This is an electronically generated document and does not require a
          signature.
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
