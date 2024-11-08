import { useEffect, useState } from "react";
import { Button, Table, Input, Space, Tag } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../../types/visitListType";
import {
  useGetListVisitByDepartmentIdQuery,
  useGetListVisitQuery,
} from "../../services/visitList.service";
import { useDispatch, useSelector } from "react-redux";
import { toggleStatusTab } from "../../redux/slices/filterTab.slice";

const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole");
  const departmentId = Number(localStorage.getItem("departmentId"));
  // console.log(departmentId);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");

  let data: any = [];
  // const totalPages = Math.ceil(data.length / pageSize);
  const dispatch = useDispatch();
  const visit = useSelector<any>((s) => s.visitDetailList.data) as [];
  const isFiltering = useSelector<any>(
    (s) => s.visitDetailList.isFiltering
  ) as boolean;
  let isLoading = true;
  let refetch;
  if (userRole === "DepartmentManager") {
    let {
      data: managerData,
      isLoading: managerLoading,
      refetch: refetchManager,
    } = useGetListVisitByDepartmentIdQuery({
      pageNumber: 1,
      pageSize: 100,
      departmentId: departmentId,
    });
    data = managerData;
    isLoading = managerLoading;
    refetch = refetchManager;
  } else {
    let {
      data: allData,
      isLoading: allLoading,
      refetch: refetchAll,
    } = useGetListVisitQuery({
      pageNumber: 1,
      pageSize: 100,
      status: "",
    });
    data = allData;
    isLoading = allLoading;
    refetch = refetchAll;
  }
  if (isFiltering) {
    data = visit;
  }
  console.log(data);
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
        } else if (text === "Unactive") {
          color = "blue";
          displayText = "Hết hạn";
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
      render: (text) => {
        let displayText;
        let color;

        if (text?.scheduleType?.scheduleTypeId === 2) {
          displayText = "Theo tuần";
          color = "blue"; // Set color for "Theo tuần"
        } else if (text?.scheduleType?.scheduleTypeId === 3) {
          displayText = "Theo tháng";
          color = "green"; // Set color for "Theo tháng"
        } else {
          displayText = "Theo ngày";
          color = "default"; // Default color for "Theo ngày"
        }
        return (
          <Tag color={color} style={{ fontSize: "14px" }}>
            {displayText}
          </Tag>
        );
      },
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

  const handleFilterTabs = () => {
    dispatch(toggleStatusTab());
  };
  useEffect(() => {
    refetch();
  }, []);

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
        <Button type={"default"} onClick={handleFilterTabs}>
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
      {/* <FilterVisit body="keke"/> */}
    </Content>
  );
};

export default CustomerVisit;
