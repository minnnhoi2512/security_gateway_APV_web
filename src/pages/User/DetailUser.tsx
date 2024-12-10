import React, { useState } from "react";
import {
  Layout,
  Button,
  Form,
  Input,
  Upload,
  Spin,
  notification,
  Card,
  Typography,
  Divider,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateUserMutation,
  useGetDetailUserQuery,
  useGetListUserByRoleQuery,
} from "../../services/user.service";
import User from "../../types/userType";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { imageDB } from "../../api/firebase";
import { roleMap, UserRole } from "../../types/Enum/UserRole";

const { Content } = Layout;
const { Title, Text } = Typography;
interface DetailUserProps {
  userId: number;
  onSuccess?: () => void;
}
const DetailUser: React.FC<DetailUserProps> = ({ userId, onSuccess }) => {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [imgFace, setImgFace] = useState<string | null>(null);
  const [faceImg, setFaceImg] = useState<File[]>([]);
  const [updateUser] = useUpdateUserMutation();

  const { data: userData, isLoading, refetch } = useGetDetailUserQuery(userId);
  const { refetch: refetchUserList } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: "All",
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
      onSuccess?.();
      notification.success({ message: `Cập nhật thành công` });
    } catch (error) {
      notification.error({ message: `Cập nhật thất bại` });
    }
  };

  const handleFaceImageChange = (info: any) => {
    const fileList = info.fileList;
    setFaceImg(fileList.map((file: any) => file.originFileObj));
    const newUploadedImage = URL.createObjectURL(fileList[0]?.originFileObj);
    setImgFace(newUploadedImage);
  };

  return (
    <Content className="w-full max-w-lg">
      <Card className="shadow-sm border border-white rounded-lg p-4">
        {/* Header with Profile Image and Name */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={imgFace || userData?.image || "https://via.placeholder.com/80"}
            alt="User Avatar"
            className="w-16 h-16 rounded-full border border-gray-300 mb-2"
          />
          <Title level={4} className="m-0 text-gray-800">
            {userData?.fullName || "Tên người dùng"}
          </Title>
          <Text className="text-gray-500">{textRole}</Text>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <Spin tip="Đang tải dữ liệu..." size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={userData}
            className="space-y-4"
          >
            <Form.Item
              name="fullName"
              label={<Text className="text-gray-700 font-semibold">Tên</Text>}
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input placeholder="Nhập tên người dùng" className="rounded-md" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text className="text-gray-700 font-semibold">Email</Text>}
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input placeholder="Nhập email" className="rounded-md" />
            </Form.Item>

            <Form.Item
              label={
                <Text className="text-gray-700 font-semibold">Vai trò</Text>
              }
            >
              <Input disabled value={textRole} className="rounded-md" />
            </Form.Item>

            <Form.Item
              label={
                <Text className="text-gray-700 font-semibold">
                  Hình ảnh mặt
                </Text>
              }
            >
              <Upload
                listType="picture"
                showUploadList={false}
                className="w-full"
                onChange={handleFaceImageChange}
                maxCount={1}
              >
                <Button
                  icon={<UploadOutlined />}
                  className="w-full h-20 flex items-center justify-center border-2 border-dashed hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <span className="ml-2">Tải ảnh lên</span>
                </Button>
              </Upload>
              {imgFace && (
                <div className="mt-2">
                  <img
                    src={imgFace}
                    alt="Uploaded Face"
                    className="w-16 h-16 rounded-full border border-gray-300"
                  />
                </div>
              )}
            </Form.Item>

            <Divider className="my-2" />

            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleUpdateStatus}
                className="rounded-md bg-buttonColor text-white hover:!border-buttonColor hover:!text-buttonColor"
              >
                Cập nhật
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </Content>
  );
};

export default DetailUser;
