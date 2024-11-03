import { useState } from "react";
import { Button, Table, Input, Tag, Space, Modal, Form, notification } from "antd";
import { SearchOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import { useGetListDepartmentsQuery, useCreateDepartmentMutation, useUpdateDepartmentMutation, useDeleteDepartmentMutation } from "../../services/department.service";
import { useGetListUsersByDepartmentIdQuery } from "../../services/user.service";

const { confirm } = Modal;

const DepartManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUserListModalVisible, setIsUserListModalVisible] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  const [createDepartment, { isLoading: isCreating  }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const { data, isLoading, error,refetch } = useGetListDepartmentsQuery({
    pageNumber: -1,
    pageSize : -1,
  });

  const departments = data ? data : [];
  const totalDepartments = data ? data.length : 0;


  const {
    data: userListData,
    isLoading: isUserListLoading,
    error: userListError
  } = useGetListUsersByDepartmentIdQuery(
    { departmentId: selectedDepartmentId!, pageNumber: 1, pageSize: 10 }, 
    { skip: selectedDepartmentId === null } 
  );

  const filteredData = departments.filter((dept: any) =>
    dept.departmentName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "ID Phòng Ban",
      dataIndex: "departmentId",
      key: "departmentId",
    },
    {
      title: "Tên Phòng Ban",
      dataIndex: "departmentName",
      key: "departmentName",
      sorter: (a: any, b: any) => a.departmentName.localeCompare(b.departmentName),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createDate",
      key: "createDate",
      sorter: (a: any, b: any) =>
        new Date(a.createDate || "").getTime() - new Date(b.createDate || "").getTime(),
      render: (date: string) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Cấp Độ",
      dataIndex: "acceptLevel",
      key: "acceptLevel",
      sorter: (a: any, b: any) => a.acceptLevel - b.acceptLevel,
      render: (acceptLevel: number) => <Tag color="blue">{acceptLevel}</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() => openEditModal(record)}
            style={{ borderRadius: 5 }}
          >
            Chỉnh sửa
          </Button>
          <Button
            type="default"
            onClick={() => viewUserList(record.departmentId)}
            style={{ borderRadius: 5 }}
          >
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => showDeleteConfirm(record.departmentId)}
            style={{ borderRadius: 5 }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await createDepartment(values).unwrap();
      setIsModalVisible(false);
      form.resetFields();
      notification.success({
        message: "Thành công",
        description: "Phòng ban đã được tạo mới thành công.",
      });
      refetch();
    } catch (error) {
      notification.error({
        message: "Thất bại",
        description: "Tạo mới phòng ban thất bại, vui lòng thử lại.",
      });
      console.error("Failed to create department:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const openEditModal = (department: any) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      departmentName: department.departmentName,
      description: department.description,
      acceptLevel: department.acceptLevel,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateDepartment({ id: editingDepartment.departmentId, ...values }).unwrap();
      setIsEditModalVisible(false);
      form.resetFields();
      notification.success({
        message: "Thành công",
        description: "Cập nhật phòng ban thành công.",
      });
      refetch();
    } catch (error) {
      notification.error({
        message: "Thất bại",
        description: "Cập nhật phòng ban thất bại, vui lòng thử lại.",
      });
      console.error("Failed to update department:", error);
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
          notification.success({
            message: `Xóa phòng ban thành công!`,
          });
        } catch (error) {
          notification.error({
            message: "Xóa phòng ban thất bại, vui lòng thử lại.",
          });
          console.error("Failed to delete department:", error);
        }
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  const viewUserList = (departmentId: number) => {
    setSelectedDepartmentId(departmentId);
    setIsUserListModalVisible(true);
  };

  return (
    <Content className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-green-500 text-2xl font-bold">Quản lý phòng ban</h1>
      </div>
      <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Input
          placeholder="Tìm kiếm theo tên phòng ban"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{ marginBottom: 16, width: 300, borderColor: "#1890ff", borderRadius: 5 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          style={{ borderRadius: 5 }}
        >
          Tạo mới phòng ban
        </Button>
      </Space>


      <Modal
        title="Tạo mới phòng ban"
        open={isModalVisible}
        onOk={handleOk}
        confirmLoading={isCreating}
        onCancel={handleCancel}
        okText="Tạo mới"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Phòng Ban"
            name="departmentName"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng ban!" }]}
          >
            <Input placeholder="Nhập tên phòng ban" />
          </Form.Item>
          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item
            label="Cấp Độ"
            name="acceptLevel"
            rules={[{ required: true, message: "Vui lòng nhập cấp độ!" }]}
          >
            <Input type="number" placeholder="Nhập cấp độ" />
          </Form.Item>
        </Form>
      </Modal>


      <Modal
        title="Cập nhật phòng ban"
        open={isEditModalVisible}
        onOk={handleUpdate}
        confirmLoading={isUpdating}
        onCancel={handleCancel}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Phòng Ban"
            name="departmentName"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng ban!" }]}
          >
            <Input placeholder="Nhập tên phòng ban" />
          </Form.Item>
          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item
            label="Cấp Độ"
            name="acceptLevel"
            rules={[{ required: true, message: "Vui lòng nhập cấp độ!" }]}
          >
            <Input type="number" placeholder="Nhập cấp độ" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Danh sách người dùng"
        open={isUserListModalVisible}
        onCancel={() => setIsUserListModalVisible(false)}
        footer={null}
        width={800}
      >
        {userListError ? (
          <p>Đã xảy ra lỗi khi tải danh sách người dùng!</p>
        ) : (
          <Table
            columns={[
              { title: "Tên đầy đủ", dataIndex: "fullName", key: "fullName" },
              { title: "Email", dataIndex: "email", key: "email" },
              { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
              { title: "Vai trò", dataIndex: ["role", "roleName"], key: "roleName" },
              { title: "Trạng thái", dataIndex: "status", key: "status" }
            ]}
            dataSource={userListData}
            loading={isUserListLoading}
            pagination={{ pageSize: 5 }}
            rowKey="userId"
          />
        )}
      </Modal>

      {error ? (
        <p>Đã xảy ra lỗi khi tải dữ liệu!</p>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            total: totalDepartments,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            size: "small",
          }}
          loading={isLoading}
          rowKey="departmentId"
          bordered
        />
      )}
    </Content>
  );
};

export default DepartManager;