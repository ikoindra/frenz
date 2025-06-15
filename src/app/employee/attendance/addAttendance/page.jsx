"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { fetchEmployeeById } from "@/services/employee";
import { createAttendance } from "@/services/attendance";

export default function AddAttendance() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [locationStatus, setLocationStatus] = useState({
    isValidLocation: false,
    nearestLocation: null,
    distance: null,
    validLocationName: null,
    allDistances: [],
  });

  // Define allowed locations with their radius
  const allowedLocations = [
    {
      name: "FRENZ BENDUL MERISI",
      latitude: -7.306016,
      longitude: 112.748307,
      radius: 500,
    },
    {
      name: "TESTING",
      latitude: -7.327654,
      longitude: 112.809637,
      radius: 500,
    },
    {
      name: "UPN Veteran Jawa Timur (Gunung Anyar)",
      latitude: -7.333409,
      longitude: 112.788396,
      radius: 500,
    },
  ];

  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check if current location is within allowed areas
  const validateLocation = (currentLat, currentLng) => {
    let isValid = false;
    let nearest = null;
    let minDistance = Infinity;
    let validLocation = null;
    let allDistances = [];

    allowedLocations.forEach((allowedLoc, index) => {
      const distance = calculateDistance(
        currentLat,
        currentLng,
        allowedLoc.latitude,
        allowedLoc.longitude
      );

      const isWithinRadius = distance <= allowedLoc.radius;

      allDistances.push({
        name: allowedLoc.name,
        distance: Math.round(distance),
        radius: allowedLoc.radius,
        isValid: isWithinRadius,
      });

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...allowedLoc, distance: Math.round(distance) };
      }

      if (isWithinRadius) {
        isValid = true;
        validLocation = allowedLoc.name;
      }
    });

    setLocationStatus({
      isValidLocation: isValid,
      nearestLocation: nearest,
      distance: Math.round(minDistance),
      validLocationName: validLocation,
      allDistances: allDistances,
    });
  };

  // Improved location detection function
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      };

      let attempts = 0;
      const maxAttempts = 3;

      const tryGetLocation = () => {
        attempts++;
        console.log(`Location attempt ${attempts}/${maxAttempts}`);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log("Location found:", { latitude, longitude, accuracy });
            resolve({ latitude, longitude, accuracy });
          },
          (error) => {
            console.error(`Location error (attempt ${attempts}):`, error);

            if (attempts < maxAttempts) {
              setTimeout(tryGetLocation, 2000);
              reject(error);
            }
          },
          options
        );
      };

      tryGetLocation();
    });
  };

  // Function to refresh location
  const refreshLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    toast.loading("Getting your location...", { id: "location" });

    try {
      const { latitude, longitude, accuracy } = await getCurrentLocation();

      setLocation({
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      });
      setLocationAccuracy(Math.round(accuracy));

      validateLocation(latitude, longitude);
      toast.dismiss("location");
      toast.success(`Location updated! Accuracy: ${Math.round(accuracy)}m`);
    } catch (error) {
      console.error("Failed to get location:", error);
      setLocationError(error.message);
      toast.dismiss("location");

      let errorMessage = "Unable to get your location. ";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "Please allow location access and try again.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage += "Location request timed out. Please try again.";
          break;
        default:
          errorMessage += error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      const employeeId = decoded.employeeId || decoded.id;

      if (!employeeId) {
        toast.error("Employee ID not found in token");
        setLoading(false);
        return;
      }

      const employee = await fetchEmployeeById(employeeId, token);

      if (!employee) {
        toast.error("Failed to fetch employee data");
        setLoading(false);
        return;
      }
      setEmployeeData(employee);
      setLoading(false);
    };

    fetchData();
    refreshLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photoFile) {
      toast.error("Please select a photo first.");
      return;
    }
    if (!employeeData) {
      toast.error("Employee data is not available.");
      return;
    }
    if (!locationStatus.isValidLocation) {
      toast.error(
        "You must be at an authorized location to submit attendance."
      );
      return;
    }

    const formData = new FormData();
    formData.append("employeeId", employeeData.employeeId);
    formData.append("employeeName", employeeData.employeeName);
    formData.append("date", getCurrentDate());
    formData.append("time", getCurrentTime());
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    formData.append("photo", photoFile);

    try {
      await createAttendance(formData);
      toast.success("Attendance successfully added!");
      setPhotoFile(null);
      setTimeout(() => {
        router.push("/employee/attendance/list");
      }, 1500);
    } catch (error) {
      toast.error(`Failed to add attendance: ${error.message || error}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Add Attendance</h2>

      {/* Location Status Alert */}
      <div
        className={`p-4 rounded-lg border ${
          locationStatus.isValidLocation
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                locationStatus.isValidLocation ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <div>
              {locationStatus.isValidLocation ? (
                <div className="text-green-800">
                  <p className="font-medium">
                    ✓ You are in an authorized location:{" "}
                    {locationStatus.validLocationName}
                  </p>
                  {locationStatus.nearestLocation && (
                    <p className="text-sm mt-1">
                      Distance: {locationStatus.distance}m from{" "}
                      {locationStatus.nearestLocation.name}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-red-800">
                  <p className="font-medium">
                    ✗ You are not in an authorized location
                  </p>
                  {locationStatus.nearestLocation && (
                    <p className="text-sm mt-1">
                      Nearest location: {locationStatus.nearestLocation.name} (
                      {locationStatus.distance}m away, max allowed:{" "}
                      {locationStatus.nearestLocation.radius}m)
                    </p>
                  )}
                </div>
              )}

              {locationAccuracy && (
                <p className="text-xs mt-1 text-gray-600">
                  GPS Accuracy: ±{locationAccuracy}m
                </p>
              )}

              {locationError && (
                <p className="text-xs mt-1 text-red-600">
                  Location Error: {locationError}
                </p>
              )}
            </div>
          </div>

          {/* Refresh Location Button */}
          <button
            onClick={refreshLocation}
            disabled={locationLoading}
            className="ml-4 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {locationLoading ? "Getting..." : "Refresh Location"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Employee ID", value: employeeData?.employeeId || "" },
          { label: "Employee Name", value: employeeData?.employeeName || "" },
          { label: "Date", value: getCurrentDate(), type: "date" },
          { label: "Time", value: getCurrentTime() },
          {
            label: "Latitude",
            value:
              location.latitude ||
              (locationLoading
                ? "Getting location..."
                : "Location unavailable"),
          },
          {
            label: "Longitude",
            value:
              location.longitude ||
              (locationLoading
                ? "Getting location..."
                : "Location unavailable"),
          },
        ].map(({ label, value, type = "text" }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-800">
              {label}
            </label>
            <input
              type={type}
              value={value}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-800">
            Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setPhotoFile(e.target.files ? e.target.files[0] : null)
            }
            className="mt-1 block w-full text-sm text-gray-800
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-[#3F7F83] file:text-white
              hover:file:bg-[#4F969A]"
            required
          />
          {photoFile && (
            <div className="mt-2 text-sm text-gray-700">
              Selected file: {photoFile.name}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              !locationStatus.isValidLocation || !photoFile || locationLoading
            }
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${
                locationStatus.isValidLocation && photoFile && !locationLoading
                  ? "bg-[#3F7F83] hover:bg-[#4F969A] cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {locationLoading
              ? "Getting location..."
              : !locationStatus.isValidLocation
              ? "Not in authorized location"
              : !photoFile
              ? "Please select photo"
              : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
