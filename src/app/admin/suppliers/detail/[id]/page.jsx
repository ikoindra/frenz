"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await fetch(`/api/suppliers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Supplier tidak ditemukan");
        }

        const data = await response.json();
        setSupplier(data);
      } catch (error) {
        console.error("Error fetching supplier:", error);
        toast.error("Gagal memuat detail supplier: " + error.message);
        router.push("/admin/suppliers/list");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchSupplier();
    }  }, [token, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading supplier details...</div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Supplier tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-800">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#2B5658]">Detail Supplier</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/suppliers/edit/${supplier.id}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Edit Supplier
          </button>
          <button
            onClick={() => router.push("/admin/suppliers/list")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Kembali
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-[#2B5658] mb-4">Informasi Supplier</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">ID Supplier</label>
              <p className="text-gray-800 font-medium">{supplier.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Nama Supplier</label>
              <p className="text-gray-800 font-medium">{supplier.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Kontak</label>
              <p className="text-gray-800">{supplier.contact || "-"}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800">{supplier.email || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Alamat</label>
              <p className="text-gray-800">{supplier.address || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Tanggal Dibuat</label>
              <p className="text-gray-800">
                {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('id-ID') : "-"}
              </p>
            </div>
          </div>
        </div>
        {supplier.description && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Deskripsi</label>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{supplier.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
