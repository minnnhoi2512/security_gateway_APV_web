import React, { useState } from "react";
import { Layout, Button, Form, Input, message, Select, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Option } = Select;

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  
  const [form] = Form.useForm();
  const [status, setStatus] = useState("Active"); // Default status
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [idCardImg, setIdCardImg] = useState<any[]>([]);
  const [faceImg, setFaceImg] = useState<any[]>([]);

  const handleCreateUser = () => {
    form.validateFields().then(() => {
      // Handle user creation logic here
      message.success("Tạo người dùng thành công!");
      navigate(-1); // Go back after successful creation
    }).catch((errorInfo) => {
      console.error("Failed to create user:", errorInfo);
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold">Tạo người dùng mới</h1>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
            <Input placeholder="Nhập tên" />
          </Form.Item>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>
          <Form.Item name="department" label="Phòng ban" rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}>
            <Select placeholder="Chọn phòng ban">
              <Option value="Sales">Bán hàng</Option>
              <Option value="Marketing">Tiếp thị</Option>
              <Option value="HR">Nhân sự</Option>
              <Option value="IT">Công nghệ thông tin</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Trạng thái">
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
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
            <Input.Password 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Nhập mật khẩu" 
            />
          </Form.Item>
          <Form.Item label="Ảnh ID Card">
            <Upload
              beforeUpload={(file) => {
                setIdCardImg([...idCardImg, file]);
                return false;
              }}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>Tải lên ảnh ID Card</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Ảnh Gương Mặt">
            <Upload
              beforeUpload={(file) => {
                setFaceImg([...faceImg, file]);
                return false;
              }}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>Tải lên ảnh gương mặt</Button>
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
