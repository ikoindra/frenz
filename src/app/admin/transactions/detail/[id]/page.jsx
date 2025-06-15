"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchSaleDetail } from "@/services/sale";

export default function SalesDetail() {
  const params = useParams();
  const router = useRouter();
  const [saleData, setSaleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaleDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchSaleDetail(params.id);
        setSaleData(data);
      } catch (error) {
        console.error("Error loading sale detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadSaleDetail();
    }
  }, [params.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F7F83] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail penjualan...</p>
        </div>
      </div>
    );
  }

  if (!saleData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">
            Data penjualan tidak ditemukan
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#3F7F83] text-white rounded-lg hover:bg-[#4F969A] transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Kembali
            </button>

            {saleData.method?.toLowerCase() === "qris" &&
              saleData.proofQris && (
                <button
                  onClick={() => router.push(saleData.proofQris)}
                  className="flex items-center px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition ml-4"
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
                      d="M9 12h6m-3-3v6m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lihat Bukti QRIS
                </button>
              )}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-[#3F7F83] text-white rounded-lg hover:bg-[#4F969A] transition"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Cetak Invoice
          </button>
        </div>

        {/* Invoice Container */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden invoice-print">
          {/* Header */}
          <div className="bg-[#3F7F83] text-white px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                <p className="text-lg opacity-90">#{saleData.invoice}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold">FRENZ BENDUL MERISI</h2>
                <p className="mt-2 opacity-90">
                  Jl. Bendul Merisi No.148, Sidosermo
                  <br />
                  Kec. Wonocolo, Surabaya, Jawa Timur 60239
                  <br />
                  Telp: (021) 123-4567
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Informasi Penjualan
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">ID Transaksi:</span>{" "}
                    {saleData.id}
                  </p>
                  <p>
                    <span className="font-medium">Tanggal:</span>{" "}
                    {formatDate(saleData.date)}
                  </p>
                  <p>
                    <span className="font-medium">Metode Pembayaran:</span>{" "}
                    {saleData.method}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Karyawan</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">ID Karyawan:</span>{" "}
                    {saleData.employeeId}
                  </p>
                  <p>
                    <span className="font-medium">Nama:</span>{" "}
                    {saleData.employeeName || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Selesai
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6">
            <h3 className="font-semibold text-gray-700 mb-4">Detail Produk</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      No
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Produk
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">
                      Harga
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {saleData.details?.length > 0 ? (
                    saleData.details.map((item, index) => (
                      <tr
                        key={item.saleDetailId}
                        className="border-b border-gray-100"
                      >
                        <td className="py-4 px-2 text-gray-600">{index + 1}</td>
                        <td className="py-4 px-2">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.productName ||
                                `Product ID: ${item.productId}`}
                            </p>
                            {item.productDescription && (
                              <p className="text-sm text-gray-500">
                                {item.productDescription}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-2 text-right text-gray-600">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-4 px-2 text-right font-medium text-gray-800">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 px-2 text-center text-gray-500"
                      >
                        Tidak ada detail produk
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="max-w-sm ml-auto">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-600">
                    {formatCurrency(saleData.subtotal || 0)}
                  </span>
                </div>
                {saleData.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(saleData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[#3F7F83] border-t border-gray-300 pt-3">
                  <span>Total:</span>
                  <span>{formatCurrency(saleData.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Dibayar:</span>
                  <span className="font-medium">
                    {formatCurrency(saleData.payment || saleData.total)}
                  </span>
                </div>
                {saleData.change > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Kembalian:</span>
                    <span className="font-medium">
                      {formatCurrency(saleData.change)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-[#3F7F83] text-white text-center">
            <p className="text-sm opacity-90">
              Terima kasih atas pembelian Anda!
            </p>
            <p className="text-xs opacity-75 mt-2">
              Invoice ini dicetak pada {formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .invoice-print,
          .invoice-print * {
            visibility: visible !important;
          }

          .invoice-print {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          /* Hide UI-only elements */
          .sidebar,
          .navbar,
          .print\\:hidden {
            display: none !important;
          }

          @page {
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
