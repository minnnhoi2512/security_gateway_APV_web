// src/components/ScheduleDetailModal.tsx
import React, { useState } from "react";
import { Modal, Button, notification, Collapse, Tag } from "antd";
import { ScheduleUserType } from "../../types/ScheduleUserType";
import { useGetVisitByScheduleUserIdQuery } from "../../services/visitList.service";
import {
  useApproveScheduleMutation,
  useCancelScheduleMutation,
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
  EyeOutlined,
} from "@ant-design/icons";
import { VisitStatus, visitStatusMap } from "../../types/Enum/VisitStatus";
import {
  scheduleStatusMap,
  ScheduleUserStatus,
} from "../../types/Enum/ScheduleUserStatus";
import LoadingState from "../State/LoadingState";
import { useNavigate } from "react-router";
import ReadOnlyMonthCalendar from "../ReadOnlyMonthCalendar";
import ReadOnlyWeekCalendar from "../ReadOnlyWeekCalendar";

const { Panel } = Collapse;

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
    : dateObj.toLocaleDateString("vi-VN");
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
  const navigate = useNavigate();
  const scheduleUserId = selectedRecord?.id || 0;
  const userRole = localStorage.getItem("userRole");
  const { data, isError, isLoading } = useGetVisitByScheduleUserIdQuery(
    { scheduleUserId },
    { skip: scheduleUserId === 0 }
  );
  const [rejectSchedule] = useRejectScheduleMutation();
  const [approveSchedule] = useApproveScheduleMutation();
  const [cancelSchedule] = useCancelScheduleMutation();
  const [isDescriptionModalVisible, setDescriptionIsModalVisible] =
    useState(false);
  const [isViewMonthlySchedule, setIsViewMonthlySchedule] = useState(false);
  const [isViewWeeklySchedule, setIsViewWeeklySchedule] = useState(false);
  const [modalViewSchedule, setModalViewSchedule] = useState(false);
  const handleDescriptionDoubleClick = () => {
    setDescriptionIsModalVisible(true);
  };

  console.log("Data detail nhiem vu: ", data);

  const handleDescriptionModalClose = () => {
    setDescriptionIsModalVisible(false);
  };

  const handleRejectSchedule = async (id: number) => {
    try {
      await rejectSchedule(id).unwrap();
      notification.success({ message: "Đã từ chối nhiệm vụ thành công" });
      handleClose();
      refetch();
    } catch (error) {
      notification.error({
        message: "Không thể từ chối nhiệm vụ",
        description: "Lỗi xảy ra khi từ chối",
      });
    }
  };

  const handleApproveSchedule = async (id: number) => {
    try {
      await approveSchedule(id).unwrap();
      notification.success({ message: "Đã duyệt nhiệm vụ thành công" });
      refetch();
      handleClose();
    } catch (error) {
      if (isEntityError(error)) {
        notification.error({
          message: "Không thể duyệt nhiệm vụ",
          description: "Lỗi xảy ra khi duyệt",
        });
      }
    }
  };
  const handleCancelSchedule = async (id: number) => {
    try {
      await cancelSchedule(id).unwrap();
      notification.success({ message: "Đã hủy nhiệm vụ thành công" });
      refetch();
      handleClose();
    } catch (error) {
      if (isEntityError(error)) {
        notification.error({
          message: "Không thể hủy nhiệm vụ",
          description: "Lỗi xảy ra khi hủy",
        });
      }
    }
  };
  const status = selectedRecord?.status as ScheduleUserStatus;
  const truncatedDescription =
    data?.description.length > 100
      ? `${data?.description.substring(0, 100)}...`
      : data?.description;
  if (isLoading)
    return (
      <div>
        <LoadingState />
      </div>
    );
  const handleCloseViewSchedule = () => {
    setModalViewSchedule(false);
  };
  return (
    <Modal
      title={
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2">
            <FileTextOutlined className="text-blue-500" />
            <span className="font-medium">Chi tiết nhiệm vụ đã giao</span>
          </div>
          {status && (
            <Tag
              color={scheduleStatusMap[status]?.color || "gray"}
              className="text-xs px-2 py-0.5 rounded-full"
            >
              {scheduleStatusMap[status].text || "Trạng thái không xác định"}
            </Tag>
          )}
        </div>
      }
      visible={isVisible}
      onCancel={handleClose}
      width={800}
      footer={[
        userRole !== "Staff" && (
          <Button
            key="approve"
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 mr-2"
            onClick={() => handleApproveSchedule(selectedRecord?.id || 0)}
            disabled={selectedRecord?.status !== ScheduleUserStatus.Pending}
          >
            Duyệt
          </Button>
        ),
        userRole !== "Staff" && (
          <Button
            key="reject"
            type="primary"
            danger
            className="mr-2 hover:opacity-90"
            onClick={() => handleRejectSchedule(selectedRecord?.id || 0)}
            disabled={selectedRecord?.status !== ScheduleUserStatus.Pending}
          >
            Từ chối
          </Button>
        ),
        userRole !== "Staff" && (
          <Button
            key="reject"
            type="primary"
            danger
            className="mr-2"
            onClick={() => handleCancelSchedule(selectedRecord?.id || 0)}
            disabled={selectedRecord?.status !== ScheduleUserStatus.Assigned}
          >
            Hủy nhiệm vụ
          </Button>
        ),
        userRole === "Staff" && status === "Assigned" && (
          <Button
            key="createVisit"
            type="primary"
            className="bg-green-500 hover:bg-green-600 mr-2"
            onClick={() =>
              navigate("/schedule-staff/createNewVisitList", {
                state: { from: selectedRecord },
              })
            }
          >
            Tạo chuyến thăm
          </Button>
        ),
        <Button key="close" onClick={handleClose}>
          Đóng
        </Button>,
      ]}
      className="rounded-lg shadow-md"
    >
      <div className="max-h-[65vh] overflow-y-auto">
        {selectedRecord && (
          <div className="space-y-4">
            {/* Task Information Section */}
            <div className="bg-white rounded-lg p-3">
              <div className="font-medium text-gray-800 mb-3">
                Thông tin nhiệm vụ
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <FileTextOutlined className="mr-2 text-blue-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">Tiêu đề</div>
                      <div className="font-medium">{selectedRecord.title}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <InfoCircleOutlined className="mr-2 text-green-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">Mô tả</div>
                      <div>{selectedRecord.description || "Không"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <CalendarOutlined className="mr-2 text-green-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">
                        Thời gian giao
                      </div>
                      <div>{formatDateTime(selectedRecord.assignTime)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <CalendarOutlined className="mr-2 text-red-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">
                        Hạn hoàn thành
                      </div>
                      <div>{formatDateTime(selectedRecord.deadlineTime)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <UserOutlined className="mr-2 text-orange-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">Người giao</div>
                      <div>{selectedRecord.assignFrom.fullName}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <UserOutlined className="mr-2 text-purple-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">Người nhận</div>
                      <div>{selectedRecord.assignTo.fullName}</div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 bg-blue-50 p-2 rounded">
                  <div className="flex items-start">
                    <CalendarOutlined className="mr-2 text-blue-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">
                        Tên lịch trình
                      </div>
                      <div className="font-medium">
                        {selectedRecord.schedule.scheduleName}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <CalendarOutlined className="mr-2 text-teal-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">
                        Loại lịch trình
                      </div>
                      <div>
                        {translateScheduleType(
                          selectedRecord.schedule.scheduleType.scheduleTypeName
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex items-start">
                    <InfoCircleOutlined className="mr-2 text-gray-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">Ghi chú</div>
                      <div>{selectedRecord.note || "Không"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Information Section */}
            {data && !isError && (
              <div className="bg-white rounded-lg p-3">
                <div className="font-medium text-gray-800 mb-3">
                  Thông tin chuyến thăm
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="flex items-start">
                      <FileTextOutlined className="mr-2 text-blue-500 mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          Tên chuyến thăm
                        </div>
                        <div>{data.visitName}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded">
                    <div className="flex items-start">
                      <TeamOutlined className="mr-2 text-teal-500 mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          Số lượng dự kiến
                        </div>
                        <div>{data.visitQuantity}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded">
                    <div className="flex items-start">
                      <CalendarOutlined className="mr-2 text-green-500 mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          Thời gian bắt đầu
                        </div>
                        <div>{formatDateTime(data.expectedStartTime)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded">
                    <div className="flex items-start">
                      <CalendarOutlined className="mr-2 text-red-500 mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          Thời gian kết thúc
                        </div>
                        <div>{formatDateTime(data.expectedEndTime)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded">
                    <div className="flex items-start">
                      <UserOutlined className="mr-2 text-purple-500 mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">Người tạo</div>
                        <div>
                          {data.createBy ? data.createBy.fullName : "Không"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 bg-gray-50 p-2 rounded">
                    <div className="flex items-start">
                      <InfoCircleOutlined className="mr-2 text-blue-500 mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">Mô tả</div>
                        <div
                          className="cursor-pointer hover:text-blue-500"
                          onDoubleClick={handleDescriptionDoubleClick}
                        >
                          <HtmlContent htmlString={truncatedDescription} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visitor Details Section */}
                {data.visitDetail && data.visitDetail.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium text-gray-800 mb-3">
                      Danh sách chi tiết khách
                    </div>
                    <div className="space-y-3">
                      {data.visitDetail.map((detail: any, index: number) => (
                        <div
                          key={detail.visitDetailId}
                          className="bg-gray-50 p-3 rounded"
                        >
                          <div className="font-medium text-gray-700 mb-2">
                            Khách {index + 1}: {detail.visitor.visitorName}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start">
                              <CalendarOutlined className="mr-2 text-green-500 mt-1" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Giờ bắt đầu dự kiến
                                </div>
                                <div>
                                  {formatTimeOnly(detail.expectedStartHour)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <CalendarOutlined className="mr-2 text-red-500 mt-1" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Giờ kết thúc dự kiến
                                </div>
                                <div>
                                  {formatTimeOnly(detail.expectedEndHour)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <CheckCircleOutlined className="mr-2 text-green-500 mt-1" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Trạng thái
                                </div>
                                <div>
                                  {detail.status
                                    ? "Đã xác nhận"
                                    : "Chưa xác nhận"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <UserOutlined className="mr-2 text-orange-500 mt-1" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Tên khách
                                </div>
                                <div>{detail.visitor.visitorName}</div>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <BankOutlined className="mr-2 text-purple-500 mt-1" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Công ty
                                </div>
                                <div>{detail.visitor.companyName}</div>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <PhoneOutlined className="mr-2 text-blue-500 mt-1" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Số điện thoại
                                </div>
                                <div>{detail.visitor.phoneNumber}</div>
                              </div>
                            </div>

                            <div className="flex items-start col-span-2">
                              <IdcardOutlined className="mr-2 text-gray-500 mt-1" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Số thẻ
                                </div>
                                <div>{detail.visitor.credentialsCard}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!data && !isError && (
              <div className="text-center text-gray-500 py-4">
                Nhiệm vụ chưa có chuyến thăm nào
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description Modal */}
      <Modal
        title="Chi tiết mô tả"
        visible={isDescriptionModalVisible}
        onCancel={handleDescriptionModalClose}
        footer={null}
      >
        <HtmlContent htmlString={data?.description} />
      </Modal>

      {/* Schedule Preview Modal */}
      <Modal
        title="Xem trước lịch"
        visible={modalViewSchedule}
        onCancel={handleCloseViewSchedule}
        footer={null}
      >
        {isViewMonthlySchedule && (
          <ReadOnlyMonthCalendar
            daysOfSchedule={
              selectedRecord?.schedule.daysOfSchedule || undefined
            }
          />
        )}
        {isViewWeeklySchedule && (
          <ReadOnlyWeekCalendar
            daysOfSchedule={
              selectedRecord?.schedule.daysOfSchedule || undefined
            }
          />
        )}
      </Modal>
    </Modal>
  );
};

export default ScheduleUserDetailModal;
