import { useState, useEffect } from "react";
import { Button, Table, Input, Tag, Space } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { TableProps, PaginationProps } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../types/visitListType";
import { useGetListVisitQuery } from "../services/visitList.service";

const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Fetching data using the query
  const { data, isLoading, error } = useGetListVisitQuery({ pageNumber: currentPage, pageSize });
  console.log(data);
  // Mapping visit types to corresponding tags with colors
  const statusTags: Record<string, JSX.Element> = {
    ProcessWeek: <Tag color="green">ProcessWeek</Tag>,
    VisitStaff: <Tag color="red">VisitStaff</Tag>,
  };

  const getMappedVisitType = (type: string) => statusTags[type] || <Tag color="gray">Khác</Tag>;

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

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
            onClick={() => navigate('/createNewVisitList')}
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
          current: currentPage,
          pageSize: pageSize,
          total: data?.total || 0, // Assuming data contains total count
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
    </Content>
  );
};

export default CustomerVisit;