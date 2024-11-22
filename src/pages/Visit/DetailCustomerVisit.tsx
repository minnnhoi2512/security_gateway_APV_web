import React, { useEffect, useState } from "react";
import {
  Layout,
  Table,
  Button,
  TimePicker,
  DatePicker,
  Tag,
  notification,
  Input,
  Modal,
  Card,
  Divider,
} from "antd";
import { useParams } from "react-router-dom";
import {
  ClockCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  useGetDetailVisitQuery,
  useGetListDetailVisitQuery,
  useUpdateStatusVisitMutation,
  useUpdateVisitAfterStartDateMutation,
  useUpdateVisitBeforeStartDateMutation,
} from "../../services/visitDetailList.service";
import VisitorSearchModal from "../../form/ModalSearchVisitor";
import { DetailVisitor } from "../../types/detailVisitorForVisit";
import { convertToVietnamTime, formatDateWithourHour } from "../../utils/ultil";
import ListHistorySesson from "../History/ListHistorySession";
import { ScheduleType, typeMap } from "../../types/Enum/ScheduleType";
import { VisitStatus, visitStatusMap } from "../../types/Enum/VisitStatus";
import ListHistorySessonVisit from "../History/ListHistorySessionVisit";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { HtmlContent } from "../../components/Description/description";
import LoadingState from "../../components/State/LoadingState";

dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

const { Content } = Layout;

const DetailCustomerVisit: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [isHistoryAllModalVisible, setIsHistoryAllModalVisible] =
    useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { id } = useParams<{ id: string }>();
  const {
    data: visitData,
    refetch: refetchVisit,
    isLoading,
  } = useGetDetailVisitQuery({
    visitId: Number(id),
  });
  const [updateVisitBeforeStartDate] = useUpdateVisitBeforeStartDateMutation();
  const [updateVisitAfterStartDate] = useUpdateVisitAfterStartDateMutation();
  const [updateVisitStatus] = useUpdateStatusVisitMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    data: detailVisitData = [],
    refetch: refetchListVisitor,
    isLoading: loadingDetailVisitData,
  } = useGetListDetailVisitQuery({
    visitId: Number(id),
    pageNumber: -1,
    pageSize: -1,
  });

  const [visitors, setVisitors] = useState<DetailVisitor[]>([]);
  const [visitQuantity, setVisitQuantity] = useState<number>(
    visitData?.visitQuantity || 0
  );
  const [editableVisitName, setEditableVisitName] = useState<string>("");
  const [editableStartDate, setEditableStartDate] = useState<Dayjs>();
  const [editableDescription, setEditableDescription] = useState<string>("");
  const [editableEndDate, setEditableEndDate] = useState<Dayjs>();
  const [scheduleTypeId, setScheduleTypeId] = useState<ScheduleType | null>(
    null
  );
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);
  const [status, setStatusVisit] = useState<VisitStatus | String>("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const convertToDayjs = (date: string | Date | Dayjs): Dayjs => {
    return dayjs(date);
  };
  const isEditable = () => {
    const endOfExpectedStartTime = dayjs(visitData?.expectedStartTime).endOf(
      "day"
    );
    return dayjs().isSameOrBefore(endOfExpectedStartTime);
  };
  const isEditableToday = () => {
    const startOfExpectedStartTime = dayjs(visitData?.expectedStartTime).startOf("day");
    return !dayjs().isSame(startOfExpectedStartTime, "day");
  };
  // console.log();
  useEffect(() => {
    setSelectedVisitId(Number(id));
    setVisitors(detailVisitData);
    setVisitQuantity(visitData?.visitQuantity);
    setEditableVisitName(visitData?.visitName);
    setEditableDescription(visitData?.description);
    setEditableStartDate(convertToDayjs(visitData?.expectedStartTime));
    setEditableEndDate(convertToDayjs(visitData?.expectedEndTime));
    setScheduleTypeId(
      visitData?.scheduleUser?.schedule.scheduleType
        .scheduleTypeId as ScheduleType
    );
    setStatusVisit(visitData?.visitStatus);
  }, [detailVisitData, visitData, refetchListVisitor, refetchVisit]);

  const handleToggleMode = async () => {
    if (isEditMode) {
      // When switching to edit mode, call the API to save changes
      try {
        const visitId = Number(id);
        let expectedEndTimeFinally =
          editableEndDate?.toDate() || visitData?.expectedEndTime;
        if (scheduleTypeId === undefined) {
          expectedEndTimeFinally =
            editableStartDate?.toDate() || visitData?.expectedStartTime;
        }
        // console.log("Visitors list luc put : ",visitors);
        const visitDetail = visitors.map((v) => ({
          // console.log(v)
          expectedStartHour: v.expectedStartHour,
          expectedEndHour: v.expectedEndHour,
          visitorId: v.visitor.visitorId,
          status: v.status,
        }));

        const updatedVisitData = {
          visitName: editableVisitName || visitData?.visitName, // Include other necessary fields
          expectedStartTime:
            convertToVietnamTime(editableStartDate?.toDate()) ||
            visitData?.expectedStartTime,
          expectedEndTime: convertToVietnamTime(expectedEndTimeFinally),
          description: editableDescription,
          visitDetail: visitDetail,
          updateById: userId,
          visitQuantity: visitDetail.length,
        };
        console.log(isEditable());
        if (isEditable()) {
          await updateVisitBeforeStartDate({
            visitId: visitId,
            updateVisit: updatedVisitData,
          }).unwrap();
        } else {
          await updateVisitAfterStartDate({
            visitId: visitId,
            updateVisit: updatedVisitData,
          }).unwrap();
        }
        refetchVisit();
        refetchListVisitor();
        notification.success({ message: "Chỉnh sửa thành công!" });
      } catch (error) {
        return notification.error({ message: "Chỉnh sửa thất bại!" });
      }
    }
    setIsEditMode((prev) => !prev); // Toggle edit mode
  };
  const handleApprove = async () => {
    try {
      await updateVisitStatus({
        visitId: Number(id),
        action: "Active",
      }).unwrap();
      notification.success({ message: "Chấp thuận thành công!" });
      refetchVisit();
    } catch (error) {
      notification.error({ message: "Chấp thuận thất bại!" });
    }
  };
  const truncatedDescription =
    editableDescription?.length > 100
      ? `${editableDescription.substring(0, 100)}...`
      : editableDescription;

  const handleCancel = async () => {
    try {
      await updateVisitStatus({
        visitId: Number(id),
        action: "Cancelled",
      }).unwrap();
      notification.success({ message: "Hủy thành công!" });
      refetchVisit();
    } catch (error) {
      notification.error({ message: "Hủy thất bại!" });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setEditableDescription(value);
  };
  const handleReport = async () => {
    try {
      await updateVisitStatus({
        visitId: Number(id),
        action: "Violation",
      }).unwrap();
      notification.success({ message: "Từ chối thành công!" });
      refetchVisit();
    } catch (error) {
      notification.error({ message: "Từ chối thất bại!" });
    }
  };

  const timePickerStyles = {
    error: {
      borderColor: "red",
    },
  };
  const handleAddGuest = () => {
    setIsModalVisible(true);
  };
  const showHistoryModal = (record: any) => {
    setSelectedRecord(record);
    setIsHistoryModalVisible(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalVisible(false);
    setSelectedRecord(null);
  };

  const handleVisitorSelected = (visitor: any) => {
    const selectedVisitor: DetailVisitor = {
      expectedEndHour: "",
      expectedStartHour: "",
      visitor: visitor[0],
      status: true,
    };

    if (visitor[0].status === "Unactive") {
      notification.warning({ message: "Người dùng đã bị cấm." });
      return setVisitors((prevVisitors: DetailVisitor[]) => [...prevVisitors]);
    }

    const isDuplicate = visitors.some(
      (v: DetailVisitor) =>
        v.visitor.visitorId === selectedVisitor.visitor.visitorId
    );

    if (!isDuplicate) {
      setVisitors((prevVisitors: DetailVisitor[]) => [
        ...prevVisitors,
        selectedVisitor,
      ]);
      setVisitQuantity((prevQuantity) => prevQuantity + 1);
    } else {
      notification.warning({ message: "Khách này đã có trong danh sách." });
    }
  };

  const handleDeleteVisitor = (visitorId: string) => {
    if (!isEditable()) {
      setVisitors((prevVisitors: DetailVisitor[]) => {
        return prevVisitors.map((v: DetailVisitor) => {
          if (v.visitor.visitorId === Number(visitorId)) {
            // console.log("data before change : ", v);
            // Change the status of the specific visitor
            return {
              ...v,
              status: !v.status,
            };
          }
          return v;
        });
      });
    } else {
      if (visitors?.length === 1) {
        return notification.warning({
          message: "Danh sách không thể trống khách.",
        });
      }
      setVisitors((prevVisitors: DetailVisitor[]) =>
        prevVisitors.filter(
          (v: DetailVisitor) => v.visitor.visitorId !== Number(visitorId)
        )
      );
      setVisitQuantity((prevQuantity) => Math.max(prevQuantity - 1, 0));
      notification.success({
        message: "Xóa khách ra khỏi danh sách thành công.",
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableVisitName(e.target.value);
  };
  const handleEndHourChange = (time: any, index: any, record: any) => {
    const startHour = dayjs(record.expectedStartHour, "HH:mm");

    if (time && startHour && time.isBefore(startHour)) {
      // Show an error message or feedback
      notification.warning({ message: "Giờ ra phải sau giờ vào" });
      return; // Prevent setting the end hour if it's not valid
    }

    getHourString(time, "expectedEndHour", index); // Update end hour
  };
  const handleDescriptionDoubleClick = () => {
    setIsDescriptionModalVisible(true);
  };

  const handleDescriptionModalClose = () => {
    setIsDescriptionModalVisible(false);
  };
  const getHourString = (
    value: Dayjs | null,
    nameValue: string,
    index: number
  ) => {
    setVisitors((prevVisitors) => {
      const updatedVisitors = prevVisitors.map((visitor, i) =>
        i === index
          ? {
              ...visitor,
              [nameValue]: value ? value.format("HH:mm:ss") : "",
            }
          : visitor
      );

      return updatedVisitors;
    });
  };
  const scheduleType = scheduleTypeId as ScheduleType;
  const statusType = status as VisitStatus;
  const { colorScheduleType, textScheduleType } = typeMap[scheduleType] || {
    color: "default",
    text: "Theo ngày",
  };
  const { colorVisitStatus, textVisitStatus } = visitStatusMap[statusType] || {
    color: "black",
    text: "Không xác định",
  };
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: ["visitor", "visitorName"],
      key: "visitorName",
    },
    {
      title: "Số điện thoại",
      dataIndex: ["visitor", "phoneNumber"],
      key: "phoneNumber",
    },
    {
      title: "Công ty",
      dataIndex: ["visitor", "companyName"],
      key: "companyName",
    },
    {
      title: "Giờ vào dự kiến",
      dataIndex: "expectedStartHour",
      key: "expectedStartHour",
      render: (text: string, record: DetailVisitor, index: number) => {
        const isError = !text && !isEditMode; // Check if there is no value and edit mode is not active
        return (
          <TimePicker
            value={text ? dayjs(text, "HH:mm:ss") : null}
            onChange={(time) => getHourString(time, "expectedStartHour", index)}
            disabled={!isEditMode}
            format="HH:mm:ss"
            style={isError ? timePickerStyles.error : undefined} // Apply error style
            key={record.visitor.visitorId}
          />
        );
      },
    },
    {
      title: "Giờ ra dự kiến",
      dataIndex: "expectedEndHour",
      key: "expectedEndHour",
      render: (text: string, record: DetailVisitor, index: number) => {
        const isError = !text && !isEditMode; // Check if there is no value and edit mode is not active
        return (
          <TimePicker
            value={text ? dayjs(text, "HH:mm:ss") : null}
            onChange={(time) => handleEndHourChange(time, index, record)}
            disabled={!isEditMode}
            format="HH:mm:ss"
            style={isError ? timePickerStyles.error : undefined} // Apply error style
            key={record.visitor.visitorId}
          />
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (record: any) => (
        <>
          {!isEditMode && (
            <>
              <Button size="middle" onClick={() => showHistoryModal(record)}>
                <SearchOutlined />
              </Button>
            </>
          )}
          {isEditMode && (
            <Button
              size="middle"
              danger
              onClick={() => handleDeleteVisitor(record.visitor.visitorId)}
              style={{ marginLeft: 8 }}
            >
              <StopOutlined />
            </Button>
          )}
        </>
      ),
    },
  ];
  if (isLoading && loadingDetailVisitData) {
    return (
      <div>
        <LoadingState />
      </div>
    );
  }
  return (
    <Layout className="bg-white">
      <Content>
        <div className="container mx-auto p-4">
          <Card className="w-full shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cột 1: Thông tin cơ bản */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-600">
                  <InfoCircleOutlined className="text-xl" />
                  <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
                </div>
                <Divider className="my-2" />

                <div>
                  <p className="text-sm text-gray-500 space-y-2">
                    Tên danh sách:
                  </p>
                  {isEditMode && isEditableToday() ? (
                    <Input
                      value={editableVisitName}
                      onChange={handleNameChange}
                      className="mt-1"
                      placeholder="Nhập tên danh sách"
                    />
                  ) : (
                    <p className="text-base font-semibold text-gray-800">
                      {editableVisitName}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 space-y-2">Mô tả:</p>
                  {isEditMode && isEditableToday() ? (
                    <ReactQuill
                      value={editableDescription}
                      onChange={handleDescriptionChange}
                      className="mt-1 mb-12 h-60"
                      theme="snow"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["link", "image", "clean"],
                        ],
                      }}
                      placeholder="Nhập mô tả"
                    />
                  ) : (
                    <p
                      className="text-base font-semibold text-gray-800"
                      onDoubleClick={handleDescriptionDoubleClick}
                    >
                      <HtmlContent htmlString={truncatedDescription} />
                    </p>
                  )}
                  <Modal
                    title="Chi tiết mô tả"
                    visible={isDescriptionModalVisible}
                    onCancel={handleDescriptionModalClose}
                    footer={null}
                  >
                    <HtmlContent htmlString={editableDescription} />
                  </Modal>
                </div>
                <div className="flex items-center pt-6 ">
                  <div>
                    <p className="text-sm text-gray-500 space-y-2 ">
                      Trạng thái:
                    </p>
                    <Tag color={colorVisitStatus} className="text-sm mt-1">
                      {textVisitStatus}
                    </Tag>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 ">Loại:</p>
                    <Tag
                      color={
                        scheduleTypeId === undefined
                          ? "default"
                          : colorScheduleType
                      }
                      className="text-sm mt-1"
                    >
                      {scheduleTypeId === undefined
                        ? "Theo ngày"
                        : textScheduleType}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Cột 2: Thời gian và Trạng thái */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-green-600">
                  <ClockCircleOutlined className="text-xl" />
                  <h3 className="font-semibold text-lg">Thời gian</h3>
                </div>
                <Divider className="my-2" />

                <div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày đăng ký:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {formatDateWithourHour(visitData?.createTime)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Thời gian:</p>
                  {isEditMode ? (
                    <div className="space-y-2">
                      <span>Ngày bắt đầu</span>
                      <DatePicker
                        value={editableStartDate}
                        onChange={(date) => setEditableStartDate(date)}
                        format="DD/MM/YYYY"
                        placeholder="Ngày bắt đầu"
                        className="w-full"
                        disabled={!isEditable() || !isEditableToday()}
                        disabledDate={(date) =>
                          date && date.isBefore(dayjs(), "day")
                        }
                      />
                      {scheduleTypeId !== undefined && (
                        <div>
                          <span>Ngày hết hạn</span>
                          <DatePicker
                            value={editableEndDate}
                            onChange={(date) => setEditableEndDate(date)}
                            format="DD/MM/YYYY"
                            placeholder="Ngày kết thúc"
                            className="w-full"
                            disabledDate={(date) =>
                              date &&
                              (date.isBefore(editableStartDate, "day") ||
                                date.isBefore(dayjs(), "day"))
                            }
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-base font-semibold text-gray-800">
                      {scheduleTypeId === undefined
                        ? `Ngày ${formatDateWithourHour(
                            visitData?.expectedStartTime
                          )} `
                        : `Từ ${formatDateWithourHour(
                            visitData?.expectedStartTime
                          )} Đến ${formatDateWithourHour(
                            visitData?.expectedEndTime
                          )}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Cột 3: Thông tin người dùng */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-purple-600">
                  <UserOutlined className="text-xl" />
                  <h3 className="font-semibold text-lg">
                    Thông tin lượt ra/vào
                  </h3>
                </div>
                <Divider className="my-2" />

                <div>
                  <p className="text-sm text-gray-500">Số khách:</p>
                  <p className="text-base font-semibold text-gray-800">
                    {visitQuantity} khách
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tổng lượt ra vào:</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-800">
                      {visitData?.visitorSessionCount} lượt
                    </p>
                    {!isEditMode && (
                      <Button
                        type="link"
                        className="text-blue-600 hover:text-blue-800 text-base"
                        onClick={() => setIsHistoryAllModalVisible(true)}
                      >
                        Xem chi tiết
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="p-6">
          <Table
            dataSource={visitors}
            columns={columns}
            loading={loadingDetailVisitData}
            rowKey="visitorId"
            pagination={false}
          />
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
            className="mt-4"
          >
            {status === "ActiveTemporary" && (
              <>
                <Button
                  className="bg-yellow-500 text-white"
                  onClick={handleReport}
                >
                  Báo cáo
                </Button>
                <Button
                  className="bg-green-500 text-white"
                  onClick={handleApprove}
                >
                  Chấp thuận
                </Button>
              </>
            )}
            {status === "Active" && !isEditMode && (
              <div className="bg-red">
                <Button
                  className="bg-red-500 text-white"
                  onClick={handleCancel}
                >
                  Vô hiệu hóa
                </Button>
              </div>
            )}
            {isEditMode && (
              <Button type="default" onClick={handleAddGuest} className="mb-4">
                Thêm khách
              </Button>
            )}
            {(isEditable() &&
              scheduleTypeId == undefined &&
              visitData.visitStatus != "ActiveTemporary" && (
                <Button
                  type="primary"
                  onClick={handleToggleMode}
                  className="mb-4"
                >
                  {isEditMode ? "Lưu" : "Chỉnh sửa"}
                </Button>
              )) ||
              (scheduleTypeId != undefined && (
                <Button
                  type="primary"
                  onClick={handleToggleMode}
                  className="mb-4"
                >
                  {isEditMode ? "Lưu" : "Chỉnh sửa"}
                </Button>
              ))}
          </div>
        </div>

        <VisitorSearchModal
          isModalVisible={isModalVisible}
          setIsModalVisible={() => setIsModalVisible(false)}
          onVisitorSelected={handleVisitorSelected}
        />
      </Content>
      <Modal
        title="Chi tiết lịch sử từng người"
        visible={isHistoryModalVisible}
        onCancel={handleCloseHistoryModal}
        footer={null} // No footer buttons
      >
        {selectedRecord && (
          <ListHistorySesson data={selectedRecord.visitDetailId} />
        )}
      </Modal>
      <Modal
        title="Lịch sử lượt ra vào"
        visible={isHistoryAllModalVisible}
        onCancel={() => setIsHistoryAllModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedVisitId && (
          <ListHistorySessonVisit visitId={selectedVisitId} />
        )}
      </Modal>
    </Layout>
  );
};

export default DetailCustomerVisit;
