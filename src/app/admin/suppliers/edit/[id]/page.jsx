"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function EditSupplier() {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [form, setForm] = useState({
    supplierName: "",
    contact: "",
    // address: "",
    // email: "",
    // description: "",
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/supplier/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Supplier tidak ditemukan");
        }

        const data = await response.json();
        setForm({
          supplierName: data.supplierName || "",
          contact: data.contact || "",
          // address: data.address || "",
          // email: data.email || "",
          // description: data.description || "",
        });
      } catch (error) {
        console.error("Error fetching supplier:", error);
        toast.error("Gagal memuat data supplier: " + error.message);
        router.push("/admin/suppliers/list");
      } finally {
        setFetchLoading(false);
      }
    };

    if (token && id) {
      fetchSupplier();
    }
  }, [token, id, router]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.supplierName.trim()) {
      toast.error("Nama supplier harus diisi");
      return;
    }
    
    if (!form.contact.trim()) {
      toast.error("Kontak supplier harus diisi");
      return;
    }
    console.log("Submitting form:", form);
    

    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/supplier/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengupdate supplier");
      }

      toast.success("Supplier berhasil diupdate");
      router.push("/admin/suppliers/list");
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Gagal mengupdate supplier: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading supplier data...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#2B5658] mb-8">
        Edit Supplier
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-gray-800 font-medium">
                Nama Supplier <span className="text-red-500">*</span>
              </label>
              <input
                name="supplierName"
                type="text"
                value={form.supplierName}
                onChange={handleChange}
                placeholder="Masukkan Nama Supplier"
                className="text-black w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-800 font-medium">
                Kontak <span className="text-red-500">*</span>
              </label>
              <input
                name="contact"
                type="text"
                value={form.contact}
                onChange={handleChange}
                placeholder="Masukkan Nomor Telepon/HP"
                className="text-black w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                required
              />
            </div>

            {/* <div className="space-y-2">
              <label className="block text-gray-800 font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan Email Supplier"
                className="text-black w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-800 font-medium">Alamat</label>
              <input
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="Masukkan Alamat Supplier"
                className="text-black w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-gray-800 font-medium">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Masukkan Deskripsi Supplier (opsional)"
                rows={3}
                className="text-black w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"
              />
            </div> */}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-400 text-gray-800 rounded-xl hover:bg-gray-100 font-medium transition"
              disabled={loading}
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#3F7F83] text-white rounded-xl hover:bg-[#2B5658] font-medium transition shadow-md disabled:bg-gray-400"
            >
              {loading ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
