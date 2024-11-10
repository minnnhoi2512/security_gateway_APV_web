import React, { useState } from "react";
import {
  Layout,
  Button,
  Form,
  Input,
  Upload,
  Spin,
  notification,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import {
  useUpdateUserMutation,
  useGetDetailUserQuery,
  useGetListUserByRoleQuery,
} from "../../services/user.service";
import User from "../../types/userType";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique file names
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase functions
import { imageDB } from "../../api/firebase"; // Import your Firebase configuration
import { roleMap, UserRole } from "../../types/Enum/UserRole";

const { Content } = Layout;

const DetailUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = Number(id);
  const [form] = Form.useForm();
  const [imgFace, setImgFace] = useState<string | null>(null);
  const [faceImg, setFaceImg] = useState<File[]>([]);
  const [updateUser] = useUpdateUserMutation();

  // Fetch user details using the userId
  const { data: userData, isLoading,refetch } = useGetDetailUserQuery(userId);
  console.log(userData);
  const { refetch: refetchUserList } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: userData?.role?.roleName || "",
  });
  const roleId = Number(userData?.role?.roleId) as UserRole;
  const { textRole } = roleMap[roleId] || {
    color: "black",
    text: "Không xác định",
  };
  
  const handleUpdateStatus = async () => {
    try {
      const faceImgPromises = faceImg.map((file) => {
        const uniqueFileName = `${uuidv4()}`;
        const storageRef = ref(imageDB, `avtImg/${uniqueFileName}`);
        return uploadBytes(storageRef, file).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        );
      });
      const faceImgUrls = await Promise.all(faceImgPromises);

      const updatedUser: User = {
        ...userData,
        fullName: form.getFieldValue("fullName"),
        email: form.getFieldValue("email"),
        departmentId: userData.department.departmentId,
        roleID: userData.role.roleId,
        image: faceImgUrls[0] || userData.image,
      };

      await updateUser({
        idUser: userData.userId || null,
        User: updatedUser,
      }).unwrap();
      refetchUserList();
      refetch();
      notification.success({ message: `Cập nhật thành công` });
      navigate(-1);
    } catch (error) {
      console.log(error);
      notification.error({ message: `Cập nhật thất bại` });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleFaceImageChange = (info: any) => {
    const fileList = info.fileList;
    setFaceImg(fileList.map((file: any) => file.originFileObj));
    const newUploadedImage = URL.createObjectURL(fileList[0]?.originFileObj);
    setImgFace(newUploadedImage);
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold">
          Chi tiết người dùng
        </h1>
        {isLoading ? (
          <Spin tip="Đang tải dữ liệu..." />
        ) : (
          <Form form={form} layout="vertical" initialValues={userData}>
            <Form.Item
              name="fullName"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input disabled={isLoading} />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input disabled={isLoading} />
            </Form.Item>
            <Form.Item label="Vai trò">
              <Input disabled value={textRole} />
            </Form.Item>

            <Form.Item label="Hình ảnh mặt">
              <Upload
                listType="picture"
                showUploadList={false}
                onChange={handleFaceImageChange}
                maxCount={1}
                disabled={isLoading}
              >
                <Button icon={<UploadOutlined />}>Tải lên hình ảnh mặt</Button>
              </Upload>
              {userData?.image && (
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
              <Button
                type="primary"
                onClick={handleUpdateStatus}
                disabled={isLoading}
              >
                Cập nhật
              </Button>
              <Button
                onClick={handleCancel}
                style={{ marginLeft: "10px" }}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </Form.Item>
          </Form>
        )}
      </Content>
    </Layout>
  );
};

export default DetailUser;
