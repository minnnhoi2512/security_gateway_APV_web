import React, { useEffect, useState } from "react";
import { Avatar, Button, Form, Input, message, notification, Tag } from "antd";
import { useParams } from "react-router-dom";
import {
  useGetDetailUserQuery,
  useUpdateUserMutation,
} from "../../services/user.service";
import {
  Building,
  Camera,
  CheckIcon,
  Mail,
  MapPinIcon,
  PencilIcon,
  Phone,
  User,
  XIcon,
} from "lucide-react";
import defaultImg from "../../assets/default-user-image.png";

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const userId = Number(id) || Number(localStorage.getItem("userId"));
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetDetailUserQuery(userId);
  const [updateUser] = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        departmentName: user.department?.departmentName || "N/A",
        image: user.image || defaultImg,
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
      if (
        user?.role?.roleName !== "Admin" &&
        user?.role?.roleName !== "Manager"
      ) {
        payload.departmentId = user?.department?.departmentId || 0;
      }

      await updateUser({ User: payload, idUser: userId }).unwrap();
      notification.success({ message: "Cập nhật thông tin thành công!" });

      refetch(); // Gọi lại API để lấy dữ liệu mới nhất
    } catch (e: any) {
      console.error("Lỗi API:", e);
      if (e.data?.errors) {
        Object.entries(e.data.errors).forEach(([key, value]) => {
          console.error(`Lỗi ở ${key}: ${value}`);
        });
      }
      notification.error({
        message: `Cập nhật thất bại: ${e.data?.message || "Có lỗi xảy ra"}`,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        image: user?.image,
        roleID: user?.role?.roleId || 0,
        status: user?.status || "Inactive",
      };
      payload.departmentId = user?.department?.departmentId || 0;
      await updateUser({ User: payload, idUser: userId }).unwrap();
      setIsEditing(false);
      notification.success({ message: "Cập nhật thông tin thành công!" });
      refetch();
    } catch (e: any) {
      notification.error({
        message: `Cập nhật thất bại: ${e.data?.message || "Có lỗi xảy ra"}`,
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden mb-[120px]">
        {/* Header Section */}
        <div className="relative h-40 bg-backgroundPage">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
              isEditing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            {isEditing ? (
              <XIcon size={20} className="text-white" />
            ) : (
              <PencilIcon size={20} className="text-white" />
            )}
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 -mt-16">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                <img
                  src={user?.image || defaultImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-800">
              {user?.fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPinIcon size={16} />
              <span className="text-sm">
                {user?.department?.departmentName || "N/A"}
              </span>
            </div>

            {/* Status and Role Tags */}
            <div className="flex gap-2 mt-3">
              <Tag
                color={user?.status === "Active" ? "success" : "error"}
                className="rounded-full px-3"
              >
                {user?.status === "Active" ? "Hoạt động" : "Không hoạt động"}
              </Tag>
              <Tag color="blue" className="rounded-full px-3">
                {user?.role?.roleName || "N/A"}
              </Tag>
            </div>
          </div>

          {/* Form Section */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-xl mx-auto"
          >
            <div className="space-y-4">
              <Form.Item name="userName" label="Tên đăng nhập">
                <Input
                  prefix={<User size={16} className="text-gray-400 mr-2" />}
                  readOnly
                  className="bg-gray-50 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input
                  prefix={<Building size={16} className="text-gray-400 mr-2" />}
                  readOnly={!isEditing}
                  className={`rounded-lg ${!isEditing ? "bg-gray-50" : ""}`}
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input
                    prefix={<Mail size={16} className="text-gray-400 mr-2" />}
                    readOnly={!isEditing}
                    className={`rounded-lg ${!isEditing ? "bg-gray-50" : ""}`}
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: /^[0-9]+$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input
                    prefix={<Phone size={16} className="text-gray-400 mr-2" />}
                    readOnly={!isEditing}
                    className={`rounded-lg ${!isEditing ? "bg-gray-50" : ""}`}
                  />
                </Form.Item>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckIcon size={16} />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
