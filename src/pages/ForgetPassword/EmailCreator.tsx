import React, { useState } from "react";
import { Input, Button, notification } from "antd";
import { useForgetPasswordUserMutation } from "../../services/forgetPassword.service";
import { useNavigate } from "react-router";

const EmailCreator = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [inputEmail] = useForgetPasswordUserMutation();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await inputEmail({ email }).unwrap();
      localStorage.setItem("email", email);
      console.log(result);
      if (result) {
        navigate("/confirmOTP");
      }
    } catch (error: any) {
      notification.error({
        message: error.data.errors.email[0] || "Email không tồn tại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="flex justify-center items-center h-screen">
    //   <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
    //     <h2 className="text-2xl font-bold mb-4">Địa chỉ email</h2>
    //     <div className="space-y-4">
    //       <Input
    //         placeholder="Địa chỉ email"
    //         className="rounded-md"
    //         value={email}
    //         onChange={handleInputChange}
    //       />
    //       <Button type="primary" block onClick={handleSubmit}>
    //         Xác nhận
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
            Hệ thống khôi phục mật khẩu
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                ĐỊA CHỈ EMAIL
              </label>
              {/* <input
                type="email"
                className="w-full bg-[#141a27] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Nhập địa chỉ email"
              /> */}

              <Input
                placeholder="Địa chỉ email"
                className="w-full bg-white  border border-gray-700 rounded-md px-4 py-2 text-black focus:!text-black focus:outline-none focus:border-blue-500"
                value={email}
                onChange={handleInputChange}
              />
            </div>

            <Button
              type="primary"
              block
              onClick={handleSubmit}
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              {loading ? "Đang gửi OTP" : "Xác nhận"}
            </Button>

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

export default EmailCreator;
