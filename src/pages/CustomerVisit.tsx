import { useState, useEffect } from "react";
import {
  Button,
  Table,
  message,
} from "antd";
import { TableProps,Input } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone"; // Import moment-timezone
import { Content } from "antd/es/layout/layout";
import { useGetListVisitQuery } from "../services/visitList.service";
import VisitListType from "../types/visitListType";

const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole"); // Retrieve user role
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>(""); // For search functionality
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page number
  const [pageSize, setPageSize] = useState<number>(5); // Rows per page
  const { data = [], error, isLoading } = useGetListVisitQuery({
    pageNumber: currentPage,
    pageSize,
  });

  useEffect(() => {
    if (error) {
      message.error("Failed to load visits!");
    }
  }, [error]);

  const columns: TableProps<VisitListType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "visitName", // Ensure this matches your data structure
      key: "visitName",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.visitName.toLowerCase().includes(value.toString().toLowerCase()), // Use visitName for filtering
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Ngày",
      dataIndex: "dateRegister",
      key: "dateRegister",
      render: (date) => moment.tz(date, "Asia/Ho_Chi_Minh").format("MMMM DD, YYYY, HH:mm:ss"), // Format date to Vietnam time
    },
    {
      title: "Số lượng (Người)",
      dataIndex: "visitQuantity", // Ensure this matches your data structure
      key: "visitQuantity",
      render: (text) => text, // Handle potential undefined
    },
    {
      title: "Miêu tả",
      dataIndex: "description", // Ensure this matches your data structure
      key: "description",
    },
    {
      title: "Loại",
      dataIndex: "visitType", // Ensure this matches your data structure
      key: "visitType",
      render: (text) => text, // Handle potential undefined
    },
    {
      title: "Tạo bởi",
      dataIndex: "createBy", // Ensure this matches your data structure
      key: "createBy",
      render: (text) => text?.fullName || "-", // Handle potential undefined
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() => 
            navigate(`/detailVisit/${record.visitId}`)
            // console.log(record?.visitId)
          } // Navigate with ID
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
      {/* Table with pagination */}
      <Table
        columns={columns}
        dataSource={data} // Ensure data is an array
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length, // This should now be safe
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        onChange={handleTableChange}
        loading={isLoading} // Show loading state
        rowKey="visitId"
      />
    </Content>
  );
};

export default CustomerVisit;