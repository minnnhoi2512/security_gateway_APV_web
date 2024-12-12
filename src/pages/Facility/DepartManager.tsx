import { useState } from "react";
import {
  Button,
  Table,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  notification,
  Layout,
  Divider,
  Card,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import {
  useGetListDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../../services/department.service";
import { useGetListUsersByDepartmentIdQuery } from "../../services/user.service";
import { Plus } from "lucide-react";

const { confirm } = Modal;

const DepartManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUserListModalVisible, setIsUserListModalVisible] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [form] = Form.useForm();
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const { data, isLoading, error, refetch } = useGetListDepartmentsQuery({
    pageNumber: -1,
    pageSize: -1,
  });

  const departments = data
    ? data.filter((department) => ![1, 2, 3].includes(department.departmentId))
    : [];
  const totalDepartments = departments ? departments.length : 0;

  const {
    data: userListData,
    isLoading: isUserListLoading,
    error: userListError,
  } = useGetListUsersByDepartmentIdQuery(
    { departmentId: selectedDepartmentId!, pageNumber: 1, pageSize: 100 },
    { skip: selectedDepartmentId === null }
  );

  const filteredData = departments.filter((dept: any) =>
    dept.departmentName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    // {
    //   title: "ID Phòng Ban",
    //   dataIndex: "departmentId",
    //   key: "departmentId",
    // },
    {
      title: "Tên Phòng Ban",
      dataIndex: "departmentName",
      key: "departmentName",
      sorter: (a: any, b: any) =>
        a.departmentName.localeCompare(b.departmentName),
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
        new Date(a.createDate || "").getTime() -
        new Date(b.createDate || "").getTime(),
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
          {/* Edit Icon */}
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => openEditModal(record)}
          />

          {/* View Details Icon */}
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#52c41a" }} />}
            onClick={() => viewUserList(record.departmentId)}
          />

          {/* Delete Icon */}
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => showDeleteConfirm(record.departmentId)}
          />
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
      await updateDepartment({
        id: editingDepartment.departmentId,
        ...values,
      }).unwrap();
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
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col mb-2 mt-2">
          <div className="flex gap-4 justify-between items-center">
            <Input
              placeholder="Tìm kiếm theo tên phòng ban"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={handleSearchChange}
              className="max-w-xs"
            />

            <Button
              // type="primary"
              // icon={<PlusOutlined />}
              className=" group relative px-5 py-3 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
              onClick={showModal}
            >
              <div className="flex items-center gap-2 text-white">
                <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
                <span className="font-medium text-lg">Tạo mới</span>
              </div>
            </Button>
          </div>
        </div>

        <Divider />

        {/* Create Department Modal */}
        <Modal
          title={<h2 className="text-lg font-semibold">Tạo mới phòng ban</h2>}
          open={isModalVisible}
          onOk={handleOk}
          confirmLoading={isCreating}
          onCancel={handleCancel}
          okText="Tạo mới"
          cancelText="Hủy"
          className="rounded-lg"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Tên Phòng Ban"
              name="departmentName"
              rules={[
                { required: true, message: "Vui lòng nhập tên phòng ban!" },
              ]}
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

        {/* Edit Department Modal */}
        <Modal
          title={<h2 className="text-lg font-semibold">Cập nhật phòng ban</h2>}
          open={isEditModalVisible}
          onOk={handleUpdate}
          confirmLoading={isUpdating}
          onCancel={handleCancel}
          okText="Cập nhật"
          cancelText="Hủy"
          className="rounded-lg"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Tên Phòng Ban"
              name="departmentName"
              rules={[
                { required: true, message: "Vui lòng nhập tên phòng ban!" },
              ]}
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

        {/* User List Modal */}
        <Modal
          title={
            <h2 className="text-lg font-semibold">Danh sách người dùng</h2>
          }
          open={isUserListModalVisible}
          onCancel={() => setIsUserListModalVisible(false)}
          footer={null}
          width={800}
          className="rounded-lg"
        >
          {userListError ? (
            <p className="text-red-500">
              Đã xảy ra lỗi khi tải danh sách người dùng!
            </p>
          ) : (
            <Card className="shadow-lg rounded-xl border-0">
              <Table
                columns={[
                  {
                    title: "Tên đầy đủ",
                    dataIndex: "fullName",
                    key: "fullName",
                  },
                  { title: "Email", dataIndex: "email", key: "email" },
                  {
                    title: "Số điện thoại",
                    dataIndex: "phoneNumber",
                    key: "phoneNumber",
                  },
                  {
                    title: "Vai trò",
                    dataIndex: ["role", "roleName"],
                    key: "roleName",
                  },
                  { title: "Trạng thái", dataIndex: "status", key: "status" },
                ]}
                dataSource={userListData}
                loading={isUserListLoading}
                pagination={{ pageSize: 5 }}
                rowKey="userId"
                bordered
                className="w-full [&_thead_th]:!bg-[#34495e] [&_thead_th]:!text-white [&_thead_th]:!font-medium [&_thead_th]:!py-3 [&_thead_th]:!text-sm hover:[&_tbody_tr]:bg-blue-50/30 [&_table]:!rounded-none [&_table-container]:!rounded-none [&_thead>tr>th:first-child]:!rounded-tl-none [&_thead>tr>th:last-child]:!rounded-tr-none [&_thead_th]:!transition-none"
              />
            </Card>
          )}
        </Modal>

        {error ? (
          <p className="text-red-500 text-center">
            Đã xảy ra lỗi khi tải dữ liệu!
          </p>
        ) : (
          <Card className="shadow-lg rounded-xl border-0">
            <Table
              columns={columns}
              showSorterTooltip={false}
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
              className="w-full [&_thead_th]:!bg-[#34495e] [&_thead_th]:!text-white [&_thead_th]:!font-medium [&_thead_th]:!py-3 [&_thead_th]:!text-sm hover:[&_tbody_tr]:bg-blue-50/30 [&_table]:!rounded-none [&_table-container]:!rounded-none [&_thead>tr>th:first-child]:!rounded-tl-none [&_thead>tr>th:last-child]:!rounded-tr-none [&_thead_th]:!transition-none"
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default DepartManager;
