import { Layout, Button, Table, Tag, Modal, Form, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserType from "../types/userType";
import { useGetListUserByRoleQuery } from "../services/user.service";
const { Content } = Layout;

const Manager = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const { data = [] } = useGetListUserByRoleQuery({
    pageNumber: -1,
    pageSize: -1,
    role: "Manager",
  });
  console.log(data);
  const [form] = Form.useForm();
  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

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
      render: (role: { roleName: string; status: string } | null) => {
        const displayedRole = role ? role.roleName : "Quản lý"; // Use roleName if role is not null
        const color = role && role.status === "Active" ? "green" : "volcano"; // Check status for color
    
        return <Tag color={color}>{displayedRole}</Tag>; // Use displayedRole for the tag
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
              Danh sách quản lý
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

export default Manager;
