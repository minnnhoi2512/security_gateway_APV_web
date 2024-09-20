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

interface DataType {
  key: string;
  title: string;
  time: string;
  date: string;
  area: string[];
  status: string;
}

const { Option } = Select;

const CustomerVisitStaff = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>(""); // For search functionality
  const [filteredDate, setFilteredDate] = useState<string | null>(null); // Date filter state
  const [filteredTime, setFilteredTime] = useState<string | null>(null); // Time filter state
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
  ]);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <a>{text}</a>,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      filteredValue: filteredDate ? [filteredDate] : null,
      onFilter: (value, record) => record.date === value,
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      sorter: (a, b) =>
        moment(a.time, "HH:mm").unix() - moment(b.time, "HH:mm").unix(),
      filteredValue: filteredTime ? [filteredTime] : null,
      onFilter: (value, record) => record.time === value,
    },
    {
      title: "Khu vực",
      key: "area",
      dataIndex: "area",
      filters: [
        { text: "Sản xuất", value: "Sản xuất" },
        { text: "Kinh doanh", value: "Kinh doanh" },
        { text: "Nhân sự", value: "Nhân sự" },
      ],
      onFilter: (value, record) => record.area.includes(value as string),
      render: (_, { area }) => (
        <>
          {area.map((area) => {
            let color = area.length > 5 ? "geekblue" : "green";
            return (
              <Tag color={color} key={area}>
                {area.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      filters: [
        { text: "Đã duyệt", value: "Đã duyệt" },
        { text: "Chưa duyệt", value: "Chưa duyệt" },
      ],
      onFilter: (value, record) => record.status === value, // Exact match
      render: (_, { status }) => {
        let color = status === "Chưa duyệt" ? "volcano" : "green";
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() =>
            navigate("/detailVisit", { state: { title: record.title } })
          }
        >
          Chi tiết
        </Button>
      ),
    },
  ];
  

  const showModal = () => {
    setIsModalVisible(true);
  };

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

  return (
    <>
      {/* Search Input */}
      <Input
        placeholder="Tìm kiếm theo tiêu đề"
        value={searchText}
        onChange={handleSearchChange}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Button type="default" onClick={showModal} className="m-5">
        Tạo mới
      </Button>
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
            label="Khung giờ"
            rules={[{ required: true, message: "Vui lòng chọn khung giờ" }]}
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
      {/* Table */}
      <Table columns={columns} dataSource={data} />
    </>
  );
};

export default CustomerVisitStaff;
