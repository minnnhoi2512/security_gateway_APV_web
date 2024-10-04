import React, { useState } from "react";
import { Layout, Button, Form, Input, message, Select, Upload } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { useUpdateUserMutation } from "../services/user.service";
import User from "../types/userType";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique file names
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase functions
import { imageDB } from "../api/firebase"; // Import your Firebase configuration

const { Content } = Layout;
const { Option } = Select;

const DetailUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData: User = location.state ; // Ensure userData is of type User

  const [form] = Form.useForm();
  const [status, setStatus] = useState<string | null>(userData.status || null);
  const [imgFace, setImgFace] = useState<string | null>(userData.image || null); // Initialize with existing image
  const [faceImg, setFaceImg] = useState<File[]>([]); // State to hold uploaded image files
  const [updateUser] = useUpdateUserMutation(); // Hook for updating user

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

      // Prepare the updated user data
      const updatedUser: User = {
        ...userData,
        status: status || undefined,
        image: faceImgUrls[0] || userData.image // Use the new image if uploaded, or keep the old one
      };

      // Call the mutation with the user ID and updated user data
      await updateUser({ idUser: userData.userId || null, User: updatedUser }).unwrap();
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
        <h1 className="text-green-500 text-2xl font-bold">Chi tiết người dùng</h1>
        <Form form={form} layout="vertical" initialValues={userData}>
          <Form.Item name="fullName" label="Tên">
            <Input value={userData.fullName} readOnly />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input value={userData.email} readOnly />
          </Form.Item>
          <Form.Item label="Vai trò">
            <Input disabled value={userData.role?.roleName} />
          </Form.Item>
          <Form.Item label="Cập nhật trạng thái">
            <Form.Item name="status" noStyle>
              <Select
                value={status}
                onChange={(value) => setStatus(value)}
                style={{ width: "100%" }}
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
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
            {imgFace && (
              <img
                src={imgFace}
                alt="User Face"
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