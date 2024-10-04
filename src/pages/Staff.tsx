import { Layout, Button, Table, Tag, Input } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserType from "../types/userType";
import {
  useGetListUsersByDepartmentIdQuery,
  useGetListUserByRoleQuery,
} from "../services/user.service";
const { Content } = Layout;

const Staff = () => {
  const userRole = localStorage.getItem("userRole");
  const userId = Number(localStorage.getItem("userId"));
  // console.log("userRole", userRole);
  // console.log("userId", userId);
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const [data, setData] = useState<UserType[]>([]);

  // Fetch data based on user role
  const staffQuery = useGetListUsersByDepartmentIdQuery(
    { pageNumber: 1, pageSize: 5, departmentId: userId },
    { skip: userRole !== "DepartmentManager" } // Skip if not Department Manager
  );

  const userQuery = useGetListUserByRoleQuery(
    { pageNumber: 1, pageSize: 5, role: "Staff" },
    { skip: userRole === "DepartmentManager" } // Skip if Department Manager
  );

  useEffect(() => {
    if (staffQuery.data) {
      setData(staffQuery.data);
    } else if (userQuery.data) {
      setData(userQuery.data);
    }
  }, [staffQuery.data, userQuery.data]);


  // const handleAddUser = () => {
  //   form.validateFields().then((values) => {
  //     const newUser: DataType = {
  //       key: (data.length + 1).toString(),
  //       name: values.name,
  //       department: values.department,
  //       status: values.status,
  //       role: values.role,
  //       avatar: "/api/placeholder/32/32", // Default avatar
  //     };
  //     setData([newUser, ...data]);
  //     message.success("Thêm người dùng thành công!");
  //     setIsAddModalVisible(false);
  //     form.resetFields();
  //   });
  // };

  // const handleDeleteUser = (key: string) => {
  //   const updatedData = data.filter((user) => user.key !== key);
  //   setData(updatedData);
  //   message.success("Xóa người dùng thành công!");
  // };

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
      render: (status: string) => {
        let color = status === "Active" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string | null) => {
        const displayedRole = role || "Nhân viên";
        let color = displayedRole === "Active" ? "green" : "volcano";
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
              navigate("/detailUser", {
                state: record,
              })
            }
          >
            Chỉnh sửa
          </Button>
          <Button type="primary" danger onClick={() => console.log("haha")}>
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
            onClick={() => navigate("/createUser")}
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
            pagination={false}
            rowKey={"userId"}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Staff;
