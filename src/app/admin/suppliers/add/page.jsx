"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function AddSupplier() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    email: "",
    description: "",
  });

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

    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/supplier`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambah supplier");
      }

      toast.success("Supplier berhasil ditambahkan");
      router.push("/admin/suppliers/list");
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Gagal menambah supplier: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#2B5658] mb-8">
        Tambah Supplier
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
            </div> */}

            {/* <div className="space-y-2">
              <label className="block text-gray-800 font-medium">Alamat</label>
              <input
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="Masukkan Alamat Supplier"
                className="text-black w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div> */}

            {/* <div className="md:col-span-2 space-y-2">
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
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
