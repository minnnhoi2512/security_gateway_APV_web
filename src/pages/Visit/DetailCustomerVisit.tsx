import React, { useEffect, useState } from "react";
import {
  Layout,
  Table,
  Button,
  Row,
  Col,
  TimePicker,
  DatePicker,
  Tag,
  notification,
  Input,
  Modal,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  useGetDetailVisitQuery,
  useGetListDetailVisitQuery,
  useUpdateVisitAfterStartDateMutation,
  useUpdateVisitBeforeStartDateMutation,
} from "../../services/visitDetailList.service";
import VisitorSearchModal from "../../form/ModalSearchVisitor";
import { DetailVisitor } from "../../types/detailVisitorForVisit";
import { convertToVietnamTime } from "../../utils/ultil";
import ListHistorySesson from "../History/ListHistorySession";

dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

const { Content } = Layout;

const DetailCustomerVisit: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const [isEditMode, setIsEditMode] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: visitData, refetch: refetchVisit } = useGetDetailVisitQuery({
    visitId: Number(id),
  });
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
  const [updateVisitBeforeStartDate] = useUpdateVisitBeforeStartDateMutation();
  const [updateVisitAfterStartDate] = useUpdateVisitAfterStartDateMutation();
  // const [appendVisitAfterStartDate] = useAppendVisitAfterStartDateMutation();
  const [editableStartDate, setEditableStartDate] = useState<Dayjs>();
  const [editableEndDate, setEditableEndDate] = useState<Dayjs>();
  const [scheduleTypeId, setScheduleTypeId] = useState<number>(0);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const convertToDayjs = (date: string | Date | Dayjs): Dayjs => {
    return dayjs(date);
  };
  const formatDate = (date: string) => dayjs(date).format("DD/MM/YYYY");

  // Check if the visit is editable based on the expected start time
  const isEditable = () =>
    dayjs().isBefore(dayjs(visitData?.expectedStartTime));

  useEffect(() => {
    setVisitors(detailVisitData);
    // console.log(detailVisitData);
    setVisitQuantity(detailVisitData.length);
    setEditableVisitName(visitData?.visitName);
    setEditableStartDate(convertToDayjs(visitData?.expectedStartTime));
    setEditableEndDate(convertToDayjs(visitData?.expectedEndTime));
    // setScheduleTypeId(Number(visitData?.schedule.scheduleTypeId));
  }, [detailVisitData, visitData, refetchListVisitor, refetchVisit]);

  const handleToggleMode = async () => {
    if (isEditMode) {
      // When switching to edit mode, call the API to save changes
      try {
        const visitId = Number(id);
        let expectedEndTimeFinally =
          editableEndDate?.toDate() || visitData?.expectedEndTime;
        if (scheduleTypeId === 1) {
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
          description: visitData?.description,
          visitDetail: visitDetail,
          updateById: userId,
          visitQuantity: visitDetail.length,
        };
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
        await refetchVisit();
        await refetchListVisitor();
        notification.success({ message: "Chỉnh sửa thành công!" });
      } catch (error) {
        return notification.error({ message: "Chỉnh sửa thất bại!" });
      }
    }
    setIsEditMode((prev) => !prev); // Toggle edit mode
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
    console.log(record);
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
      notification.warning({ message: "Visitor is already in the list." });
    }
  };

  const handleDeleteVisitor = (visitorId: string) => {
    if (!isEditable()) {
      setVisitors((prevVisitors: DetailVisitor[]) => {
        return prevVisitors.map((v: DetailVisitor) => {
          if (v.visitor.visitorId === Number(visitorId)) {
            console.log("data before change : ", v);
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
      if (visitors.length === 1) {
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

  const getScheduleType = (typeId: number) => {
    switch (typeId) {
      case 1:
        return "Theo ngày";
      case 2:
        return "Theo tháng";
      default:
        return "Khác";
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableVisitName(e.target.value);
  };

  const handleStartDateChange = (date: Dayjs) => {
    setEditableStartDate(date);
  };

  const handleEndDateChange = (date: Dayjs) => {
    setEditableEndDate(date);
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
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: ["visitor", "visitorName"],
      key: "visitorName",
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
                Kiểm tra người dùng
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
              Xóa người dùng
            </Button>
          )}
        </>
      ),
    },
  ];
  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold mb-4 text-center">
          Chi tiết chuyến thăm
        </h1>
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm flex items-start space-x-4">
              <CalendarOutlined className="text-blue-500 text-2xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ngày đăng ký:</p>

                <p className="text-base font-semibold text-gray-800">
                  {formatDate(visitData?.createTime)}
                </p>
                <p className="text-sm text-gray-600">Tên danh sách:</p>
                {isEditMode && isEditable() ? (
                  <Input
                    value={editableVisitName}
                    onChange={(e) => handleNameChange(e)}
                    className="text-base font-semibold text-gray-800"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800">
                    {editableVisitName}
                  </p>
                )}
                <p className="text-sm text-gray-600">Thời gian:</p>
                {isEditMode ? (
                  <>
                    {isEditable() && (
                      <DatePicker
                        value={editableStartDate}
                        onChange={handleStartDateChange}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày bắt đầu"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    {/* Render end date picker only if scheduleTypeId is not 1 and isEditable() is true */}
                    {scheduleTypeId !== 1 && !isEditable() && (
                      <>
                        <p className="text-base font-semibold text-gray-800">
                          Từ {formatDate(visitData?.expectedStartTime)} Đến
                        </p>
                        <DatePicker
                          value={editableEndDate}
                          onChange={handleEndDateChange}
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày kết thúc"
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* {scheduleTypeId === 1 ? (
                      <p className="text-base font-semibold text-gray-800">
                        Ngày {formatDate(visitData?.expectedStartTime)}
                      </p>
                    ) : (
                      <p className="text-base font-semibold text-gray-800">
                        Từ {formatDate(visitData?.expectedStartTime)} Đến{" "}
                        {formatDate(visitData?.expectedEndTime)}
                      </p>
                    )} */}
                  </>
                )}

                <p className="text-sm text-gray-600">Số lượng:</p>
                <p className="text-base font-semibold text-gray-800">
                  {visitQuantity} người
                </p>
                <p className="text-sm text-gray-600">Loại:</p>
                <p className="text-base font-semibold text-gray-800">
                  {/* {getScheduleType(visitData?.schedule.scheduleTypeId)} */}
                </p>
              </div>
            </div>
          </Col>
          <Col span={12}>
            {isEditMode && (
              <Button
                type="default"
                onClick={handleAddGuest}
                className="mb-4 ml-2"
              >
                Thêm khách
              </Button>
            )}
          </Col>
        </Row>
        <Table
          dataSource={visitors}
          columns={columns}
          loading={loadingDetailVisitData}
          rowKey="visitorId"
        />
        <Button
          type="default"
          onClick={() => navigate(-1)}
          className="mb-4 ml-2"
        >
          Quay lại
        </Button>
        <Button type="primary" onClick={handleToggleMode} className="mb-4">
          {isEditMode ? "Lưu" : "Chỉnh sửa"}
        </Button>
        <VisitorSearchModal
          isModalVisible={isModalVisible}
          setIsModalVisible={() => setIsModalVisible(false)}
          onVisitorSelected={handleVisitorSelected}
        />
      </Content>
      <Modal
        title="Chi tiết lịch sử"
        visible={isHistoryModalVisible}
        onCancel={handleCloseHistoryModal}
        footer={null} // No footer buttons
      >
        {selectedRecord && (
          <ListHistorySesson data={selectedRecord.visitDetailId} />
        )}
      </Modal>
    </Layout>
  );
};

export default DetailCustomerVisit;
