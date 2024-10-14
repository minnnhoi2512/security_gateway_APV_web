import { Layout, Button, Table, Tag, Input, Modal, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserType from "../types/userType";
import {
  useGetListStaffByDepartmentManagerQuery,
  useGetListUserByRoleQuery,
  useDeleteUserMutation,
} from "../services/user.service";

const { Content } = Layout;

const Staff = () => {
  const userRole = localStorage.getItem("userRole");
  const userId = Number(localStorage.getItem("userId"));
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const [data, setData] = useState<UserType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null); // State to store user ID for deletion

  // Fetch data based on user role
  const {
    data: staffData,
    refetch: refetchStaffData,
    isLoading: isLoadingStaff,
  } = useGetListStaffByDepartmentManagerQuery(
    { pageNumber: -1, pageSize: -1, departmentManagerId: userId },
    { skip: userRole !== "DepartmentManager" } // Skip if not Department Manager
  );

  const {
    data: userData,
    refetch: refetchUserData,
    isLoading: isLoadingUser,
  } = useGetListUserByRoleQuery(
    { pageNumber: -1, pageSize: -1, role: "Staff" },
    { skip: userRole === "DepartmentManager" } // Skip if Department Manager
  );

  // Combine loading states
  const isLoading = isLoadingStaff || isLoadingUser;

  useEffect(() => {
    if (staffData) {
      setData(staffData);
    } else if (userData) {
      setData(userData);
    }
  }, [staffData, userData]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter the data based on search text
  const filteredData = data.filter((user: UserType) =>
    user.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const [deleteUser] = useDeleteUserMutation(); // Hook for deleting user

  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      try {
        await deleteUser(userIdToDelete).unwrap(); // Call the delete mutation
        message.success("Xóa người dùng thành công");
        setIsModalVisible(false); // Close the modal
        setUserIdToDelete(null); // Reset the user ID
        // Refetch the data after deletion based on the user role
        if (userRole === "DepartmentManager") {
          refetchStaffData();
        } else {
          refetchUserData();
        }
      } catch (error) {
        message.error("Xóa người dùng thất bại");
      }
    }
  };

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
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      render: (text: any) => (
        <span style={{ fontSize: "14px", color: "#000" }}>
          {text ? text.departmentName : "Không có phòng ban"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = status === "Active" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: { roleName: string; status: string } | null) => {
        const displayedRole = role ? role.roleName : "Nhân viên";
        const color = role && role.status === "Active" ? "green" : "volcano";
        return <Tag color={color}>{displayedRole}</Tag>;
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

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="p-6">
          <div className="flex justify-center mb-4">
            <h1 className="text-green-500 text-2xl font-bold">
              Danh sách nhân viên
            </h1>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={() => navigate("/createUser", { state: { roleId: 4 } })}
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
              total: filteredData?.length, // Assuming data contains total count
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
              hideOnSinglePage: false,
              size: "small",
            }}
            loading={isLoading} // Use the combined loading state
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

export default Staff;
