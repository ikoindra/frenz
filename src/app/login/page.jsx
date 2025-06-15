"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "@/redux/slices/auth";
import { login } from "@/services/auth/index";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSplash } from "@/providers/SplashProvider";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { showSplashScreen } = useSplash();

  const handleSubmit = async (e) => {    
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("Username and password must be filled.");
      return;
    }

    setLoading(true);

    try {
      const data = await login({
        username: formData.username,
        password: formData.password,
      });

      dispatch(setToken(data.token));
      dispatch(setUser(data.employee));      toast.success("Login successful!");      const role = data.employee.role?.toLowerCase();

      // Mark that user came from login
      sessionStorage.setItem("fromLogin", "true");

      // Determine target route
      let targetRoute = "/employee/dashboard"; // default
      if (role === "employee") {
        targetRoute = "/employee/dashboard";
      } else if (role === "admin") {
        targetRoute = "/admin/dashboard";
      } else if (role === "supervisor") {
        targetRoute = "/supervisor/dashboard";
      } else {
        toast.error("Unrecognized role. Please contact the administrator.");
        return;
      }      // Store user data in localStorage immediately for faster dashboard loading
      localStorage.setItem("userRole", role);
      localStorage.setItem("userData", JSON.stringify(data.employee));

      // Show splash screen first
      showSplashScreen();
      
      // Immediate navigation for supervisor role - bypass timing issues
      if (role === "supervisor") {
        setTimeout(() => {
          router.push(targetRoute);
        }, 100); // Slightly longer for supervisor to ensure state is set
      } else {
        setTimeout(() => {
          router.push(targetRoute);
        }, 50); // Faster for other roles
      }

      // Fallback navigation in case splash screen takes too long
      setTimeout(() => {
        router.push(targetRoute);
      }, 2000); // Longer fallback for more reliable navigation
    } catch (error) {
      toast.error(
        "Login failed: " + (error?.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex relative overflow-hidden bg-white">
      {/* Background Decorations */}
      <div className="hidden lg:block absolute w-full h-full overflow-hidden">
        {[
          {
            className: "w-[941px] h-[800px] -left-[225px] -top-[117px]",
          },
          {
            className: "w-[398px] h-[400px] -left-[77px] top-[553px]",
          },
          {
            className: "w-[283px] h-[280px] left-[419px] top-[454px]",
          },
        ].map((style, idx) => (
          <div
            key={idx}
            className={`absolute rounded-full ${style.className}`}
            style={{
              backgroundImage:
                "linear-gradient(to bottom, #0E1C1D 0%, #264E50 38%, #336669 56%, #3F7F82 75%)",
            }}
          />
        ))}
        <div className="absolute left-[50px] top-[20px]">
          <img
            src="/images/frenzLogo.png"
            alt="Frenz logo"
            className="rounded-full w-[600px] h-[600px]"
          />
        </div>
      </div>

      {/* Login Form */}
      <div className="flex w-full max-w-[1280px] mx-auto p-5 relative z-[1] lg:flex-row flex-col items-center lg:p-10">
        <div className="lg:ml-auto p-10 w-full max-w-[472px] shadow-2xl rounded-[20px] bg-white">
          <div className="font-poppins text-[48px] font-bold text-black mb-5 text-center sm:text-left">
            Welcome!
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
            {/* Username */}
            <div className="relative rounded-[20px] p-5 h-[76px] flex items-center bg-[#D9D9D9]">
              <i className="ti ti-user text-[24px] text-black mr-5" />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="bg-transparent border-none font-poppins text-[24px] font-light text-black w-full focus:outline-none"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="relative rounded-[20px] p-5 h-[76px] flex items-center bg-[#D9D9D9]">
              <i className="ti ti-lock text-[24px] text-black mr-5" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-transparent border-none font-poppins text-[24px] font-light text-black w-full focus:outline-none"
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[76px] rounded-[20px] text-white font-poppins font-bold mt-[20px] ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#3F7F83]"
              } sm:text-[36px] text-[24px] flex items-center justify-center`}
            >
              {loading ? "Processing..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
