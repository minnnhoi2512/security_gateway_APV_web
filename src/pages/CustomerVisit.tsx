import { useState, useEffect } from "react";
import { Button, Table, Input, Tag, Space, Modal, Form, DatePicker, InputNumber, Row, Col, Select } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { TableProps, PaginationProps } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../types/visitListType";

// Function to generate fake data with a limited number of entries
const generateFakeData = (count: number): VisitListType[] => {
  const types = ["ProcessWeek", "VisitStaff"];
  const descriptions = ["Meeting with staff", "Weekly process review", "Staff training session", "Monthly overview"];
  const names = ["Visit A", "Visit B", "Visit C", "Visit D"];
  const creators = [{ fullName: "John Doe" }, { fullName: "Jane Smith" }, { fullName: "Michael Brown" }];

  return Array.from({ length: count }, (_, i) => ({
    visitId: i + 1,
    visitName: `${names[i % names.length]} ${i + 1}`,
    dateRegister: new Date(), // Convert dateRegister to Date object
    visitQuantity: Math.floor(Math.random() * 20) + 1,
    description: descriptions[i % descriptions.length],
    visitType: types[i % types.length],
    createBy: creators[i % creators.length],
  }));
};

const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [data, setData] = useState<VisitListType[]>([]); // State to hold fake data
  const isLoading = false; // Set isLoading as false since we're using fake data

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Set fake data with a count that results in about 5 pages
    setData(generateFakeData(25)); // Adjust to generate only 25 items
  }, []);

  // Mapping visit types to corresponding tags with colors
  const statusTags: Record<string, JSX.Element> = {
    ProcessWeek: <Tag color="green">ProcessWeek</Tag>,
    VisitStaff: <Tag color="red">VisitStaff</Tag>,
  };

  // Function to get the appropriate tag for visit type
  const getMappedVisitType = (type: string) => statusTags[type] || <Tag color="gray">Khác</Tag>;

  const handleCreateNew = () => {
    form.validateFields()
      .then((values) => {
        console.log("Form values:", values);
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns: TableProps<VisitListType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "visitName",
      key: "visitName",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.visitName.toLowerCase().includes(value.toString().toLowerCase()),
      sorter: (a, b) => a.visitName.localeCompare(b.visitName),
      render: (text) => <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>,
    },
    {
      title: "Ngày",
      dataIndex: "dateRegister",
      key: "dateRegister",
      render: (date: Date) => moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.dateRegister).getTime() - new Date(b.dateRegister).getTime(),
    },
    {
      title: "Số lượng (Người)",
      dataIndex: "visitQuantity",
      key: "visitQuantity",
      sorter: (a, b) => a.visitQuantity - b.visitQuantity,
      render: (text) => <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>,
    },
    {
      title: "Miêu tả",
      dataIndex: "description",
      key: "description",
      render: (text) => <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "visitType",
      key: "visitType",
      render: (text) => getMappedVisitType(text),
    },
    {
      title: "Tạo bởi",
      dataIndex: "createBy",
      key: "createBy",
      render: (text) => <span style={{ fontSize: "14px", color: "#000" }}>{text?.fullName || "-"}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button size="middle" onClick={() => navigate(`/detailVisit/${record.visitId}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  // Handling search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle pagination change with proper typing
  const handleTableChange = (pagination: PaginationProps) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 5);
  };

  return (
    <Content className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-green-500 text-2xl font-bold">Danh sách khách đến công ty</h1>
      </div>
      <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Input
          placeholder="Tìm kiếm theo tiêu đề"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{ marginBottom: 16, width: 300, borderColor: "#1890ff", borderRadius: 5 }}
        />
        {userRole !== "Security" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            style={{ borderRadius: 5 }}
          >
            Tạo mới
          </Button>
        )}
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          hideOnSinglePage: false,
          size: "small",
        }}
        onChange={handleTableChange}
        loading={isLoading}
        rowKey="visitId"
        bordered
      />

      {/* Modal for Creating New Visit */}
      <Modal
        title="Tạo mới khách đến"
        visible={isModalVisible}
        onOk={handleCreateNew}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tiêu đề"
                name="visitName"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày"
                name="dateRegister"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số lượng (Người)"
                name="visitQuantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại"
                name="visitType"
                rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
              >
                <Select options={Object.keys(statusTags).map(key => ({ label: statusTags[key].props.children, value: key }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Miêu tả" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Content>
  );
};

export default CustomerVisit;
