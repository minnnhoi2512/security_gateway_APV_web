import React, { useState, useEffect } from "react";
import { Button, Table, Tag, Space, Tooltip, Input } from "antd";
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
  }, [data, filters]);

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

  const [searchText, setSearchText] = useState("");

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

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Tìm kiếm theo tên nhiệm vụ"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={handleSearchChange}
          className="max-w-xs"
        />
        <div className="flex items-end justify-end gap-2 mb-6 ">
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
      </div>

      <div className="flex gap-1">
        <Button
          onClick={() => handleStatusFilter(null)}
          className={`rounded-t-3xl mr-[2px] ${
            filters.visitStatus.length === 0
              ? "bg-mainColor text-white"
              : "bg-white border-mainColor text-mainColor"
          }`}
        >
          Tất cả
        </Button>

        {/* Special button for Pending status */}
        <Button
          onClick={() => handleStatusFilter(ScheduleUserStatus.Pending)}
          className={`
      rounded-t-3xl mr-[2px] relative transition-all duration-200
      ${
        filters.visitStatus.includes(ScheduleUserStatus.Pending)
          ? "bg-orange-500 text-white border-none shadow-lg scale-105"
          : "bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100"
      }
      font-medium
    `}
        >
          {scheduleStatusMap[ScheduleUserStatus.Pending].text}
          {getCountByStatus(ScheduleUserStatus.Pending) > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full animate-pulse">
              {getCountByStatus(ScheduleUserStatus.Pending)}
            </div>
          )}
        </Button>

        {/* Other status buttons */}
        {Object.values(ScheduleUserStatus)
          .filter((status) => status !== ScheduleUserStatus.Pending)
          .map((status) => {
            const count = getCountByStatus(status);
            return (
              <Button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`rounded-t-3xl mr-[2px] relative ${
                  filters.visitStatus.includes(status)
                    ? "bg-mainColor text-white border-none"
                    : "bg-white border-mainColor text-mainColor"
                }`}
              >
                {scheduleStatusMap[status].text}
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
        size="small"
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10"],
          showTotal: (total) => `Tổng ${total} chuyến thăm`,
        }}
        className="w-full [&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-700 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30"
        loading={isLoading}
        onRow={(record) => ({
          onDoubleClick: () => onRowClick(record),
          className: "cursor-pointer hover:bg-gray-50",
        })}
      />
    </div>
  );
};

export default TableScheduleUser;
