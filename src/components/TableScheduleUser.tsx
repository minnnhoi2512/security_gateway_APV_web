import React, { useState, useEffect } from "react";
import { Button, Table, Tag, Space, Tooltip, Input, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router";
import {
  scheduleStatusMap,
  ScheduleUserStatus,
} from "../types/Enum/ScheduleUserStatus";
import { ScheduleUserType } from "../types/ScheduleUserType";
import { formatDateWithourHour } from "../utils/ultil";
import { ScheduleType, typeMap } from "../types/Enum/ScheduleType";
import { CalendarDays, CalendarRange, Clock4 } from "lucide-react";
import {
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { VisitStatus, visitStatusMap } from "../types/Enum/VisitStatus";

interface Filters {
  visitStatus: ScheduleUserStatus[];
  scheduleTypeId: any[];
}

interface ScheduleAssignedTableProps {
  data: ScheduleUserType[];
  isLoading: boolean;
  onRowClick: (record: ScheduleUserType) => void;
  error: any | null;
}

const TableScheduleUser: React.FC<ScheduleAssignedTableProps> = ({
  data,
  isLoading,
  onRowClick,
  error,
}) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const [filters, setFilters] = useState<Filters>({
    visitStatus: [],
    scheduleTypeId: [],
  });
  console.log(data);
  const [filteredData, setFilteredData] = useState<ScheduleUserType[]>(data);
  const [animationActive, setAnimationActive] = useState<boolean>(true);

  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    let filtered = data;

    if (filters.visitStatus.length > 0) {
      filtered = filtered.filter((item: any) =>
        filters.visitStatus.includes(item.status)
      );
    }

    if (filters.scheduleTypeId.length > 0) {
      filtered = filtered.filter((item) =>
        filters.scheduleTypeId.includes(
          item.schedule?.scheduleType?.scheduleTypeId
        )
      );
    }
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [data, filters, searchText]);

  const columns: ColumnsType<ScheduleUserType> = [
    // {
    //   title: "STT",
    //   dataIndex: "index",
    //   key: "index",
    //   width: 50,
    //   render: (text, record, index) => index + 1,
    // },
    {
      title: "Tên nhiệm vụ",
      dataIndex: "title",
      key: "title",
      align: "left",
      sorter: (a, b) => a.title?.localeCompare(b.title),
      render: (text) => (
        <Tooltip title={text}>
          {text.length > 50 ? `${text.substring(0, 50)}...` : text}
        </Tooltip>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) => {
        return (
          <div className="flex flex-col text-left">
            <span className="text-gray-500 text-sm">{note}</span>
          </div>
        );
      },
    },
    {
      title: "Thời hạn hoàn thành",
      dataIndex: "deadlineTime",
      key: "deadlineTime",
      align: "left",
      render: (deadlineTime: string) => {
        return (
          <div className="flex flex-col text-left">
            <span className="text-gray-500 text-sm">
              {formatDateWithourHour(deadlineTime)}
            </span>
          </div>
        );
      },
      className: "pl-4",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "left",
      render: (status: ScheduleUserStatus) => {
        const { color, text } = scheduleStatusMap[status] || {
          color: "black",
          text: "Không xác định",
        };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Loại",
      dataIndex: "schedule",
      key: "schedule",
      render: (schedule) => {
        const scheduleTypeId = schedule?.scheduleType
          ?.scheduleTypeId as ScheduleType;
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
    ...(userRole !== "DepartmentManager"
      ? [
          {
            title: "Người giao",
            dataIndex: ["assignFrom", "fullName"],
            key: "fullName",
            render: (text: string) => <span>{text}</span>,
          },
        ]
      : []),
    ...(userRole !== "Staff"
      ? [
          {
            title: "Người nhận",
            dataIndex: ["assignTo", "fullName"],
            key: "fullName",
            render: (text: string) => <span>{text}</span>,
          },
        ]
      : []),
  ];

  const getCountByStatus = (status: ScheduleUserStatus) => {
    return data?.filter((item: any) => item.status === status).length || 0;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleTypeFilter = (type: ScheduleType | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      scheduleTypeId: prevFilters.scheduleTypeId.includes(type) ? [] : [type],
    }));
  };

  const handleStatusFilter = (status: ScheduleUserStatus) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      visitStatus: prevFilters.visitStatus.includes(status) ? [] : [status],
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

  return (
    <Card className="shadow-lg rounded-xl border-0">
      <div className="shadow-lg rounded-xl border-0">
        <div className="flex gap-1">
          <Button
            onClick={() => handleTypeFilter(null)}
            className={`rounded-t-[140px] min-w-[120px] border-b-0 ${
              filters.scheduleTypeId.includes(null)
                ? "border-[#138d75] text-white bg-[#138d75] hover:!bg-[#138d75] hover:!text-white hover:!border-[#138d75]"
                : "border-[#34495e] text-[#34495e] hover:!border-[#34495e] hover:!text-[#34495e]"
            }`}
          >
            <Clock4 size={17} />
            Theo ngày
          </Button>
          <Button
            onClick={() => handleTypeFilter(ScheduleType.Weekly)}
            className={`rounded-t-[120px] min-w-[120px] border-b-0  ${
              filters.scheduleTypeId.includes(ScheduleType.Weekly)
                ? "border-[#e67e22] text-white bg-[#e67e22] hover:!border-[#e67e22] hover:!text-white hover:!bg-[#e67e22]"
                : "border-[#34495e] text-[#34495e] hover:!border-[#34495e] hover:!text-[#34495e]"
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
                ? "border-[#2980b9] text-white bg-[#2980b9] hover:!border-[#2980b9] hover:!text-white hover:!bg-[#2980b9]"
                : "border-[#34495e] text-[#34495e] hover:!border-[#34495e] hover:!text-[#34495e]"
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
        size="middle"
        bordered={false}
        pagination={{
          // pageSize: 8,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10"],
          size: "small",
          showTotal: (total) => `Tổng ${total} chuyến thăm`,
        }}
        className={`w-full ${getHeaderBackgroundColor()} [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30 [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead_th]:!transition-none`}
        loading={isLoading}
        onRow={(record) => ({
          onDoubleClick: () => onRowClick(record),
          className: "cursor-pointer hover:bg-gray-50",
        })}
      />
    </Card>
  );
};

export default TableScheduleUser;
