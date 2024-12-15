import React, { useState } from "react";
import { Input, Button, Result, notification } from "antd";
import { useForgetPasswordUserMutation } from "../../services/forgetPassword.service";
import { useNavigate } from "react-router";

const EmailCreator = () => {
  const [email, setEmail] = useState<string>("");
  const [inputEmail] = useForgetPasswordUserMutation();
  const navigate = useNavigate();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const result = await inputEmail({ email }).unwrap();
      localStorage.setItem("email", email);
      console.log(result)
      if (result) {
        navigate("/confirmOTP");
      }
    } catch (error) {
      //   console.log(error.data.errors.email[0]);
      notification.error({
        message: error.data.errors.email[0] || "Email không tồn tại",
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Địa chỉ email</h2>
        <div className="space-y-4">
          <Input
            placeholder="Địa chỉ email"
            className="rounded-md"
            value={email}
            onChange={handleInputChange}
          />
          <Button type="primary" block onClick={handleSubmit}>
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailCreator;
