import React, { useState, useEffect } from "react";
import { Input, Button, notification } from "antd";
import {
  useConfirmOTPMutation,
  useForgetPasswordUserMutation,
} from "../../services/forgetPassword.service";
import { useNavigate } from "react-router";

const InputOTP = () => {
  const [OTP, setOTP] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(60);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const email = localStorage.getItem("email");
  const [inputOTP] = useConfirmOTPMutation();
  const [resendOTP] = useForgetPasswordUserMutation();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOTP(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const result = await inputOTP({ email, OTP }).unwrap();
      localStorage.setItem("OTP", OTP);
      navigate("/resetNewPassword");
      notification.success({ message: "Xác nhận thành công" });
    } catch (error) {
      notification.error({ message: "Xác nhận thất bại" });
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP({ email }).unwrap();
      setCountdown(60);
      setIsResendDisabled(true);
      notification.success({ message: "OTP đã được gửi lại" });
    } catch (error) {
      notification.error({ message: "Gửi lại OTP thất bại" });
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendOTP]);

  return (
    // <div className="flex justify-center items-center h-screen">
    //   <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
    //     <h2 className="text-2xl font-bold mb-4">
    //       Nhập mã OTP - {isResendDisabled && `(${countdown}s)`}
    //     </h2>
    //     <div className="space-y-4">
    //       <Input
    //         placeholder="OTP"
    //         className="rounded-md"
    //         value={OTP}
    //         onChange={handleInputChange}
    //       />
    //       <Button type="primary" block onClick={handleSubmit}>
    //         Xác nhận
    //       </Button>
    //       <Button type="default" block onClick={handleResendOTP}>
    //         Gửi lại OTP
    //       </Button>
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen flex items-center justify-center bg-[#1a2235]">
      <div className="w-full max-w-4xl flex bg-[#1e2736] rounded-lg overflow-hidden">
        <div className="w-1/2 p-8">
          <div className="flex items-center mb-8">
            {/* <div className="w-8 h-8 bg-blue-500 rounded-full mr-3"></div> */}
            <h1 className="text-white text-xl font-semibold">
              APACHE VIET NAM
            </h1>
          </div>

          <h2 className="text-white text-lg mb-6">
            Nhập mã OTP {isResendDisabled && `(${countdown}s)`}
          </h2>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                className="w-full bg-[#141a27] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Nhập mã OTP"
                value={OTP}
                onChange={handleInputChange}
              />
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              onClick={handleSubmit}
            >
              Xác nhận
            </button>

            <button
              className={`w-full border border-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 
              ${
                isResendDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-700"
              }`}
              onClick={handleResendOTP}
              disabled={isResendDisabled}
            >
              Gửi lại OTP
            </button>
            <div className="text-center">
              <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
                Quay lại đăng nhập
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            © 2024 Apache Vietnam
          </div>
        </div>

        <div className="w-1/2">
          <img
            src="https://www.vietthanhcorp.vn/files/2023/05/25/101823-cat%20uni.jpg"
            alt="Apache Vietnam Office"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default InputOTP;
