"use client";

import {
  Package,
  Database,
  ChartBar,
  CurrencyDollar,
  User,
  MapPin,
  Phone,
  Building,
  Shield,
  Hash,
} from "tabler-icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchEmployeeById } from "@/services/employee";
import { jwtDecode } from "jwt-decode";
import Stats from "@/components/dashboard/Stats";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const token = useSelector((state) => state.auth.token);
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getEmployee() {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Decode token to get employee ID
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
          setEmployee(data);
        } else {
          setError("Failed to fetch employee data");
        }
      } catch (err) {
        console.error("Failed to fetch employee:", err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    }

    getEmployee();
  }, [token]);

  const getIconForField = (label) => {
    const iconMap = {
      "Employee ID": <Hash className="w-5 h-5" />,
      Name: <User className="w-5 h-5" />,
      Address: <MapPin className="w-5 h-5" />,
      Contact: <Phone className="w-5 h-5" />,
      "Store Name": <Building className="w-5 h-5" />,
      Role: <Shield className="w-5 h-5" />,
    };
    return iconMap[label] || <User className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {employee?.employeeName || "Guest"}
        </p>
      </div>

      <Stats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3F7F83] to-[#2B5658] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#3F7F83] ml-4">
              Employee Information
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3F7F83]" />
              <p className="text-gray-500 text-sm ml-4">
                Loading employee data...
              </p>
            </div>
          ) : employee ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: "Employee ID", value: employee.employeeId },
                { label: "Name", value: employee.employeeName },
                { label: "Address", value: employee.address },
                { label: "Contact", value: employee.contact },
                { label: "Store Name", value: employee.storename },
                { label: "Role", value: employee.role },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center space-x-4 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[#3F7F83] group-hover:from-[#3F7F83] group-hover:to-[#2B5658] group-hover:text-white transition-all duration-200">
                    {getIconForField(label)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {label === "Role" && value === "Employee"
                        ? "Store Staff"
                        : value || (
                            <span className="text-gray-400 italic">
                              Not available
                            </span>
                          )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-500 text-sm font-medium">
                Failed to load employee data
              </p>
              <p className="text-gray-400 text-xs">Please try again later</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#3F7F83] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Data Produk",
                icon: <Database />,
                route: "/admin/products/list",
              },
              {
                label: "Data Penjualan",
                icon: <ChartBar />,
                route: "/admin/transactions/list",
              },
              {
                label: "Order Produk",
                icon: <Package />,
                route: "/admin/orders/list",
              },
            ].map(({ label, icon, route }) => (
              <button
                key={label}
                className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                onClick={() => router.push(route)}
              >
                <div className="w-8 h-8 rounded-full bg-[#3F7F83] flex items-center justify-center text-white mb-2">
                  {icon}
                </div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
