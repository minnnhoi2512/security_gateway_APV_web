import {
    Layout,
    Button,
    Table,
    Tag,
    Modal,
    message,
    Form,
    Input,
  } from "antd";
  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  
  const { Content } = Layout;
  
  interface DataType {
    key: string;
    name: string;
    department: string;
    status: string;
    role: string;
    avatar: string;
  }
  
  const DepartmentManager = () => {
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [searchText, setSearchText] = useState<string>("");
    const navigate = useNavigate();
    const [data, setData] = useState<DataType[]>([
      {
        key: "1",
        name: "Tom Tom",
        department: "San José",
        status: "Active",
        role: "Trợ lý giám đốc",
        avatar: "/api/placeholder/32/32",
      },
      {
        key: "2",
        name: "Alice Smith",
        department: "New York",
        status: "Inactive",
        role: "Trợ lý giám đốc",
        avatar: "/api/placeholder/32/32",
      },
      {
        key: "3",
        name: "Bob Johnson",
        department: "Los Angeles",
        status: "Active",
        role: "Trợ lý giám đốc",
        avatar: "/api/placeholder/32/32",
      },
    ]);
  
    const [form] = Form.useForm();

  
    const handleAddCancel = () => {
      setIsAddModalVisible(false);
      form.resetFields();
    };
  
    const handleAddUser = () => {
      form.validateFields().then((values) => {
        const newUser: DataType = {
          key: (data.length + 1).toString(),
          name: values.name,
          department: values.department,
          status: values.status,
          role: values.role,
          avatar: "/api/placeholder/32/32", // Default avatar
        };
        setData([newUser, ...data]);
        message.success("Thêm người dùng thành công!");
        setIsAddModalVisible(false);
        form.resetFields();
      });
    };
  
    const handleDeleteUser = (key: string) => {
      const updatedData = data.filter((user) => user.key !== key);
      setData(updatedData);
      message.success("Xóa người dùng thành công!");
    };
  
    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    };
  
    // Filter the data based on search text
    const filteredData = data.filter((user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase())
    );
  
    const columns = [
      {
        title: "Avatar",
        dataIndex: "avatar",
        key: "avatar",
        render: (avatar: string) => <img src={avatar} alt="avatar" style={{ width: 32, height: 32 }} />,
      },
      {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        sorter: (a: DataType, b: DataType) => a.name.localeCompare(b.name),
      },
      {
        title: "Phòng ban",
        dataIndex: "department",
        key: "department",
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
      },
      {
        title: "Hành động",
        key: "action",
        render: (_: any, record: DataType) => (
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
            <Button
              type="primary"
              danger
              onClick={() => handleDeleteUser(record.key)}
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
                Danh sách trợ lý giám đốc
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
            />
          </Content>
  
          {/* Modal for Adding New User */}
          <Modal
            title="Thêm người dùng mới"
            visible={isAddModalVisible}
            onCancel={handleAddCancel}
            footer={[
              <Button key="cancel" onClick={handleAddCancel}>
                Hủy bỏ
              </Button>,
              <Button key="save" type="primary" onClick={handleAddUser}>
                Thêm
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Tên người dùng"
                rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="department"
                label="Phòng ban"
                rules={[{ required: true, message: "Vui lòng nhập phòng ban" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng nhập vai trò" }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Layout>
      </Layout>
    );
  };
  
  export default DepartmentManager;
  