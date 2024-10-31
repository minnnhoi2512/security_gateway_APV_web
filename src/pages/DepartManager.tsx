import { useEffect, useState } from "react";
import { Button, Table, Input, Space, Modal, Form, Tag, Pagination, notification } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import {
  useGetListDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../services/department.service";
import { useGetListUsersByDepartmentIdQuery } from "../services/user.service";

const { confirm } = Modal;

interface Department {
  departmentId: number;
  departmentName: string;
  description: string;
  createDate?: string;
  acceptLevel: number;
}

const DepartManager = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUserListModalVisible, setIsUserListModalVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const { data: departments = [], isLoading, refetch } = useGetListDepartmentsQuery({
    pageNumber: currentPage,
    pageSize: pageSize,
  });

  const {
    data: userListData = [],
    isLoading: isUserListLoading,
    isFetching: isUserListFetching,
    error: userListError,
    refetch: refetchUsers,
  } = useGetListUsersByDepartmentIdQuery(
    { 
      departmentId: selectedDepartmentId!, 
      pageNumber: currentPage, 
      pageSize 
    },
    { skip: !selectedDepartmentId }
  );

  // useEffect(() => {
  //   if (selectedDepartmentId) {
  //     refetchUsers(); 
  //   }
  // }, [selectedDepartmentId, currentPage, pageSize]);

  const validateDuplicateName = async (_: any, value: string) => {
    const isDuplicate = departments.some(
      (dept) => dept.departmentName.toLowerCase() === value.toLowerCase() && dept.departmentId !== selectedDepartment?.departmentId
    );
    if (isDuplicate) {
      return Promise.reject(new Error("Tên phòng ban đã tồn tại!"));
    }
    return Promise.resolve();
  };

  const validateNameFormat = async (_: any, value: string) => {
    const regex = /^[\p{L}\s]{1,25}$/u;
    if (value && !regex.test(value)) {
      return Promise.reject(new Error("Tên phòng ban không được chứa ký tự đặc biệt hoặc số!"));
    }
    return Promise.resolve();
  };

  const validateAcceptLevel = async (_: any, value: number) => {
    if (value < 1 || value > 3) {
      return Promise.reject(new Error("Cấp độ chỉ được từ 1 đến 3!"));
    }
    return Promise.resolve();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createDepartment({ ...values, acceptLevel: Number(values.acceptLevel) }).unwrap();
      notification.success({ message: "Thành công", description: "Tạo mới phòng ban thành công." });
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      notification.error({ message: "Thất bại", description: "Tạo mới phòng ban thất bại." });
    }
  };

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    form.setFieldsValue(department);
    setIsEditModalVisible(true);
  };

  const viewUserList = (departmentId: number) => {
    setSelectedDepartmentId(departmentId); 
    setCurrentPage(1);
    setIsUserListModalVisible(true);
  };

  const closeUserListModal = () => {
    setIsUserListModalVisible(false);
    setSelectedDepartmentId(null);
  };
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (selectedDepartment) {
        await updateDepartment({ id: selectedDepartment.departmentId, ...values }).unwrap();
        notification.success({
          message: "Thành công",
          description: "Cập nhật phòng ban thành công.",
        });
        setIsEditModalVisible(false);
        form.resetFields();
        refetch();
      }
    } catch (error) {
      notification.error({ message: "Thất bại", description: "Cập nhật phòng ban thất bại." });
    }
  };

  const showDeleteConfirm = (departmentId: number) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa phòng ban này?",
      icon: <ExclamationCircleOutlined />,
      content: "Việc xóa phòng ban sẽ không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteDepartment({ id: departmentId }).unwrap();
          notification.success({ message: "Xóa phòng ban thành công!" });
          refetch();
        } catch (error) {
          notification.error({ message: "Xóa phòng ban thất bại." });
        }
      },
    });
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    refetch();
  };

  const columns = [
    { title: "ID", dataIndex: "departmentId", key: "departmentId" },
    { title: "Tên Phòng Ban", dataIndex: "departmentName", key: "departmentName" },
    { title: "Mô Tả", dataIndex: "description", key: "description" },
    {
      title: "Ngày Tạo",
      dataIndex: "createDate",
      key: "createDate",
      render: (date: string) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    { title: "Cấp Độ", dataIndex: "acceptLevel", key: "acceptLevel" },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record: Department) => (
        <div className="flex justify-center space-x-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-green-600 hover:text-green-800"
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            className="text-blue-500 hover:text-blue-700"
            onClick={() => viewUserList(record.departmentId)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.departmentId)}
          />
        </div>
      ),
    }
  ];

  return (
    <Content className="p-8">
      <h1 className="text-center text-3xl font-bold text-green-600 mb-6">
        Quản lý phòng ban
      </h1>
      <Space className="mb-6 w-full justify-between">
        <Input
          placeholder="Tìm kiếm phòng ban"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-1/2"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ borderRadius: 5 }}
        >
          Tạo mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={departments}
        pagination={{
          current: currentPage,
          pageSize,
          total: departments.length,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
            refetch();
          },
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          locale: { items_per_page: "/ trang" },
        }}
        rowKey="departmentId"
        bordered
        loading={isLoading}
      />

      <Modal
        title="Tạo mới phòng ban"
        open={isModalVisible}
        onOk={handleCreate}
        confirmLoading={isCreating}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Phòng Ban"
            name="departmentName"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng ban!" },
              { validator: validateNameFormat },
              { validator: validateDuplicateName },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Cấp Độ"
            name="acceptLevel"
            rules={[
              { required: true, message: "Vui lòng nhập cấp độ!" },
              { validator: validateAcceptLevel },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật phòng ban"
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Phòng Ban"
            name="departmentName"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng ban!" },
              { validator: validateNameFormat },
              { validator: validateDuplicateName },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Cấp Độ"
            name="acceptLevel"
            rules={[
              { required: true, message: "Vui lòng nhập cấp độ!" },
              { validator: validateAcceptLevel },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
<Modal
  title={<h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Danh sách nhân viên phòng ban</h2>}
  open={isUserListModalVisible}
  onCancel={closeUserListModal}
  footer={null}
  width={900}
  centered={false}  
  style={{
    top: '140px', 
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  }}
  bodyStyle={{ 
    padding: '16px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
  }}
>
  {userListError ? (
    <p style={{ textAlign: 'center', color: 'red' }}>Đã xảy ra lỗi khi tải danh sách người dùng!</p>
  ) : (
    <div style={{ width: '100%' }}>
      <Table
        columns={[
          {
            title: "Tên đầy đủ",
            dataIndex: "fullName",
            key: "fullName",
            align: 'center',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
          },
          {
            title: "Email",
            dataIndex: "email",
            key: "email",
            align: 'center',
          },
          {
            title: "Số điện thoại",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            align: 'center',
          },
          {
            title: "Vai trò",
            dataIndex: ["role", "roleName"],
            key: "roleName",
            align: 'center',
            render: (roleName) => {
              let roleColor = "default";
              let roleLabel = "";

              switch (roleName) {
                case "Admin":
                  roleColor = "red";
                  roleLabel = "Quản trị viên";
                  break;
                case "Manager":
                  roleColor = "blue";
                  roleLabel = "Quản lý";
                  break;
                case "DepartmentManager":
                  roleColor = "yellow";
                  roleLabel = "Quản lý phòng ban";
                  break;
                case "Security":
                  roleColor = "orange";
                  roleLabel = "Bảo vệ";
                  break;
                case "Staff":
                  roleColor = "green";
                  roleLabel = "Nhân viên";
                  break;
                default:
                  roleLabel = "Không xác định";
              }

              return <Tag color={roleColor}>{roleLabel}</Tag>;
            },
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: 'center',
            render: (status) => (
              <Tag color={status === "Active" ? "green" : "red"}>
                {status === "Active" ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            ),
          },
        ]}
        dataSource={userListData}
        loading={ isUserListLoading || isUserListFetching}      
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        rowKey="userId"
        bordered
        style={{ marginBottom: '16px' }}
      />
    </div>
  )}
</Modal>

    </Content>
  );
};

export default DepartManager;
