const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Ensure uploads/invoices directory exists
const invoicesDir = path.join(__dirname, "../uploads/invoices");
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

/**
 * Generate an invoice PDF and save it to disk
 * @param {Object} order - Order object with all invoice details
 * @param {Array} items - Order items with product details
 * @returns {Object} - Object containing filePath and fileName
 */
const generateInvoicePDF = async (order, items) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${order.invoice_no}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      // Create a new PDF document with premium spacing
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      // Create write stream
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ===== HEADER SECTION =====
      // Left side: Brand name and tagline
      doc.fontSize(28).font("Helvetica-Bold").fillColor("#333333").text("TÉRA", 50, 50);
      doc.fontSize(28).font("Helvetica-Bold").fillColor("#C8A574").text("LIVING", 180, 50);
      doc.fillColor("#333333");
      doc.fontSize(11).font("Helvetica").fillColor("#666666").text("PREMIUM FURNITURE & DECOR", 50, 85);
      
      // Right side: Invoice info (aligned to right)
      const rightX = 545;
      doc.fontSize(9).font("Helvetica").fillColor("#999999").text("Invoice Number", 350, 52, { align: "right", width: 195 });
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#333333").text(order.invoice_no, 350, 65, { align: "right", width: 195 });
      
      doc.fontSize(9).font("Helvetica").fillColor("#999999").text("Invoice Date", 350, 88, { align: "right", width: 195 });
      doc.fontSize(11).font("Helvetica").fillColor("#333333").text(new Date(order.order_date).toLocaleDateString("en-US"), 350, 101, { align: "right", width: 195 });

      // Subtle top border
      doc.strokeColor("#E8E8E8").lineWidth(1).moveTo(50, 125).lineTo(545, 125).stroke();

      // ===== CUSTOMER SECTION =====
      let yPos = 140;

      // Customer Information (Left Column)
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#666666").text("CUSTOMER DETAILS", 50, yPos);
      
      // Delivery Address (Right Column)
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#666666").text("DELIVERY ADDRESS", 310, yPos);
      yPos += 15;

      // Light background for customer info
      doc.rect(50, yPos, 235, 75).fillAndStroke("#FAFAFA", "#E8E8E8");
      doc.fillColor("#333333");

      doc.fontSize(8).font("Helvetica").fillColor("#999999").text("Name", 60, yPos + 6);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#333333").text(order.customer_name, 60, yPos + 18);

      doc.fontSize(8).font("Helvetica").fillColor("#999999").text("Phone", 60, yPos + 33);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#333333").text(order.customer_phone, 60, yPos + 45);

      if (order.customer_email) {
        doc.fontSize(8).font("Helvetica").fillColor("#999999").text("Email", 60, yPos + 58);
        doc.fontSize(9).font("Helvetica").fillColor("#C8A574").text(order.customer_email, 60, yPos + 68, { width: 165 });
      }

      // Light background for address
      doc.rect(310, yPos, 235, 75).fillAndStroke("#FAFAFA", "#E8E8E8");
      doc.fillColor("#333333");

      doc.fontSize(10).font("Helvetica").fillColor("#333333").text(order.delivery_address, 320, yPos + 10, {
        width: 215,
        height: 60,
        align: "left",
      });

      yPos += 85;

      // ===== ORDER ITEMS TABLE =====
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#666666").text("ORDER ITEMS", 50, yPos);
      yPos += 14;

      // Table header with soft background
      const headerY = yPos;
      doc.rect(50, headerY, 495, 22).fillAndStroke("#F0EDE5", "#E8E8E8");
      
      const col1 = 60;      // Product name starts at 60
      const col2 = 320;     // Qty column (centered in 30px space)
      const col3 = 395;     // Unit Price (centered in 100px space)
      const col4 = 535;     // Total (right-aligned at right edge)

      doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333");
      doc.text("Product", col1, headerY + 6);
      doc.text("Qty", 305, headerY + 6, { width: 30, align: "center" });
      doc.text("Unit Price", 345, headerY + 6, { width: 100, align: "center" });
      doc.text("Total", 455, headerY + 6, { width: 90, align: "right" });

      yPos = headerY + 25;

      // Table rows
      let rowIndex = 0;
      items.forEach((item) => {
        const productName = item.Product ? item.Product.name : "Product";
        const quantity = item.quantity;
        const unitPrice = parseFloat(item.unit_price).toFixed(2);
        const lineTotal = (parseFloat(item.unit_price) * item.quantity).toFixed(2);

        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc.rect(50, yPos - 2, 495, 26).fill("#FAFAFA");
        }

        doc.fontSize(9).font("Helvetica").fillColor("#333333");
        doc.text(productName.substring(0, 40), col1, yPos + 3, { width: 235 });
        doc.text(quantity.toString(), 305, yPos + 3, { width: 30, align: "center" });
        doc.text(`LKR ${unitPrice}`, 345, yPos + 3, { width: 100, align: "center" });
        doc.font("Helvetica-Bold").text(`LKR ${lineTotal}`, 455, yPos + 3, { width: 90, align: "right" });

        yPos += 26;
        rowIndex++;
      });

      // Subtle divider
      doc.strokeColor("#E8E8E8").lineWidth(1).moveTo(50, yPos).lineTo(545, yPos).stroke();
      yPos += 15;

      // ===== TOTALS SECTION =====
      const totalsBoxStart = 340;
      const totalsBoxWidth = 195;
      const totalsLabelX = totalsBoxStart + 10;
      const totalsValueX = totalsBoxStart + totalsBoxWidth;

      doc.fontSize(9).font("Helvetica").fillColor("#666666");
      doc.text("Subtotal", totalsLabelX, yPos, { width: 80, align: "left" });
      doc.font("Helvetica").fillColor("#333333").text(`LKR ${parseFloat(order.subtotal).toFixed(2)}`, totalsLabelX + 85, yPos, { width: 100, align: "right" });

      yPos += 16;
      doc.fontSize(9).font("Helvetica").fillColor("#666666");
      doc.text("Shipping", totalsLabelX, yPos, { width: 80, align: "left" });
      doc.font("Helvetica").fillColor("#333333").text(parseFloat(order.shipping) === 0 ? "FREE" : `LKR ${parseFloat(order.shipping).toFixed(2)}`, totalsLabelX + 85, yPos, { width: 100, align: "right" });

      yPos += 16;

      if (parseFloat(order.discount) > 0) {
        doc.fontSize(9).font("Helvetica").fillColor("#666666");
        doc.text("Discount", totalsLabelX, yPos, { width: 80, align: "left" });
        doc.font("Helvetica").fillColor("#C24435").text(`-LKR ${parseFloat(order.discount).toFixed(2)}`, totalsLabelX + 85, yPos, { width: 100, align: "right" });
        yPos += 16;
      }

      // Grand Total - Premium accent
      yPos += 4;
      const totalBoxY = yPos - 6;
      doc.rect(totalsBoxStart, totalBoxY, totalsBoxWidth, 38).fillAndStroke("#C8A574", "#C8A574");
      
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#FFFFFF");
      doc.text("Grand Total", totalsLabelX, yPos + 4, { width: 70, align: "left" });
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#FFFFFF");
      doc.text(`LKR ${parseFloat(order.total_price).toFixed(2)}`, totalsBoxStart + 10, yPos + 18, { width: totalsBoxWidth - 20, align: "right" });

      // ===== PAYMENT SECTION =====
      yPos += 48;
      
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#666666").text("PAYMENT DETAILS", 50, yPos);
      yPos += 15;

      // Payment Method Badge
      doc.rect(50, yPos, 235, 35).fillAndStroke("#E8F4F8", "#B8D4E0");
      doc.fontSize(8).font("Helvetica").fillColor("#666666").text("Payment Method", 60, yPos + 6);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#333333").text(
        order.payment_method === "CARD" ? "Credit / Debit Card" : "Cash on Delivery",
        60,
        yPos + 18
      );

      // Payment Status Badge
      const statusColor = order.payment_status === "Completed" ? "#D4F1E4" : "#FFF4D6";
      const statusBorder = order.payment_status === "Completed" ? "#8ECAA8" : "#F0D97B";
      const statusText = order.payment_status === "Completed" ? "#1B7D4C" : "#9B7D1E";
      
      doc.rect(310, yPos, 235, 35).fillAndStroke(statusColor, statusBorder);
      doc.fontSize(8).font("Helvetica").fillColor(statusText).text("Payment Status", 320, yPos + 6);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(statusText).text(order.payment_status, 320, yPos + 18);

      // ===== FOOTER =====
      yPos += 50;
      // Ensure footer doesn't exceed page
      const footerY = Math.min(yPos, 720);
      
      doc.strokeColor("#E8E8E8").lineWidth(1).moveTo(50, footerY).lineTo(545, footerY).stroke();
      
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#333333").text("Thank you for your purchase!", 50, footerY + 12, { align: "center" });
      doc.fontSize(8).font("Helvetica").fillColor("#999999").text("Grosvenor Furniture | Phone: +94 765661371 | Email: info@grosvenorfurniture.com", 50, footerY + 28, { align: "center", width: 495 });
      doc.fontSize(7).font("Helvetica").fillColor("#CCCCCC").text("Please keep this invoice for your records.", 50, footerY + 42, { align: "center" });

      // Finalize the PDF
      doc.end();

      stream.on("finish", () => {
        resolve({
          filePath: filePath,
          fileName: fileName,
          invoiceNo: order.invoice_no,
        });
      });

      stream.on("error", (err) => {
        reject(err);
      });

      doc.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get the file path for an invoice PDF
 * @param {String} invoiceNo - Invoice number
 * @returns {String} - Full path to the PDF file
 */
const getInvoiceFilePath = (invoiceNo) => {
  return path.join(invoicesDir, `${invoiceNo}.pdf`);
};

/**
 * Check if an invoice PDF exists
 * @param {String} invoiceNo - Invoice number
 * @returns {Boolean} - True if file exists
 */
const invoiceExists = (invoiceNo) => {
  const filePath = getInvoiceFilePath(invoiceNo);
  return fs.existsSync(filePath);
};

/**
 * Delete an invoice PDF file
 * @param {String} invoiceNo - Invoice number
 * @returns {Promise<Boolean>} - True if deleted successfully
 */
const deleteInvoice = async (invoiceNo) => {
  return new Promise((resolve, reject) => {
    const filePath = getInvoiceFilePath(invoiceNo);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    } else {
      resolve(false);
    }
  });
};

module.exports = {
  generateInvoicePDF,
  getInvoiceFilePath,
  invoiceExists,
  deleteInvoice,
  invoicesDir,
};
