"use client";

import { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchProducts } from "@/services/product/index";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const lowerSearch = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(lowerSearch) ||
        p.productId.toString().toLowerCase().includes(lowerSearch)
    );
  }, [products, searchTerm]);

  const totalPages =
    rowsPerPage === 0
      ? 1
      : Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));

  if (currentPage > totalPages) setCurrentPage(totalPages);

  const paginatedProducts = useMemo(() => {
    if (rowsPerPage === 0) return filteredProducts;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, currentPage, rowsPerPage]);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function handleRowsPerPageChange(e) {
    const value = e.target.value;
    setRowsPerPage(value === "all" ? 0 : Number(value));
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
    doc.text("Jl. Bendul Merisi No.148, Sidosermo, Kec. Wonocolo, Surabaya, Jawa Timur 60239", 14, 21);
    doc.text(
      `Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`,
      14,
      27
    );

    doc.setFontSize(16);
    doc.text("Laporan Data Produk", 14, 37);

    const tableColumn = ["Kode Produk", "Nama Produk", "Stok", "Harga"];
    const tableRows = products.map((product) => [
      product.productId,
      product.productName,
      `${product.stock ?? 0} pcs`,
      `Rp ${(product.price ?? 0).toLocaleString("id-ID")}`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
    });

    doc.save("laporan-produk.pdf");
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Product List</h1>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <select
            className="px-3 py-2 border-2 border-[#3F7F83] rounded-lg text-gray-700"
            value={rowsPerPage === 0 ? "all" : rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value="all">All rows</option>
          </select>
        </div>

        <div className="flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Search product..."
            className="w-[250px] px-4 py-2 border-2 text-gray-700 border-[#3F7F83] rounded-lg placeholder-gray-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <table className="min-w-full table-auto text-sm text-left bg-white rounded-2xl shadow-sm overflow-x-auto">
          <thead>
            <tr className="bg-[#3F7F83] text-white">
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2 w-full">Product Name</th>
              <th className="px-4 py-2 text-center">Stock</th>
              <th className="px-4 py-2 text-center">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No products found
                </td>
              </tr>
            )}

            {paginatedProducts.map((product) => (
              <tr
                key={product.productId}
                className="border-b bg-gray-50 hover:bg-gray-100"
              >
                <td className="px-4 py-2 text-gray-700 w-[120px]">
                  {product.productId}
                </td>

                <td className="px-4 py-2 text-gray-700">
                  {product.productName}
                </td>

                <td className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">
                  {`${product.stock ?? 0} pcs`}
                </td>

                <td className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">
                  {`Rp ${(product.price ?? 0).toLocaleString("id-ID")}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
