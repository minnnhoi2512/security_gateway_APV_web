import { useState, useEffect, useRef } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import LoginImg from "../assets/login-img.jpg";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../services/user.service";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import { toast } from "react-toastify"; // Import toast for notification
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import SetSignalR from "../utils/signalR";
import UserConnectionHubType from "../types/userConnectionHubType";
import { useDispatch } from "react-redux";
import { Building2, Camera, Lock, ShieldCheck, User } from "lucide-react";

function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const connection = useRef<signalR.HubConnection | null>(null);
  const dispatch = useDispatch();

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      // If a token exists, decode it and check the role
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.role !== "Security") {
        // If the role is not 'Security', redirect to dashboard
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const result = await loginUser({ username, password }).unwrap();
      const { jwtToken } = result;

      // Decode the token
      const decodedToken: any = jwtDecode(jwtToken);
      // console.log(decodedToken);
      // console.log(result);
      // Check if the role is 'Security' and prevent access
      if (decodedToken.role === "Security") {
        toast.error("Người dùng này không có quyền truy cập vào hệ thống");
        return; // Stop further actions
      }

      // Save the token and other details in localStorage
      localStorage.setItem("jwtToken", jwtToken);
      localStorage.setItem("userRole", decodedToken.role);
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("userName", result.userName);
      localStorage.setItem("departmentId", decodedToken.departmentId);
      // Success toast notification
      toast.success("Đăng nhập thành công!");
      const user: UserConnectionHubType = {
        userId: result.userId,
        role: decodedToken.role,
      };
      await SetSignalR.SetSignalR(user, connection, dispatch);
      // Navigate to dashboard after successful login
      navigate("/dashboard");
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
      </div>

      <div className="w-full max-w-4xl flex bg-slate-800/80 backdrop-blur-md rounded-lg shadow-2xl relative">
        <div className="w-full md:w-1/2 p-8">
          <div className="flex items-center justify-start gap-4 mb-8">
            <img
              src="https://vietnetco.vn/wp-content/uploads/2020/04/Secure-Web-Gateway-01-1024x844.png"
              alt="Security Gate Logo"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-2xl font-bold text-white">APACHE VIET NAM SECURITY GATE</h1>
          </div>

          {/* <h2 className="text-2xl font-bold text-white mb-1">Security Gate</h2> */}
          <p className="text-gray-400 mb-6">
            Hệ thống kiểm soát ra vào
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                Tên đăng nhập
              </label>
              <input
                type="text"
                required
                className="w-full p-2.5 rounded bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <a href="#" className="text-sm text-blue-400 hover:underline block">
              Quên mật khẩu?
            </a>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            © 2024 Apache Vietnam
          </p>
        </div>

        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="https://www.vietthanhcorp.vn/files/2023/05/25/101823-cat%20uni.jpg"
            alt="Login background"
            className="h-full w-full object-cover rounded-r-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent rounded-r-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;
