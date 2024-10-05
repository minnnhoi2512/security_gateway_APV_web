import { useState } from "react";
import { Button, Table, Input, Space } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../types/visitListType";
import { useGetListVisitQuery } from "../services/visitList.service";

const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");

  // Fetching data using the query
  const { data, isLoading } = useGetListVisitQuery({
    pageNumber: -1,
    pageSize: -1,
  });
  // Mapping visit types to corresponding tags with colors

  console.log(data);
  const columns: TableProps<VisitListType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "visitName",
      key: "visitName",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.visitName.toLowerCase().includes(value.toString().toLowerCase()),
      sorter: (a, b) => a.visitName.localeCompare(b.visitName),
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "expectedStartTime",
      key: "expectedStartTime",
      render: (date: Date) =>
        moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss"), // Include time
      sorter: (a, b) =>
        new Date(a.expectedStartTime).getTime() -
        new Date(b.expectedStartTime).getTime(),
    },
    {
      title: "Ngày dự kiến kết thúc",
      dataIndex: "expectedEndTime",
      key: "expectedEndTime",
      render: (date: Date) =>
        moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss"), // Include time
      sorter: (a, b) =>
        new Date(a.expectedEndTime).getTime() -
        new Date(b.expectedEndTime).getTime(),
    },
    {
      title: "Số lượng (Người)",
      dataIndex: "visitQuantity",
      key: "visitQuantity",
      sorter: (a, b) => a.visitQuantity - b.visitQuantity,
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>
      ),
    },
    {
      title: "Miêu tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "visitStatus",
      key: "visitStatus",
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "schedule",
      key: "schedule",
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>{text.scheduleName}</span>
      ),
    },
    {
      title: "Tạo bởi",
      dataIndex: "createBy",
      key: "createBy",
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>
          {text?.fullName || "-"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() =>
            navigate(`/detailVisit/${record.visitId}`, { state: { record } })
          }
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <Content className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-green-500 text-2xl font-bold">
          Danh sách khách đến công ty
        </h1>
      </div>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Tìm kiếm theo tiêu đề"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{
            marginBottom: 16,
            width: 300,
            borderColor: "#1890ff",
            borderRadius: 5,
          }}
        />
        {userRole !== "Security" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/createNewVisitList")}
            style={{ borderRadius: 5 }}
          >
            Tạo mới
          </Button>
        )}
      </Space>
      <Table
        columns={columns}
        dataSource={data || []} // Fallback to an empty array if data is undefined
        pagination={{
          total: data?.total || 0, // Assuming data contains total count
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          hideOnSinglePage: false,
          size: "small",
        }}
        loading={isLoading}
        rowKey="visitId"
        bordered
      />
    </Content>
  );
};

export default CustomerVisit;
