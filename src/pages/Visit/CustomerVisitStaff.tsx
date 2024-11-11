import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Input,
  Space,
  Tag,
  DatePicker,
  Select,
  Slider,
  Modal,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Content } from "antd/es/layout/layout";
import VisitListType from "../../types/visitListType";
import { useGetListVisitByResponsiblePersonIdQuery } from "../../services/visitList.service";
import { statusMap, VisitStatus } from "../../types/Enum/VisitStatus";
import { ScheduleType, typeMap } from "../../types/Enum/ScheduleType";
import ListHistorySessonVisit from "../History/ListHistorySessionVisit";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;

interface Filters {
  expectedStartTime: Dayjs | null;
  expectedEndTime: Dayjs | null;
  visitQuantity: [number, number];
  visitStatus: VisitStatus[];
  scheduleTypeId: any[];
}

const CustomerVisitStaff = () => {
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredData, setFilteredData] = useState<VisitListType[]>([]);
  const [filters, setFilters] = useState<Filters>({
    expectedStartTime: null,
    expectedEndTime: null,
    visitQuantity: [1, 100],
    visitStatus: [],
    scheduleTypeId: [],
  });

  let { data, isLoading, refetch } = useGetListVisitByResponsiblePersonIdQuery({
    pageNumber: 1,
    pageSize: 100,
    id: Number(userId),
  });
  useEffect(() => {
    refetch();
  }, []);
  console.log(data);
  const columns: TableProps<VisitListType>["columns"] = [
    {
      title: "Tiêu đề",
      dataIndex: "visitName",
      key: "visitName",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: any) =>
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
      render: (date: Date) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"), // Include time
      sorter: (a, b) =>
        new Date(a.expectedStartTime).getTime() -
        new Date(b.expectedStartTime).getTime(),
    },
    {
      title: "Ngày dự kiến kết thúc",
      dataIndex: "expectedEndTime",
      key: "expectedEndTime",
      render: (date: Date) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"), // Include time
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
      title: "Trạng thái",
      dataIndex: "visitStatus",
      key: "visitStatus",
      render: (status: VisitStatus) => {
        const { colorVisitStatus, textVisitStatus } = statusMap[status] || { color: "black", text: "Không xác định" };
        return <Tag color={colorVisitStatus}>{textVisitStatus}</Tag>;
      }
    },
    {
      title: "Loại",
      dataIndex: "schedule",
      key: "schedule",
      render: (schedule) => {
        const scheduleTypeId = schedule?.scheduleType?.scheduleTypeId as ScheduleType;
        if (scheduleTypeId === undefined) return <Tag color="default">Theo ngày</Tag>;
        const { colorScheduleType, textScheduleType } = typeMap[scheduleTypeId] || { color: "default", text: "Theo ngày" };
        return (
          <Tag color={colorScheduleType} style={{ fontSize: "14px" }}>
            {textScheduleType}
          </Tag>
        );
      },
    },
    {
      title: "Lượt ra vào",
      dataIndex: "visitorSessionCount",
      key: "visitorSessionCount",
      render: (text, record) => (
        <span
          style={{ fontSize: "14px", color: "#000", cursor: "pointer", textDecoration: "underline" }}
          onClick={() => {
            setSelectedVisitId(record.visitId);
            setIsModalVisible(true);
          }}
        >
          {text} lượt
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
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
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
          item.schedule?.scheduleType?.scheduleTypeId ?? null
        )
      );
    }
    if (searchText) {
      filtered = filtered.filter((item: any) =>
        item.visitName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }, [data,isLoading,filters, searchText]);

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

      <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
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
        <Select
          mode="multiple"
          placeholder="Trạng thái"
          onChange={(value: VisitStatus[]) => handleFilterChange("visitStatus", value)}
          style={{ width: 200 }}
        >
          <Option value={VisitStatus.Active}>Còn hiệu lực</Option>
          <Option value={VisitStatus.Pending}>Chờ phê duyệt</Option>
          <Option value={VisitStatus.Cancelled}>Đã hủy</Option>
          <Option value={VisitStatus.ActiveTemporary}>Tạm thời</Option>
          <Option value={VisitStatus.Violation}>Vi phạm</Option>
          <Option value={VisitStatus.Inactive}>Đã hết hạn</Option>
        </Select>
        <Select
          mode="multiple"
          placeholder="Loại"
          onChange={(value) => handleFilterChange("scheduleTypeId", value)}
          style={{ width: 200 }}
        >
          <Option value={null}>Theo ngày</Option>
          <Option value={ScheduleType.Weekly}>Theo tuần</Option>
          <Option value={ScheduleType.Monthly}>Theo tháng</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          total: filteredData?.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          hideOnSinglePage: false,
          size: "small",
        }}
        rowKey="visitId"
        bordered
        loading={isLoading}
      />
       <Modal
        title="Lịch sử lượt ra vào"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedVisitId && <ListHistorySessonVisit visitId={selectedVisitId} />}
      </Modal>
    </Content>
  );
};

export default CustomerVisitStaff;