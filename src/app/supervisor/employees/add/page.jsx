"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createEmployee } from "@/services/employee";

export default function AddEmployee() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    storename: "",
    username: "",
    password: "",
    contact: "",
    address: "",
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    setProfilePictureFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build FormData
    const formData = new FormData();
    formData.append("employeeName", form.name);
    formData.append("role", form.role);
    formData.append("storename", form.storename);
    formData.append("username", form.username);
    formData.append("password", form.password);
    formData.append("contact", form.contact);
    formData.append("address", form.address);

    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
    }

    try {
      const newEmployee = await createEmployee(formData);
      toast.success("Karyawan berhasil ditambahkan!");
      router.push("/supervisor/employees/list");
      console.log("Created employee:", newEmployee);
    } catch (error) {
      toast.error("Gagal menambahkan karyawan: " + error.message);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-[#2B5658] mb-8">
        Tambah Karyawan
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Name */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Nama</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Masukkan Nama"
            className="w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800"
            required
          />
        </div>

        {/* Role */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800 bg-white"
            required
          >
            <option value="">Pilih Role</option>
            <option value="Karyawan Toko">Karyawan Toko</option>
            <option value="Admin">Admin</option>
            <option value="Supervisor">Supervisor</option>
          </select>
        </div>

        {/* Store Name */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Cabang Toko</label>
          <select
            name="storename"
            value={form.storename}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800 bg-white"
            required
          >
            <option value="">Pilih Cabang Toko</option>
            <option value="Frenz Rungkut">Frenz Rungkut</option>
            <option value="Frenz Sukolilo">Frenz Sukolilo</option>
            <option value="Frenz Head Office">Frenz Head Office</option>
            <option value="Frenz Jemursari">Frenz Jemursari</option>
          </select>
        </div>

        {/* Username */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Username</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Masukkan Username"
            className="w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Masukkan Password"
            className="w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800"
            required
          />
        </div>

        {/* Contact */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Kontak</label>
          <input
            name="contact"
            type="text"
            value={form.contact}
            onChange={handleChange}
            placeholder="Masukkan Kontak"
            className="w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800"
            required
          />
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Alamat</label>
          <input
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            placeholder="Masukkan Alamat"
            className="w-full px-4 py-3 border-2 border-[#3F7F83] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-gray-800"
            required
          />
        </div>

        {/* Profile Picture Upload */}
        <div className="space-y-2 md:col-span-1">
          <label className="block text-gray-800 font-medium">Foto Profil</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-800
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-[#3F7F83] file:text-white
              hover:file:bg-[#4F969A]"
          />
          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl border border-gray-300"
                style={{ aspectRatio: "1 / 1" }}
              />
            </div>
          )}
        </div>

        {/* Buttons span full width */}
        <div className="md:col-span-2 flex justify-between pt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border-2 border-gray-400 text-gray-800 rounded-xl hover:bg-gray-100 font-medium transition"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-[#3F7F83] text-white rounded-xl hover:bg-[#2B5658] font-medium transition shadow-md"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
