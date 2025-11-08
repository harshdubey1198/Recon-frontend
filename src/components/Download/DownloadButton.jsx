import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const DownloadButton = ({ data, columns, filename = "data" }) => {
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const downloadRef = useRef(null);

  // 🔹 Download CSV Function
  const downloadCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No data to download");
      return;
    }

    const headers = columns.map(col => col.label);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        columns.map(col => {
          const value = col.getValue ? col.getValue(row) : row[col.key];
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowDownloadDropdown(false);
  };

  // 🔹 Download XLSX Function
  const downloadXLSX = () => {
    if (!data || data.length === 0) {
      toast.error("No data to download");
      return;
    }

    // Create proper XLSX format with XML
    let xlsxContent = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:html="http://www.w3.org/TR/REC-html40">
        <Worksheet ss:Name="Sheet1">
          <Table>`;

    // Add header row
    xlsxContent += `<Row>`;
    columns.forEach(col => {
      xlsxContent += `<Cell><Data ss:Type="String">${col.label}</Data></Cell>`;
    });
    xlsxContent += `</Row>`;

    // Add data rows
    data.forEach(row => {
      xlsxContent += `<Row>`;
      columns.forEach(col => {
        const value = col.getValue ? col.getValue(row) : row[col.key];
        const isNumber = typeof value === 'number';
        const dataType = isNumber ? "Number" : "String";
        const cellValue = value !== null && value !== undefined ? value : "—";
        xlsxContent += `<Cell><Data ss:Type="${dataType}">${cellValue}</Data></Cell>`;
      });
      xlsxContent += `</Row>`;
    });

    xlsxContent += `</Table>
        </Worksheet>
      </Workbook>`;

    const blob = new Blob([xlsxContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowDownloadDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={downloadRef}>
      <button
        onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
        className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium"
      >
        <span>Download</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {showDownloadDropdown && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            onClick={downloadCSV}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            CSV
          </button>
          <button
            onClick={downloadXLSX}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm font-medium border-t border-gray-100"
          >
            XLSX
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;