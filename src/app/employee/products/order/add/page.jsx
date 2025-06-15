"use client";

import { useState, useEffect } from "react";

const products = [
  { id: 1, name: "TEMP GLASS IP 11", stock: 15 },
  { id: 2, name: "TEMP GLASS IP 11 PRO MAX", stock: 8 },
  { id: 3, name: "TG BLUE CLR IP 11", stock: 12 },
  { id: 4, name: "CASE PIC MATTE IP 11", stock: 20 },
];

export default function AddOrder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setEmployeeId("EMP123456");
    setCurrentDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.length > 0) {
      const results = products.filter((p) =>
        p.name.toLowerCase().includes(term)
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleProductChange = (productId, quantity) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.id === productId);
      if (existing) {
        if (quantity > 0) {
          return prev.map((p) => (p.id === productId ? { ...p, quantity } : p));
        } else {
          return prev.filter((p) => p.id !== productId);
        }
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      employeeId,
      date: currentDate,
      selectedProducts,
    });
    alert("Order submitted! Check console for data.");
  };

  const totalOrdered = selectedProducts.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-bold text-[#2B5658]">Tambah Order Barang</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#2B5658] font-semibold mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-[#2B5658]"
            />
          </div>
          <div>
            <label className="block text-[#2B5658] font-semibold mb-1">
              Tanggal Order
            </label>
            <input
              type="date"
              value={currentDate}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-[#2B5658]"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div>
          <label className="block text-[#2B5658] font-semibold mb-1">
            Cari Produk
          </label>
          <input
            type="text"
            placeholder="Contoh: IP 11"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded text-gray-800"
          />
        </div>

        {/* Total Products */}
        <p className="text-sm text-[#2B5658]">
          Total Produk Tersedia: {products.length}
        </p>

        {/* Product Search Results */}
        {filteredProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#2B5658]">
              Hasil Pencarian:
            </h2>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between border-b py-2"
              >
                <div className="text-sm text-[#2B5658]">
                  <strong>{product.name}</strong>
                  <br />
                  ID: {product.id} | Stok: {product.stock}
                </div>
                <input
                  type="number"
                  min="0"
                  max={product.stock}
                  placeholder="Qty"
                  onChange={(e) =>
                    handleProductChange(
                      product.id,
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-[#2B5658] bg-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* Selected Product Summary Table */}
        {selectedProducts.length > 0 && (
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold text-[#2B5658] mb-2">
              Ringkasan Pesanan
            </h2>
            <table className="min-w-full bg-white border border-gray-300 rounded-md text-sm text-[#2B5658]">
              <thead>
                <tr className="bg-[#E8F0F0] text-left">
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nama Produk</th>
                  <th className="px-4 py-2 border">Qty</th>
                  <th className="px-4 py-2 border">Stok</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.id}</td>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">{item.quantity}</td>
                    <td className="px-4 py-2 border">{item.stock}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold bg-[#F0F9F9]">
                  <td className="px-4 py-2 border" colSpan={2}>
                    Total Produk Dipesan
                  </td>
                  <td className="px-4 py-2 border" colSpan={2}>
                    {totalOrdered}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#3F7F83] text-white font-semibold rounded-lg hover:bg-[#4F969A] transition"
        >
          Submit Order
        </button>
      </form>
    </div>
  );
}
