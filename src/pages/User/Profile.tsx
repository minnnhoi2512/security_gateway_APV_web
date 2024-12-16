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
import { roleTextMap, UserRoleText } from "../../types/Enum/UserRoleText";
import upload from "../../api/upload";
import { isEntityError } from "../../utils/helpers";

type FormData = {
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  departmentName: string;
  image: string;
  departmentId?: number;
};

const Profile: React.FC = () => {
  const { idUser } = useParams();

  const userId = Number(idUser) || Number(localStorage.getItem("userId"));
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetDetailUserQuery(userId);
  const [roleText, setRoleText] = useState<string>("");
  const [updateUser] = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);

  type FormError = { [key in keyof FormData]?: string[] } | null;
  const [errorVisitor, setErrorVisitor] = useState<FormError>(null);
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    departmentName: "",
    image: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData({
      userName: user.userName || "N/A",
      fullName: user.fullName || "N/A",
      email: user.email || "N/A",
      phoneNumber: user.phoneNumber || "N/A",
      departmentName: user.department?.departmentName || "N/A",
      image: user.image || defaultImg,
    });
    setRoleText(
      user?.role?.roleName
        ? roleTextMap[user.role.roleName as UserRoleText]?.textRole
        : "N/A"
    );
    setErrorVisitor(null);
  }, [idUser, user,isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      let downloadURL = null;
      if (file != null) {
        downloadURL = await upload(file);
      }

      const payload = {
        ...formData,
        image: downloadURL || user?.image,
        roleID: user?.role?.roleId || 0,
        status: user?.status || "Inactive",
      };
      payload.departmentId = user?.department?.departmentId || 0;
      const result = await updateUser({
        User: payload,
        idUser: userId,
      }).unwrap();
      console.log(result);
      setIsEditing(false);
      setFile(null);
      setFormData((prevData) => ({
        ...prevData,
        image: downloadURL,
      }));
      notification.success({ message: "Cập nhật thông tin thành công!" });
      refetch();
    } catch (error: any) {
      // console.log(error);
      if (isEntityError(error)) {
        setErrorVisitor(error.data.errors as FormError);
      }
      notification.error({
        message: `Cập nhật thất bại`,
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
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center p-1">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative h-48 bg-backgroundPage">
          <button
            onClick={() => {
              setIsEditing(!isEditing);
            }}
            className={`absolute top-3 right-4 rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg
              ${
                isEditing
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-blue-600 hover:bg-gray-100"
              }`}
          >
            {isEditing ? (
              <XIcon size={20} className="text-black" />
            ) : (
              <PencilIcon size={20} className="text-black" />
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
                  src={formData.image || user?.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="text-white w-8 h-8" />
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleImageChange(e)}
                    />
                  </div>
                )}
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-800">
              {formData.fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPinIcon size={16} />
              <span className="text-sm">{formData.departmentName}</span>
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
                {roleText}
              </Tag>
            </div>
          </div>

          {/* Form Section */}
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-xl mx-auto"
          >
            <div className="space-y-4">
              <Form.Item name="userName" label="Tên đăng nhập">
                <Input
                  name="userName"
                  value={formData.userName || "N/A"}
                  onChange={handleInputChange}
                  prefix={<User size={16} className="text-gray-400 mr-2" />}
                  readOnly
                  className="bg-gray-50 rounded-lg"
                  status={errorVisitor?.userName ? "error" : ""}
                />
                <span className="text-sm text-gray-600">
                 
                </span>
                {errorVisitor?.userName && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {errorVisitor.userName[0]}
                  </p>
                )}
              </Form.Item>
            </div>
            <Form.Item name="fullName" label="Họ và tên">
              <Input
                name="fullName"
                value={formData.fullName || "N/A"}
                onChange={handleInputChange}
                prefix={<Building size={16} className="text-gray-400 mr-2" />}
                readOnly={!isEditing}
                className={`rounded-lg ${!isEditing ? "bg-gray-50" : ""}`}
                status={errorVisitor?.fullName ? "error" : ""}
              />
               <span className="text-sm text-gray-600">
                 
                 </span>
              {errorVisitor?.fullName && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {errorVisitor.fullName[0]}
                </p>
              )}
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="email" label="Email">
                <Input
                  name="email"
                  value={formData.email || "N/A"}
                  onChange={handleInputChange}
                  prefix={<Mail size={16} className="text-gray-400 mr-2" />}
                  readOnly={!isEditing}
                  className={`rounded-lg ${!isEditing ? "bg-gray-50" : ""}`}
                  status={errorVisitor?.email ? "error" : ""}
                />
                 <span className="text-sm text-gray-600">
                 
                 </span>
                {errorVisitor?.email && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {errorVisitor.email[0]}
                  </p>
                )}
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                className="mb-4"
              >
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber || "N/A"}
                  onChange={handleInputChange}
                  prefix={<Phone size={16} className="text-gray-400 mr-2" />}
                  readOnly={!isEditing}
                  className={`rounded-lg ${!isEditing ? "bg-gray-50" : ""}`}
                  status={errorVisitor?.phoneNumber ? "error" : ""}
                />
                  <span className="text-sm text-gray-600">
                 
                 </span>
                {errorVisitor?.phoneNumber && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {errorVisitor.phoneNumber[0]}
                  </p>
                )}
              </Form.Item>
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
