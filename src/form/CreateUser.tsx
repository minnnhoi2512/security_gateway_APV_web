import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  Form,
  Input,
  Upload,
  Select,
  Card,
  Typography,
  Row,
  Col,
  notification,
} from "antd";
import { useLocation } from "react-router-dom";
import {
  DeleteOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { imageDB } from "../api/firebase";
import UserType from "../types/userType";
import {
  useCreateNewUserMutation,
  useGetListUserByRoleQuery,
} from "../services/user.service";
import { useGetListDepartmentsQuery } from "../services/department.service";
import DepartmentType from "../types/departmentType";

const { Content } = Layout;
const { Title, Text } = Typography;
interface CreateUserProps {
  onSuccess?: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onSuccess }) => {
  const userRole = localStorage.getItem("userRole");
  const departmentId_local = localStorage.getItem("departmentId");
  const [form] = Form.useForm();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [faceImg, setFaceImg] = useState<File[]>([]);
  const [roleId, setRoleId] = useState("");
  const [fileList, setFileList] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const [departmentId, setDepartmentId] = useState<number | undefined>(
    undefined
  );
  const [editDisable, setEditDisabled] = useState(false);
  const [createNewUser] = useCreateNewUserMutation();

  const { data: listDepartment } = useGetListDepartmentsQuery({
    pageNumber: -1,
    pageSize: -1,
  });

  const { refetch: refetchUserList } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: "All",
  });

  const handleReset = () => {
    form.resetFields();
    setFileList([]);
    setImageUrl("");
    setFaceImg([]);
  };

  const handleImageUpload = ({ file, fileList: newFileList }) => {
    setFileList(newFileList);

    // Tạo URL cho preview
    if (file.status !== "removed") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setImageUrl(result);
        }
      };
      reader.readAsDataURL(file.originFileObj);
      setFaceImg([file.originFileObj]);
    } else {
      // Reset khi xóa file
      setImageUrl("");
      setFaceImg([]);
    }
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleCreateUser = async () => {
    try {
      await form.validateFields();
      const faceImgPromises = faceImg.map((file) => {
        const uniqueFileName = `${uuidv4()}`;
        const storageRef = ref(imageDB, `avtImg/${uniqueFileName}`);
        return uploadBytes(storageRef, file).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        );
      });
      const faceImgUrls = await Promise.all(faceImgPromises);

      const user: UserType = {
        userName: username,
        password: password,
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        image: faceImgUrls[0],
        roleID: userRole === "DepartmentManager" ? 4 : Number(roleId), // Force Staff role
        departmentId:
          userRole === "DepartmentManager"
            ? Number(departmentId_local)
            : departmentId, // Force department match
      };
      await createNewUser(user).unwrap();
      setFaceImg([]);
      form.resetFields();
      refetchUserList();
      onSuccess?.();
      notification.success({ message: "Tạo người dùng thành công!" });
    } catch (error) {
      console.error("Failed to create user:", error);
      notification.error({ message: "Tạo người dùng thất bại!" });
    }
  };

  return (
    <div className="bg-white">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 text-center">
        <Title level={4} className="!mb-1 text-lg !text-buttonColor">
          Tạo Người Dùng Mới
        </Title>
        <p className="text-gray-500 text-sm">
          Vui lòng nhập thông tin cần thiết
        </p>
      </div>

      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          className="space-y-3"
          requiredMark={false}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Form.Item
                name="fullName"
                label={<span className="text-gray-600">Họ và Tên</span>}
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nhập họ và tên"
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-md"
                  size="middle"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-gray-600">Email</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="example@domain.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md"
                  size="middle"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label={<span className="text-gray-600">Số điện thoại</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="0123456789"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-md"
                  size="middle"
                />
              </Form.Item>
            </div>

            <div className="space-y-3">
              <Form.Item
                name="username"
                label={<span className="text-gray-600">Tên đăng nhập</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nhập tên đăng nhập"
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-md"
                  size="middle"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-gray-600">Mật khẩu</span>}
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-md"
                  size="middle"
                />
              </Form.Item>

              {userRole !== "DepartmentManager" && (
                <Form.Item
                  name="departmentId"
                  label={<span className="text-gray-600">Phòng ban</span>}
                  rules={[
                    { required: true, message: "Vui lòng chọn phòng ban" },
                  ]}
                >
                  <Select
                    placeholder="Chọn phòng ban"
                    onChange={(value) => {
                      setDepartmentId(value);
                      const selectedDepartment = listDepartment.find(
                        (dept) => dept.departmentId === value
                      );
                      if (selectedDepartment?.departmentName === "Security") {
                        setRoleId("5");
                      }
                    }}
                    className="rounded-md"
                    size="middle"
                  >
                    {listDepartment
                      ?.filter((department) => {
                        if (userRole === "Manager") {
                          return (
                            department.departmentName !== "Admin" &&
                            department.departmentName !== "Manager"
                          );
                        }
                        return true;
                      })
                      ?.map((department) => (
                        <Select.Option
                          key={department.departmentId}
                          value={department.departmentId}
                        >
                          {department.departmentName === "Manager"
                            ? "Phòng Quản lý"
                            : department.departmentName === "Security"
                            ? "Phòng Bảo vệ"
                            : department.departmentName}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              )}
            </div>
          </div>

          {userRole !== "DepartmentManager" && !editDisable && (
            <Form.Item
              name="roleId"
              label={<span className="text-gray-600">Vai trò</span>}
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                onChange={(value) => setRoleId(value)}
                className="rounded-md"
                size="middle"
              >
                {userRole === "Admin" && (
                  <>
                    <Select.Option value="1">Quản trị viên</Select.Option>
                    <Select.Option value="2">Quản lý</Select.Option>
                  </>
                )}
                <Select.Option value="3">Quản lý phòng ban</Select.Option>
                <Select.Option value="4">Nhân viên</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            label={<span className="text-gray-600">Ảnh đại diện</span>}
          >
            {/* <Upload
              beforeUpload={(file) => {
                setFaceImg((prev) => [...prev, file]);
                return false;
              }}
              showUploadList={true}
              className="w-full"
            >
              <Button
                icon={<UploadOutlined />}
                className="w-full h-20 flex items-center justify-center border-2 border-dashed hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <span className="ml-2">Tải ảnh lên</span>
              </Button>
            </Upload> */}
            {!imageUrl ? (
              <Upload
                accept="image/*"
                fileList={fileList}
                onChange={handleImageUpload}
                beforeUpload={(file) => {
                  // Thêm beforeUpload giống như code cũ
                  setFaceImg((prev) => [...prev, file]);
                  return false;
                }}
                maxCount={1}
                listType="picture"
                className="w-full"
              >
                <Button
                  icon={<UploadOutlined />}
                  className="w-full h-20 flex items-center justify-center border-2 border-dashed hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <span className="ml-2">Tải ảnh lên</span>
                </Button>
              </Upload>
            ) : (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-[200px] rounded-lg shadow-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <Upload
                      accept="image/*"
                      beforeUpload={(file) => {
                        setFaceImg((prev) => [...prev, file]);
                        return false;
                      }}
                      showUploadList={false}
                      onChange={handleImageUpload}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="hover:text-blue-500"
                      >
                        Tải ảnh mới
                      </Button>
                    </Upload>
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setImageUrl("");
                        setFileList([]);
                        setFaceImg([]);
                      }}
                      className="hover:text-red-500"
                    >
                      Xóa ảnh
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Form.Item>

          <Form.Item className="mb-0 mt-4">
            <div className="flex justify-end gap-2">
              <Button onClick={() => form.resetFields()} className="rounded-md">
                Đặt lại
              </Button>
              <Button
                type="primary"
                onClick={handleCreateUser}
                className="rounded-md bg-buttonColor hover:!bg-buttonColor"
              >
                Tạo người dùng
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateUser;
