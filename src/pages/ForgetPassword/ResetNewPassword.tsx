import React, { useEffect, useState } from "react";
import { Form, Input, Button, notification } from "antd";
import { useNavigate } from "react-router";
import { useSetNewPasswordMutation } from "../../services/forgetPassword.service";

const ResetNewPassword = () => {
  const email = localStorage.getItem("email");
  const OTP = localStorage.getItem("OTP");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [resetPassword] = useSetNewPasswordMutation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(60);
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      notification.error({ message: "Mật khẩu không khớp" });
      return;
    }

    try {
      await resetPassword({ email, OTP, newPassword }).unwrap();
      notification.success({ message: "Thay đổi mật khẩu thành công" });
      navigate("/");
    } catch (error) {
      //   notification.error({ message: "Thay đổi mật khẩu thất bại" });
    }
  };
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Nhập mật khẩu mới - {`(${countdown}s)`}
        </h2>
        <Form onFinish={handleSubmit}>
          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password
              placeholder="Mật khẩu mới"
              className="rounded-md"
              value={newPassword}
              onChange={handleNewPasswordChange}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu"
              className="rounded-md"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
          </Form.Item>
          <Button type="primary" block htmlType="submit">
            Thay đổi mật khẩu
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ResetNewPassword;
