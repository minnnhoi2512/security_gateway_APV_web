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
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Nhập mã OTP - {isResendDisabled && `(${countdown}s)`}
        </h2>
        <div className="space-y-4">
          <Input
            placeholder="OTP"
            className="rounded-md"
            value={OTP}
            onChange={handleInputChange}
          />
          <Button type="primary" block onClick={handleSubmit}>
            Xác nhận
          </Button>
          <Button type="default" block onClick={handleResendOTP}>
            Gửi lại OTP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputOTP;
