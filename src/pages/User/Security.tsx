import { Layout, Button, Table, Tag, Input, Modal, message, Divider } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserType from "../../types/userType";
import { useGetListUserByRoleQuery, useDeleteUserMutation } from "../../services/user.service";
import { statusUserMap, UserStatus } from "../../types/Enum/UserStatus";
import { roleMap, UserRole } from "../../types/Enum/UserRole";
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Content } = Layout;

const Security = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch data for users with the role of "Security"
  const { data = [], refetch, isLoading } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: "Security",
  });

  const [deleteUser] = useDeleteUserMutation();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter the data based on search text
  const filteredData = data.filter((user: UserType) =>
    user.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: "10%",
      render: (image: string) => (
        <img
          src={image}
          alt="avatar"
          style={{ width: 32, height: 32, borderRadius: "50%", cursor: "pointer" }}
          onClick={() => {
            setEnlargedImage(image);
            setIsImageModalVisible(true);
          }}
        />
      ),
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      width: "20%",
      sorter: (a: UserType, b: UserType) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "20%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status: UserStatus) => {
        const { colorUserStatus, textUserStatus } = statusUserMap[status] || {
          color: "black",
          text: "Không xác định",
        };
        return <Tag color={colorUserStatus}>{textUserStatus}</Tag>;
      },
    },
    {
      title: "Vai trò",
      dataIndex: ["role", "roleId"],
      key: "roleId",
      width: "20%",
      render: (roleId: UserRole) => {
        const { textRole } = roleMap[roleId] || { text: "Không xác định" };
        return <Tag color="blue">{textRole}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: "10%",
      align: "center" as const,
      render: (_: any, record: UserType) => (
        <div className="flex justify-center space-x-1">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-green-600 hover:text-green-800 p-0"
            onClick={() => navigate(`/detailUser/${record.userId}`, { state: record })}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="text-red-500 hover:text-red-700 p-0"
            onClick={() => {
              setUserIdToDelete(record.userId || null);
              setIsModalVisible(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      try {
        await deleteUser(userIdToDelete).unwrap();
        message.success("Xóa người dùng thành công");
        setIsModalVisible(false);
        setUserIdToDelete(null);
        refetch();
      } catch (error) {
        message.error("Xóa người dùng thất bại");
      }
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-titleMain">
          Danh sách bảo vệ
        </h1>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center bg-white rounded-full shadow-sm p-2 border border-gray-300 focus-within:border-blue-500 transition-all duration-200 ease-in-out">
            <SearchOutlined className="text-gray-500 ml-2" />
            <Input
              placeholder="Tìm kiếm theo tên"
              value={searchText}
              onChange={handleSearchChange}
              className="ml-2 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
              style={{ width: 300 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-sm"
            onClick={() => navigate("/createUser", { state: { roleId: 5 } })}
          >
            Tạo mới người dùng
          </Button>
        </div>

        {/* Divider Line */}
        <Divider/>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            total: data?.length,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          loading={isLoading}
          rowKey={"userId"}
          bordered
          className="bg-white shadow-md rounded-lg"
        />

        {/* Image Modal for Enlarged View */}
        <Modal
          title="Ảnh phóng to"
          visible={isImageModalVisible}
          footer={null}
          onCancel={() => setIsImageModalVisible(false)}
          className="rounded-lg"
        >
          <img src={enlargedImage} alt="Enlarged" className="w-full h-auto rounded" />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title={<span className="text-xl font-semibold">Xác nhận xóa</span>}
          visible={isModalVisible}
          onOk={handleDeleteUser}
          onCancel={() => setIsModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          className="rounded-lg"
          bodyStyle={{ padding: "20px" }}
        >
          <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Security;
