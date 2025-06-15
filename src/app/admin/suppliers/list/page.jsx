"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchSuppliers } from "@/services/supplier";

export default function SupplierList() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        const data = await fetchSuppliers(token);
        setSuppliers(data);
      } catch (error) {
        console.error("Error loading suppliers:", error);
        toast.error("Gagal memuat data supplier");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadSuppliers();
    }
  }, [token]);

  const handleDelete = async (supplier) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.supplierName}"?`)) {
      return;
    }

    setDeleteLoading(supplier.id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/supplier/${supplier.supplierId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus supplier");
      }

      setSuppliers(prev => prev.filter(s => s.supplierId !== supplier.supplierId));
      toast.success("Supplier berhasil dihapus");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Gagal menghapus supplier: " + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      s.supplierId?.toString().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Data Supplier</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <Link href="/admin/suppliers/add">
            <button className="w-[170px] px-4 py-2 border bg-[#3F7F83] text-white rounded-lg hover:bg-[#4F969A] transition">
              Tambah Supplier
            </button>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Cari:</span>
            <input
              type="text"
              placeholder="Nama / ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-black px-3 py-2 border-2 border-[#3F7F83] rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <i className="ti ti-building-store text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">
                {search ? "Tidak ada supplier yang ditemukan" : "Belum ada data supplier"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm text-left">
                <thead>
                  <tr className="bg-[#3F7F83] text-white">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Kontak</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier, index) => (
                    <tr
                      key={supplier.id}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-3 text-gray-700">{supplier.supplierId}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{supplier.supplierName}</td>
                      <td className="px-4 py-3 text-gray-700">{supplier.contact || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2 justify-center">
                          {/* <Link href={`/admin/suppliers/detail/${supplier.supplierId}`}>
                            <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition">
                              Detail
                            </button>
                          </Link> */}
                          <button 
                            onClick={() => router.push(`/admin/suppliers/edit/${supplier.supplierId}`)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(supplier)}
                            disabled={deleteLoading === supplier.supplierId}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-400"
                          >
                            {deleteLoading === supplier.supplierId ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Supplier</div>
          <div className="text-2xl font-bold text-gray-900">{suppliers.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Hasil Pencarian</div>
          <div className="text-2xl font-bold text-gray-900">{filteredSuppliers.length}</div>
        </div>
      </div>
    </div>
  );
}
