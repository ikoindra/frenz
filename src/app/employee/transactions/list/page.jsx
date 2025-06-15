"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchSales } from "@/services/sale";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Sales() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);

  useEffect(() => {
    async function loadSales() {
      setLoading(true);
      try {
        const data = await fetchSales();
        data.sort((a, b) => a.id - b.id);
        setSalesData(data);
      } catch (error) {
        console.error("Error loading sales:", error);
        toast.error("Failed to load sales data");
      } finally {
        setLoading(false);
      }
    }
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    let filtered = salesData;

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.invoice.toLowerCase().includes(lowerSearch) ||
          item.employeeId.toLowerCase().includes(lowerSearch) ||
          item.id.toString().toLowerCase().includes(lowerSearch)
      );
    }
    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);

        // fromDate at start of day
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        if (fromDate) fromDate.setHours(0, 0, 0, 0);

        // toDate at end of day
        const toDate = dateTo ? new Date(dateTo) : null;
        if (toDate) toDate.setHours(23, 59, 59, 999);

        const matchesDateFrom = fromDate ? itemDate >= fromDate : true;
        const matchesDateTo = toDate ? itemDate <= toDate : true;

        return matchesDateFrom && matchesDateTo;
      });
    }

    return filtered;
  }, [salesData, searchTerm, dateFrom, dateTo]);

  const totalPages =
    rowsPerPage === 0
      ? 1
      : Math.max(1, Math.ceil(filteredSales.length / rowsPerPage));

  if (currentPage > totalPages) setCurrentPage(totalPages);

  const paginatedSales = useMemo(() => {
    if (rowsPerPage === 0) return filteredSales;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSales.slice(start, start + rowsPerPage);
  }, [filteredSales, currentPage, rowsPerPage]);

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function handleRowsPerPageChange(e) {
    const value = e.target.value;
    setRowsPerPage(value === "all" ? 0 : Number(value));
    setCurrentPage(1);
  }

  function handleDateFromChange(e) {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  }

  function handleDateToChange(e) {
    setDateTo(e.target.value);
    setCurrentPage(1);
  }

  function handlePreviousPage() {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }

  function handleNextPage() {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }

  function handleExportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("FRENZ BENDUL MERISI", 14, 15);
    doc.setFontSize(10);
    doc.text("Jl. Bendul Merisi No.148, Sidosermo, Kec. Wonocolo, Surabaya, Jawa Timur 60239", 14, 21);
    doc.text(
      `Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`,
      14,
      27
    );

    // Add date range info if filters are applied
    if (dateFrom || dateTo) {
      const fromText = dateFrom
        ? new Date(dateFrom).toLocaleDateString("id-ID")
        : "Awal";
      const toText = dateTo
        ? new Date(dateTo).toLocaleDateString("id-ID")
        : "Akhir";
      doc.text(`Periode: ${fromText} - ${toText}`, 14, 33);
    }

    doc.setFontSize(16);
    doc.text("Laporan Riwayat Penjualan", 14, dateFrom || dateTo ? 43 : 37);

    const tableColumn = [
      "ID",
      "Invoice",
      "ID Karyawan",
      "Tanggal",
      "Total",
      "Metode",
    ];

    // Prepare table rows
    const tableRows = paginatedSales.map((sale) => [
      sale.id,
      sale.invoice,
      sale.employeeId,
      formatDate(sale.date),
      `Rp ${(sale.total ?? 0).toLocaleString("id-ID")}`,
      sale.method,
    ]);

    // Calculate total amount
    const totalAmount = paginatedSales.reduce(
      (sum, sale) => sum + (sale.total ?? 0),
      0
    );

    // Add total row
    tableRows.push([
      "", // Empty ID
      "", // Empty Invoice
      "", // Empty Employee ID
      "Total:", // Label in Date column
      `Rp ${totalAmount.toLocaleString("id-ID")}`, // Total amount
      "", // Empty Method
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: dateFrom || dateTo ? 51 : 45,
    });

    doc.save("laporan-penjualan.pdf");
    toast.success("PDF exported successfully");
  }

  function clearFilters() {
    console.log("clearFilters called");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    toast.success("Filters cleared");
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Sales History</h1>
      </div>

      {/* Top Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border-2 border-[#3F7F83] rounded-lg text-gray-700"
            value={rowsPerPage === 0 ? "all" : rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value="all">All rows</option>
          </select>

          <input
            type="text"
            placeholder="Search sales..."
            className="w-[200px] px-4 py-2 border-2 text-gray-700 border-[#3F7F83] rounded-lg placeholder-gray-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Date Range:</span>
          <input
            type="date"
            className="px-3 py-2 border-2 border-[#3F7F83] rounded-lg text-gray-700"
            value={dateFrom}
            onChange={handleDateFromChange}
          />
          <span className="text-gray-700">to</span>
          <input
            type="date"
            className="px-3 py-2 border-2 border-[#3F7F83] rounded-lg text-gray-700"
            value={dateTo}
            onChange={handleDateToChange}
          />
          {(dateFrom || dateTo || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <table className="min-w-full table-auto text-sm text-left bg-white rounded-2xl shadow-sm overflow-x-auto">
          <thead>
            <tr className="bg-[#3F7F83] text-white">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2 w-[200px]">Employee ID</th>
              <th className="px-4 py-2 w-[180px]">Date</th>
              <th className="px-4 py-2 text-center w-[150px]">Total</th>
              <th className="px-4 py-2 text-center w-[120px]">Method</th>
              <th className="px-4 py-2 text-center w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* No Data */}
            {paginatedSales.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No sales data found
                </td>
              </tr>
            )}

            {/* Sales Data */}
            {paginatedSales.map((transaction, index) => (
              <tr
                key={transaction.id || index}
                className="border-b bg-gray-50 hover:bg-gray-100"
              >
                <td className="px-4 py-2 text-gray-700 w-[120px]">
                  {transaction.id}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {transaction.invoice}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {transaction.employeeId}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">
                  Rp {(transaction.total ?? 0).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-2 text-center text-gray-700">
                  {transaction.method}
                </td>
                <td className="px-4 py-2 text-center">
                  <Link
                    href={`/employee/transactions/detail/${transaction.id}`}
                  >
                    <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                      Detail
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {/* Total Row */}
            {paginatedSales.length > 0 && (
              <tr
                className="font-semibold"
                style={{ backgroundColor: "#E6F1F1", color: "#2B5658" }}
              >
                <td colSpan="4" className="px-4 py-2 text-right">
                  Total:
                </td>
                <td className="px-4 py-2 text-center">
                  Rp{" "}
                  {paginatedSales
                    .reduce((sum, sale) => sum + (sale.total ?? 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td colSpan="2"></td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bottom Controls */}
        <div className="flex justify-between items-center space-x-2 font-semibold text-gray-700">
          <button
            onClick={handleExportPDF}
            className="w-[150px] px-4 py-2 border bg-[#5A8F91] text-white rounded-lg hover:bg-[#6BA9AC] transition"
          >
            Export PDF
          </button>

          <div className="flex items-center space-x-3 text-sm font-semibold text-gray-700">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#5A8F91] text-white rounded-lg hover:bg-[#6BA9AC] disabled:bg-gray-300 disabled:text-gray-500 transition"
            >
              Previous
            </button>

            <span className="px-2 text-gray-800">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#5A8F91] text-white rounded-lg hover:bg-[#6BA9AC] disabled:bg-gray-300 disabled:text-gray-500 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
