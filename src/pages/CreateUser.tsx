import React, { useState } from "react";
import { Layout, Button, Form, Input, message, Upload, Select } from "antd";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { UploadOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import getDownloadURL
import { imageDB } from "../api/firebase"; // Adjust the path as necessary
import UserType from "../types/userType"; // Ensure this type is defined
import { useCreateNewUserMutation, useGetListUserByRoleQuery } from "../services/user.service";
import { useGetListDepartmentsQuery } from "../services/department.service";
import DepartmentType from "../types/departmentType";

const { Content } = Layout;

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the location
  const roleId = location.state?.roleId; // Access roleId from state

  const [form] = Form.useForm();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [faceImg, setFaceImg] = useState<File[]>([]);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined); // State for selected department

  const [createNewUser] = useCreateNewUserMutation(); // Destructure the mutation

  // Determine role based on roleId
  let role = "";
  if (roleId === 2) {
    role = "Manager";
  } else if (roleId === 3) {
    role = "DepartmentManager";
  } else if (roleId === 4) {
    role = "Staff";
  } else if (roleId === 5) {
    role = "Security";
  }

  const { data: listDepartment } = useGetListDepartmentsQuery({
    pageNumber: -1,
    pageSize: -1,
  });

  const { refetch: refetchUserList } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: role, // Use the dynamically set role
  });

  const handleCreateUser = async () => {
    try {
      await form.validateFields();

      // Upload images to Firebase Storage
      const faceImgPromises = faceImg.map((file) => {
        const uniqueFileName = `${uuidv4()}`; // Use uuid for unique filename
        const storageRef = ref(imageDB, `avtImg/${uniqueFileName}`);
        return uploadBytes(storageRef, file).then((snapshot) => {
          return getDownloadURL(snapshot.ref); // Get the download URL after upload
        });
      });

      // Wait for all uploads to complete and get URLs
      const faceImgUrls = await Promise.all(faceImgPromises);

      // Determine departmentId based on roleId
      const assignedDepartmentId = roleId === 2 ? 20 : roleId === 5 ? 19 : departmentId;

      const user: UserType = {
        userName: username,
        password: password,
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        image: faceImgUrls[0], // Assuming you want to store the first uploaded image
        roleID: roleId, // Use the roleId from the state
        departmentId: assignedDepartmentId, // Set departmentId based on roleId
      };

      // Call the mutation to create the user
      await createNewUser(user).unwrap(); // Use unwrap to handle the promise correctly
      message.success("Tạo người dùng thành công!");
      await refetchUserList();
      setFaceImg([]); // Clear the uploaded images
      form.resetFields(); // Reset form fields
      navigate(-1); // Go back after successful creation
    } catch (error) {
      console.error("Failed to create user:", error);
      const errorMessage = "Tạo người dùng thất bại!";
      message.error(errorMessage); // Show error message
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold">Tạo người dùng mới</h1>
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ Và Tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input
              placeholder="Nhập tên"
              onChange={(e) => setFullName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input
              placeholder="Nhập email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input
              placeholder="Nhập số điện thoại"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </Form.Item>
          {roleId === 3 || roleId === 4 ? (
            <Form.Item
              name="departmentId"
              label="Chọn phòng ban"
              rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
            >
              <Select
                placeholder="Chọn phòng ban"
                onChange={(value) => setDepartmentId(value)}
              >
                {listDepartment?.map((department: DepartmentType) => (
                  <Select.Option key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}
          <Form.Item label="Ảnh đại diện">
            <Upload
              beforeUpload={(file) => {
                setFaceImg((prev) => [...prev, file]);
                return false; // Prevent automatic upload
              }}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCreateUser}>
              Tạo người dùng
            </Button>
            <Button onClick={handleCancel} style={{ marginLeft: "10px" }}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default CreateUser;