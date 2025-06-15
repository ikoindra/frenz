export async function fetchAttendance() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return [];
  }
}

export async function createAttendance(attendance) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: attendance,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create attendance");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Create attendance error:", error);
    throw error;
  }
}
