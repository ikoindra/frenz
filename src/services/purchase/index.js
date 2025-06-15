
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Get all purchase orders
export const fetchPurchaseOrders = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/purchase`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch purchase orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }
};

// Create new purchase order
export const createPurchaseOrder = async (purchaseData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/purchase`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create purchase order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating purchase order:", error);
    throw error;
  }
};

// Approve purchase order
export const approvePurchaseOrder = async (id, approvalData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/purchase/${id}/approve`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(approvalData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to approve purchase order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving purchase order:", error);
    throw error;
  }
};

// Reject purchase order
export const rejectPurchaseOrder = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/purchase/${id}/reject`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reject purchase order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error rejecting purchase order:", error);
    throw error;
  }
};
