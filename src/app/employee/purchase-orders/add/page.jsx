"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { fetchProducts } from "@/services/product";
import { createPurchaseOrder } from "@/services/purchase";

export default function AddPurchaseOrderPage() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [invoice, setInvoice] = useState("");
  const [date, setDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Generate invoice number
    const generateInvoice = () => {
      const now = new Date();
      const timestamp = now.getTime().toString().slice(-6);
      return `PO${timestamp}`;
    };

    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setInvoice(generateInvoice());

    // Fetch products
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(token);

        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products");
        console.error(error);
      } finally {
        setProductsLoading(false);
      }
    };

    if (token) {
      loadProducts();
    }
  }, [token]);

  const addProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: "", quantity: 1, price: 0, subtotal: 0 },
    ]);
  };

  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value;

    // Calculate subtotal when quantity or price changes
    if (field === "quantity" || field === "price") {
      updated[index].subtotal = updated[index].quantity * updated[index].price;
    }

    setSelectedProducts(updated);
  };

  const calculateTotal = () => {
    const subtotal = selectedProducts.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    return subtotal - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    // Validate all products are selected and have valid data
    for (const product of selectedProducts) {
      if (!product.productId || product.quantity <= 0 || product.price <= 0) {
        toast.error("Please fill all product details correctly");
        return;
      }
    }

    setLoading(true);

    try {
      // Get employee ID from token
      const decoded = jwtDecode(token);
      const employeeId = decoded.employeeId || decoded.id;

      const subtotal = selectedProducts.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const total = subtotal - discount;

      const purchaseData = {
        detail: selectedProducts.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal),
        })),
        invoice,
        employeeId: parseInt(employeeId),
        date: `${date} 00:00:00`,
        subtotal,
        discount: parseFloat(discount),
        total,
      };

      await createPurchaseOrder(purchaseData, token);
      toast.success("Purchase order created successfully!");
      router.push("/employee/purchase-orders/list");
    } catch (error) {
      toast.error("Failed to create purchase order: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Tambah Purchase Order
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Information */}{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Invoice Number
              </label>{" "}
              <input
                type="text"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Date
              </label>{" "}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
          </div>
          {/* Products Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Products</h3>
              <button
                type="button"
                onClick={addProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <i className="ti ti-plus mr-2"></i>
                Add Product
              </button>
            </div>{" "}
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-black">
                No products added. Click "Add Product" to start.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>{" "}
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updateProduct(index, "productId", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option
                              key={product.productId}
                              value={product.productId}
                            >
                              {product.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>{" "}
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateProduct(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>{" "}
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            updateProduct(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtotal
                        </label>{" "}
                        <input
                          type="text"
                          value={`Rp ${item.subtotal.toLocaleString()}`}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Summary */}
          <div className="border-t pt-4">
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Discount
                </label>{" "}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                {" "}
                <div className="text-right w-full">
                  <div className="text-sm text-black">
                    Subtotal: Rp{" "}
                    {selectedProducts
                      .reduce((sum, item) => sum + item.subtotal, 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    Total: Rp {calculateTotal().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedProducts.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
