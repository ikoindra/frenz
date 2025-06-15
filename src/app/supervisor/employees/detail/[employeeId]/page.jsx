"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  fetchEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "@/services/employee/index";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getNumericParam = (param) => {
    const id = Array.isArray(param) ? param[0] : param;
    const numeric = parseInt(id ?? "", 10);
    return isNaN(numeric) ? null : numeric;
  };

  const loadEmployeeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const numericId = getNumericParam(employeeId);
      if (!numericId) {
        setError("Invalid employee ID");
        setLoading(false);
        return;
      }

      const employeeData = await fetchEmployeeById(numericId, token);

      if (employeeData) {
        const formatted = {
          id: employeeData.employeeId,
          name: employeeData.employeeName,
          address: employeeData.address,
          contact: employeeData.contact,
          username: employeeData.username,
          password: "",
          role: employeeData.role,
          storename: employeeData.storename,
          status: employeeData.status === 1 ? "Aktif" : "Tidak Aktif",
          profilePicture: employeeData.profilePicture,
        };
        setEmployee(formatted);
        setEditData({
          employeeName: employeeData.employeeName,
          address: employeeData.address || "",
          contact: employeeData.contact || "",
          username: employeeData.username,
          password: "",
          role: employeeData.role,
          storename: employeeData.storename || "",
        });
      } else {
        setError(`Employee with ID ${numericId} not found.`);
      }
    } catch (error) {
      console.error("Failed to load employee data:", error);
      const msg = error.message || "";
      if (msg.includes("404") || msg.includes("not found")) {
        setError("Employee not found");
      } else if (msg.includes("403")) {
        setError("You don't have permission to view this employee's details");
      } else if (msg.includes("401")) {
        setError("Your session has expired. Please log in again");
      } else {
        setError("Failed to load employee data: " + msg);
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append("employeeName", editData.employeeName);
      formData.append("address", editData.address);
      formData.append("contact", editData.contact);
      formData.append("username", editData.username);
      formData.append("role", editData.role);
      formData.append("storename", editData.storename);

      if (editData.password) {
        formData.append("password", editData.password);
      }

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      const numericId = getNumericParam(employeeId);
      await updateEmployee(numericId, formData);

      setEditMode(false);
      setSelectedFile(null);
      setPreviewImage(null);
      await loadEmployeeData();
      toast.success("Karyawan berhasil diedit!");
    } catch (error) {
      console.error("Failed to update employee:", error);
      setError("Failed to update employee: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      const numericId = getNumericParam(employeeId);
      await deleteEmployee(numericId);
      toast.success("Karyawan berhasil dihapus!");
      router.push("/supervisor/employees/list");
    } catch (error) {
      console.error("Failed to delete employee:", error);
      setError("Failed to delete employee: " + error.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedFile(null);
    setPreviewImage(null);
    setError(null);
    // Reset edit data to original values
    if (employee) {
      setEditData({
        employeeName: employee.name,
        address: employee.address || "",
        contact: employee.contact || "",
        username: employee.username,
        password: "",
        role: employee.role,
        storename: employee.storename || "",
      });
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId, loadEmployeeData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading employee details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-lg text-red-600">{error}</div>
        <button
          onClick={loadEmployeeData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-800">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#2B5658]">Detail Karyawan</h1>

        {!editMode && (
          <div className="space-x-3">
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-40 h-40 rounded-full overflow-hidden border border-gray-300">
            <img
              src={
                previewImage ||
                employee.profilePicture ||
                "https://via.placeholder.com/150?text=No+Image"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {editMode && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-600 mb-2">Name</p>
            {editMode ? (
              <input
                type="text"
                value={editData.employeeName}
                onChange={(e) =>
                  handleInputChange("employeeName", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{employee.name}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600 mb-2">Username</p>
            {editMode ? (
              <input
                type="text"
                value={editData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{employee.username}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600 mb-2">Address</p>
            {editMode ? (
              <textarea
                value={editData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{employee.address || "-"}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600 mb-2">Contact</p>
            {editMode ? (
              <input
                type="text"
                value={editData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{employee.contact || "-"}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600 mb-2">Role</p>
            {editMode ? (
              <select
                value={editData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            ) : (
              <p className="text-gray-800">{employee.role}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600 mb-2">Store Name</p>
            {editMode ? (
              <select
                value={editData.storename}
                onChange={(e) => handleInputChange("storename", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Cabang Toko</option>
                <option value="Frenz Rungkut">Frenz Rungkut</option>
                <option value="Frenz Sukolilo">Frenz Sukolilo</option>
                <option value="Frenz Head Office">Frenz Head Office</option>
                <option value="Frenz Jemursari">Frenz Jemursari</option>
              </select>
            ) : (
              <p className="text-gray-800">{employee.storename || "-"}</p>
            )}
          </div>

          {editMode && (
            <div className="col-span-2">
              <p className="font-semibold text-gray-600 mb-2">
                New Password (leave empty to keep current)
              </p>
              <input
                type="password"
                value={editData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {!editMode && (
            <div>
              <p className="font-semibold text-gray-600 mb-2">Status</p>
              <p className="text-gray-800">{employee.status}</p>
            </div>
          )}
        </div>

        {editMode && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this employee? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
