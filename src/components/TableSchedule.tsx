import React, { useState } from "react";
import { Button, Card, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Schedule from "../types/scheduleType";
import {
  DeleteOutlined,
  EditOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { formatDate } from "../utils/ultil";
import DetailSchedule from "../pages/Schedule/DetailSchedule";
import moment from "moment"; // Import moment
import { useNavigate } from "react-router-dom"; // Import navigate
import { Dayjs } from "dayjs";
import { VisitStatus } from "../types/Enum/VisitStatus";
import { ScheduleType } from "../types/Enum/ScheduleType";
import { CalendarDays, CalendarRange, Clock4 } from "lucide-react";

interface ScheduleTableProps {
  schedules: Schedule[];
  schedulesIsLoading: boolean;
  totalCount: number;
  handleDeleteSchedule: (scheduleId: number) => void;
  handleAssignUser: (scheduleId: number) => void;
}

interface Filters {
  expectedStartTime: Dayjs | null;
  expectedEndTime: Dayjs | null;
  visitQuantity: [number, number];
  visitStatus: VisitStatus[];
  scheduleTypeId: any[];
}

const TableSchedule: React.FC<ScheduleTableProps> = ({
  schedules,
  schedulesIsLoading,
  totalCount,
  handleDeleteSchedule,
  handleAssignUser,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const navigate = useNavigate(); // Define navigate

  const showModal = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [filters, setFilters] = useState<Filters>({
    expectedStartTime: null,
    expectedEndTime: null,
    visitQuantity: [1, 100],
    visitStatus: [],
    scheduleTypeId: [],
  });

  const handleTypeFilter = (type: ScheduleType | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      scheduleTypeId: prevFilters.scheduleTypeId.includes(type) ? [] : [type],
    }));
  };
  const filteredSchedules = schedules.filter((schedule) => {
    if (filters.scheduleTypeId.length === 0) {
      return true;
    }
    return filters.scheduleTypeId.includes(
      schedule.scheduleType?.scheduleTypeId
    );
  });

  const getHeaderBackgroundColor = () => {
    if (filters.scheduleTypeId.length === 1) {
      const type = filters.scheduleTypeId[0];
      switch (type) {
        case null:
          return "[&_.ant-table-thead_th]:!bg-[#138d75] [&_.ant-table-thead_th]:!text-white";
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

  console.log(schedules);
  const columns: ColumnsType<Schedule> = [
    {
      title: "Tên lịch trình",
      dataIndex: "scheduleName",
      key: "scheduleName",
      sorter: (a, b) => a.scheduleName?.localeCompare(b.scheduleName),
    },
    {
      title: "Lịch trình",
      dataIndex: "scheduleType",
      key: "scheduleType",
      render: (text) => {
        const scheduleTypeName = text.scheduleTypeName;
        let tagColor = "default";

        switch (scheduleTypeName) {
          // case "VisitDaily":
          //   return (
          //     <Tag
          //       color="blue"
          //       style={{ minWidth: "80px", textAlign: "center" }}
          //     >
          //       Theo ngày
          //     </Tag>
          //   );
          case "ProcessWeek":
            return (
              <Tag
                color="green"
                style={{ minWidth: "80px", textAlign: "center" }}
              >
                Theo tuần
              </Tag>
            );
          case "ProcessMonth":
            return (
              <Tag
                color="orange"
                style={{ minWidth: "80px", textAlign: "center" }}
              >
                Theo tháng
              </Tag>
            );
          default:
            return (
              <Tag
                color={tagColor}
                style={{ minWidth: "80px", textAlign: "center" }}
              >
                {scheduleTypeName}
              </Tag>
            );
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag
          color={status ? "green" : "red"}
          style={{ minWidth: "80px", textAlign: "center" }}
        >
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Ngày tạo</div>,
      dataIndex: "createTime",
      key: "createTime",
      render: (createDate: string) => (
        <div>{moment(createDate).format("DD/MM/YYYY")}</div>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Ngày cập nhập</div>,
      dataIndex: "updateTime",
      key: "updateTime",
      render: (createDate: string) => (
        <div>{moment(createDate).format("DD/MM/YYYY")}</div>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Số nhiệm vụ đã giao</div>,
      dataIndex: "scheduleUser",
      key: "scheduleUser",
      render: (scheduleUser: any) => <div>{scheduleUser.length}</div>,
    },
    {
      title: <div style={{ textAlign: "left" }}>Hành động</div>,
      key: "action",
      render: (_, record: any) => (
        <div className="flex justify-center space-x-2">
          {
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 hover:text-green-800"
              onClick={() => showModal(record.scheduleId)}
            />
          }
          {record.status === true && (
            <Button
              type="text"
              icon={<UserAddOutlined />}
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleAssignUser(record.scheduleId)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    // <>
    //   <Table
    //     columns={columns}
    //     dataSource={schedules || []}
    //     rowKey="scheduleId"
    //     loading={schedulesIsLoading}
    //     pagination={{
    //       total: totalCount,
    //       showSizeChanger: true,
    //       pageSizeOptions: ["5", "10"],
    //       size: "small",
    //     }}
    //     bordered
    //      className="w-full [&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white"
    //   />
    //   <Modal
    //     title={
    //       <h1 className="text-3xl font-bold text-titleMain text-center mb-6">
    //         Cập nhật lịch trình
    //       </h1>
    //     }
    //     centered
    //     width="68vw"
    //     bodyStyle={{ padding: "20px", maxHeight: "90vh", overflowY: "auto" }}
    //     visible={isModalVisible}
    //     onCancel={handleCancel}
    //     footer={null}
    //   >
    //     <DetailSchedule
    //       scheduleId={selectedScheduleId}
    //       onUpdateSuccess={handleCancel}
    //     />
    //   </Modal>
    // </>

    <Card className="shadow-lg rounded-xl border-0">
      <div className="shadow-lg rounded-xl border-0">
        <div className="flex gap-1">
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
        showSorterTooltip={false}
        dataSource={filteredSchedules || []}  
        // dataSource={schedules || []}
        rowKey="scheduleId"
        loading={schedulesIsLoading}
        pagination={{
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10"],
          size: "small",
        }}
        size="middle"
        bordered={false}
        className={`w-full ${getHeaderBackgroundColor()} [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30 [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead_th]:!transition-none`}
      />
        <Modal
        title={
          <h1 className="text-3xl font-bold text-titleMain text-center mb-6">
            Cập nhật lịch trình
          </h1>
        }
        centered
        width="68vw"
        bodyStyle={{ padding: "20px", maxHeight: "90vh", overflowY: "auto" }}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <DetailSchedule
          scheduleId={selectedScheduleId}
          onUpdateSuccess={handleCancel}
        />
      </Modal>
    </Card>
  );
};

export default TableSchedule;
