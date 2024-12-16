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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  
    
    if (newPassword !== confirmPassword) {
      notification.error({
        message: "Lỗi",
        description: "Mật khẩu không khớp",
        placement: "topRight",
      });
      return;
    }

    try {
      await resetPassword({ email, OTP, newPassword }).unwrap();
      notification.success({
        message: "Thành công",
        description: "Thay đổi mật khẩu thành công",
        placement: "topRight",
      });
      setTimeout(() => navigate("/"), 1500); 
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Thay đổi mật khẩu thất bại",
        placement: "topRight",
      });
    }
};

  // const handleSubmit = async () => {
  //   if (newPassword !== confirmPassword) {
  //     notification.error({ message: "Mật khẩu không khớp" });
  //     return;
  //   }

  //   try {
  //     await resetPassword({ email, OTP, newPassword }).unwrap();
  //     notification.success({ message: "Thay đổi mật khẩu thành công" });
  //     navigate("/");
  //   } catch (error) {
  //     //   notification.error({ message: "Thay đổi mật khẩu thất bại" });
  //   }
  // };
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  return (
    // <div className="flex justify-center items-center h-screen">
    //   <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
    //     <h2 className="text-2xl font-bold mb-4">
    //       Nhập mật khẩu mới - {`(${countdown}s)`}
    //     </h2>
    //     <Form onFinish={handleSubmit}>
    //       <Form.Item
    //         name="newPassword"
    //         rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
    //       >
    //         <Input.Password
    //           placeholder="Mật khẩu mới"
    //           className="rounded-md"
    //           value={newPassword}
    //           onChange={handleNewPasswordChange}
    //         />
    //       </Form.Item>
    //       <Form.Item
    //         name="confirmPassword"
    //         rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
    //       >
    //         <Input.Password
    //           placeholder="Xác nhận mật khẩu"
    //           className="rounded-md"
    //           value={confirmPassword}
    //           onChange={handleConfirmPasswordChange}
    //         />
    //       </Form.Item>
    //       <Button type="primary" block htmlType="submit">
    //         Thay đổi mật khẩu
    //       </Button>
    //     </Form>
    //   </div>
    // </div>
    <div className="min-h-screen flex items-center justify-center bg-[#1a2235]">
      <div className="w-full max-w-4xl flex bg-[#1e2736] rounded-lg overflow-hidden">
        <div className="w-1/2 p-8">
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-full mr-3"></div>
            <h1 className="text-white text-xl font-semibold">
              APACHE VIET NAM
            </h1>
          </div>

          <h2 className="text-white text-lg mb-6">
            Nhập mật khẩu mới{" "}
            {`(${Math.floor(countdown / 60)}:${(countdown % 60)
              .toString()
              .padStart(2, "0")})`}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                className="w-full bg-[#141a27] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
              />
            </div>

            <div className="space-y-2">
              <input
                type="password"
                // className={`w-full bg-[#141a27] border rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500
                //   ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'}`}
                className="w-full bg-[#141a27] border rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {/* {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )} */}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              // disabled={Object.keys(errors).length > 0 || !newPassword || !confirmPassword}
            >
              Thay đổi mật khẩu
            </button>
            {/* <div className="text-center">
              <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
                Quay lại đăng nhập
              </a>
            </div> */}
          </form>

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

export default ResetNewPassword;
