"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchEmployee } from "@/services/employee/index";

export default function EmployeeList() {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const token = localStorage.getItem("token"); // Adjust if you use cookies or a different key
        if (!token) return;

        const data = await fetchEmployee(token);
        setEmployees(data || []);
      } catch (error) {
        console.error("Failed to load employees:", error);
      }
    };

    loadEmployees();
  }, []);

  return (
    <div className="space-y-4">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Karyawan Toko</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <Link href="/supervisor/employees/add">
            <button className="w-[170px] px-4 py-2 border bg-[#3F7F83] text-white rounded-lg hover:bg-[#4F969A] transition">
              Tambah Karyawan
            </button>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Cari:</span>
            <input
              type="text"
              placeholder="Nama / ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border-2 border-[#3F7F83] rounded-lg text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <table className="min-w-full table-auto text-sm text-left bg-white rounded-2xl shadow-sm overflow-x-auto">
          <thead>
            <tr className="bg-[#3F7F83] text-white">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Toko</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Kontak</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {employees
              .filter(
                (e) =>
                  e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                  String(e.employeeId)
                    .toLowerCase()
                    .includes(search.toLowerCase())
              )
              .map((emp, index) => (
                <tr
                  key={emp.employeeId}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-2 text-gray-700">{emp.employeeId}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {emp.employeeName}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{emp.role}</td>
                  <td className="px-4 py-2 text-gray-700">{emp.storename}</td>
                  <td className="px-4 py-2 text-gray-700">{emp.username}</td>
                  <td className="px-4 py-2 text-gray-700">{emp.contact}</td>
                  <td className="px-4 py-2 text-gray-700">
                    <Link
                      href={`/supervisor/employees/detail/${emp.employeeId}`}
                    >
                      <button className="px-3 py-1 text-sm bg-[#3F7F83] text-white rounded hover:bg-[#4F969A] transition">
                        Detail
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
