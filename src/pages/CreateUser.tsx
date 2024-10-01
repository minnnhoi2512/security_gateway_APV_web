import React, { useState } from "react";
import { Layout, Button, Form, Input, message, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { ref, uploadBytes } from "firebase/storage";
import { imageDB } from "../api/firebase"; // Adjust the path as necessary

const { Content } = Layout;

const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [idCardImg, setIdCardImg] = useState<File[]>([]);
    const [faceImg, setFaceImg] = useState<File[]>([]);

    const handleCreateUser = async () => {
        try {
            await form.validateFields();
            const user = {
                username,
                password,
                fullName,
                phoneNumber,
                email,
            };

            // Upload images to Firebase Storage
            const idCardPromises = idCardImg.map((file) => {
                const uniqueFileName = `${uuidv4()}`; // Use uuid for unique filename
                const storageRef = ref(imageDB, `idCards/${uniqueFileName}`);
                return uploadBytes(storageRef, file);
            });

            const faceImgPromises = faceImg.map((file) => {
                const uniqueFileName = `${uuidv4()}`; // Use uuid for unique filename
                const storageRef = ref(imageDB, `faceImages/${uniqueFileName}`);
                return uploadBytes(storageRef, file);
            });

            // Wait for all uploads to complete
            await Promise.all([...idCardPromises, ...faceImgPromises]);

            message.success("Tạo người dùng thành công!");
            setIdCardImg([]); // Clear the uploaded images
            setFaceImg([]); // Clear the uploaded images
            form.resetFields(); // Reset form fields
            navigate(-1); // Go back after successful creation
        } catch (errorInfo) {
            console.error("Failed to create user:", errorInfo);
            message.error("Tạo người dùng thất bại!"); // Show error message
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
                    <Form.Item label="Ảnh ID Card">
                        <Upload
                            beforeUpload={(file) => {
                                setIdCardImg((prev) => [...prev, file]);
                                return false; // Prevent automatic upload
                            }}
                            showUploadList={true}
                        >
                            <Button icon={<UploadOutlined />}>Tải lên ảnh ID Card</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item label="Ảnh Gương Mặt">
                        <Upload
                            beforeUpload={(file) => {
                                setFaceImg((prev) => [...prev, file]);
                                return false; // Prevent automatic upload
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