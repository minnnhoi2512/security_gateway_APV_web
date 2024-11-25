import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Input,
  Space,
  Tag,
  DatePicker,
  Slider,
  Select,
  Modal,
  Tooltip,
  Popover,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../../types/visitListType";
import {
  useGetListVisitByDepartmentIdQuery,
  useGetListVisitQuery,
} from "../../services/visitList.service";
import dayjs, { Dayjs } from "dayjs";
import { VisitStatus, visitStatusMap } from "../../types/Enum/VisitStatus";
import { ScheduleType, typeMap } from "../../types/Enum/ScheduleType";
import ListHistorySessonVisit from "../History/ListHistorySessionVisit";

interface Filters {
  expectedStartTime: Dayjs | null;
  expectedEndTime: Dayjs | null;
  visitQuantity: [number, number];
  visitStatus: VisitStatus[];
  scheduleTypeId: any[];
}
const { Option } = Select;
const CustomerVisit = () => {
  const userRole = localStorage.getItem("userRole");
  const departmentId = Number(localStorage.getItem("departmentId"));
  const [filteredData, setFilteredData] = useState<VisitListType[]>([]);
  const [filters, setFilters] = useState<Filters>({
    expectedStartTime: null,
    expectedEndTime: null,
    visitQuantity: [1, 100],
    visitStatus: [],
    scheduleTypeId: [],
  });
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  let data: any = [];
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
    });
    data = allData;
    isLoading = allLoading;
    refetch = refetchAll;
  }
  const columns: TableProps<VisitListType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tên chuyến thăm",
      dataIndex: "visitName",
      key: "visitName",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: any) =>
        record.visitName.toLowerCase().includes(value.toString().toLowerCase()),
      sorter: (a, b) => a.visitName.localeCompare(b.visitName),
      render: (text) => (
        <Tooltip title={text}>
          <span
            style={{
              fontSize: "14px",
              color: "#000",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "150px",
              display: "inline-block",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "expectedStartTime",
      key: "expectedStartTime",
      render: (date: Date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        new Date(a.expectedStartTime).getTime() -
        new Date(b.expectedStartTime).getTime(),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expectedEndTime",
      key: "expectedEndTime",
      render: (date: Date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        new Date(a.expectedEndTime).getTime() -
        new Date(b.expectedEndTime).getTime(),
    },
    {
      title: "Số khách",
      dataIndex: "visitQuantity",
      key: "visitQuantity",
      sorter: (a, b) => a.visitQuantity - b.visitQuantity,
      render: (text) => (
        <span style={{ fontSize: "14px", color: "#000" }}>{text} Khách</span>
      ),
    },
    {
      title: "Lượt ra vào",
      dataIndex: "visitorSessionCount",
      key: "visitorSessionCount",
      render: (text, record) => (
        <span
          style={{
            fontSize: "14px",
            color: "#000",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => {
            setSelectedVisitId(record.visitId);
            setIsModalVisible(true);
          }}
        >
          {text} Lượt
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "visitStatus",
      key: "visitStatus",
      render: (status: VisitStatus) => {
        const { colorVisitStatus, textVisitStatus } = visitStatusMap[
          status
        ] || {
          color: "black",
          text: "Không xác định",
        };
        return <Tag color={colorVisitStatus}>{textVisitStatus}</Tag>;
      },
    },
    {
      title: "Loại",
      dataIndex: "scheduleUser",
      key: "scheduleUser",
      render: (scheduleUser) => {
        const scheduleTypeId = scheduleUser?.schedule.scheduleType.scheduleTypeId as ScheduleType;
        if (scheduleTypeId === undefined)
          return <Tag color="default">Theo ngày</Tag>;
        const { colorScheduleType, textScheduleType } = typeMap[
          scheduleTypeId
        ] || {
          color: "default",
          text: "Theo ngày",
        };
        return (
          <div>
            <Tag color={colorScheduleType} style={{ fontSize: "14px" }}>
              {textScheduleType}
            </Tag>
        
          </div>
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
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const handleClearFilters = () => {
    setFilters({
      expectedStartTime: null,
      expectedEndTime: null,
      visitQuantity: [1, 100],
      visitStatus: [],
      scheduleTypeId: [],
    });
  };
  useEffect(() => {
    refetch();
  }, []);
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };
  const filterContent = (
    <Space direction="vertical">
      <DatePicker
        placeholder="Ngày bắt đầu"
        onChange={(date) => handleFilterChange("expectedStartTime", date)}
      />
      <DatePicker
        placeholder="Ngày kết thúc"
        onChange={(date) => handleFilterChange("expectedEndTime", date)}
      />
      <Slider
        range
        min={1}
        max={100}
        defaultValue={[1, 100]}
        onChange={(value) => handleFilterChange("visitQuantity", value)}
        style={{ width: 200 }}
      />
      <Button type="default" onClick={handleClearFilters}>
        Xóa bộ lọc
      </Button>
    </Space>
  );
  useEffect(() => {
    if (isLoading || !data) return;
    let filtered = data;
    if (filters.expectedStartTime) {
      filtered = filtered.filter((item: any) =>
        dayjs(item?.expectedStartTime).isSameOrAfter(filters.expectedStartTime!)
      );
    }
    if (filters.expectedEndTime) {
      filtered = filtered.filter((item: any) =>
        dayjs(item?.expectedEndTime).isSameOrBefore(filters.expectedEndTime!)
      );
    }
    if (filters.visitQuantity) {
      filtered = filtered.filter(
        (item: any) =>
          item?.visitQuantity >= filters.visitQuantity[0] &&
          item?.visitQuantity <= filters.visitQuantity[1]
      );
    }
    if (filters.visitStatus.length > 0) {
      filtered = filtered.filter((item: any) =>
        filters.visitStatus?.includes(item.visitStatus)
      );
    }
    if (filters.scheduleTypeId.length > 0) {
      filtered = filtered.filter((item: any) =>
        filters.scheduleTypeId.includes(
          item.scheduleUser?.schedule?.scheduleType?.scheduleTypeId ?? null
        )
      );
    }
    if (searchText) {
      filtered = filtered.filter((item: any) =>
        item.visitName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }, [data, isLoading, filters, searchText]);
  const handleTypeFilter = (type: ScheduleType | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      scheduleTypeId: prevFilters.scheduleTypeId.includes(type) ? [] : [type],
    }));
  };
  const getCountByStatus = (status: VisitStatus) => {
    return data?.filter((item: any) => item.visitStatus === status).length || 0;
  };
  const handleStatusFilter = (status: VisitStatus) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      visitStatus: prevFilters.visitStatus.includes(status) ? [] : [status],
    }));
  };

  return (
    <Content className="px-6">
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên chuyến thăm"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{
              width: 300,
              borderColor: "#1890ff",
              borderRadius: 5,
            }}
          />
          <Popover content={filterContent} title="Bộ lọc" trigger="click">
            <Button icon={<FilterOutlined />} />
          </Popover>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/customerVisit/createNewVisitList")}
          style={{ borderRadius: 12 }}
        >
          Tạo mới
        </Button>
      </Space>
      <>
        <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
          <Button
            type={filters.scheduleTypeId.includes(null) ? "primary" : "default"}
            onClick={() => handleTypeFilter(null)}
            className={`px-4 py-2 rounded-md ${
              filters.scheduleTypeId.includes(null)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Theo ngày
          </Button>
          <Button
            type={
              filters.scheduleTypeId.includes(ScheduleType.Weekly)
                ? "primary"
                : "default"
            }
            onClick={() => handleTypeFilter(ScheduleType.Weekly)}
            className={`px-4 py-2 rounded-md ${
              filters.scheduleTypeId.includes(ScheduleType.Weekly)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Theo tuần
          </Button>
          <Button
            type={
              filters.scheduleTypeId.includes(ScheduleType.Monthly)
                ? "primary"
                : "default"
            }
            onClick={() => handleTypeFilter(ScheduleType.Monthly)}
            className={`px-4 py-2 rounded-md ${
              filters.scheduleTypeId.includes(ScheduleType.Monthly)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Theo tháng
          </Button>
        </Space>
        <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
          <Button
            type={
              filters.visitStatus.includes(VisitStatus.ActiveTemporary)
                ? "primary"
                : "default"
            }
            onClick={() => handleStatusFilter(VisitStatus.ActiveTemporary)}
            className={`px-4 py-2 rounded-md ${
              filters.visitStatus.includes(VisitStatus.ActiveTemporary)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600 
            }`}
          >
            Cần duyệt ({getCountByStatus(VisitStatus.ActiveTemporary)})
          </Button>
          <Button
            type={
              filters.visitStatus.includes(VisitStatus.Pending)
                ? "primary"
                : "default"
            }
            onClick={() => handleStatusFilter(VisitStatus.Pending)}
            className={`px-4 py-2 rounded-md ${
              filters.visitStatus.includes(VisitStatus.Pending)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Chờ phê duyệt ({getCountByStatus(VisitStatus.Pending)})
          </Button>
          <Button
            type={
              filters.visitStatus.includes(VisitStatus.Active)
                ? "primary"
                : "default"
            }
            onClick={() => handleStatusFilter(VisitStatus.Active)}
            className={`px-4 py-2 rounded-md ${
              filters.visitStatus.includes(VisitStatus.Active)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Còn hiệu lực ({getCountByStatus(VisitStatus.Active)})
          </Button>
          <Button
            type={
              filters.visitStatus.includes(VisitStatus.Violation)
                ? "primary"
                : "default"
            }
            onClick={() => handleStatusFilter(VisitStatus.Violation)}
            className={`px-4 py-2 rounded-md ${
              filters.visitStatus.includes(VisitStatus.Violation)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Vi phạm ({getCountByStatus(VisitStatus.Violation)})
          </Button>
          <Button
            type={
              filters.visitStatus.includes(VisitStatus.Cancelled)
                ? "primary"
                : "default"
            }
            onClick={() => handleStatusFilter(VisitStatus.Cancelled)}
            className={`px-4 py-2 rounded-md ${
              filters.visitStatus.includes(VisitStatus.Cancelled)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Đã vô hiệu hóa ({getCountByStatus(VisitStatus.Cancelled)})
          </Button>
          <Button
            type={
              filters.visitStatus.includes(VisitStatus.Inactive)
                ? "primary"
                : "default"
            }
            onClick={() => handleStatusFilter(VisitStatus.Inactive)}
            className={`px-4 py-2 rounded-md ${
              filters.visitStatus.includes(VisitStatus.Inactive)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600`}
          >
            Đã hết hạn ({getCountByStatus(VisitStatus.Inactive)})
          </Button>
        </Space>
      </>

      <Table
        columns={columns}
        dataSource={filteredData}
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
        onRow={(record) => ({
          onDoubleClick: () => {
            navigate(`/customerVisit/detailVisit/${record.visitId}`, {
              state: { record },
            });
          },
        })}
      />
      <Modal
        title="Lịch sử lượt ra vào"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedVisitId && (
          <ListHistorySessonVisit visitId={selectedVisitId} />
        )}
      </Modal>
    </Content>
  );
};

export default CustomerVisit;
