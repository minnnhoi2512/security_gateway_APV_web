// create page for forget password input email, input otp, input new password
// do it in 1 page with step of ant design

import React, { useState } from "react";
import { Form, Input, Button, Steps, message } from "antd";
// import { useHistory } from "react-router-dom";
import { useMutation } from "react-query";
// import { forgetPassword } from "../services/auth.service";
import { toast } from "react-toastify";
// import { useAuth } from "../context/auth.context";
import { useQueryClient } from "react-query";
import { LoadingOutlined } from "@ant-design/icons";
const { Step } = Steps;

const ForgetPassword = () => {
  const [current, setCurrent] = useState(0);
//   const history = useHistory();
  const queryClient = useQueryClient();
//   const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

//   const { mutateAsync: forgetPasswordMutation } = useMutation(forgetPassword, {
//     onSuccess: async (data) => {
//       if (data) {
//         toast.success("Mã OTP đã được gửi tới email của bạn");
//         setCurrent(1);
//       }
//     },
//     onError: (error) => {
//       toast.error("Email không tồn tại");
//     },
//   });

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
    //   await forgetPasswordMutation(values);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const handleNext = () => {
    setCurrent(current + 1);
  };
  const handlePrev = () => {
    setCurrent(current - 1);
  };
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Quên mật khẩu</h2>
          <Form
            form={form}
            name="forget-password"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <input type="password" name="password" placeholder="Mậtfortunate" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
            />
            <button type="submit">Xác nhận</button>
          </Form>

          <div className="text-center mt-4">
            <Button type="primary" >
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
