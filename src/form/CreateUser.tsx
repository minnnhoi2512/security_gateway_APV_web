import React, { useState } from "react";
import { Layout, Button, Form, Input, message, Upload, Select, Card, Typography, Row, Col } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { imageDB } from "../api/firebase";
import UserType from "../types/userType";
import {
  useCreateNewUserMutation,
  useGetListStaffByDepartmentManagerQuery,
  useGetListUserByRoleQuery,
} from "../services/user.service";
import { useGetListDepartmentsQuery } from "../services/department.service";
import DepartmentType from "../types/departmentType";

const { Content } = Layout;
const { Title, Text } = Typography;

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roleId = location.state?.roleId;
  const departmentId_local = Number(localStorage.getItem("departmentId"));
  const userRole = localStorage.getItem("userRole");
  const userId = Number(localStorage.getItem("userId"));
  const [form] = Form.useForm();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [faceImg, setFaceImg] = useState<File[]>([]);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [createNewUser] = useCreateNewUserMutation();

  const { data: listDepartment } = useGetListDepartmentsQuery({
    pageNumber: -1,
    pageSize: -1,
  });

  const { refetch: refetchStaffData } = useGetListStaffByDepartmentManagerQuery(
    { pageNumber: -1, pageSize: -1, departmentManagerId: userId },
    { skip: userRole !== "DepartmentManager" }
  );

  const { refetch: refetchUserList } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: roleId === 2 ? "Manager" : roleId === 3 ? "DepartmentManager" : roleId === 4 ? "Staff" : "Security",
  });

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
      const assignedDepartmentId =
        roleId === 2 ? 2 : roleId === 5 ? 3 : departmentId || departmentId_local;

      const user: UserType = {
        userName: username,
        password: password,
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        image: faceImgUrls[0],
        roleID: roleId,
        departmentId: assignedDepartmentId || departmentId_local,
      };

      await createNewUser(user).unwrap();
      message.success("Tạo người dùng thành công!");
      if (userRole === "DepartmentManager") {
        await refetchStaffData();
      } else {
        await refetchUserList();
      }
      setFaceImg([]);
      form.resetFields();
      navigate(-1);
    } catch (error) {
      console.error("Failed to create user:", error);
      message.error("Tạo người dùng thất bại!");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const filteredDepartments = listDepartment?.filter(
    (department: DepartmentType) => ![1, 2, 3].includes(department.departmentId)
  );

  return (
    <Layout className="min-h-screen flex justify-center items-center bg-gray-50">
      <Content className="w-full max-w-2xl">
        <Card className="shadow-md border border-gray-200 p-6 rounded-lg">
          <Title level={3} className="text-3xl font-bold text-center text-titleMain mb-6">Tạo Người Dùng Mới</Title>
          <Text type="secondary" className="text-center block mb-6">
            Vui lòng nhập thông tin cần thiết để tạo người dùng mới
          </Text>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="fullName"
                  label={<Text className="font-medium text-gray-700">Họ và Tên</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                >
                  <Input
                    placeholder="Nhập tên"
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label={<Text className="font-medium text-gray-700">Email</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập email" }]}
                >
                  <Input
                    placeholder="Nhập email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label={<Text className="font-medium text-gray-700">Tên đăng nhập</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                >
                  <Input
                    placeholder="Nhập tên đăng nhập"
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label={<Text className="font-medium text-gray-700">Mật khẩu</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                >
                  <Input.Password
                    placeholder="Nhập mật khẩu"
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phoneNumber"
                  label={<Text className="font-medium text-gray-700">Số điện thoại</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                >
                  <Input
                    placeholder="Nhập số điện thoại"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                {roleId !== 2 && roleId !== 5 && !(roleId === 4 && userRole === "DepartmentManager") && (
                  <Form.Item
                    name="departmentId"
                    label={<Text className="font-medium text-gray-700">Chọn phòng ban</Text>}
                    rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
                  >
                    <Select
                      placeholder="Chọn phòng ban"
                      onChange={(value) => setDepartmentId(value)}
                      className="rounded-md"
                    >
                      {filteredDepartments?.map((department: DepartmentType) => (
                        <Select.Option key={department.departmentId} value={department.departmentId}>
                          {department.departmentName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Col>
              <Col xs={24}>
                <Form.Item label={<Text className="font-medium text-gray-700">Ảnh đại diện</Text>}>
                  <Upload
                    beforeUpload={(file) => {
                      setFaceImg((prev) => [...prev, file]);
                      return false;
                    }}
                    showUploadList={true}
                    className="rounded-md"
                  >
                    <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={handleCancel} className="rounded-md border-gray-300">
                Hủy
              </Button>
              <Button type="primary" onClick={handleCreateUser} className="rounded-md">
                Tạo người dùng
              </Button>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default CreateUser;
