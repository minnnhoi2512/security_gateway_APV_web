// src/components/TableSchedule.tsx
import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Schedule from '../types/scheduleType';
import { ScheduleUserType } from '../types/ScheduleUserType';


interface ScheduleAssignedTableProps {
  data: ScheduleUserType[];
  isLoading: boolean;
  onRowClick: (record: ScheduleUserType) => void;
  error: string | null;

}

const TableScheduleUser: React.FC<ScheduleAssignedTableProps> = ({ data, isLoading, onRowClick, error }) => {
  

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
      render: (status: string) => (
        <Tag color={status ? "green" : "red"}>
          {status === 'Assigned' ? 'Đã tạo' : status === 'Pending' ? "" : 'Chờ duyệt'}
        </Tag>
      ),
    },
    {
      title: 'Người giao việc',
      dataIndex: ['assignFrom', 'userName'],
      key: 'assignFrom',
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          {/* <Button
            type="text"
            icon={<EditOutlined />}
            className="text-green-600 hover:text-green-800"
            onClick={() => navigate(`/detailSchedule/${record.scheduleId}`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSchedule(record.scheduleId!)}
          />
          <Button
            type="text"
            icon={<UserAddOutlined />}
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAssignUser(record.scheduleId)}
          /> */}
        </div>
      ),
    },
  ];
  
  return (
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
  );
};

export default TableScheduleUser;