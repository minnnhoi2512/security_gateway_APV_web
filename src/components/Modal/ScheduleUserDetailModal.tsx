// src/components/ScheduleDetailModal.tsx
import React, { useState } from "react";
import { Modal, Button, notification, Collapse, Tag } from "antd";
import { ScheduleUserType } from "../../types/ScheduleUserType";
import { useGetVisitByScheduleUserIdQuery } from "../../services/visitList.service";
import {
  useApproveScheduleMutation,
  useRejectScheduleMutation,
} from "../../services/scheduleUser.service";
import { isEntityError } from "../../utils/helpers";
import { HtmlContent } from "../Description/description";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;

// Status options and color mappings
export enum ScheduleUserStatus {
  Assigned = "Assigned",
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Cancelled = "Cancelled",
}

export const statusMap: {
  [key in ScheduleUserStatus]: { color: string; text: string };
} = {
  [ScheduleUserStatus.Assigned]: { color: "green", text: "Chờ tạo" },
  [ScheduleUserStatus.Pending]: { color: "orange", text: "Chờ phê duyệt" },
  [ScheduleUserStatus.Approved]: { color: "blue", text: "Đã phê duyệt" },
  [ScheduleUserStatus.Rejected]: { color: "red", text: "Đã từ chối" },
  [ScheduleUserStatus.Cancelled]: { color: "gray", text: "Đã hủy" },
};

const translateScheduleType = (type: string) => {
  switch (type) {
    case "ProcessWeek":
      return (
        <Tag color="green" style={{ minWidth: "80px", textAlign: "center" }}>
          Theo tuần
        </Tag>
      );
    case "ProcessMonth":
      return (
        <Tag color="orange" style={{ minWidth: "80px", textAlign: "center" }}>
          Theo tháng
        </Tag>
      );
    default:
      return (
        <Tag color="gray" style={{ minWidth: "80px", textAlign: "center" }}>
          {type}
        </Tag>
      );
  }
};

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "Không xác định";
  const dateObj = new Date(dateString);
  return isNaN(dateObj.getTime())
    ? "Không xác định"
    : `${dateObj.toLocaleDateString("vi-VN")} ${dateObj.toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: true }
      )}`;
};

// Helper function to format only the time
const formatTimeOnly = (timeString: string | undefined) => {
  if (!timeString) return "Không xác định";
  const dateObj = new Date(`1970-01-01T${timeString}`);
  return isNaN(dateObj.getTime())
    ? "Không xác định"
    : dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
};

interface ScheduleUserModalDetailProps {
  isVisible: boolean;
  handleClose: () => void;
  selectedRecord: ScheduleUserType | null;
  refetch: () => void;
}

const ScheduleUserDetailModal: React.FC<ScheduleUserModalDetailProps> = ({
  isVisible,
  handleClose,
  selectedRecord,
  refetch,
}) => {
  const scheduleUserId = selectedRecord?.id || 0;

  const { data, isError } = useGetVisitByScheduleUserIdQuery(
    { scheduleUserId },
    { skip: scheduleUserId === 0 }
  );
  const [rejectSchedule] = useRejectScheduleMutation();
  const [approveSchedule] = useApproveScheduleMutation();
  const [isDescriptionModalVisible, setDescriptionIsModalVisible] = useState(false);

  const handleDescriptionDoubleClick = () => {
    setDescriptionIsModalVisible(true);
  };

  const handleDescriptionModalClose = () => {
    setDescriptionIsModalVisible(false);
  };

  const handleRejectSchedule = async (id: number) => {
    try {
      await rejectSchedule(id).unwrap();
      notification.success({ message: "Đã từ chối lịch trình thành công" });
      handleClose();
      refetch();
    } catch (error) {
      notification.error({
        message: "Không thể từ chối lịch trình",
        description: "Lỗi xảy ra khi từ chối",
      });
    }
  };

  const handleApproveSchedule = async (id: number) => {
    try {
      await approveSchedule(id).unwrap();
      notification.success({ message: "Đã duyệt lịch trình thành công" });
      refetch();
      handleClose();
    } catch (error) {
      if (isEntityError(error)) {
        notification.error({
          message: "Không thể duyệt lịch trình",
          description: "Lỗi xảy ra khi duyệt",
        });
      }
    }
  };

  const status = selectedRecord?.status as ScheduleUserStatus;
  const truncatedDescription = data?.description.length > 100
    ? `${data?.description.substring(0, 100)}...`
    : data?.description;
  return (
    <Modal
      title="Chi tiết lịch trình đã giao"
      visible={isVisible}
      onCancel={handleClose}
      width={900}
      footer={[
        <Button
          key="approve"
          type="primary"
          className="bg-blue-500 mr-2"
          onClick={() => handleApproveSchedule(selectedRecord?.id || 0)}
          disabled={selectedRecord?.status !== ScheduleUserStatus.Pending}
        >
          Duyệt
        </Button>,
        <Button
          key="reject"
          type="primary"
          danger
          className="mr-2"
          onClick={() => handleRejectSchedule(selectedRecord?.id || 0)}
          disabled={selectedRecord?.status !== ScheduleUserStatus.Pending}
        >
          Từ chối
        </Button>,
        <Button key="close" onClick={handleClose}>
          Đóng
        </Button>,
      ]}
      className="rounded-lg shadow-md"
    >
      {selectedRecord && (
        <Collapse defaultActiveKey={["1"]} className="mb-4">
          <Panel
            header={
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">Thông tin lịch trình</span>
                {status && (
                  <Tag
                    color={statusMap[status]?.color || "gray"}
                    className="text-sm"
                  >
                    {statusMap[status]?.text || "Trạng thái không xác định"}
                  </Tag>
                )}
              </div>
            }
            key="1"
            className="bg-gray-50 rounded-lg p-4 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center">
                <FileTextOutlined className="mr-2 text-blue-500" />
                <strong>Tiêu đề:</strong>{" "}
                <span className="ml-1">{selectedRecord.title}</span>
              </div>
              <div className="flex items-center">
                <InfoCircleOutlined className="mr-2 text-green-500" />
                <strong>Mô tả:</strong>{" "}
                <span className="ml-1">
                  {selectedRecord.description || "Không"}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarOutlined className="mr-2 text-green-500" />
                <strong>Ngày giao và thời gian:</strong>{" "}
                <span className="ml-1">
                  {formatDateTime(selectedRecord.assignTime)}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarOutlined className="mr-2 text-red-500" />
                <strong>Hạn hoàn thành:</strong>{" "}
                <span className="ml-1">
                  {formatDateTime(selectedRecord.deadlineTime)}
                </span>
              </div>
              <div className="flex items-center">
                <UserOutlined className="mr-2 text-orange-500" />
                <strong>Người giao:</strong>{" "}
                <span className="ml-1">
                  {selectedRecord.assignFrom.userName}
                </span>
              </div>
              <div className="flex items-center">
                <UserOutlined className="mr-2 text-purple-500" />
                <strong>Người nhận:</strong>{" "}
                <span className="ml-1">{selectedRecord.assignTo.userName}</span>
              </div>
              <div className="flex items-center">
                <strong>Tên lịch trình:</strong>{" "}
                <span className="ml-1">
                  {selectedRecord.schedule.scheduleName}
                </span>
              </div>
              <div className="flex items-center">
                <strong>Loại lịch trình:</strong>{" "}
                <span className="ml-1">
                  {translateScheduleType(
                    selectedRecord.schedule.scheduleType.scheduleTypeName
                  )}
                </span>
              </div>
              <div className="col-span-2">
                <strong>Ghi chú:</strong>{" "}
                <span className="ml-1">{selectedRecord.note || "Không"}</span>
              </div>
            </div>
          </Panel>
        </Collapse>
      )}

      {/* Appointment Details */}
      {data && !isError && (
        <Collapse defaultActiveKey={["2"]} className="mb-4">
          <Panel
            header="Thông tin cuộc hẹn"
            key="2"
            className="bg-gray-50 rounded-lg p-4 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center">
                <FileTextOutlined className="mr-2 text-blue-500" />
                <strong>Tên cuộc hẹn:</strong>{" "}
                <span className="ml-1">{data.visitName}</span>
              </div>
              <div className="flex items-center">
                <TeamOutlined className="mr-2 text-teal-500" />
                <strong>Số lượng dự kiến:</strong>{" "}
                <span className="ml-1">{data.visitQuantity}</span>
              </div>
              <div className="flex items-center">
                <CalendarOutlined className="mr-2 text-green-500" />
                <strong>Ngày và giờ bắt đầu:</strong>{" "}
                <span className="ml-1">
                  {formatDateTime(data.expectedStartTime)}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarOutlined className="mr-2 text-red-500" />
                <strong>Ngày và giờ kết thúc:</strong>{" "}
                <span className="ml-1">
                  {formatDateTime(data.expectedEndTime)}
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircleOutlined className="mr-2 text-green-500" />
                <strong>Trạng thái:</strong>{" "}
                <Tag
                  color={data.visitStatus === "Confirmed" ? "green" : "red"}
                  className="ml-1"
                >
                  {data.visitStatus === "Confirmed"
                    ? "Đã xác nhận"
                    : "Chưa xác nhận"}
                </Tag>
              </div>
              <div className="flex items-center">
                <UserOutlined className="mr-2 text-purple-500" />
                <strong>Người tạo:</strong>{" "}
                <span className="ml-1">
                  {data.createBy ? data.createBy.fullName : "Không"}
                </span>
              </div>
              <div className="col-span-2">
                <strong>Mô tả:</strong>{" "}
                <span
                  className="ml-1"
                  onDoubleClick={handleDescriptionDoubleClick}
                >
                  {HtmlContent({ htmlString: truncatedDescription })}
                </span>
                <Modal
                  title="Chi tiết mô tả"
                  visible={isDescriptionModalVisible}
                  onCancel={handleDescriptionModalClose}
                  footer={null}
                >
                  <HtmlContent htmlString={data.description} />
                </Modal>
              </div>
            </div>
          </Panel>
          {data.visitDetail && data.visitDetail.length > 0 && (
            <Panel
              header="Chi tiết lịch trình đã giao"
              key="3"
              className="bg-gray-50 rounded-lg p-4 shadow-sm"
            >
              <Collapse className="mb-4">
                {data.visitDetail.map((detail: any, index: number) => (
                  <Panel
                    header={`Khách thăm ${index + 1}: ${
                      detail.visitor.visitorName
                    }`}
                    key={detail.visitDetailId}
                    className="bg-gray-50 rounded-lg p-4 shadow-sm"
                  >
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                      <div className="flex items-center">
                        <strong>ID Chi tiết:</strong>{" "}
                        <span className="ml-1">{detail.visitDetailId}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-green-500" />
                        <strong>Giờ bắt đầu dự kiến:</strong>{" "}
                        <span className="ml-1">
                          {formatTimeOnly(detail.expectedStartHour)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-red-500" />
                        <strong>Giờ kết thúc dự kiến:</strong>{" "}
                        <span className="ml-1">
                          {formatTimeOnly(detail.expectedEndHour)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleOutlined className="mr-2 text-green-500" />
                        <strong>Trạng thái:</strong>{" "}
                        <span className="ml-1">
                          {detail.status ? "Đã xác nhận" : "Chưa xác nhận"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <UserOutlined className="mr-2 text-orange-500" />
                        <strong>Tên khách:</strong>{" "}
                        <span className="ml-1">
                          {detail.visitor.visitorName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BankOutlined className="mr-2 text-purple-500" />
                        <strong>Công ty:</strong>{" "}
                        <span className="ml-1">
                          {detail.visitor.companyName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <PhoneOutlined className="mr-2 text-blue-500" />
                        <strong>Số điện thoại:</strong>{" "}
                        <span className="ml-1">
                          {detail.visitor.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <IdcardOutlined className="mr-2 text-gray-500" />
                        <strong>Số thẻ:</strong>{" "}
                        <span className="ml-1">
                          {detail.visitor.credentialsCard}
                        </span>
                      </div>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </Panel>
          )}
        </Collapse>
      )}
      {!data && !isError && (
        <div className="text-center text-gray-500">
          Lịch trình chưa được tạo cuộc hẹn
        </div>
      )}
    </Modal>
  );
};

export default ScheduleUserDetailModal;
