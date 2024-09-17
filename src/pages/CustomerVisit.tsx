
import {Table, Tag } from "antd";
import type { TableProps } from "antd";

interface DataType {
  key: string;
  title: string;
  time: string;
  date: string;
  area: string[];
  status: string[];
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Khung giờ",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Thời gian",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "Khu vực",
    key: "area",
    dataIndex: "area",
    render: (_, { area }) => (
      <>
        {area.map((area) => {
          let color = area.length > 5 ? "geekblue" : "green";
          if (area === "loser") {
            color = "volcano";
          }
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
    key: "tags",
    dataIndex: "tags",
    render: (_, { status }) => (
      <>
        {status.map((status) => {
          let color = status.length > 5 ? "green" : "geekblue";
          if (status === "Chưa duyệt") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={status}>
              {status.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  // {
  //   title: "Action",
  //   key: "action",
  //   render: (_, record) => (
  //     <Space size="middle">
  //       <a>Invite {record.title}</a>
  //       <a>Delete</a>
  //     </Space>
  //   ),
  // },
];

const data: DataType[] = [
  {
    key: "1",
    title: "Lịch hẹn khảo sát",
    date: "05/09/2024",
    time: "11h00 - 12h00",
    area: ["Sản xuất"],
    status: ["Đã duyệt"],
  },
  {
    key: "2",
    title: "Lịch hẹn tham quan",
    date: "05/09/2024",
    time: "11h00 - 12h00",
    area: ["Sản xuất"],
    status: ["Chưa duyệt"],
  },
  {
    key: "3",
    title: "Lịch hẹn tham quan",
    date: "05/09/2024",
    time: "11h00 - 12h00",
    area: ["Sản xuất"],
    status: ["Đã duyệt"],
  },
];

const CustomerVisit = () => {
  return (
    <div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default CustomerVisit;
