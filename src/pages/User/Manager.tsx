import { Layout, Button, Table, Tag, Input, Modal, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserType from "../../types/userType";
import { useGetListUserByRoleQuery, useDeleteUserMutation } from "../../services/user.service";
import { statusUserMap, UserStatus } from "../../types/Enum/UserStatus";
import { roleMap, UserRole } from "../../types/Enum/UserRole";

const { Content } = Layout;

const Manager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  
  // Fetch data for users with the role of "Manager"
  const { data = [], refetch, isLoading } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: "Manager",
  });

  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null); // State to store user ID for deletion
  const [deleteUser] = useDeleteUserMutation(); // Hook for deleting user

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
      render: (image: string) => (
        <img src={image} alt="avatar" style={{ width: 32, height: 32 }} />
      ),
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a: UserType, b: UserType) =>
        a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
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
      dataIndex: ["role","roleId"],
      key: "roleId",
      render: (roleId: UserRole) => {
        const { textRole } = roleMap[roleId] || {
          color: "black",
          text: "Không xác định",
        };
        return <Tag color="blue">{textRole}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: UserType) => (
        <>
          <Button
            type="primary"
            className="mr-2"
            onClick={() =>
              navigate(`/detailUser/${record.userId}`, {
                state: record,
              })
            }
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => {
              setUserIdToDelete(record.userId || null); // Set the user ID to delete
              setIsModalVisible(true); // Show the confirmation modal
            }}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      try {
        await deleteUser(userIdToDelete).unwrap(); // Call the delete mutation
        message.success("Xóa người dùng thành công");
        setIsModalVisible(false); // Close the modal
        setUserIdToDelete(null); // Reset the user ID
        refetch(); // Refetch the data after deletion
      } catch (error) {
        message.error(`Xóa người dùng thất bại`);
      }
    }
  };

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="p-6">
          <div className="flex justify-center mb-4">
            <h1 className="text-green-500 text-2xl font-bold">
              Danh sách quản lý
            </h1>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={() => navigate("/createUser", { state: { roleId: 2 } })}
          >
            Tạo mới người dùng
          </Button>
          <Input
            placeholder="Tìm kiếm theo tên"
            value={searchText}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, width: 300 }}
          />
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              total: filteredData.length, // Assuming totalCount is provided in the response
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
              size: "small",
            }}
            loading={isLoading} // Use the loading state from the query
            rowKey={"userId"}
          />
          <Modal
            title="Xác nhận xóa"
            visible={isModalVisible}
            onOk={handleDeleteUser}
            onCancel={() => setIsModalVisible(false)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Manager;