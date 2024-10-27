import React, { useEffect } from "react";
import { Avatar, Button, Form, Input, message, Tag } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useGetDetailUserQuery, useUpdateUserMutation } from "../services/user.service";

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userId = Number(id) || Number(localStorage.getItem("userId"));
  const { data: user, isLoading, error, refetch } = useGetDetailUserQuery(userId);
  const [updateUser] = useUpdateUserMutation();

  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        departmentName: user.department?.departmentName || "N/A",
        image: user.image,
      });
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    try {
      const payload: any = {
        ...values,
        roleID: user?.role?.roleId || 0,
        status: user?.status || "Inactive",
      };

      // Nếu user có role Admin hoặc Manager, không gửi departmentId
      if (user?.role?.roleName !== "Admin" && user?.role?.roleName !== "Manager") {
        payload.departmentId = user?.department?.departmentId || 0;
      }

      const response = await updateUser({ User: payload, idUser: userId }).unwrap();
      message.success("Cập nhật thông tin thành công!");

      refetch(); // Gọi lại API để lấy dữ liệu mới nhất
    } catch (e: any) {
      console.error("Lỗi API:", e);
      if (e.data?.errors) {
        Object.entries(e.data.errors).forEach(([key, value]) => {
          console.error(`Lỗi ở ${key}: ${value}`);
        });
      }
      message.error(`Cập nhật thất bại: ${e.data?.message || "Có lỗi xảy ra"}`);
    }
  };

  if (isLoading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Không tìm thấy thông tin người dùng.</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar size={64} src={user?.image} />
        <div>
          <h2 className="text-xl font-semibold">{user?.fullName}</h2>
          <p className="text-gray-500">{user?.role?.roleName}</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
        <Form.Item label="Tên đăng nhập" name="userName">
          <Input readOnly className="bg-gray-100" />
        </Form.Item>

        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            { pattern: /^[0-9]+$/, message: "Số điện thoại không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item label="Ảnh đại diện" name="image" hidden>
          <Input />
        </Form.Item>

        {/* Chỉ hiển thị trường phòng ban nếu không phải Admin hoặc Manager */}
        {user?.role?.roleName !== "Admin" && user?.role?.roleName !== "Manager" && (
          <Form.Item label="Phòng ban" name="departmentName">
            <Input readOnly className="bg-gray-100" />
          </Form.Item>
        )}

        <div className="flex items-center space-x-2">
          <span>Trạng thái:</span>
          {user?.status === "Active" ? (
            <Tag color="green">Hoạt động</Tag>
          ) : (
            <Tag color="red">Không hoạt động</Tag>
          )}
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Cập nhật thông tin
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
