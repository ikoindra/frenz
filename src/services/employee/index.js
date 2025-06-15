export async function fetchEmployee(token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch employee");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchEmployeeById(employeeId, token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/${employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch employee with id: ${employeeId}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createEmployee(employeeFormData) {
  console.log(employeeFormData);
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: employeeFormData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create employee");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Create employee error:", error);
    throw error;
  }
}

// Add these functions to your existing services file

export async function updateEmployee(employeeId, employeeFormData) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/${employeeId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: employeeFormData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update employee");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Update employee error:", error);
    throw error;
  }
}

export async function deleteEmployee(employeeId) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/${employeeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete employee");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Delete employee error:", error);
    throw error;
  }
}
