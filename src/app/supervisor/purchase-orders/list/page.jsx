"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchPurchaseOrders,
  approvePurchaseOrder,
  rejectPurchaseOrder,
} from "@/services/purchase";
import { fetchSuppliers } from "@/services/supplier";

export default function SupervisorPurchaseOrderPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, suppliersData] = await Promise.all([
          fetchPurchaseOrders(token),
          fetchSuppliers(token),
        ]);
        setPurchaseOrders(ordersData);
        setSuppliers(suppliersData);
      } catch (error) {
        toast.error("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadData();
    }
  }, [token]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const handleApprove = (order) => {
    setSelectedOrder(order);
    setShowApproveModal(true);
    setSelectedSupplierId("");
  };

  const handleReject = async (order) => {
    if (
      !confirm(
        `Are you sure you want to reject purchase order ${order.invoice}?`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await rejectPurchaseOrder(order.purchaseId, token);
      toast.success("Purchase order rejected successfully");

      // Update local state
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.id === order.purchaseId ? { ...po, status: "rejected" } : po
        )
      );
    } catch (error) {
      toast.error("Failed to reject purchase order: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmApprove = async () => {
    
    if (!selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }

    setActionLoading(true);
    try {
      await approvePurchaseOrder(
        selectedOrder.purchaseId,
        { supplierId: parseInt(selectedSupplierId) },
        token
      );
      toast.success("Purchase order approved successfully");

      // Update local state
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.id === selectedOrder.id
            ? {
                ...po,
                status: "approved",
                supplier: suppliers.find(
                  (s) => s.id === parseInt(selectedSupplierId)
                ),
              }
            : po
        )
      );

      setShowApproveModal(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error("Failed to approve purchase order: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading purchase orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Purchase Order Management
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {" "}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <i className="ti ti-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by invoice or employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-black pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <i className="ti ti-shopping-cart text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No purchase orders found matching your criteria"
                : "No purchase orders yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.purchaseId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {order.invoice}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {order.employeeName || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {order.detail?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        Rp {order.total?.toLocaleString()}
                      </div>
                      {order.discount > 0 && (
                        <div className="text-sm text-gray-500">
                          Discount: Rp {order.discount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {order.supplier?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status?.toLowerCase() === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(order)}
                            disabled={actionLoading}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                          >
                            <i className="ti ti-check mr-1"></i>
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(order)}
                            disabled={actionLoading}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                          >
                            <i className="ti ti-x mr-1"></i>
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">
            {purchaseOrders.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {
              purchaseOrders.filter(
                (order) => order.status?.toLowerCase() === "pending"
              ).length
            }
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {
              purchaseOrders.filter(
                (order) => order.status?.toLowerCase() === "approved"
              ).length
            }
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {
              purchaseOrders.filter(
                (order) => order.status?.toLowerCase() === "rejected"
              ).length
            }
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Approve Purchase Order
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Purchase Order: <strong>{selectedOrder?.invoice}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Total Amount:{" "}
                <strong>Rp {selectedOrder?.total?.toLocaleString()}</strong>
              </p>
            </div>{" "}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.supplierName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedOrder(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={actionLoading || !selectedSupplierId}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {actionLoading ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
