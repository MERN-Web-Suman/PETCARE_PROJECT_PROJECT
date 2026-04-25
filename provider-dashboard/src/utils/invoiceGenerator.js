import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const M = {
  left: 18,
  right: 192,
  pageW: 210,
};

const orderIdPrefix = (order) => {
  const id = order?._id;
  if (!id) return "ORDER";
  const s = typeof id === "string" ? id : String(id);
  return s.substring(0, 8).toUpperCase();
};

const providerNameFromOrder = (order) => {
  const list = Array.isArray(order?.products) ? order.products : [];
  for (const item of list) {
    const p = item?.product;
    if (!p) continue;
    const pr = p.provider;
    if (pr && typeof pr === "object" && pr.name) return String(pr.name);
  }
  return "—";
};

const productDetailsCell = (item) => {
  const name = item?.product?.name || "Product";
  const desc = (item?.product?.description || "").trim();
  if (!desc) return name;
  const short = desc.length > 80 ? `${desc.slice(0, 77)}...` : desc;
  return `${name}\n${short}`;
};

/** City, State from fields, or last segments of address, else ZIP */
const getCityStateLine = (ship) => {
  const c = (ship.city || "").trim();
  const st = (ship.state || "").trim();
  if (c && st) return `${c}, ${st}`;
  if (c) return c;
  if (st) return st;
  const addr = (ship.address || "").trim();
  if (addr) {
    const parts = addr.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return parts.slice(-2).join(", ");
  }
  const z = (ship.zip || "").trim();
  if (z) return z;
  return "—";
};

export const generateInvoice = (order) => {
  if (!order) {
    console.error("generateInvoice: missing order");
    return;
  }

  try {
  const ship = order.shippingDetails || {};
  const products = Array.isArray(order.products) ? order.products : [];
  const providerName = providerNameFromOrder(order);
  const shipCustomerName = ship.name || order.user?.name || "—";
  const cityStateLine = getCityStateLine(ship);

  const doc = new jsPDF();

  const created = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = Number.isNaN(created.getTime())
    ? new Date().toLocaleString()
    : created.toLocaleString();

  // —— Premium header band + logo mark ——
  doc.setFillColor(67, 56, 202);
  doc.rect(0, 0, M.pageW, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("PetCare", M.left, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Super App · Premium pet care & supplies", M.left, 21);
  doc.text("123 Pet Street, Care City  ·  support@petcare.com", M.left, 27);

  // Logo mark (circle + monogram)
  doc.setFillColor(255, 255, 255);
  doc.circle(M.pageW - 26, 17, 11, "F");
  doc.setTextColor(67, 56, 202);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PC", M.pageW - 30.5, 20.5);

  // —— Title + meta strip ——
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", M.pageW / 2, 46, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Official order receipt for your records", M.pageW / 2, 53, { align: "center" });

  let y = 60;

  // Provider + invoice meta (two columns)
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.text("Provider Name:", M.left, y);
  doc.setFont("helvetica", "normal");
  doc.text(providerName, M.left + 38, y);

  const metaX = 118;
  const metaW = M.right - metaX;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(metaX, y - 5, metaW, 28, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Order ID", metaX + 4, y + 1);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(orderIdPrefix(order), metaX + 40, y + 1);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Billing Date", metaX + 4, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const tinyDate = created.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  doc.text(tinyDate, metaX + 40, y + 9);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Status", metaX + 4, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(String(order.status ?? "—"), metaX + 40, y + 17);

  const shipBoxTop = 88;
  const labelX = M.left + 4;
  const valueX = M.left + 46;
  const valueMaxW = 108 - (valueX - M.left) - 8;

  const shipRows = [
    ["Customer Name", shipCustomerName],
    ["Full Address", ship.address || "—"],
    ["City, State", cityStateLine],
    ["Contact Number", ship.phone || "—"],
  ];

  let shipContentH = 14;
  doc.setFontSize(9);
  for (const [, raw] of shipRows) {
    const lines = doc.splitTextToSize(String(raw), valueMaxW);
    shipContentH += Math.max(6, lines.length * 4.8);
  }
  shipContentH += 8;
  const shipBoxH = Math.max(56, shipContentH);
  const payBoxW = M.right - 118;

  // —— Ship To (left-aligned, structured) ——
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(M.left - 2, shipBoxTop, 108, shipBoxH, 3, 3, "FD");

  doc.setTextColor(67, 56, 202);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Ship To:", M.left + 2, shipBoxTop + 8);

  let shipInnerY = shipBoxTop + 18;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  for (const [label, raw] of shipRows) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, labelX, shipInnerY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(String(raw), valueMaxW);
    doc.text(lines, valueX, shipInnerY);
    shipInnerY += Math.max(6, lines.length * 4.8);
  }

  y = shipBoxTop + shipBoxH + 10;

  // Payment (right column, same height as ship box)
  const payBoxY = shipBoxTop;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(118, payBoxY, payBoxW, shipBoxH, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(67, 56, 202);
  doc.text("Payment", 122, payBoxY + 8);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Method:", 122, payBoxY + 20);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const payMethodLines = doc.splitTextToSize(order.paymentMethod || "—", payBoxW - 12);
  doc.text(payMethodLines, 122, payBoxY + 28);
  if (order.paymentIntentId && typeof order.paymentIntentId === "string") {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Ref: ${order.paymentIntentId.substring(0, 18)}…`, 122, payBoxY + 28 + payMethodLines.length * 5);
  }

  const tableStartY = y;

  // Items Table
  const tableColumn = ["Product Details", "Brand", "Quantity", "Price", "Subtotal"];
  const tableRows = [];

  products.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const productData = [
      productDetailsCell(item),
      item.product?.brand || "—",
      String(qty),
      `$${price.toFixed(2)}`,
      `$${(price * qty).toFixed(2)}`,
    ];
    tableRows.push(productData);
  });

  if (tableRows.length === 0) {
    tableRows.push(["—", "—", "0", "$0.00", "$0.00"]);
  }

  autoTable(doc, {
    startY: tableStartY,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    margin: { left: M.left, right: M.left },
    headStyles: {
      fillColor: [67, 56, 202],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      textColor: [30, 41, 59],
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 58, valign: "top" },
      1: { cellWidth: 28, valign: "middle" },
      2: { cellWidth: 22, halign: "center", valign: "middle" },
      3: { cellWidth: 24, halign: "right", valign: "middle" },
      4: { cellWidth: 28, halign: "right", valign: "middle" },
    },
    styles: { lineColor: [226, 232, 240], lineWidth: 0.1 },
  });

  const lastY = doc.lastAutoTable?.finalY;
  let finalY = (typeof lastY === "number" ? lastY : tableStartY) + 6;

  const subtotal = products.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity) || 0), 0);
  const delivery = Number(order.deliveryCharges) || 0;
  const discount = Number(order.discount) || 0;
  
  const total = Number(order.totalAmount);
  const totalStr = Number.isFinite(total) ? total.toFixed(2) : String(order.totalAmount ?? "0");

  // Price Breakdown
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", M.right - 58, finalY);
  doc.text(`$${subtotal.toFixed(2)}`, M.right - 4, finalY, { align: "right" });
  finalY += 6;
  doc.text("Delivery Charges:", M.right - 58, finalY);
  doc.text(`$${delivery.toFixed(2)}`, M.right - 4, finalY, { align: "right" });
  finalY += 6;
  doc.text("Discount (if any):", M.right - 58, finalY);
  doc.text(`$${discount.toFixed(2)}`, M.right - 4, finalY, { align: "right" });
  finalY += 6;

  // Final Total row
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(241, 245, 249);
  doc.rect(M.left, finalY, M.right - M.left, 14, "FD");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(67, 56, 202);
  doc.text("Final Total:", M.right - 58, finalY + 9);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${totalStr}`, M.right - 4, finalY + 9, { align: "right" });
  
  finalY += 20;

  // Additional Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Order Details:", M.left, finalY);
  finalY += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Provider notes: ${order.providerNotes || "N/A"}`, M.left, finalY);
  finalY += 6;
  
  // Use a text fallback for heart since jsPDF helvetica doesn't support unicode like ❤️
  doc.text(`Notes / Message: Thank you for shopping with us <3`, M.left, finalY);
  finalY += 8;
  
  // QR Code placeholder
  const qrSize = 24;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M.left, finalY, qrSize, qrSize, 2, 2, "FD");
  
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("QR Code", M.left + (qrSize / 2), finalY + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("(Pro Feature)", M.left + (qrSize / 2), finalY + 14, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for choosing PetCare — we appreciate your trust.",
    M.pageW / 2,
    285,
    { align: "center" }
  );

  doc.save(`Invoice_${orderIdPrefix(order)}.pdf`);
  } catch (err) {
    console.error("Invoice generation failed:", err);
    alert("Could not download the invoice. Please try again or contact support.");
  }
};
