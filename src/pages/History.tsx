import { Table, Tag, Button, Input } from "antd";
import { useState } from "react";
import type { TableProps } from "antd";
import { useNavigate } from "react-router-dom";

interface DataType {
  key: string;
  title: string;
  time: string;
  date: string;
  area: string[];
  status: string[];
}
const data: DataType[] = [
  {
    key: "1",
    title: "Lịch hẹn khảo sát",
    date: "2024-09-05",
    time: "11h00 - 12h00",
    area: ["Kinh Doanh"],
    status: ["Đã duyệt"],
  },
  {
    key: "2",
    title: "Lịch hẹn tham quan",
    date: "2024-09-05",
    time: "11h00 - 12h00",
    area: ["Sản xuất"],
    status: ["Đã duyệt"],
  },
];

const History = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [filteredData, setFilteredData] = useState<DataType[]>(data); // Holds filtered data

  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    // Filter the data based on the search text
    const filtered = data.filter((entry) =>
      entry.title.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Khung giờ",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      sorter: (a, b) => a.time.localeCompare(b.time),
    },
    {
      title: "Khu vực",
      key: "area",
      dataIndex: "area",
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
      render: (_, { status }) => (
        <>
          {status.map((status) => {
            let color = status === "Chưa duyệt" ? "volcano" : "green";
            return (
              <Tag color={color} key={status}>
                {status.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() =>
            navigate("/historyDetail", { state: { title: record.title } })
          }
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Tìm kiếm theo tiêu đề"
        value={searchText}
        onChange={handleSearchChange}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Table columns={columns} dataSource={filteredData} />
    </div>
  );
};

export default History;
