import React, { useState } from "react";
import { Layout, Button, Form, Input, message, Select, Upload } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import {
  useUpdateUserMutation,
  useGetDetailUserQuery,
  useGetListUserByRoleQuery,
} from "../services/user.service";
import User from "../types/UserType";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique file names
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase functions
import { imageDB } from "../api/firebase"; // Import your Firebase configuration

const { Content } = Layout;
const { Option } = Select;

const DetailUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Extract id from route parameters
  const userId = Number(id); // Parse id to a number
  const [form] = Form.useForm();
  const [imgFace, setImgFace] = useState<string | null>(null); // Initialize with existing image
  const [faceImg, setFaceImg] = useState<File[]>([]); // State to hold uploaded image files
  const [updateUser] = useUpdateUserMutation(); // Hook for updating user

  // Fetch user details using the userId
  const { data: userData, isLoading, isError } = useGetDetailUserQuery(userId);
  // Handle loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user details.</div>;
  const { refetch: refetchUserList } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: userData.role.roleName, // Use the dynamically set role
  });
  const handleUpdateStatus = async () => {
    try {
      // Prepare an array of promises for uploading images
      const faceImgPromises = faceImg.map((file) => {
        const uniqueFileName = `${uuidv4()}`; // Use uuid for unique filename
        const storageRef = ref(imageDB, `avtImg/${uniqueFileName}`);
        return uploadBytes(storageRef, file).then((snapshot) => {
          return getDownloadURL(snapshot.ref); // Get the download URL after upload
        });
      });

      // Wait for all uploads to complete and get URLs
      const faceImgUrls = await Promise.all(faceImgPromises);
      console.log(userData);
      // Prepare the updated user data
      const updatedUser: User = {
        ...userData,
        fullName: form.getFieldValue("fullName"), // Get updated fullName from form
        email: form.getFieldValue("email"), // Get updated email from form
        departmentId: userData.department.departmentId,
        roleID: userData.role.roleId,
        status: form.getFieldValue("status") || userData.status, // Get updated status from form
        image: faceImgUrls[0] || userData.image, // Use the new image if uploaded, or keep the old one
      };

      // Call the mutation with the user ID and updated user data
      await updateUser({
        idUser: userData.userId || null,
        User: updatedUser,
      }).unwrap();
      await refetchUserList();
      message.success(`Cập nhật thành công`);
      navigate(-1);
    } catch (error) {
      message.error(`Cập nhật thất bại`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleFaceImageChange = (info: any) => {
    const fileList = info.fileList;
    setFaceImg(fileList.map((file: any) => file.originFileObj)); // Store the uploaded file(s)
    const newUploadedImage = URL.createObjectURL(fileList[0]?.originFileObj);
    setImgFace(newUploadedImage); // Preview the uploaded image
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold">
          Chi tiết người dùng
        </h1>
        <Form form={form} layout="vertical" initialValues={userData}>
          <Form.Item
            name="fullName"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Vai trò">
            <Input disabled value={userData.role?.roleName} />
          </Form.Item>
          <Form.Item name="status" label="Cập nhật trạng thái">
            <Select
              defaultValue={userData.status}
              onChange={(value) => form.setFieldsValue({ status: value })} // Update form value
              style={{ width: "100%" }}
            >
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Hình ảnh mặt">
            <Upload
              listType="picture"
              showUploadList={false}
              onChange={handleFaceImageChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh mặt</Button>
            </Upload>
            {userData.image && (
              <img
                src={userData.image}
                alt="User Face"
                className="w-16 h-16 rounded-full mt-2"
              />
            )}
            {imgFace && (
              <img
                src={imgFace}
                alt="Uploaded Face"
                className="w-16 h-16 rounded-full mt-2"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleUpdateStatus}>
              Cập nhật
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

export default DetailUser;
