import React from 'react';
import { Button, Table, Tag, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { ScheduleUserStatus, statusMap } from '../types/Enum/ScheduleUserStatus';
import { ScheduleUserType } from '../types/ScheduleUserType';

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

  const columns: ColumnsType<ScheduleUserType> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      align: "left",
      sorter: (a, b) => a.title?.localeCompare(b.title),
      width: "50%",
      className: "pl-4",
    },
    {
      title: 'Thời hạn hoàn thành',
      dataIndex: 'deadlineTime',
      key: 'deadlineTime',
      align: "left",
      width: "20%",
      render: (deadlineTime: string) => {
        const date = new Date(deadlineTime);
        const formattedDate = date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        const formattedTime = date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return (
          <div className="flex flex-col text-left">
            <span className="font-medium">{formattedDate}</span>
            <span className="text-gray-500 text-sm">{formattedTime}</span>
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
      width: "20%",
      render: (status: ScheduleUserStatus) => {
        const { color, text } = statusMap[status] || { color: "black", text: "Không xác định" };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "left",
      width: "10%",
      render: (_, record) => (
        (userRole === "Staff") ? (

          <div className="flex space-x-2">

            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 hover:text-green-800"
              onClick={() => navigate(`/detail-schedule-staff/${record.id}`, { state: record.id })}
            />
          </div>

        ) : (
          null
        )
      ),
    },
  ];

  return (
    <>
      {error ? (
        <p className="text-red-500 text-center">Không có lịch trình được giao</p>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['5', '10'],
          }}
          bordered
          className="bg-white shadow-md rounded-lg"
          onRow={(record) => ({
            onClick: () => onRowClick(record),
          })}
        />
      )}
    </>
  );
};

export default TableScheduleUser;
