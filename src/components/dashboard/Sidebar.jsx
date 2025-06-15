"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { fetchEmployeeById } from "@/services/employee";

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigationByRole = {
    Employee: [
      { name: "Dashboard", icon: "home", href: "/employee/dashboard" },
      { name: "Absensi", icon: "users", href: "/employee/attendance/list" },
      {
        name: "Barang",
        icon: "report",
        name: "Data Barang",
        href: "/employee/products/list",
      },
      {
        name: "Purchase Order",
        icon: "shopping-cart",
        children: [
          { name: "Pengajuan Baru", href: "/employee/purchase-orders/add" },
          { name: "History Pengajuan", href: "/employee/purchase-orders/list" },
        ],
      },
      {
        name: "Transaksi",
        icon: "settings",
        children: [
          { name: "Data Penjualan", href: "/employee/transactions/list" },
          { name: "Tambah Transaksi", href: "/employee/transactions/sales" },
        ],
      },
    ],
    Admin: [
      { name: "Dashboard", icon: "home", href: "/admin/dashboard" },
      {
        name: "Barang",
        icon: "report",
        name: "Data Barang",
        href: "/admin/products/list",
      },
      { name: "Transaksi", icon: "settings", href: "/admin/transactions/list" },
      {
        name: "Purchase Order",
        icon: "shopping-cart",
        href: "/admin/purchase-orders/list",
      },
      {
        name: "Supplier",
        icon: "building-store",
        href: "/admin/suppliers/list",
      },
    ],
    Supervisor: [
      { name: "Dashboard", icon: "home", href: "/supervisor/dashboard" },
      {
        name: "Barang",
        icon: "report",
        name: "Data Barang",
        href: "/supervisor/products/list",
      },
      // {
      //   name: "Purchase Order",
      //   icon: "shopping-cart",
      //   href: "/supervisor/purchase-orders/list",
      // },
      {
        name: "Transaksi",
        icon: "settings",
        href: "/supervisor/transactions/list",
      },
      { name: "Absensi", icon: "users", href: "/supervisor/attendance/list" },
      {
        name: "Data Karyawan",
        icon: "user",
        href: "/supervisor/employees/list",
      },
    ],
  };
  useEffect(() => {
    const fetchRole = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get cached role first for faster loading
        const cachedRole = localStorage.getItem("userRole");
        const cachedUserData = localStorage.getItem("userData");

        if (cachedRole && cachedUserData) {
          const normalizedRole =
            cachedRole.charAt(0).toUpperCase() +
            cachedRole.slice(1).toLowerCase();
          setRole(normalizedRole);
          setLoading(false);
          return; // Use cached data, skip API call
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const employeeId = decoded.employeeId || decoded.id;

        if (!employeeId) {
          setError("Employee ID not found in token");
          setLoading(false);
          return;
        }

        const employee = await fetchEmployeeById(employeeId, token);

        if (!employee) {
          setError("Failed to fetch employee data");
          setLoading(false);
          return;
        }

        // Normalize role to ensure consistent casing
        const normalizedRole =
          employee.role?.charAt(0).toUpperCase() +
          employee.role?.slice(1).toLowerCase();
        setRole(normalizedRole);

        // Cache the role and user data for faster future loads
        localStorage.setItem("userRole", employee.role?.toLowerCase());
        localStorage.setItem("userData", JSON.stringify(employee));
      } catch (err) {
        console.error("Failed to fetch role:", err);
        setError("Failed to load user role");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  useEffect(() => {
    if (!role) return;

    const navItems = navigationByRole[role] || [];
    const activeParent = navItems.find((item) =>
      item.children?.some((child) => pathname.startsWith(child.href))
    );
    setOpenMenu(activeParent?.name || null);
  }, [pathname, role]);

  const navigation = navigationByRole[role] || [];

  const isParentActive = (item) => {
    if (item.href && pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  const isChildActive = (href) => pathname === href;

  const handleToggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    // Redirect to login page
    window.location.href = "/login";
  };

  // Loading state
  if (loading) {
    return (
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-60 bg-white border-r transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out shadow-lg shadow-black/10`}
      >
        <div className="h-full flex flex-col">
          <div className="h-[72px] flex items-center justify-center border-b">
            <img
              src="/images/frenzLogo.png"
              alt="Frenz logo"
              className="w-[200px] h-[200px]"
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </aside>
    );
  }

  // Error state
  if (error) {
    return (
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-60 bg-white border-r transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out shadow-lg shadow-black/10`}
      >
        <div className="h-full flex flex-col">
          <div className="h-[72px] flex items-center justify-center border-b">
            <img
              src="/images/frenzLogo.png"
              alt="Frenz logo"
              className="w-[200px] h-[200px]"
            />
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-red-500">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-2 text-xs text-blue-500 hover:underline"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // No role found
  if (!role || !navigationByRole[role]) {
    return (
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-60 bg-white border-r transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out shadow-lg shadow-black/10`}
      >
        <div className="h-full flex flex-col">
          <div className="h-[72px] flex items-center justify-center border-b">
            <img
              src="/images/frenzLogo.png"
              alt="Frenz logo"
              className="w-[200px] h-[200px]"
            />
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <p className="text-sm">No navigation available for your role</p>
            </div>
          </div>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i className="ti ti-logout text-xl mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-60 bg-white border-r transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out shadow-lg shadow-black/10`}
    >
      <div className="h-full flex flex-col">
        <div className="h-[72px] flex items-center justify-center border-b">
          <img
            src="/images/frenzLogo.png"
            alt="Frenz logo"
            className="w-[200px] h-[200px]"
          />
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                {!item.children ? (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isParentActive(item)
                        ? "bg-gray-100 text-gray-800"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <i className={`ti ti-${item.icon} text-xl mr-3`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => handleToggleMenu(item.name)}
                      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                        isParentActive(item)
                          ? "bg-gray-100 text-gray-800"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <i className={`ti ti-${item.icon} text-xl mr-3`} />
                      <span className="font-medium flex-1 text-left">
                        {item.name}
                      </span>
                      <i
                        className={`ti ${
                          openMenu === item.name
                            ? "ti-chevron-up"
                            : "ti-chevron-down"
                        } text-sm`}
                      />
                    </button>

                    {openMenu === item.name && (
                      <ul className="pl-11 mt-1 space-y-1 text-sm">
                        {item.children.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              className={`block py-2 px-3 rounded-lg transition-colors ${
                                isChildActive(sub.href)
                                  ? "bg-gray-100 text-gray-800"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="ti ti-logout text-xl mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
