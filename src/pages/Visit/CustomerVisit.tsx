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
    // {
    //   title: "STT",
    //   dataIndex: "index",
    //   key: "index",
    //   width: 50,
    //   render: (text, record, index) => index + 1,
    // },
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
  const [isActive, setIsActive] = useState(false);

  const handleClick = (status) => {
    setIsActive(!isActive);
    if (!isActive) {
      handleStatusFilter(status);
    } else {
      handleClearFilters();
    }
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

  const handleStatusFilter = (status: VisitStatus | null) => {
    setFilters((prev) => ({
      ...prev,
      visitStatus: status === null ? [] : [status],
    }));
  };

  const getHeaderBackgroundColor = () => {
    if (filters.scheduleTypeId.length === 1) {
      const type = filters.scheduleTypeId[0];
      switch (type) {
        case null:
          return "[&_.ant-table-thead_th]:!bg-[#138d75]/10 [&_.ant-table-thead_th]:!text-[#138d75]";
        case ScheduleType.Weekly:
          return "[&_.ant-table-thead_th]:!bg-[#e67e22]/10 [&_.ant-table-thead_th]:!text-[#e67e22]";
        case ScheduleType.Monthly:
          return "[&_.ant-table-thead_th]:!bg-[#2980b9]/10 [&_.ant-table-thead_th]:!text-[#2980b9]";
        case "ALL":
          return "[&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white";
        default:
          return "[&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white";
      }
    }
    return "[&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white";
  };

  if (isLoading) {
    return <LoadingState></LoadingState>;
  }
  return (
    <Content className="p-4 max-w-[1200px] mx-auto mt-10">
      <div className="flex flex-col mb-2">
        <div className="flex gap-4 items-center">
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
                  {/* Bộ lọc theo ngày */}
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

                  {/* Bộ lọc số lượng khách */}
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

                  {/* Bộ lọc trạng thái */}
                  <div className="mt-4">
                    <small className="text-gray-500 block mb-2">
                      Trạng thái
                    </small>
                    <div className="flex flex-wrap items-center gap-2">
                      {Object.values(VisitStatus)
                        .filter((status) => status !== "Pending")
                        .map((status) => {
                          const { colorVisitStatus, textVisitStatus } =
                            visitStatusMap[status];
                          const count = getCountByStatus(status);
                          const isSelected =
                            filters.visitStatus.includes(status);

                          return (
                            <Button
                              key={status}
                              onClick={() => handleStatusFilter(status)}
                              className={`
                  relative 
                  rounded-full 
                  px-3 
                  py-1 
                  h-auto 
                  text-xs 
                  transition-all 
                  duration-200 
                  ${
                    isSelected
                      ? "bg-[#34495e] text-white hover:bg-primary/90"
                      : "bg-[white] text-primary border-primary hover:bg-primary/10"
                  }
                `}
                            >
                              <span className="relative z-10">
                                {textVisitStatus}
                              </span>
                              {count > 0 && (
                                <span
                                  className="
                      absolute 
                      -top-1 
                      -right-1 
                      z-20 
                      bg-red-500 
                      text-white 
                      text-[10px] 
                      rounded-full 
                      min-w-[16px] 
                      h-[16px] 
                      flex 
                      items-center 
                      justify-center 
                      px-1
                    "
                                >
                                  {count}
                                </span>
                              )}
                            </Button>
                          );
                        })}
                    </div>
                  </div>
                  {/* Nút xóa bộ lọc */}
                  <Button
                    type="default"
                    block
                    onClick={handleClearFilters}
                    size="small"
                    className="mt-4"
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

          <div className="flex items-center gap-2">
            {/* <div
              className={`
      bg-[#dc7633] 
      shadow-lg 
      rounded-lg 
      p-1 
      animate-cardPulse 
      transition-all 
      duration-200
      ${isActive ? "ring-2 ring-white" : ""}
    `}
            >
              <div className="flex items-center gap-2 px-2">
                {Object.values(VisitStatus)
                  .filter((status) => status === VisitStatus.ActiveTemporary)
                  .map((status) => {
                    const { textVisitStatus } = visitStatusMap[status];
                    const count = getCountByStatus(status);

                    return (
                      <button
                        key={status}
                        onClick={() => handleClick(status)}
                        className={`
                  text-white
                  px-2
                  py-1
                  text-sm
                  rounded-md
                  flex
                  items-center
                  gap-2
                  hover:opacity-80
                  transition-all
                  duration-200
                  h-8
                  ${isActive ? "" : ""}
                `}
                      >
                        <span>{textVisitStatus}</span>
                        {count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div> */}

            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate("/customerVisit/createNewVisitList")}
              className="px-4 py-4 text-lg   rounded-lg bg-buttonColor hover:bg-opacity-90 transition-all   shadow-md text-white flex items-center justify-center"
            >
              <span className="mb-[2px]">Tạo mới</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="shadow-lg rounded-xl border-0">
        <div className="shadow-lg rounded-xl border-0">
          <div className="flex gap-1">
            <Button
              onClick={() => handleTypeFilter(null)}
              className={`rounded-t-[140px] min-w-[120px] border-b-0 ${
                filters.scheduleTypeId.includes(null)
                  ? "border-[#138d75] text-white bg-[#138d75]  "
                  : "border-[#34495e] text-[#34495e]  "
              }`}
            >
              <Clock4 size={17} />
              Theo ngày
            </Button>
            <Button
              onClick={() => handleTypeFilter(ScheduleType.Weekly)}
              className={`rounded-t-[120px] min-w-[120px] border-b-0  ${
                filters.scheduleTypeId.includes(ScheduleType.Weekly)
                  ? "border-[#e67e22] text-white bg-[#e67e22]"
                  : "border-[#34495e] text-[#34495e] hover:bg-yellow-50"
              }`}
            >
              <CalendarDays size={17} />
              Theo tuần
            </Button>
            <Button
              // type={
              //   filters.scheduleTypeId.includes(ScheduleType.Monthly)
              //     ? "primary"
              //     : "default"
              // }
              onClick={() => handleTypeFilter(ScheduleType.Monthly)}
              className={`rounded-t-[120px] min-w-[120px] border-b-0  ${
                filters.scheduleTypeId.includes(ScheduleType.Monthly)
                  ? "border-[#2980b9] text-white bg-[#2980b9]"
                  : "border-[#34495e] text-[#34495e] hover:bg-purple-50"
              }`}
            >
              <CalendarRange size={17} />
              Theo tháng
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          showSorterTooltip={false}
          pagination={{
            total: filteredData?.length,
            // pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10"],
            showTotal: (total) => `Tổng ${total} chuyến thăm`,
            size: "small",
            className: "mt-4",
          }}
          className={`w-full ${getHeaderBackgroundColor()} [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30 [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead_th]:!transition-none`}
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
