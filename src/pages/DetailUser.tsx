import React, { useState } from "react";
import { Layout, Button, Form, Input, message, Select, Upload } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Option } = Select;

interface UserData {
  key: string;
  name: string;
  username: string;
  department: string;
  status: string;
  role: string;
  avatar: string;
  idCard?: string; // Optional field for ID Card
  imgFace?: string; // Optional field for Face Image
}

const DetailUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state as UserData;

  const [form] = Form.useForm();
  const [status, setStatus] = useState(userData.status);
  const [username, setUsername] = useState(userData.username);
  const [password, setPassword] = useState(""); // You might want to handle password securely
  const [idCard, setIdCard] = useState(userData.idCard);
  const [imgFace, setImgFace] = useState<string | null>(null); // State for face image

  const handleUpdateStatus = () => {
    message.success(`Cập nhật thành công`);
    navigate(-1);
    // Add logic here to update the user's status in the main data array if needed
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleFaceImageChange = (info: any) => {
    const file = info.file.originFileObj;
    const newUploadedImage = URL.createObjectURL(file);
    setImgFace(newUploadedImage);
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold">Chi tiết người dùng</h1>
        <Form form={form} layout="vertical" initialValues={userData}>
          <Form.Item name="name" label="Tên">
            <Input disabled />
          </Form.Item>
          <Form.Item name="username" label="Tên đăng nhập">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>
          <Form.Item name="department" label="Phòng ban">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Cập nhật trạng thái">
            <Form.Item name="status" noStyle>
              <Select
                value={status}
                onChange={(value) => setStatus(value)}
                style={{ width: '100%' }}
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu">
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>
          <Form.Item name="idCard" label="ID Card">
            <Input
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              placeholder="Nhập ID Card"
            />
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
              <img src={imgFace} alt="" className="w-16 h-16 rounded-full mt-2" />
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
