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
  Card,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
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
import { CalendarDays, CalendarRange, Clock4 } from "lucide-react";
import LoadingState from "../../components/State/LoadingState";

interface Filters {
  expectedStartTime: Dayjs | null;
  expectedEndTime: Dayjs | null;
  visitQuantity: [number, number];
  visitStatus: VisitStatus[];
  scheduleTypeId: any[];
}
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
        const scheduleTypeId = scheduleUser?.schedule.scheduleType
          .scheduleTypeId as ScheduleType;
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
  useEffect(() => {
    if (isLoading || !data) return;
    let filtered = data.filter((item) => item.visitStatus !== "Pending");
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
  if (isLoading) {
    return <LoadingState></LoadingState>;
  }
  return (
    <Content className="p-4 max-w-[1200px] mx-auto">
      <div className="flex gap-4 mb-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Tìm kiếm chuyến thăm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={handleSearchChange}
            className="max-w-xs"
          />
          <Popover
            content={
              <Space direction="vertical" className="w-64">
                <DatePicker
                  placeholder="Ngày bắt đầu"
                  className="w-full"
                  onChange={(date) =>
                    handleFilterChange("expectedStartTime", date)
                  }
                />
                <DatePicker
                  placeholder="Ngày kết thúc"
                  className="w-full"
                  onChange={(date) =>
                    handleFilterChange("expectedEndTime", date)
                  }
                />
                <div className="mt-1">
                  <small className="text-gray-500">Số lượng khách</small>
                  <Slider
                    range
                    min={1}
                    max={100}
                    defaultValue={[1, 100]}
                    onChange={(value) =>
                      handleFilterChange("visitQuantity", value)
                    }
                  />
                </div>
                <Button
                  type="default"
                  block
                  onClick={handleClearFilters}
                  size="small"
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            }
            trigger="click"
            placement="bottomRight"
          >
            <Button icon={<FilterOutlined />} />
          </Popover>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleTypeFilter(null)}
            className={`min-w-[120px] border-2 ${
              filters.scheduleTypeId.includes(null)
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-green-500 text-green-600 hover:bg-green-50"
            }`}
          >
            <Clock4 size={17} />
            Theo ngày
          </Button>
          <Button
            onClick={() => handleTypeFilter(ScheduleType.Weekly)}
            className={`min-w-[120px] border-2 ${
              filters.scheduleTypeId.includes(ScheduleType.Weekly)
                ? "border-yellow-500 text-yellow-600 bg-yellow-50"
                : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            <CalendarDays size={17} />
            Theo tuần
          </Button>
          <Button
            type={
              filters.scheduleTypeId.includes(ScheduleType.Monthly)
                ? "primary"
                : "default"
            }
            onClick={() => handleTypeFilter(ScheduleType.Monthly)}
            className={`min-w-[120px] border-2 ${
              filters.scheduleTypeId.includes(ScheduleType.Monthly)
                ? "border-purple-500 text-purple-600 bg-purple-50"
                : "border-purple-500 text-purple-600 hover:bg-purple-50"
            }`}
          >
            <CalendarRange size={17} />
            Theo tháng
          </Button>
        </div>

        <Button
          icon={<PlusOutlined />}
          onClick={() => navigate("/customerVisit/createNewVisitList")}
          className="px-4 py-4 text-lg   rounded-lg bg-mainColor hover:bg-opacity-90 transition-all   shadow-md text-white flex items-center justify-center"
        >
          <span className="mb-[2px]">Tạo mới</span>
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl border-0">
        <div className="mb-4 flex gap-1">
          <Button
            onClick={() => handleStatusFilter(null)}
            className={`rounded-t-3xl mr-[2px] relative ${
              filters.visitStatus.length === 0
                ? "bg-mainColor text-white border-none hover:bg-mainColor"
                : "bg-white border-mainColor text-mainColor hover:text-mainColor hover:border-mainColor"
            }`}
          >
            Tất cả
          </Button>
          {Object.values(VisitStatus)
            .filter((status) => status !== "Pending")
            .map((status) => {
              const { colorVisitStatus, textVisitStatus } =
                visitStatusMap[status];
              const count = getCountByStatus(status);
              return (
                <Button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`rounded-t-3xl mr-[2px] relative ${
                    filters.visitStatus.includes(status)
                      ? "bg-mainColor text-white border-none hover:bg-mainColor"
                      : "bg-white border-mainColor text-mainColor hover:text-mainColor hover:border-mainColor"
                  }`}
                >
                  {textVisitStatus}
                  {count > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                      {count}
                    </div>
                  )}
                </Button>
              );
            })}
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            total: filteredData?.length,
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10"],
            showTotal: (total) => `Tổng ${total} chuyến thăm`,
            size: "small",
            className: "mt-4",
          }}
          className="w-full [&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-700 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30"
          size="middle"
          bordered={false}
          onRow={(record) => ({
            onDoubleClick: () =>
              navigate(`/customerVisit/detailVisit/${record.visitId}`, {
                state: { record },
              }),
            className: "cursor-pointer transition-colors",
          })}
        />
        <div className="text-gray-400 text-xs mt-2 flex items-center gap-1">
          <InfoCircleOutlined className="text-blue-400" />
          Nhấp đúp để xem chi tiết chuyến thăm
        </div>
      </Card>
    </Content>
  );
};

export default CustomerVisit;
