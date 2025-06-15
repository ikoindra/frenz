
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Get all suppliers
export const fetchSuppliers = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/supplier`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch suppliers");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

// Get supplier by ID
export const fetchSupplierById = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch supplier");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching supplier:", error);
    throw error;
  }
};
