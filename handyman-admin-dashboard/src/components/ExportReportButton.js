import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ExportReportButton({ data, columns, fileName = "Report" }) {

  const exportToPDF = () => {
  const doc = new jsPDF({ orientation: "landscape" });

  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map((row, rowIdx) =>
      columns.map(col =>
        typeof col.accessor === "function"
          ? col.accessor(row, rowIdx)
          : row[col.accessor] ?? ""
      )
    ),
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
      valign: "middle",
      halign: "left",
    },
    headStyles: {
      fillColor: [30, 108, 179],
      textColor: 255,
      fontSize: 9,
      halign: "center",
    },
    // Manually control problematic columns
    columnStyles: {
      0: { cellWidth: 10 },      // #
      1: { cellWidth: 22 },      // Name
      2: { cellWidth: 25 },      // Phone
      3: { cellWidth: 45 },      // Address (was way too narrow!)
      4: { cellWidth: 22 },      // ID Card
      5: { cellWidth: 70 },      // Certificates (extra wide for URL)
      6: { cellWidth: 17 },      // Status
      7: { cellWidth: 25 },      // Submission Date
    },
    margin: { left: 8, right: 8 },
    startY: 20,
    pageBreak: "auto",
    showHead: "everyPage",
  });

  doc.save(`${fileName}.pdf`);
};


  const exportToExcel = () => {
    const wsData = [
      columns.map(col => col.header),
      ...data.map((row, rowIdx) =>
        columns.map(col =>
          typeof col.accessor === "function"
            ? col.accessor(row, rowIdx)
            : row[col.accessor] ?? ""
        )
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${fileName}.xlsx`);
  };

  return (
    <Dropdown className="d-flex align-items-center h-100 mb-0 mt-0">
      <Dropdown.Toggle as={Button} variant="outline-primary">
        Export Report
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={exportToPDF}>Export to PDF</Dropdown.Item>
        <Dropdown.Item onClick={exportToExcel}>Export to Excel</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ExportReportButton;
