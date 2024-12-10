import {
  Layout,
  Button,
  Table,
  Tag,
  Input,
  Modal,
  message,
  Divider,
  Select,
  Card,
} from "antd";
import { useState, useEffect } from "react";
import UserType from "../../types/userType";
import {
  useGetListUserByRoleQuery,
  useDeleteUserMutation,
} from "../../services/user.service";
import { statusUserMap, UserStatus } from "../../types/Enum/UserStatus";
import { roleMap, UserRole } from "../../types/Enum/UserRole";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { useGetListDepartmentsQuery } from "../../services/department.service";
import CreateUser from "../../form/CreateUser";
import DetailUser from "./DetailUser";
import { Plus } from "lucide-react";

const { Content } = Layout;
const { Option } = Select;

const User = () => {
  const userRole = localStorage.getItem("userRole");
  const departmentId = localStorage.getItem("departmentId");
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | undefined>(
    undefined
  );
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] =
    useState(false);
  const [role, setRole] = useState<string>("All");
  const [department, setDepartment] = useState<string>("All");

  const {
    data: userData,
    refetch: refetchUserData,
    isLoading: isLoadingUser,
  } = useGetListUserByRoleQuery({ pageNumber: -1, pageSize: -1, role: role });

  const { data: departmentData } = useGetListDepartmentsQuery({
    pageNumber: -1,
    pageSize: -1,
  });

  useEffect(() => {
    refetchUserData();
  }, [role, department, refetchUserData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredData = userData?.filter((user: UserType) => {
    const matchesSearchText = user.fullName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesDepartment =
      department === "All" || user.department?.departmentName === department;

    // For DepartmentManager - only show Staff from their department
    if (userRole === "DepartmentManager") {
      return (
        matchesSearchText &&
        matchesDepartment &&
        user.role?.roleId === 4 && // Only show Staff (roleId 4)
        user.department?.departmentId === Number(departmentId) // Match department
      );
    }

    // Existing Manager filter
    if (userRole === "Manager" && role === "All") {
      return (
        matchesSearchText &&
        matchesDepartment &&
        user.role?.roleId !== 1 &&
        user.role?.roleId !== 2
      );
    }

    // Existing Admin filter
    if (userRole === "Admin" && role === "All") {
      return matchesSearchText && matchesDepartment && user.role?.roleId !== 1;
    }

    return matchesSearchText && matchesDepartment;
  });

  const [deleteUser] = useDeleteUserMutation();
  const handleCreateSuccess = () => {
    setIsCreateUserModalVisible(false);
    refetchUserData();
  };

  const handleUpdateSuccess = () => {
    setIsDetailModalVisible(false);
    refetchUserData();
  };
  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      try {
        await deleteUser(userIdToDelete).unwrap();
        message.success("Xóa người dùng thành công");
        setIsModalVisible(false);
        setUserIdToDelete(null);
        refetchUserData();
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
      width: "8%",
      render: (image: string) => (
        <img
          src={image}
          alt="avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            cursor: "pointer",
          }}
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
      sorter: (a: UserType, b: UserType) =>
        a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "15%",
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: "20%",
      render: (text: any) => (
        <span style={{ fontSize: "14px", color: "#000" }}>
          {text.departmentName === "Manager"
            ? "Phòng Quản lý"
            : text.departmentName === "Security"
            ? "Phòng Bảo vệ"
            : text.departmentName}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
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
      width: "10%",
      render: (roleId: UserRole) => {
        const { textRole } = roleMap[roleId] || { text: "Không xác định" };
        return <Tag color="blue">{textRole}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: "12%",
      align: "center" as const,
      render: (_: any, record: UserType) => (
        <div className="flex justify-center space-x-1">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-green-600 hover:text-green-800 p-0"
            onClick={() => {
              setSelectedUser(record);
              setIsDetailModalVisible(true);
            }}
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

  return (
    // <Layout className="min-h-screen bg-white">
    //   <Content className="p-8">
    //     <div className="flex justify-between items-center mb-4">
    //       <div className="flex items-center bg-white rounded-full shadow-sm p-2 border border-gray-300 focus-within:border-blue-500 transition-all duration-200 ease-in-out">
    //         <SearchOutlined className="text-gray-500 ml-2" />
    //         <Input
    //           placeholder="Tìm kiếm theo tên"
    //           value={searchText}
    //           onChange={handleSearchChange}
    //           className="ml-2 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
    //           style={{ width: 300 }}
    //         />
    //       </div>
    //       <Button
    //         type="primary"
    //         icon={<PlusOutlined />}
    //         className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-sm"
    //         onClick={() => setIsCreateUserModalVisible(true)}
    //       >
    //         Tạo mới người dùng
    //       </Button>
    //     </div>

        // <div className="flex items-center mb-4">
          
        // </div>

    //     {/* Divider Line */}
    //     <Divider />

    //     <Table
    //       columns={columns}
    //       dataSource={filteredData}
    //       pagination={{
    //         total: filteredData?.length,
    //         showSizeChanger: true,
    //         pageSizeOptions: ["5", "10", "20"],
    //         size: "small",
    //       }}
    //       loading={isLoadingUser}
    //       rowKey={"userId"}
    //       bordered
    //       className="bg-white shadow-md rounded-lg"
    //     />

    //     {/* Image Modal for Enlarged View */}
    //     <Modal
    //       title="Ảnh phóng to"
    //       visible={isImageModalVisible}
    //       footer={null}
    //       onCancel={() => setIsImageModalVisible(false)}
    //       className="rounded-lg"
    //     >
    //       <img
    //         src={enlargedImage}
    //         alt="Enlarged"
    //         className="w-full h-auto rounded"
    //       />
    //     </Modal>

    //     {/* Delete Confirmation Modal */}
    //     <Modal
    //       title={<span className="text-xl font-semibold">Xác nhận xóa</span>}
    //       visible={isModalVisible}
    //       onOk={handleDeleteUser}
    //       onCancel={() => setIsModalVisible(false)}
    //       okText="Xóa"
    //       cancelText="Hủy"
    //       className="rounded-lg"
    //       bodyStyle={{ padding: "20px" }}
    //     >
    //       <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
    //     </Modal>

    //     {/* User Detail Modal */}
    //     <Modal
    //       title="Chi tiết người dùng"
    //       visible={isDetailModalVisible}
    //       footer={null}
    //       onCancel={() => setIsDetailModalVisible(false)}
    //       className="rounded-lg"
    //     >
    //       {selectedUser && (
    //         <DetailUser
    //           userId={Number(selectedUser.userId)}
    //           onSuccess={handleUpdateSuccess}
    //         />
    //       )}
    //     </Modal>

    //     {/* Create User Modal */}
    //     <Modal
    //       visible={isCreateUserModalVisible}
    //       footer={null}
    //       onCancel={() => setIsCreateUserModalVisible(false)}
    //       className="rounded-lg"
    //     >
    //       <CreateUser onSuccess={handleCreateSuccess} />
    //     </Modal>
    //   </Content>
    // </Layout>
    <Layout className="min-h-screen bg-white">
      <Content className="p-8">
        {/* Search and Create Button Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 focus-within:border-blue-500 transition-all">
              <SearchOutlined className="text-gray-400 ml-3" />
              <Input
                placeholder="Tìm kiếm theo tên"
                value={searchText}
                onChange={handleSearchChange}
                className="border-none focus:outline-none text-gray-700"
                style={{ width: 300 }}
              />
            </div>
            {userRole !== "DepartmentManager" && (
            <Select
              value={role}
              onChange={(value) => setRole(value)}
              style={{ width: 200 }}
            >
              <Option value="All">Tất cả</Option>
              {userRole === "Admin" && <Option value="Manager">Quản lý</Option>}
              {userRole !== "DepartmentManager" && (
                <Option value="DepartmentManager">Quản lý phòng ban</Option>
              )}
              <Option value="Staff">Nhân viên</Option>
              <Option value="Security">Bảo vệ</Option>
            </Select>
          )}

          {userRole !== "DepartmentManager" && (
            <Select
              value={department}
              onChange={(value) => setDepartment(value)}
              style={{ width: 200 }}
              disabled={userRole === "DepartmentManager"} // Disable for DepartmentManager
            >
              <Option value="All">Tất cả phòng ban</Option>
              {departmentData
                ?.filter((dept: any) => {
                  if (userRole === "Admin") {
                    return dept.departmentName !== "Admin";
                  }
                  if (userRole === "Manager") {
                    return (
                      dept.departmentName !== "Admin" &&
                      dept.departmentName !== "Manager"
                    );
                  }
                  if (userRole === "DepartmentManager") {
                    return dept.departmentId === Number(departmentId);
                  }
                  return true;
                })
                ?.map((dept: any) => (
                  <Option key={dept.departmentId} value={dept.departmentName}>
                    {dept.departmentName === "Manager"
                      ? "Phòng Quản lý"
                      : dept.departmentName === "Security"
                      ? "Phòng Bảo vệ"
                      : dept.departmentName}
                  </Option>
                ))}
            </Select>
          )}
            {/* <Select
              value={role}
              onChange={(value) => setRole(value)}
              style={{ width: 200 }}
              className="rounded-lg"
            >
              <Option value="All">Tất cả</Option>
          
            </Select>

            <Select
              value={department}
              onChange={(value) => setDepartment(value)}
              style={{ width: 200 }}
              className="rounded-lg"
            >
              <Option value="All">Tất cả phòng ban</Option>
         
            </Select> */}
          </div>

          {/* <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateUserModalVisible(true)}
            className="bg-blue-500 hover:bg-blue-600 flex items-center h-10 px-4 rounded-lg"
          >
            Tạo mới người dùng
          </Button> */}
          <Button
            onClick={() => setIsCreateUserModalVisible(true)}
            className="group relative px-6 py-4 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
          >
            <div className="flex items-center gap-2 text-white">
              <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
              <span className="font-medium text-lg">Tạo mới</span>
            </div>
          </Button>
        </div>

        {/* Table Section */}
        <Card className="shadow-lg rounded-xl border-0">
          <Table
            columns={columns}
            showSorterTooltip={false}
            dataSource={filteredData}
            pagination={{
              total: filteredData?.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              size: "small",
              showTotal: (total) => `Tổng ${total} người dùng`,
              className: "mt-5",
            }}
            loading={isLoadingUser}
            rowKey="userId"
            className={`w-full [&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30 [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead_th]:!transition-none`}
            size="middle"
            rowClassName="hover:bg-gray-50"
          />
        </Card>

        {/* Modals */}
        <Modal
          title={<div className="text-lg font-medium px-2">Ảnh phóng to</div>}
          visible={isImageModalVisible}
          footer={null}
          onCancel={() => setIsImageModalVisible(false)}
          className="rounded-lg"
        >
          <img
            src={enlargedImage}
            alt="Enlarged"
            className="w-full h-auto rounded-lg"
          />
        </Modal>

        <Modal
          title={
            <div className="text-lg font-medium text-red-500 px-2">
              Xác nhận xóa
            </div>
          }
          visible={isModalVisible}
          onOk={handleDeleteUser}
          onCancel={() => setIsModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{
            className: "bg-red-500 hover:bg-red-600",
          }}
          className="rounded-lg"
        >
          <p className="px-2">Bạn có chắc chắn muốn xóa người dùng này?</p>
        </Modal>

        <Modal
          title={
            <div className="text-lg font-medium px-2">Chi tiết người dùng</div>
          }
          visible={isDetailModalVisible}
          footer={null}
          onCancel={() => setIsDetailModalVisible(false)}
          className="rounded-lg ml-[140px]"
          centered
    
          bodyStyle={{ padding: 0 }}
          destroyOnClose
        >
          {selectedUser && (
            <DetailUser
              userId={Number(selectedUser.userId)}
              onSuccess={handleUpdateSuccess}
            />
          )}
        </Modal>

        <Modal
          visible={isCreateUserModalVisible}
          footer={null}
          onCancel={() => setIsCreateUserModalVisible(false)}
          centered
          className="rounded-lg ml-[140px]"
          styles={{
            body: {
              overflow: "auto",
              padding: 0,
            },
          }}
        >
          <CreateUser onSuccess={handleCreateSuccess} />
        </Modal>
      </Content>
    </Layout>
  );
};

export default User;
