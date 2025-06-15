"use client";

import { useState, useEffect } from "react";
import { fetchProducts } from "@/services/product";
import { createSale } from "@/services/sale";
import { fetchEmployeeById } from "@/services/employee";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

export default function KeranjangPenjualan() {
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [payment, setPayment] = useState("");
  const [qrisImage, setQrisImage] = useState(null);
  const [qrisImagePreview, setQrisImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load products
        const products = await fetchProducts();
        setAllProducts(products);

        // Load current employee dari token
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          const employeeId = decoded.employeeId || decoded.id;

          if (!employeeId) {
            setError("Employee ID not found in token");
            setLoading(false);
            return;
          }

          // Fetch employee data with correct parameters
          const data = await fetchEmployeeById(employeeId, token);

          if (data) {
            setCurrentEmployee(data);
          } else {
            toast.error("Gagal memuat data");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
      }
    }
    loadData();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = allProducts.filter(
      (p) =>
        p.productName &&
        p.productName.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.productId);
      if (exists) {
        return prev.map((item) =>
          item.id === product.productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.productId,
          name: product.productName,
          quantity: 1,
          price: product.price,
          total: product.price,
        },
      ];
    });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetCart = () => {
    setCartItems([]);
    setDiscountPercentage("");
    setPayment("");
    setQrisImage(null);
    setQrisImagePreview(null);
  };

  const subTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const validDiscountPercentage = Math.max(
    0,
    Math.min(100, Number(discountPercentage) || 0)
  );
  const discountAmount = (subTotal * validDiscountPercentage) / 100;
  const totalAfterDiscount = subTotal - discountAmount;
  const paymentAmount = Number(payment) || 0;
  const change =
    paymentAmount >= totalAfterDiscount
      ? paymentAmount - totalAfterDiscount
      : 0;

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)
    ) {
      setDiscountPercentage(value);
    }
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setPayment(value);
    }
  };

  const handleQrisImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar!");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB!");
        return;
      }

      setQrisImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrisImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQrisImage = () => {
    setQrisImage(null);
    setQrisImagePreview(null);
  };

  // Generate invoice number
  const generateInvoice = () => {
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0");
    return `INV${timestamp}`;
  };

  const handleSubmitSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }

    if (!currentEmployee) {
      toast.error("Data employee tidak ditemukan!");
      return;
    }

    if (paymentAmount < totalAfterDiscount) {
      toast.error("Pembayaran kurang!");
      return;
    }

    if (paymentMethod === "qris" && !qrisImage) {
      toast.error("Harap upload bukti pembayaran QRIS!");
      return;
    }

    setIsSubmitting(true);

    try {
      const saleData = {
        invoice: generateInvoice(),
        employeeId: currentEmployee.employeeId,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        method: paymentMethod,
        subtotal: subTotal,
        discountPercent: validDiscountPercentage,
        total: totalAfterDiscount,
        payment: paymentAmount,
        change: change,
        details: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.total,
        })),
      };

      // Pass the image file only if payment method is QRIS
      const proofQris = paymentMethod === "qris" ? qrisImage : null;

      const result = await createSale(saleData, proofQris);

      if (result) {
        toast.success("Transaksi berhasil disimpan!");
        handleResetCart();
        setSearchInput("");
        setSearchResults([]);
        // Optional: redirect or print receipt
        // router.push(`/receipt/${result.id}`);
      } else {
        throw new Error("Gagal menyimpan transaksi");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Gagal menyimpan transaksi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white text-gray-800">
      <div className="bg-gray-100 py-2 px-4 rounded">
        <h1 className="text-xl font-semibold">Transaksi Penjualan</h1>
        {currentEmployee && (
          <p className="text-sm text-gray-600">
            Kasir: {currentEmployee.employeeName}
          </p>
        )}
      </div>

      <div className="border rounded shadow bg-white">
        <div className="bg-[#3F7F83] text-white py-3 px-4 rounded-t">
          <span className="font-semibold">Cari Barang</span>
        </div>
        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Masukan : Kode / Nama Barang [ENTER]"
            className="w-full px-4 py-2 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
            value={searchInput}
            onChange={handleSearchChange}
          />
          <div>
            <h2 className="font-semibold mb-2">Hasil Pencarian</h2>
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-800">
                  <th className="px-4 py-2 text-left">Nama Barang</th>
                  <th className="px-4 py-2 text-center">Stok</th>
                  <th className="px-4 py-2 text-center">Harga</th>
                  <th className="px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500">
                      Tidak ada hasil pencarian
                    </td>
                  </tr>
                ) : (
                  searchResults.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{item.productName}</td>
                      <td className="px-4 py-2 text-center">{item.stock}</td>
                      <td className="px-4 py-2 text-center">
                        Rp {item.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Tambah
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border rounded shadow bg-white">
        <div className="bg-[#3F7F83] text-white py-3 px-4 flex justify-between items-center rounded-t">
          <span className="font-bold text-lg">KASIR</span>
          <button
            onClick={handleResetCart}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded font-medium"
          >
            RESET KERANJANG
          </button>
        </div>

        <div className="p-4">
          <table className="w-full border border-gray-300 text-sm mb-4">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="p-2 border-r">No</th>
                <th className="p-2 border-r">Nama Barang</th>
                <th className="p-2 border-r">Jumlah</th>
                <th className="p-2 border-r">Total</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-4 text-gray-500 italic font-light"
                  >
                    Keranjang kosong
                  </td>
                </tr>
              ) : (
                cartItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-2 border-r text-center">{index + 1}</td>
                    <td className="p-2 border-r">{item.name}</td>
                    <td className="p-2 border-r text-center">
                      {item.quantity}
                    </td>
                    <td className="p-2 border-r text-center">
                      Rp {item.total.toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mb-4">
            <label className="font-semibold mr-4">Metode Pembayaran:</label>
            <label className="mr-4">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => {
                  setPaymentMethod("cash");
                  setQrisImage(null);
                  setQrisImagePreview(null);
                }}
                className="mr-1"
              />
              Cash
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="qris"
                checked={paymentMethod === "qris"}
                onChange={() => setPaymentMethod("qris")}
                className="mr-1"
              />
              QRIS
            </label>
          </div>

          {/* QRIS Image Upload Section */}
          {paymentMethod === "qris" && (
            <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2 text-gray-700">
                Upload Bukti Pembayaran QRIS
              </h3>

              {!qrisImagePreview ? (
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrisImageChange}
                    className="hidden"
                    id="qris-upload"
                  />
                  <label
                    htmlFor="qris-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Pilih Gambar
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Format: JPG, PNG, GIF (Max: 5MB)
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={qrisImagePreview}
                      alt="QRIS Payment Proof"
                      className="max-w-xs max-h-48 object-contain border rounded"
                    />
                    <button
                      onClick={handleRemoveQrisImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-sm"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Gambar berhasil diupload
                  </p>
                  <button
                    onClick={handleRemoveQrisImage}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Ganti Gambar
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="mb-2 flex items-center">
                <label className="w-1/3">Discount (%)</label>
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={handleDiscountChange}
                  min={0}
                  max={100}
                  placeholder="0"
                  className="flex-1 border border-gray-300 p-2"
                />
              </div>
              <div className="mb-2 flex items-center">
                <label className="w-1/3">Sub Total</label>
                <input
                  type="text"
                  value={`Rp ${subTotal.toLocaleString()}`}
                  readOnly
                  className="flex-1 border border-gray-300 p-2 bg-gray-100 text-gray-800"
                />
              </div>
              <div className="mb-2 flex items-center">
                <label className="w-1/3">Total Semua</label>
                <input
                  type="text"
                  value={`Rp ${totalAfterDiscount.toLocaleString()}`}
                  readOnly
                  className="flex-1 border border-gray-300 p-2 bg-gray-100 text-gray-800 font-bold"
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center">
                <label className="w-1/3">Bayar</label>
                <input
                  type="number"
                  value={payment}
                  onChange={handlePaymentChange}
                  min={0}
                  placeholder="0"
                  className="flex-1 border border-gray-300 p-2"
                />
              </div>
              <div className="mb-2 flex items-center">
                <label className="w-1/3">Kembali</label>
                <input
                  type="text"
                  value={`Rp ${change.toLocaleString()}`}
                  readOnly
                  className="flex-1 border border-gray-300 p-2 bg-gray-100 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSubmitSale}
              disabled={
                isSubmitting ||
                cartItems.length === 0 ||
                paymentAmount < totalAfterDiscount ||
                (paymentMethod === "qris" && !qrisImage)
              }
              className={`px-6 py-3 rounded font-semibold text-white ${
                isSubmitting ||
                cartItems.length === 0 ||
                paymentAmount < totalAfterDiscount ||
                (paymentMethod === "qris" && !qrisImage)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Menyimpan..." : "SIMPAN TRANSAKSI"}
            </button>
          </div>

          {/* Status indicators */}
          <div className="mt-2 text-sm">
            {cartItems.length === 0 && (
              <p className="text-red-500">• Tambahkan produk ke keranjang</p>
            )}
            {paymentAmount < totalAfterDiscount && paymentAmount > 0 && (
              <p className="text-red-500">
                • Pembayaran kurang Rp{" "}
                {(totalAfterDiscount - paymentAmount).toLocaleString()}
              </p>
            )}
            {paymentMethod === "qris" && !qrisImage && (
              <p className="text-red-500">• Upload bukti pembayaran QRIS</p>
            )}
            {paymentAmount >= totalAfterDiscount &&
              cartItems.length > 0 &&
              (paymentMethod !== "qris" || qrisImage) && (
                <p className="text-green-600">• Siap untuk disimpan</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
