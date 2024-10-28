import { useEffect, useState } from "react";
import { Button, Table, Input, Space, Tag } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../types/VisitListType";
import {
  useGetListVisitByCreatedIdQuery,
  useGetListVisitByDepartmentManagerIdQuery,
  useGetListVisitQuery,
} from "../services/visitList.service";
import CustomPagination from "../components/Pagination";
import FilterVisit from "../components/FilterVisit";
import { useDispatch, useSelector } from "react-redux";
import { toggleStatusTab } from "../redux/slices/filterTab.slice";
import VisitDetailList from "../types/VisitDetailListType";

const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole");
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Active");

  let data: any = [];
  // const totalPages = Math.ceil(data.length / pageSize);
  const dispatch = useDispatch();
  const visit  = useSelector<any>(s => s.visitDetailList.data) as []
  const isFiltering  = useSelector<any>(s => s.visitDetailList.isFiltering) as boolean
  // Fetching data using the query
  let isLoading = true;
  let refetch;

  if (userRole === "Staff") {
    const {
      data: staffData,
      isLoading: staffLoading,
      refetch: refetchStaff,
    } = useGetListVisitByCreatedIdQuery({
      pageNumber: -1,
      pageSize: -1,
      createdById: userId,
    });

    data = staffData;
    isLoading = staffLoading;
    refetch = refetchStaff;
  } else if (userRole === "DepartmentManager") {
    const {
      data: managerData,
      isLoading: managerLoading,
      refetch: refetchManager,
    } = useGetListVisitByDepartmentManagerIdQuery({
      pageNumber: -1,
      pageSize: -1,
      DepartmentManagerId: userId,
    });
    data = managerData;
    isLoading = managerLoading;
    refetch = refetchManager;
  } else {
    const {
      data: allData,
      isLoading: allLoading,
      refetch: refetchAll,
    } = useGetListVisitQuery({
      pageNumber: -1,
      pageSize: -1,
      status: statusFilter,
    });
    data = allData;
    isLoading = allLoading;
    refetch = refetchAll;
  }
  if(isFiltering){
    data = visit
  }
  // const handlePageChange = (page: number, size: number) => {
  //   setCurrentPage(page);
  //   // Call your API with the new page number and size
  //   refetch({ pageNumber: page, pageSize: size });
  // };
  // const handlePageSizeChange = (size: number) => {
  //   setPageSize(size);
  //   setCurrentPage(1); // Reset to the first page when page size changes
  //   // Call your API with updated page size
  //   refetch({ pageNumber: 1, pageSize: size });
  // };
  const columns: TableProps<VisitListType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "visitName",
      key: "visitName",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: any) =>
        record.visitName.toLowerCase().includes(value.toString().toLowerCase()),
      sorter: (a: any, b: any) => a.visitName.localeCompare(b.visitName),
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
      sorter: (a: any, b: any) =>
        new Date(a.expectedStartTime).getTime() -
        new Date(b.expectedStartTime).getTime(),
    },
    {
      title: "Ngày dự kiến kết thúc",
      dataIndex: "expectedEndTime",
      key: "expectedEndTime",
      render: (date: Date) =>
        moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss"), // Include time
      sorter: (a: any, b: any) =>
        new Date(a.expectedEndTime).getTime() -
        new Date(b.expectedEndTime).getTime(),
    },
    {
      title: "Số lượng (Người)",
      dataIndex: "visitQuantity",
      key: "visitQuantity",
      sorter: (a: any, b: any) => a.visitQuantity - b.visitQuantity,
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "visitStatus",
      key: "visitStatus",
      render: (text) => {
        let color = "";
        let displayText = "";

        if (text === "Active") {
          color = "green";
          displayText = "Còn hiệu lực";
        } else if (text === "Pending") {
          color = "yellow";
          displayText = "Đang đợi";
        }

        return (
          <Tag color={color} style={{ fontSize: "14px" }}>
            {displayText}
          </Tag>
        );
      },
    },
    {
      title: "Loại",
      dataIndex: "schedule",
      key: "schedule",
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>
          {text.scheduleName}
        </span>
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

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    refetch(); // Automatically refetch the data when status changes
    // console.log(data)
  };
  const handleFilterTabs = () => {
    dispatch(toggleStatusTab());
  }
  useEffect(() => {
    refetch();
  }, [statusFilter]);

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
      <Space style={{ marginBottom: 16, display: "flex" }}>
        <Button
          type={statusFilter === "Active" ? "primary" : "default"}
          onClick={() => handleStatusChange("Active")}
        >
          Còn hiệu lực
        </Button>
        <Button
          type={statusFilter === "Pending" ? "primary" : "default"}
          onClick={() => handleStatusChange("Pending")}
        >
          Đang đợi
        </Button>
        <Button
          type={"default"}
          onClick={handleFilterTabs}
        >
          Bộ lọc tìm kiếm
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          total: data?.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          hideOnSinglePage: false,
          size: "small",
        }}
        rowKey="visitId"
        bordered
        loading={isLoading}
      />
      {/* <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      /> */}
      <FilterVisit/>
    </Content>
    
  );
};

export default CustomerVisit;
