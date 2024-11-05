// src/components/ScheduleTable.tsx
import React from 'react';
import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Schedule from '../types/scheduleType';
import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import { formatDate } from '../utils/ultil';
import { useNavigate } from 'react-router';

interface ScheduleTableProps {
  schedules: Schedule[];
  schedulesIsLoading: boolean;
  totalCount: number;
  handleDeleteSchedule: (scheduleId: number) => void;
  handleAssignUser: (scheduleId: number) => void;
}

const TableSchedule: React.FC<ScheduleTableProps> = ({ schedules, schedulesIsLoading, totalCount, handleDeleteSchedule, handleAssignUser }) => {
  const navigate = useNavigate();

  const columns: ColumnsType<Schedule> = [
    {
      title: "Tiêu đề",
      dataIndex: "scheduleName",
      key: "scheduleName",
      align: "center",
      sorter: (a, b) => a.scheduleName?.localeCompare(b.scheduleName),
    },
    {
      title: "Loại",
      dataIndex: "scheduleType",
      key: "scheduleType",
      align: "center",
      render: (text) => {
        const scheduleTypeName = text.scheduleTypeName;
        let tagColor = "default"; // Default color

        switch (scheduleTypeName) {
          case "VisitDaily":
            return <Tag color="blue">Theo ngày</Tag>;
          case "ProcessWeek":
            return <Tag color="green">Theo tuần</Tag>;
          case "ProcessMonth":
            return <Tag color="orange">Theo tháng</Tag>;
          default:
            return <Tag color={tagColor}>{scheduleTypeName}</Tag>; // Fallback if needed
        }
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createTime",
      key: "createTime",
      align: "center",
      render: (createDate: string) => <div>{formatDate(createDate)}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Số lịch hẹn đã tạo",
      dataIndex: "scheduleUser",
      key: "scheduleUser",
      align: "center",
      render: (scheduleUser: any) => (
        <div>
          <div>{scheduleUser.length}</div>
          {scheduleUser.length !== 0 ? (
            <button
            >
              xem
            </button>
          ) : (null)}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record: any) => (
        <div className="flex justify-center space-x-2">
          {record.scheduleUser.length === 0 && (
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 hover:text-green-800"
              onClick={() => navigate(`/detailSchedule/${record.scheduleId}`)}
            />
          )}
          {record.scheduleUser.length === 0 && record.status === true && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSchedule(record.scheduleId!)}
            >
            </Button>
          )}
          { record.status === true && (
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
    <Table
      columns={columns}
      dataSource={schedules || []}
      rowKey="scheduleId"
      loading={schedulesIsLoading}
      pagination={{
        total: totalCount,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
      }}
      bordered
      className="bg-white shadow-md rounded-lg"
    />
  );
};

export default TableSchedule;