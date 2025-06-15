"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export async function fetchAttendance() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch attendance");

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return [];
  }
}

// Fetch employee by ID (single employee)
async function fetchEmployeeById(token, employeeId) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/${employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`Failed to fetch employee ${employeeId}`);

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function Attendance() {
  // Default filter is today
  const todayStr = new Date().toISOString().slice(0, 10);

  const [dateFilter, setDateFilter] = useState(todayStr);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({}); // employeeId => employeeName
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function loadData() {
      if (!token) return;

      const attendance = await fetchAttendance();
      setAttendanceData(attendance);

      // Extract unique employee IDs
      const employeeIds = [
        ...new Set(attendance.map((item) => item.employeeId)),
      ];

      // Fetch employees details in parallel
      const employees = await Promise.all(
        employeeIds.map((id) => fetchEmployeeById(token, id))
      );

      // Create map: employeeId => employeeName
      const map = {};
      employees.forEach((emp) => {
        if (emp && emp.employeeId) {
          map[emp.employeeId] = emp.name || emp.employeeName || "Unknown";
        }
      });
      setEmployeeMap(map);
    }

    loadData();
  }, [token]);

  // If dateFilter empty, show all data, else filter by date
  const filteredData = dateFilter
    ? attendanceData.filter((item) => item.date === dateFilter)
    : attendanceData;

  return (
    <div className="space-y-4">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Attendance</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border-2 border-[#3F7F83] rounded-lg text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left bg-white rounded-2xl shadow-sm">
          <thead>
            <tr className="bg-[#3F7F83] text-white">
              <th className="px-4 py-2">Attendance ID</th>
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2">Employee Name</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Photo</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={item.attendanceId}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-2 text-gray-700">
                    {item.attendanceId}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{item.employeeId}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {employeeMap[item.employeeId] || "Loading..."}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{item.date}</td>
                  <td className="px-4 py-2 text-gray-700">{item.time}</td>
                  <td className="px-4 py-2 text-blue-600 underline hover:text-blue-800 cursor-pointer">
                    <a
                      href={`${item.photo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Photo
                    </a>
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "Present"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Late"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-2 text-center text-gray-500 italic"
                >
                  No attendance data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
