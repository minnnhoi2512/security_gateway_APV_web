import React, { useState, useEffect } from "react";
import { Button, Table, Tag, Space, Tooltip } from "antd";
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
      <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
        {/* <Button
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
        </Button> */}
      </Space>
      {/* <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
        <Button
          type={
            filters.visitStatus.includes(ScheduleUserStatus.Pending)
              ? "primary"
              : "default"
          }
          onClick={() => {
            setAnimationActive(false);
            handleStatusFilter(ScheduleUserStatus.Pending);
          }}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Pending)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600 ${
            animationActive && getCountByStatus(ScheduleUserStatus.Pending) > 0
              ? "animated-button"
              : ""
          }`}
        >
          Chờ phê duyệt ({getCountByStatus(ScheduleUserStatus.Pending)})
        </Button>
        <Button
          type={
            filters.visitStatus.includes(ScheduleUserStatus.Assigned)
              ? "primary"
              : "default"
          }
          onClick={() => handleStatusFilter(ScheduleUserStatus.Assigned)}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Assigned)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600`}
        >
          Chờ tạo ({getCountByStatus(ScheduleUserStatus.Assigned)})
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
        <Button
          type={
            filters.visitStatus.includes(ScheduleUserStatus.Expired)
              ? "primary"
              : "default"
          }
          onClick={() => handleStatusFilter(ScheduleUserStatus.Expired)}
          className={`px-4 py-2 rounded-md ${
            filters.visitStatus.includes(ScheduleUserStatus.Expired)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600`}
        >
          Đã hết hạn ({getCountByStatus(ScheduleUserStatus.Expired)})
        </Button>
      </Space> */}
      <Space style={{ marginLeft: 65 , display: "flex", flexWrap: "wrap" }}>
        {Object.values(ScheduleUserStatus).map((status) => {
          const count = getCountByStatus(status);
          const statusConfig = {
            [ScheduleUserStatus.Pending]: {
              text: "Chờ phê duyệt",
              className: "!text-mainColor border-mainColor",
            },
            [ScheduleUserStatus.Assigned]: {
              text: "Chờ tạo",
              className: "!text-mainColor border-mainColor",
            },
            [ScheduleUserStatus.Approved]: {
              text: "Đã phê duyệt",
              className: "!text-mainColor border-mainColor",
            },
            [ScheduleUserStatus.Rejected]: {
              text: "Đã từ chối",
              className: "!text-mainColor border-mainColor",
            },
            [ScheduleUserStatus.Cancelled]: {
              text: "Đã vô hiệu hóa",
              className: "!text-mainColor border-mainColor",
            },
            [ScheduleUserStatus.Expired]: {
              text: "Đã hết hạn",
              className: "!text-mainColor border-mainColor",
            },
          }[status];

          return (
            <Button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`rounded-t-3xl ${statusConfig.className} ${
                filters.visitStatus.includes(status)
                  ? "bg-mainColor text-white"
                  : "bg-white text-mainColor"
              }`}
            >
              {statusConfig.text}
              {count > 0 && (
                // <span className={`ml-1 px-1.5 rounded ${statusConfig.bgCount}`}>
                //   {count}
                // </span>
                <span className={`ml-1 px-1.5 rounded`}>{count}</span>
              )}
            </Button>
          );
        })}
      </Space>
      {error ? (
        <p className="text-red-500 text-center">
          Không có lịch trình được giao
        </p>
      ) : (
        <div className="max-w-[90%] mx-auto"> {/* hoặc max-w-[85%] hay max-w-[80%] tùy nhu cầu */}
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            total: filteredData?.length,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10"],
            hideOnSinglePage: false,
            size: "small",
            className: "px-4"
          }}
          className="w-full [&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white [&_.ant-table-thead_th]:!py-2 [&_.ant-table-thead_th]:!text-sm"
          rowKey="id"
          bordered
          loading={isLoading}
          size="small" // thêm size="small" để giảm kích thước các cells
          onRow={(record) => ({
            onDoubleClick: (event) => {
              event.preventDefault();
              event.stopPropagation();
              onRowClick(record);
            },
          })}
        />
      </div>
      )}
    </>
  );
};

export default TableScheduleUser;
