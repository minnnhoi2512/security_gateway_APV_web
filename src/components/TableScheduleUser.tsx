// src/components/TableSchedule.tsx
import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Schedule from '../types/scheduleType';


interface TableScheduleProps {
  columns: ColumnsType<Schedule>;
  schedules: Schedule[];
  schedulesIsLoading: boolean;
  totalCount: number;
}

const TableSchedule: React.FC<TableScheduleProps> = ({ columns, schedules, schedulesIsLoading, totalCount }) => {
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