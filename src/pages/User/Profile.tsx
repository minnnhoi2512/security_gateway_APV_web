import React, { useEffect, useState } from "react";
import { Avatar, Button, Form, Input, message, notification, Tag } from "antd";
import { useParams } from "react-router-dom";
import {
  useGetDetailUserQuery,
  useUpdateUserMutation,
} from "../../services/user.service";
import { Camera, CheckIcon, MapPinIcon, PencilIcon, XIcon } from "lucide-react";
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

  if (isLoading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Không tìm thấy thông tin người dùng.</p>;

  return (
    // <div className="p-8 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
    //   <div className="flex items-center space-x-4 mb-6">
    //     <Avatar size={64} src={user?.image} />
    //     <div>
    //       <h2 className="text-xl font-semibold">{user?.fullName}</h2>
    //       <p className="text-gray-500">{user?.role?.roleName}</p>
    //     </div>
    //   </div>

    //   <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
    //     <Form.Item label="Tên đăng nhập" name="userName">
    //       <Input readOnly className="bg-gray-100" />
    //     </Form.Item>

    //     <Form.Item
    //       label="Họ và tên"
    //       name="fullName"
    //       rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
    //     >
    //       <Input placeholder="Nhập họ và tên" />
    //     </Form.Item>

    //     <Form.Item
    //       label="Email"
    //       name="email"
    //       rules={[
    //         { required: true, message: "Vui lòng nhập email" },
    //         { type: "email", message: "Email không hợp lệ" },
    //       ]}
    //     >
    //       <Input placeholder="Nhập email" />
    //     </Form.Item>

    //     <Form.Item
    //       label="Số điện thoại"
    //       name="phoneNumber"
    //       rules={[
    //         { required: true, message: "Vui lòng nhập số điện thoại" },
    //         { pattern: /^[0-9]+$/, message: "Số điện thoại không hợp lệ" },
    //       ]}
    //     >
    //       <Input placeholder="Nhập số điện thoại" />
    //     </Form.Item>

    //     <Form.Item label="Ảnh đại diện" name="image" hidden>
    //       <Input />
    //     </Form.Item>

    //     {/* Chỉ hiển thị trường phòng ban nếu không phải Admin hoặc Manager */}
    //     {user?.role?.roleName !== "Admin" && user?.role?.roleName !== "Manager" && (
    //       <Form.Item label="Phòng ban" name="departmentName">
    //         <Input readOnly className="bg-gray-100" />
    //       </Form.Item>
    //     )}

    //     <div className="flex items-center space-x-2">
    //       <span>Trạng thái:</span>
    //       {user?.status === "Active" ? (
    //         <Tag color="green">Hoạt động</Tag>
    //       ) : (
    //         <Tag color="red">Không hoạt động</Tag>
    //       )}
    //     </div>

    //     <Form.Item>
    //       <Button type="primary" htmlType="submit" className="w-full">
    //         Cập nhật thông tin
    //       </Button>
    //     </Form.Item>
    //   </Form>
    // </div>
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center p-1">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative h-48 bg-backgroundPage">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`absolute top-3 right-4 rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg
              ${
                isEditing
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-blue-600 hover:bg-gray-100"
              }`}
          >
            {isEditing ? <XIcon size={24} /> : <PencilIcon size={24} />}
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-4 pb-4 -mt-20 mb-10 ">
          <div className="flex flex-col items-start">
            {/* Profile Image */}
            <div className="relative group mb-4">
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden">
                <img
                  src={user?.image || "/api/placeholder/150/150"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {user?.fullName}
              </h1>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPinIcon size={18} className="mr-2" />
                <span className="text-sm">
                  {user?.department?.departmentName || "N/A"}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="w-full"
              initialValues={user}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <Form.Item
                    label="Tên đăng nhập"
                    name="userName"
                    className="mb-4"
                  >
                    <Input
                      readOnly
                      className="bg-gray-100 border-transparent rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên" },
                    ]}
                    className="mb-4"
                  >
                    <Input
                      readOnly={!isEditing}
                      className={`rounded-lg ${
                        !isEditing ? "bg-gray-100" : ""
                      }`}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                    className="mb-4"
                  >
                    <Input
                      readOnly={!isEditing}
                      className={`rounded-lg ${
                        !isEditing ? "bg-gray-100" : ""
                      }`}
                    />
                  </Form.Item>
                </div>

                {/* Right Column */}
                <div>
                  <Form.Item
                    label="Số điện thoại"
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9]+$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                    className="mb-4"
                  >
                    <Input
                      readOnly={!isEditing}
                      className={`rounded-lg ${
                        !isEditing ? "bg-gray-100" : ""
                      }`}
                    />
                  </Form.Item>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </div>
                      <Tag
                        color={user?.status === "Active" ? "green" : "red"}
                        className="px-4 py-1 rounded-full"
                      >
                        {user?.status === "Active"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </Tag>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Vai trò
                      </div>
                      <Tag color="blue" className="px-4 py-1 rounded-full">
                        {user?.role?.roleName || "N/A"}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckIcon size={18} className="mr-2" />
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
