// src/components/ScheduleTable.tsx
import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ScheduleType {
  scheduleId: number;
  // Define other properties of ScheduleType here
}

interface ScheduleTableProps {
  columns: ColumnsType<ScheduleType>;
  schedules: ScheduleType[];
  schedulesIsLoading: boolean;
  totalCount: number;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ columns, schedules, schedulesIsLoading, totalCount }) => {
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

export default ScheduleTable;