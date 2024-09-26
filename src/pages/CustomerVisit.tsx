import { useState } from "react";
import {
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
} from "antd";
import type { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Content } from "antd/es/layout/layout";

interface DataType {
  key: string;
  title: string;
  time: string;
  date: string;
  area: string[];
  status: string;
}

const { Option } = Select;

const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole"); // Retrieve user role
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>(""); // For search functionality
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page number
  const [pageSize, setPageSize] = useState<number>(5); // Rows per page

  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      title: "Lịch hẹn khảo sát",
      date: "05/09/2024",
      time: "11:00",
      area: ["Sản xuất"],
      status: "Đã duyệt",
    },
    {
      key: "2",
      title: "Lịch hẹn tham quan",
      date: "05/09/2024",
      time: "12:00",
      area: ["Kinh doanh"],
      status: "Chưa duyệt",
    },
    {
      key: "3",
      title: "Lịch hẹn tham quan",
      date: "06/09/2024",
      time: "11:00",
      area: ["Sản xuất"],
      status: "Đã duyệt",
    },
    // Additional sample data can be added here
  ]);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toString().toLowerCase()),
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      sorter: (a, b) =>
        moment(a.time, "HH:mm").unix() - moment(b.time, "HH:mm").unix(),
    },
    {
      title: "Khu vực",
      key: "area",
      dataIndex: "area",
      render: (_, { area }) => (
        <>
          {area.map((area) => (
            <Tag color={area.length > 5 ? "geekblue" : "green"} key={area}>
              {area.toUpperCase()}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => (
        <Tag color={status === "Chưa duyệt" ? "volcano" : "green"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() => navigate("/detailVisit", { state: { title: record.title } })}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newData: DataType = {
        key: (data.length + 1).toString(),
        title: values.title,
        date: values.date.format("DD/MM/YYYY"), // Formatting date
        time: values.time.format("HH:mm"), // Formatting time
        area: [values.area],
        status: "Chưa duyệt",
      };
      setData([newData, ...data]); // Add the new data at the beginning
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  // Handling search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle pagination change
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Content className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-green-500 text-2xl font-bold">
          Danh sách khách đến công ty
        </h1>
      </div>

      {/* Search Input */}
      <div>
        <Input
          placeholder="Tìm kiếm theo tiêu đề"
          value={searchText}
          onChange={handleSearchChange}
          style={{ marginBottom: 16, width: 300 }}
        />
        {/* Conditionally render "Tạo mới" button based on userRole */}
        {userRole !== "Security" && (
          <Button type="default" onClick={() => navigate("/createNewVisitList")}>
            Tạo mới
          </Button>
        )}
      </div>

      {/* Modal for creating new visit */}
      <Modal
        title="Tạo mới lịch hẹn"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="time"
            label="Thời gian"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Form.Item
            name="area"
            label="Khu vực"
            rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
          >
            <Select>
              <Option value="Sản xuất">Sản xuất</Option>
              <Option value="Kinh doanh">Kinh doanh</Option>
              <Option value="Nhân sự">Nhân sự</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Table with pagination */}
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        onChange={handleTableChange}
      />
    </Content>
  );
};

export default CustomerVisit;
