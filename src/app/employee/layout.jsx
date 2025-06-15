"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import DashboardWrapper from "@/components/DashboardWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProtectedRoute requiredRole="employee">
      <DashboardWrapper userRole="employee">
        <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
              <div className="container mx-auto px-6 py-8">{children}</div>
            </main>
          </div>
        </div>
      </DashboardWrapper>
    </ProtectedRoute>
  );
}
