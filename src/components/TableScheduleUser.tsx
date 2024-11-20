import React, { useState, useEffect } from "react";
import { Button, Table, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router";
import {
  ScheduleUserStatus,
  statusMap,
} from "../types/Enum/ScheduleUserStatus";
import { ScheduleUserType } from "../types/ScheduleUserType";
import { formatDateWithourHour } from "../utils/ultil";
import { ScheduleType, typeMap } from "../types/Enum/ScheduleType";

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

    setFilteredData(filtered);
  }, [data, filters]);

  const columns: ColumnsType<ScheduleUserType> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      align: "left",
      sorter: (a, b) => a.title?.localeCompare(b.title),
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
        const { color, text } = statusMap[status] || {
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
            dataIndex: ["assignFrom", "userName"],
            key: "assignFromUserName",
            render: (text: string) => <span>{text}</span>,
          },
        ]
      : []),
    ...(userRole !== "Staff"
      ? [
          {
            title: "Người nhận",
            dataIndex: ["assignTo", "userName"],
            key: "assignToUserName",
            render: (text: string) => <span>{text}</span>,
          },
        ]
      : []),
  ];

  const getCountByStatus = (status: ScheduleUserStatus) => {
    return data?.filter((item: any) => item.status === status).length || 0;
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
    <>
      <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
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
            filters.visitStatus.includes(ScheduleUserStatus.Assigned)
              ? "primary"
              : "default"
          }
          onClick={() => {
            setAnimationActive(false);
            handleStatusFilter(ScheduleUserStatus.Assigned);
          }}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Assigned)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600 ${
            animationActive && getCountByStatus(ScheduleUserStatus.Assigned) > 0
              ? "animated-button"
              : ""
          }`}
        >
          Chờ tạo ({getCountByStatus(ScheduleUserStatus.Assigned)})
        </Button>
        <Button
          type={
            filters.visitStatus.includes(ScheduleUserStatus.Pending)
              ? "primary"
              : "default"
          }
          onClick={() => handleStatusFilter(ScheduleUserStatus.Pending)}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Pending)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600`}
        >
          Chờ phê duyệt ({getCountByStatus(ScheduleUserStatus.Pending)})
        </Button>
        <Button
          type={
            filters.visitStatus.includes(ScheduleUserStatus.Approved)
              ? "primary"
              : "default"
          }
          onClick={() => handleStatusFilter(ScheduleUserStatus.Approved)}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Approved)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600`}
        >
          Đã phê duyệt ({getCountByStatus(ScheduleUserStatus.Approved)})
        </Button>
        <Button
          type={
            filters.visitStatus.includes(ScheduleUserStatus.Rejected)
              ? "primary"
              : "default"
          }
          onClick={() => handleStatusFilter(ScheduleUserStatus.Rejected)}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Rejected)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600`}
        >
          Đã từ chối ({getCountByStatus(ScheduleUserStatus.Rejected)})
        </Button>
        <Button
          type={
            filters.visitStatus.includes(ScheduleUserStatus.Cancelled)
              ? "primary"
              : "default"
          }
          onClick={() => handleStatusFilter(ScheduleUserStatus.Cancelled)}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Cancelled)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600`}
        >
          Đã vô hiệu hóa ({getCountByStatus(ScheduleUserStatus.Cancelled)})
        </Button>
      </Space>
      {error ? (
        <p className="text-red-500 text-center">
          Không có lịch trình được giao
        </p>
      ) : (
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
          rowKey="id"
          bordered
          loading={isLoading}
          onRow={(record) => ({
            onDoubleClick: () => {
              onRowClick(record);
            },
          })}
        />
      )}
    </>
  );
};

export default TableScheduleUser;
