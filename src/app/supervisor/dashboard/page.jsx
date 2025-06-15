"use client";

import { memo, useCallback, useMemo } from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchEmployeeById } from "@/services/employee";
import { jwtDecode } from "jwt-decode";
import Stats from "@/components/dashboard/Stats";
import { useRouter } from "next/navigation";

// Dynamic imports for icons to reduce bundle size
import dynamic from "next/dynamic";

const Database = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.Database })), { ssr: false });
const ChartBar = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.ChartBar })), { ssr: false });
const Clock = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.Clock })), { ssr: false });
const User = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.User })), { ssr: false });
const MapPin = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.MapPin })), { ssr: false });
const Phone = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.Phone })), { ssr: false });
const Building = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.Building })), { ssr: false });
const Shield = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.Shield })), { ssr: false });
const Hash = dynamic(() => import("tabler-icons-react").then(mod => ({ default: mod.Hash })), { ssr: false });

// Constants moved outside component
const QUICK_ACTIONS = [
  {
    label: "Data Produk",
    iconName: "Database",
    route: "/supervisor/products/list",
  },
  {
    label: "Data Karyawan",
    iconName: "User",
    route: "/supervisor/employees/list",
  },
  {
    label: "Data Transaksi",
    iconName: "ChartBar",
    route: "/supervisor/transactions/list",
  },
  {
    label: "Data Absensi",
    iconName: "Clock",
    route: "/supervisor/attendance/list",
  },
];

// Memoized components
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3F7F83]" />
    <p className="text-gray-500 text-sm ml-4">Loading employee data...</p>
  </div>
));

const ErrorDisplay = memo(() => (
  <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
      <User className="w-6 h-6 text-red-500" />
    </div>
    <p className="text-red-500 text-sm font-medium">Failed to load employee data</p>
    <p className="text-gray-400 text-xs">Please try again later</p>
  </div>
));

const EmployeeField = memo(({ label, value, getIconForField }) => (
  <div className="flex items-center space-x-4 rounded-lg p-3 hover:bg-gray-50 transition-colors">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[#3F7F83] transition-all duration-200">
      {getIconForField(label)}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">
        {label === "Role" && value === "Employee"
          ? "Store Staff"
          : value || <span className="text-gray-400 italic">Not available</span>}
      </p>
    </div>
  </div>
));

const QuickActionButton = memo(({ action, onNavigate }) => {
  const IconComponent = useMemo(() => {
    switch (action.iconName) {
      case "Database": return Database;
      case "User": return User;
      case "ChartBar": return ChartBar;
      case "Clock": return Clock;
      default: return Database;
    }
  }, [action.iconName]);

  return (
    <button
      className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
      onClick={() => onNavigate(action.route)}
    >
      <div className="w-8 h-8 rounded-full bg-[#3F7F83] flex items-center justify-center text-white mb-2">
        <IconComponent className="w-4 h-4" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{action.label}</p>
    </button>
  );
});

function Dashboard() {
  const token = useSelector((state) => state.auth.token);
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized icon mapping
  const getIconForField = useCallback((label) => {
    const iconProps = { className: "w-5 h-5" };
    switch (label) {
      case "Employee ID": return <Hash {...iconProps} />;
      case "Name": return <User {...iconProps} />;
      case "Address": return <MapPin {...iconProps} />;
      case "Contact": return <Phone {...iconProps} />;
      case "Store Name": return <Building {...iconProps} />;
      case "Role": return <Shield {...iconProps} />;
      default: return <User {...iconProps} />;
    }
  }, []);

  // Memoized employee fields
  const employeeFields = useMemo(() => {
    if (!employee) return [];
    return [
      { label: "Employee ID", value: employee.employeeId },
      { label: "Name", value: employee.employeeName },
      { label: "Address", value: employee.address },
      { label: "Contact", value: employee.contact },
      { label: "Store Name", value: employee.storename },
      { label: "Role", value: employee.role },
    ];
  }, [employee]);

  // Memoized navigation handler
  const handleNavigate = useCallback((route) => {
    router.push(route);
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function getEmployee() {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      // Try cached data first
      const cachedUserData = localStorage.getItem("userData");
      if (cachedUserData && isMounted) {
        try {
          const parsedData = JSON.parse(cachedUserData);
          setEmployee(parsedData);
          setLoading(false);
          return;
        } catch (e) {
          console.warn("Failed to parse cached user data");
        }
      }

      if (!isMounted) return;
      setLoading(true);
      setError(null);

      try {
        const decoded = jwtDecode(token);
        const employeeId = decoded.employeeId || decoded.id;

        if (!employeeId) {
          if (isMounted) {
            setError("Employee ID not found in token");
            setLoading(false);
          }
          return;
        }

        const data = await fetchEmployeeById(employeeId, token);

        if (isMounted) {
          if (data) {
            setEmployee(data);
            localStorage.setItem("userData", JSON.stringify(data));
          } else {
            setError("Failed to fetch employee data");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch employee:", err);
        if (isMounted) {
          setError("Failed to load employee data");
          setLoading(false);
        }
      }
    }

    getEmployee();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {employee?.employeeName || "Guest"}
        </p>
      </div>

      <Stats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <LoadingSpinner />
          ) : error ? (
            <ErrorDisplay />
          ) : employee ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {employeeFields.map(({ label, value }) => (
                <EmployeeField
                  key={label}
                  label={label}
                  value={value}
                  getIconForField={getIconForField}
                />
              ))}
            </div>
          ) : (
            <ErrorDisplay />
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#3F7F83] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionButton
                key={action.route}
                action={action}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Dashboard);
