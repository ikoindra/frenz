"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchPurchaseOrders,
  approvePurchaseOrder,
  rejectPurchaseOrder,
} from "@/services/purchase";
import { fetchSuppliers } from "@/services/supplier";
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  ShoppingCart,
  Check,
  X
} from "tabler-icons-react";

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
  const [expandedRows, setExpandedRows] = useState(new Set());

  const { token } = useSelector((state) => state.auth);  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, suppliersData] = await Promise.all([
          fetchPurchaseOrders(token),
          fetchSuppliers(token),
        ]);
        
        console.log("Raw orders data:", ordersData);
        
        // Check if data exists and is an array
        if (!ordersData || !Array.isArray(ordersData)) {
          console.log("No data received or data is not an array:", ordersData);
          // Use mock data for testing if API fails
          const mockData = [
            {
              purchaseDetailId: 2,
              productId: 7,
              quantity: 5,
              price: 1000,
              subtotaldetail: 5000,
              purchaseId: 7,
              invoice: "PO058097",
              employeeId: 7,
              supplierId: 1,
              date: "2025-05-31T17:00:00.000Z",
              subtotal: 405000,
              discount: null,
              total: 405000,
              status: "pending",
              employeeName: "Ramadhana",
              supplierName: "Robot2",
              productName: "Lightning Fast Charger",
            },
            {
              purchaseDetailId: 3,
              productId: 17,
              quantity: 80,
              price: 5000,
              subtotaldetail: 400000,
              purchaseId: 7,
              invoice: "PO058097",
              employeeId: 7,
              supplierId: 1,
              date: "2025-05-31T17:00:00.000Z",
              subtotal: 405000,
              discount: null,
              total: 405000,
              status: "pending",
              employeeName: "Ramadhana",
              supplierName: "Robot2",
              productName: "Silicone Pop Socket",
            },
            {
              purchaseDetailId: 4,
              productId: 103,
              quantity: 4,
              price: 9000,
              subtotaldetail: 36000,
              purchaseId: 8,
              invoice: "PO081897",
              employeeId: 3,
              supplierId: null,
              date: "2025-06-01T17:00:00.000Z",
              subtotal: 40000,
              discount: 9000,
              total: 31000,
              status: "approve",
              employeeName: "Putra",
              supplierName: null,
              productName: "Wireless Bluetooth Adapter",
            },
          ];

          console.log("Using mock data for testing");
          const groupedMockOrders = processPurchaseOrderData(mockData);
          setPurchaseOrders(groupedMockOrders);
          setSuppliers(suppliersData || []);
          return;
        }
        
        // Process the purchase orders data to group by invoice
        const groupedOrders = processPurchaseOrderData(ordersData);
        console.log("Grouped Purchase Orders:", groupedOrders);
        setPurchaseOrders(groupedOrders);
        setSuppliers(suppliersData);
      } catch (error) {
        toast.error("Failed to load data");
        console.error(error);
        
        // Fallback to empty array on error
        setPurchaseOrders([]);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      console.log("Token available, loading purchase orders...");
      loadData();
    } else {
      console.log("No token available");
      setLoading(false);
    }
  }, [token]);

  // Helper function to process purchase order data
  const processPurchaseOrderData = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.reduce((acc, item) => {
      const existingOrder = acc.find((order) => order.invoice === item.invoice);

      if (existingOrder) {
        // Add item to existing order's details
        existingOrder.details.push({
          purchaseDetailId: item.purchaseDetailId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotaldetail: item.subtotaldetail,
        });
      } else {
        // Create new order with first item
        acc.push({
          purchaseId: item.purchaseId,
          invoice: item.invoice,
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          date: item.date,
          subtotal: item.subtotal,
          discount: item.discount,
          total: item.total,
          status: item.status,
          details: [
            {
              purchaseDetailId: item.purchaseDetailId,
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              subtotaldetail: item.subtotaldetail,
            },
          ],
        });
      }

      return acc;
    }, []);
  };
  const toggleRowExpansion = (purchaseId) => {
    console.log("=== TOGGLE ROW EXPANSION ===");
    console.log("Toggling row expansion for purchaseId:", purchaseId);
    console.log("Current expanded rows before:", Array.from(expandedRows));

    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
        console.log("Collapsing row:", purchaseId);
      } else {
        newSet.add(purchaseId);
        console.log("Expanding row:", purchaseId);
      }
      console.log("New expanded rows after:", Array.from(newSet));
      return newSet;
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approve: { color: "bg-green-100 text-green-800", text: "Approved" },
      reject: { color: "bg-red-100 text-red-800", text: "Rejected" },
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
          po.purchaseId === order.purchaseId ? { ...po, status: "rejected" } : po
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
  };  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.details?.some((detail) =>
        detail.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
  
  console.log("Purchase Orders state:", purchaseOrders);
  console.log("Filtered Orders:", filteredOrders);
  console.log("Loading state:", loading);
  console.log("Token:", token);
  console.log("Expanded rows:", expandedRows);
  

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice, employee, or product..."
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
      <div className="bg-white shadow rounded-lg overflow-hidden">        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={96} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No purchase orders found matching your criteria"
                : "No purchase orders yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <ChevronRight size={16} />
                  </th>
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
              </thead>              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  console.log(
                    "Rendering order with purchaseId:",
                    order.purchaseId,
                    "Expanded?",
                    expandedRows.has(order.purchaseId)
                  );
                  return (
                    <React.Fragment key={order.purchaseId}>
                      {/* Main Purchase Order Row */}
                      <tr className="hover:bg-gray-50">                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              console.log("Button clicked for purchaseId:", order.purchaseId);
                              toggleRowExpansion(order.purchaseId);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-transform duration-200 cursor-pointer"
                            type="button"
                          >
                            {expandedRows.has(order.purchaseId) ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                        </td>
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
                          {order.details?.length || 0} items
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
                          {order.supplierName || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.status?.toLowerCase() === "pending" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(order)}
                                disabled={actionLoading}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                              >
                                <Check size={14} className="mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(order)}
                                disabled={actionLoading}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400 flex items-center"
                              >
                                <X size={14} className="mr-1" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {/* Expanded Details Row */}
                      {expandedRows.has(order.purchaseId) && (
                        <tr key={`${order.purchaseId}-details`}>
                          <td colSpan="9" className="px-6 py-0">
                            <div className="bg-gray-50 border-l-4 border-blue-500">
                              <div className="px-6 py-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                  Order Details ({order.details?.length || 0} items)
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                    <thead>
                                      <tr className="border-b border-gray-200">
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                          Product
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                          Quantity
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                          Price
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                          Subtotal
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.details?.map((detail) => (
                                        <tr
                                          key={detail.purchaseDetailId}
                                          className="border-b border-gray-100"
                                        >
                                          <td className="py-2 text-sm text-gray-900">
                                            {detail.productName}
                                          </td>
                                          <td className="py-2 text-sm text-gray-500">
                                            {detail.quantity}
                                          </td>
                                          <td className="py-2 text-sm text-gray-500">
                                            Rp {detail.price?.toLocaleString() || 0}
                                          </td>
                                          <td className="py-2 text-sm text-gray-900 font-medium">
                                            Rp {detail.subtotaldetail?.toLocaleString() || 0}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
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
                (order) => order.status?.toLowerCase() === "approve"
              ).length
            }
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {
              purchaseOrders.filter(
                (order) => order.status?.toLowerCase() === "reject"
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
                Total Amount:
                <strong>Rp {selectedOrder?.total?.toLocaleString()}</strong>
              </p>
            </div>
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
