export async function fetchProducts() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `Failed to fetch products: ${res.status} ${errorText || res.statusText}`
      );
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Fetch products error:", error);
    return [];
  }
}

export async function createProduct(product) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      }
    );

    const data = await res.json();
    return {
      ...data,
      stock: data.stock ?? product.stock ?? 0,
    };
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
}

export async function updateProduct(productId, product) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      }
    );

    if (!res.ok) {
      let errorMessage = res.statusText;
      try {
        const errorData = await res.text();
        console.error("API Error Response:", errorData);
        errorMessage = errorData || errorMessage;
      } catch (e) {
        console.error("Could not parse error response", e);
      }
      throw new Error(
        `Failed to update product (${res.status}): ${errorMessage}`
      );
    }

    const data = await res.json();
    return {
      ...data,
      stock: data.stock ?? product.stock ?? 0,
    };
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `Failed to delete product (${res.status}): ${
          errorText || res.statusText
        }`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
}
