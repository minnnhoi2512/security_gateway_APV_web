// src/components/TableSchedule.tsx
import React from 'react';
import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Schedule from '../types/scheduleType';
import { ScheduleUserType } from '../types/ScheduleUserType';
import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { ScheduleUserStatus, statusMap } from '../types/Enum/ScheduleUserStatus';


interface ScheduleAssignedTableProps {
  data: ScheduleUserType[];
  isLoading: boolean;
  onRowClick: (record: ScheduleUserType) => void;
  error: any | null;
}

const TableScheduleUser: React.FC<ScheduleAssignedTableProps> = ({ data, isLoading, onRowClick, error }) => {
  const navigate = useNavigate();
  // console.log(data);
  const userRole = localStorage.getItem("userRole");
  const columns: ColumnsType<ScheduleUserType> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      align: "center",
      sorter: (a, b) => a.title?.localeCompare(b.title),
    },
    // {
    //   title: "Loại",
    //   dataIndex: "scheduleType",
    //   key: "scheduleType",
    //   align: "center",
    //   render: (text) => {
    //     const scheduleTypeName = text.scheduleTypeName;
    //     let tagColor = "default"; // Default color

    //     switch (scheduleTypeName) {
    //       case "VisitDaily":
    //         return <Tag color="blue">Theo ngày</Tag>;
    //       case "ProcessWeek":
    //         return <Tag color="green">Theo tuần</Tag>;
    //       case "ProcessMonth":
    //         return <Tag color="orange">Theo tháng</Tag>;
    //       default:
    //         return <Tag color={tagColor}>{scheduleTypeName}</Tag>; // Fallback if needed
    //     }
    //   },
    // },
    {
      title: 'Thời hạn hoàn thành',
      dataIndex: 'deadlineTime',
      key: 'deadlineTime',
      render: (deadlineTime: string) => new Date(deadlineTime).toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: ScheduleUserStatus) => {
        const { color, text } = statusMap[status] || { color: "black", text: "Không xác định" };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    ...(userRole === "Staff" ? [{
      title: 'Người giao việc',
      dataIndex: ['assignFrom', 'userName'],
      key: 'assignFrom',
    }] : []),
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        (userRole === "Staff") ? (


          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-green-600 hover:text-green-800"
            onClick={() => navigate(`/detail-schedule-staff/${record.schedule.scheduleId}`, { state: record })}
          />
        ) : (
          <div className="flex justify-center space-x-2">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 hover:text-green-800"
              onClick={() => navigate(`/detailSchedule/${record.schedule.scheduleId}`)}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            //onClick={() => handleDeleteSchedule(record.scheduleId!)}
            />
            <Button
              type="text"
              icon={<UserAddOutlined />}
              className="text-blue-500 hover:text-blue-700"
            //onClick={() => handleAssignUser(record.scheduleId)}
            />
          </div>
        )
      ),
    },
  ];

  return (
    <>
      {error ? (
        <p >Không có lịch trình được giao</p>
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