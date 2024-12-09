import React, { useState } from "react";
import { Button, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Schedule from "../types/scheduleType";
import {
  DeleteOutlined,
  EditOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { formatDate } from "../utils/ultil";
import DetailSchedule from "../pages/Schedule/DetailSchedule";
import moment from "moment"; // Import moment
import { useNavigate } from "react-router-dom"; // Import navigate

interface ScheduleTableProps {
  schedules: Schedule[];
  schedulesIsLoading: boolean;
  totalCount: number;
  handleDeleteSchedule: (scheduleId: number) => void;
  handleAssignUser: (scheduleId: number) => void;
}

const TableSchedule: React.FC<ScheduleTableProps> = ({
  schedules,
  schedulesIsLoading,
  totalCount,
  handleDeleteSchedule,
  handleAssignUser,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const navigate = useNavigate(); // Define navigate

  const showModal = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  console.log(schedules);
  const columns: ColumnsType<Schedule> = [
    {
      title: "Tên lịch trình",
      dataIndex: "scheduleName",
      key: "scheduleName",
      sorter: (a, b) => a.scheduleName?.localeCompare(b.scheduleName),
    },
    {
      title: "Lịch trình",
      dataIndex: "scheduleType",
      key: "scheduleType",
      render: (text) => {
        const scheduleTypeName = text.scheduleTypeName;
        let tagColor = "default";

        switch (scheduleTypeName) {
          case "VisitDaily":
            return (
              <Tag
                color="blue"
                style={{ minWidth: "80px", textAlign: "center" }}
              >
                Theo ngày
              </Tag>
            );
          case "ProcessWeek":
            return (
              <Tag
                color="green"
                style={{ minWidth: "80px", textAlign: "center" }}
              >
                Theo tuần
              </Tag>
            );
          case "ProcessMonth":
            return (
              <Tag
                color="orange"
                style={{ minWidth: "80px", textAlign: "center" }}
              >
                Theo tháng
              </Tag>
            );
          default:
            return (
              <Tag
                color={tagColor}
                style={{ minWidth: "80px", textAlign: "center" }}
              >
                {scheduleTypeName}
              </Tag>
            );
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag
          color={status ? "green" : "red"}
          style={{ minWidth: "80px", textAlign: "center" }}
        >
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Ngày tạo</div>,
      dataIndex: "createTime",
      key: "createTime",
      render: (createDate: string) => (
        <div>{moment(createDate).format("DD/MM/YYYY")}</div>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Ngày cập nhập</div>,
      dataIndex: "updateTime",
      key: "updateTime",
      render: (createDate: string) => (
        <div>{moment(createDate).format("DD/MM/YYYY")}</div>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Số nhiệm vụ đã giao</div>,
      dataIndex: "scheduleUser",
      key: "scheduleUser",
      render: (scheduleUser: any) => (
        <div>{scheduleUser.length}</div>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Hành động</div>,
      key: "action",
      render: (_, record: any) => (
        <div className="flex justify-center space-x-2">
          { (
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 hover:text-green-800"
              onClick={() => showModal(record.scheduleId)}
            />
          )}
          {record.status === true && (
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
    <>
      <Table
        columns={columns}
        dataSource={schedules || []}
        rowKey="scheduleId"
        loading={schedulesIsLoading}
        pagination={{
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10"],
          size: "small",
        }}
        bordered
        className="bg-white shadow-md rounded-lg"
      />
      <Modal
        title={
          <h1 className="text-3xl font-bold text-titleMain text-center mb-6">
            Cập nhật lịch trình
          </h1>
        }
        centered
        width="68vw"
        bodyStyle={{ padding: "20px", maxHeight: "90vh", overflowY: "auto" }}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <DetailSchedule
          scheduleId={selectedScheduleId}
          onUpdateSuccess={handleCancel}
        />
      </Modal>
    </>
  );
};

export default TableSchedule;
