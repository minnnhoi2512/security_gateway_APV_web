import { useState } from "react";
import {
  Button,
  Table,
  Tag,
  Input,
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


const CustomerVisitStaff = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>(""); // For search functionality
  const [filteredDate] = useState<string | null>(null); // Date filter state
  const [filteredTime] = useState<string | null>(null); // Time filter state
  const [data] = useState<DataType[]>([
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
      {/* Table */}
      <Table columns={columns} dataSource={data} />
    </>
  );
};

export default CustomerVisitStaff;
