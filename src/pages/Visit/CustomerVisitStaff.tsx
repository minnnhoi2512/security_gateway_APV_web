import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Input,
  Space,
  Tag,
  DatePicker,
  Slider,
  Modal,
  Popover,
  Tooltip,
  notification,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import "./animation.css";
import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../../types/visitListType";
import { useGetListVisitByResponsiblePersonIdQuery } from "../../services/visitList.service";
import { VisitStatus, visitStatusMap } from "../../types/Enum/VisitStatus";
import { ScheduleType, typeMap } from "../../types/Enum/ScheduleType";
import ListHistorySessonVisit from "../History/ListHistorySessionVisit";
import NotFoundState from "../../components/State/NotFoundState";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface Filters {
  expectedStartTime: Dayjs | null;
  expectedEndTime: Dayjs | null;
  visitQuantity: [number, number];
  visitStatus: VisitStatus[];
  scheduleTypeId: any[];
}

const CustomerVisitStaff = () => {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [animationActive, setAnimationActive] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<VisitListType[]>([]);
  const [filters, setFilters] = useState<Filters>({
    expectedStartTime: null,
    expectedEndTime: null,
    visitQuantity: [1, 100],
    visitStatus: [],
    scheduleTypeId: [],
  });
  const getCountByStatus = (status: VisitStatus) => {
    return data?.filter((item: any) => item.visitStatus === status).length || 0;
  };
  let { data, isLoading, refetch } = useGetListVisitByResponsiblePersonIdQuery({
    pageNumber: 1,
    pageSize: 100,
    id: Number(userId),
  });
  useEffect(() => {
    refetch();
  }, []);
  const handleTemporaryStatusClick = () => {
    handleStatusFilter(VisitStatus.ActiveTemporary);
    setAnimationActive(false);
  };
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
          <Tag color={colorScheduleType} style={{ fontSize: "14px" }}>
            {textScheduleType}
          </Tag>
        );
      },
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    console.log(key);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleStatusFilter = (status: VisitStatus) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      visitStatus: prevFilters.visitStatus.includes(status) ? [] : [status],
    }));
  };

  const handleTypeFilter = (type: ScheduleType | null) => {
    setFilters((prevFilters) => {
      return {
        ...prevFilters,
        scheduleTypeId: prevFilters.scheduleTypeId.includes(type) ? [] : [type],
      };
    });
  };

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
  const handleClearFilters = () => {
    setFilters({
      expectedStartTime: null,
      expectedEndTime: null,
      visitQuantity: [1, 100],
      visitStatus: [],
      scheduleTypeId: [],
    });
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
  if (userRole !== "Staff") {
    return (
      <div>
        <NotFoundState></NotFoundState>
      </div>
    );
  }
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
            placeholder="Tìm kiếm chuyến thăm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={handleSearchChange}
            className="max-w-xs"
          />
          <Popover content={filterContent} title="Bộ lọc" trigger="click">
            <Button icon={<FilterOutlined />} />
          </Popover>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
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
            onClick={handleTemporaryStatusClick}
            className={`px-4 py-2 rounded-md ${
              filters.visitStatus.includes(VisitStatus.ActiveTemporary)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-600 ${
              animationActive &&
              getCountByStatus(VisitStatus.ActiveTemporary) > 0
                ? "animated-button"
                : ""
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
          total: filteredData?.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10"],
          hideOnSinglePage: false,
          size: "small",
        }}
        rowKey="visitId"
        bordered
        loading={isLoading}
        onRow={(record) => ({
          onDoubleClick: () => {
            navigate(`/customerVisitStaff/detailVisit/${record.visitId}`, {
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
      <Modal
        title={<span style={{ fontSize: "30px" }}>Chọn loại chuyến thăm</span>}
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        className="text-center "
      >
        <div
          className="flex items-center justify-center"
          style={{ gap: "16px" }}
        >
          <div>
            <Button
              type="primary"
              onClick={() => {
                setIsCreateModalVisible(false);
                navigate("/customerVisitStaff/createNewVisitList");
              }}
              style={{
                width: "150px", // Set a fixed width to control wrapping
                height: "50px",
                whiteSpace: "normal",
                wordWrap: "break-word",
              }}
            >
              Tạo chuyến thăm trong ngày
            </Button>
          </div>
          <div>
            <Button
              type="primary"
              onClick={() => {
                setIsCreateModalVisible(false);
                navigate("/schedule-staff");
                notification.info({
                  message: "Vui lòng chọn lịch trình để tạo chuyến thăm",
                });
              }}
              style={{
                width: "150px", // Set a fixed width to control wrapping
                height: "50px",
                whiteSpace: "normal",
                wordWrap: "break-word",
              }}
            >
              Tạo chuyến thăm theo lịch trình
            </Button>
          </div>
        </div>
      </Modal>
    </Content>
  );
};

export default CustomerVisitStaff;
