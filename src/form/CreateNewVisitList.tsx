import {
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Table,
  TimePicker,
  Modal,
  Image,
  notification,
  Spin,
} from "antd";
import "./customerScrollBar.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import {
  useCreateNewListDetailVisitMutation,
  useCreateNewScheduleVisitMutation,
} from "../services/visitDetailList.service";
import ReadOnlyWeekCalendar from "../components/ReadOnlyWeekCalendar";
import ReadOnlyMonthCalendar from "../components/ReadOnlyMonthCalendar";
import VisitorSearchModal from "./ModalSearchVisitor";
import { convertToVietnamTime } from "../utils/ultil";
import { useGetDetailScheduleStaffQuery } from "../services/scheduleStaff.service";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DeleteOutlined } from "@ant-design/icons";
import ReadOnlyMonthCalendar2 from "../components/ReadOnlyMonthCalendar-2";
import ReadOnlyWeekCalendar2 from "../components/ReadOnlyWeekCalendar-2";

interface FormValues {
  title: string;
  date: Dayjs;
  visitQuantity: number;
  scheduleId: number;
  scheduleType: number;
  visitName: string;
  expectedStartTime: Dayjs;
  expectedEndTime: Dayjs;
  description: string;
  daysOfSchedule: number[] | null;
  [key: string]: any;
}
const formatDateLocal = (dateString: string) => {
  return dayjs(dateString).format("DD/MM/YYYY");
};

const CreateNewVisitList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { refetch } = useGetDetailScheduleStaffQuery(state?.from?.id);
  let daysOfSchedule: string = "";
  let scheduleTypeName: string = "";
  try {
    daysOfSchedule = state?.from?.schedule?.daysOfSchedule ?? undefined;
    scheduleTypeName =
      state?.from?.schedule?.scheduleType?.scheduleTypeName ?? undefined;
  } catch (error) {
    // console.error("Error accessing schedule properties:", error);
  }
  const [form] = Form.useForm<FormValues>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const userId = Number(localStorage.getItem("userId"));
  const [selectedVisitors, setSelectedVisitors] = useState<
    {
      startHour: string;
      endHour: string;
      visitorId: number;
      visitorName: string;
      credentialsCard: string;
      visitorImage: any;
      companyName: string;
    }[]
  >([]);
  const [createNewListDetailVisit] = useCreateNewListDetailVisitMutation();
  const [createNewScheduleVisit] = useCreateNewScheduleVisitMutation();
  const [editorState, setEditorState] = useState<string>("");
  const [isModalCalendarVisible, setIsModalCalendarVisible] = useState(false);
  const [startHourForAll, setStartHourForAll] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endHourForAll, setEndHourForAll] = useState<string | null>(null);
  const visitQuantity = form.getFieldValue("visitQuantity");
  const [expectedStartTime, setExpectedStartTime] = useState<Dayjs | null>(
    null
  );
  const [expectedEndTime, setExpectedEndTime] = useState<Dayjs | null>(null);
  useEffect(() => {
    setExpectedEndTime(state?.from?.endDate);
    setExpectedStartTime(state?.from?.startDate);
  }, [state]);
  const showModalCalendar = (type: any) => {
    setIsModalCalendarVisible(true);
    if (type === "ProcessWeek") {
      setIsMonthCalendarVisible(false);
    } else if (type === "ProcessMonth") {
      setIsWeekCalendarVisible(false);
    }
  };

  const handleVisitorSelection = (visitor: any) => {
    // console.log(visitor);
    setSelectedVisitors((prevVisitors) => {
      if (visitor[0].status === "Unactive") {
        notification.warning({
          message: "Không thể thêm khách sổ đen vào danh sách.",
        });
        return prevVisitors;
      }
      // Check if the visitor is already selected
      const isDuplicate = prevVisitors.some(
        (v) => v.visitorId === visitor[0].visitorId
      );

      // If duplicate, return the current array without changes
      if (isDuplicate) {
        notification.warning({
          message: "Khách này đã có trong danh sách.",
        });
        return prevVisitors;
      }

      // Check if adding the new visitor would exceed the limit
      if (prevVisitors.length >= visitQuantity) {
        notification.warning({
          message: "Đã đạt số lượng khách tối đa.",
        });
        return prevVisitors;
      }
      if (prevVisitors.length + 1 == visitQuantity) {
        setIsModalVisible(false);
        return [...prevVisitors, visitor[0]];
      }
      return [...prevVisitors, visitor[0]];
    });
  };

  const handleCancelCalendar = () => {
    setIsModalCalendarVisible(false);
    setIsMonthCalendarVisible(false);
    setIsWeekCalendarVisible(false);
  };

  const [isMonthCalendarVisible, setIsMonthCalendarVisible] = useState(false);
  const [isWeekCalendarVisible, setIsWeekCalendarVisible] = useState(false);

  const handleCancel = () => {
    Modal.confirm({
      content: "Hành động này sẽ xóa hết dữ liệu.",
      okText: "Đồng ý",
      cancelText: "Tiếp tục tạo mới",
      onOk() {
        navigate(-1); // Navigate back
      },
    });
  };

  const getHourString = (value: any, nameValue: string, index: any) => {
    const startHour = selectedVisitors[index]?.startHour; // Get the current startHour
    const currentDate = new Date();
    const expectedStartTime = form.getFieldValue("expectedStartTime");

    // Check if expectedStartTime is today
    const isToday =
      expectedStartTime &&
      new Date(expectedStartTime).toDateString() === currentDate.toDateString();

    // Define the minimum start time if today (current time + 30 minutes)
    const minStartHour = new Date(currentDate.getTime() + -1 * 60000);

    if (nameValue === "startHour") {
      if (isToday) {
        const [selectedHours, selectedMinutes] = value.split(":").map(Number);
        const selectedTime = new Date();
        selectedTime.setHours(selectedHours, selectedMinutes, 0, 0);
        // console.log(minStartHour);
        // console.log(selectedTime);
        // Check if the selected start time is before the minimum allowed start time
        if (selectedTime <= minStartHour) {
          notification.warning({
            message: "Giờ vào phải hơn giờ hiện tại.",
          });
          return; // Prevent updating startHour if the condition fails
        }
      }

      selectedVisitors[index] = {
        ...selectedVisitors[index],
        startHour: value,
        // Reset endHour if the startHour changes and is after the new endHour
        endHour:
          startHour && value > startHour ? selectedVisitors[index].endHour : "",
      };
    } else if (nameValue === "endHour") {
      if (
        dayjs(value, "HH:mm:ss").isBefore(
          dayjs(startHour, "HH:mm:ss").add(30, "minute")
        )
      ) {
        // Optionally show a message to the user
        notification.warning({
          message: "Giờ ra dự kiến phải hơn 30 phút so với giờ vào dự kiến!",
        }); // Adjust the message to your needs
        return; // Do not update endHour if it is not valid
      }

      selectedVisitors[index] = {
        ...selectedVisitors[index],
        endHour: value,
      };
    }

    setSelectedVisitors([...selectedVisitors]); // Trigger a re-render
  };
  // console.log(state.from);
  const handleClearVisitor = (index: number) => {
    if (selectedVisitors.length === 0) {
      message.warning("Không có khách nào để xóa.");
      return;
    }

    const updatedVisitors = [...selectedVisitors];
    if (!updatedVisitors[index]?.visitorName) {
      message.warning("Khách này không có thông tin để xóa.");
      return;
    }

    updatedVisitors.splice(index, 1);
    setSelectedVisitors(updatedVisitors);
  };
  const handleSubmit = async () => {
    try {
      const visitQuantity = form.getFieldValue("visitQuantity");
      if (selectedVisitors.length < visitQuantity) {
        notification.warning({ message: "Cần nhập đủ số lượng khách!" });
        return; // Stop further execution
      }

      setIsSubmitting(true);

      // Validate the form fields
      await form.validateFields();

      // Check if expectedStartHour and expectedEndHour are filled
      const hasMissingHours = selectedVisitors.some(
        (visitor) => !visitor.startHour || !visitor.endHour
      );

      if (hasMissingHours) {
        notification.warning({
          message: "Vui lòng nhập đủ thông tin giờ ra và giờ vào!",
        });
        setIsSubmitting(false);

        return; // Stop further execution
      }

      const formData = form.getFieldsValue(true);
      const requestData = {
        visitName: formData.title,
        visitQuantity: selectedVisitors.length,
        expectedStartTime: formData.expectedStartTime
          ? convertToVietnamTime(formData.expectedStartTime.toDate())
          : null,
        expectedEndTime: formData.expectedStartTime
          ? convertToVietnamTime(formData.expectedStartTime.toDate())
          : null,
        createById: userId,
        description: editorState,
        scheduleId: null,
        scheduleUserId: null,
        visitDetail: selectedVisitors.map((visitor) => ({
          expectedStartHour: visitor.startHour,
          expectedEndHour: visitor.endHour,
          visitorId: visitor.visitorId,
        })),
        responsiblePersonId: userId,
      };
      let validData = true;
      if (requestData.expectedStartTime) {
        const expectedStartTimeDate = new Date(requestData.expectedStartTime);
        const currentDate = new Date();

        const isSameDay =
          expectedStartTimeDate.getFullYear() === currentDate.getFullYear() &&
          expectedStartTimeDate.getMonth() === currentDate.getMonth() &&
          expectedStartTimeDate.getDate() === currentDate.getDate();
        // console.log(isSameDay);

        if (isSameDay) {
          selectedVisitors.forEach((visitor) => {
            const [hours, minutes, seconds] = visitor.startHour
              .split(":")
              .map(Number);
            const selectedVisitorTime = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              hours,
              minutes + 1,
              seconds
            );

            if (selectedVisitorTime < currentDate) {
              // expectedStartHour is before the current time

              validData = false;
              return; // Stop further execution
            }
          });
        }
        // console.log(!isSubmitting);
        // if (!isSubmitting) return;
      }
      if (!validData) {
        notification.warning({
          message: "Giờ bắt đầu dự kiến không được trước thời gian hiện tại!",
        });
        return;
      }
      if (
        scheduleTypeName === "ProcessWeek" ||
        scheduleTypeName === "ProcessMonth"
      ) {
        // console.log(expectedStartTime);
        requestData.expectedStartTime = convertToVietnamTime(expectedStartTime);
        requestData.expectedEndTime = convertToVietnamTime(expectedEndTime);
        // console.log(state.from.schedule.scheduleId)
        requestData.scheduleId = state.from.schedule.scheduleId; // Update scheduleId to state.from.id
        requestData.scheduleUserId = state.from.id; // Update scheduleId to state.from.id
        // console.log(requestData);
      }

      try {
        if (
          scheduleTypeName === "ProcessWeek" ||
          scheduleTypeName === "ProcessMonth"
        ) {
          await createNewScheduleVisit({
            newVisitDetailList: requestData,
          }).unwrap();
        } else {
          await createNewListDetailVisit({
            newVisitDetailList: requestData,
          }).unwrap(); // unwrapping for better error handling
        }
        notification.success({ message: "Lịch hẹn đã được tạo thành công!" });
        refetch();
        navigate(-1);
      } catch (error: any) {
        if (error.data.status === 400) {
          notification.error({
            message: "Vui lòng kiểm tra thông tin đã nhập.",
          });
        }
        setIsSubmitting(false);
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      notification.error({ message: "Vui lòng kiểm tra thông tin đã nhập." });
      setIsSubmitting(false);
    }
  };

  const handleAddVisitor = () => {
    setIsModalVisible(true);
  };
  const handleStartHourChangeForAll = (time: any) => {
    const startHour = time?.format("HH:mm:ss");
    const currentDate = new Date();
    const expectedStartTime = form.getFieldValue("expectedStartTime");

    // Check if expectedStartTime is today
    const isToday =
      expectedStartTime &&
      new Date(expectedStartTime).toDateString() === currentDate.toDateString();

    // Define the minimum start time if today (current time + 30 minutes)
    const minStartHour = new Date(currentDate.getTime() + -1 * 60000);

    if (isToday) {
      const [selectedHours, selectedMinutes] = startHour
        ?.split(":")
        .map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(selectedHours, selectedMinutes, 0, 0);

      // Check if the selected start time is before the minimum allowed start time
      if (selectedTime <= minStartHour) {
        notification.warning({
          message: "Giờ vào phải hơn giờ hiện tại.",
        });
        return; // Prevent updating startHour if the condition fails
      }
    }

    setStartHourForAll(startHour);

    // Reset end hour when start hour changes
    setEndHourForAll(null);

    // Update startHour for all selected visitors and reset endHour
    selectedVisitors.forEach((visitor, index) => {
      selectedVisitors[index] = {
        ...visitor,
        startHour: startHour,
        endHour: "",
      };
    });
    setSelectedVisitors([...selectedVisitors]); // Trigger a re-render
  };
  const handleOk = () => {
    // Logic to use expectedStartTime and expectedEndTime
    // Close the modal
    setIsModalCalendarVisible(false);
    setIsMonthCalendarVisible(false);
    setIsWeekCalendarVisible(false);
  };
  const handleEndHourChangeForAll = (time: any) => {
    let endHour = time?.format("HH:mm:ss");
    const isEndHourValid = dayjs(endHour, "HH:mm:ss").isAfter(
      dayjs(selectedVisitors[0]?.startHour, "HH:mm:ss").add(30, "minute") // Ensure startHour is at least 30 minutes before endHour
    );
    // console.log(endHour);
    // If endHour is not valid, clear it and show a warning
    if (!isEndHourValid && endHour !== null && endHour !== undefined) {
      notification.warning({
        message: "Giờ ra dự kiến phải hơn 30 phút so với giờ vào dự kiến!",
      });
      setEndHourForAll(null);
      const updatedVisitors = selectedVisitors.map((visitor) => ({
        ...visitor,
        endHour: "",
      }));
      setSelectedVisitors(updatedVisitors);
      return;
    }

    // Set endHour for all visitors
    setEndHourForAll(endHour);
    const updatedVisitors = selectedVisitors.map((visitor) => ({
      ...visitor,
      endHour: endHour,
    }));
    setSelectedVisitors(updatedVisitors); // Trigger a re-render
  };

  const renderVisitorsTable = () => {
    const columns = [
      {
        title: "STT",
        dataIndex: "index",
        key: "index",
        render: (_: any, record: any, index: number) => (
          <span id={record.id} className="justify-center items-center">
            {index + 1}
          </span> // Display the index starting from 1
        ),
      },
      {
        title: "Ảnh",
        dataIndex: "visitorImage",
        key: "visitorImage",
        render: (image: string) => {
          // console.log(image);
          // Check if the image string is null, empty, or starts with the base64 prefix
          if (!image) {
            return null; // or return a placeholder, e.g., <div>No Image</div>
          }

          // Ensure the image string is in base64 format
          const base64Image = image.startsWith("data:image/jpeg;base64,")
            ? image
            : `data:image/jpeg;base64,${image}`;

          return (
            <Image
              src={base64Image}
              alt="Visitor Credential"
              width={50} // Set the width of the image
              height={50} // Set the height of the image
              preview={false} // Set to false if you don't want the preview functionality
              style={{ objectFit: "cover" }} // Maintain the aspect ratio
            />
          );
        },
      },
      {
        title: "Tên khách",
        dataIndex: "visitorName",
        key: "visitorName",
      },
      {
        title: "Công ty",
        dataIndex: "companyName",
        key: "companyName",
      },
      {
        title: "Mã thẻ",
        dataIndex: "credentialsCard",
        key: "credentialsCard",
      },
      {
        title: "Giờ vào",
        dataIndex: "startHour",
        key: "startHour",
        render: (_: any, record: any, index: any) =>
          selectedVisitors[index]?.visitorName ? (
            <TimePicker
              format="HH:mm"
              value={
                record.startHour ? dayjs(record.startHour, "HH:mm:ss") : null
              } // Display the current startHour
              onChange={(time) =>
                getHourString(time?.format("HH:mm:ss"), "startHour", index)
              }
            />
          ) : null,
      },
      {
        title: "Giờ ra",
        dataIndex: "endHour",
        key: "endHour",
        render: (_: any, record: any, index: any) =>
          selectedVisitors[index]?.visitorName ? (
            <TimePicker
              format="HH:mm"
              value={record.endHour ? dayjs(record.endHour, "HH:mm:ss") : null} // Display the current endHour
              onChange={(time) => {
                // Check if startHour is selected
                if (!record.startHour) {
                  // Show toast notification
                  notification.warning({
                    message: "Vui lòng chọn giờ vào trước khi chọn giờ ra.",
                  });
                  return; // Prevent further action
                }
                getHourString(time?.format("HH:mm:ss"), "endHour", index);
              }}
            />
          ) : null,
      },
      {
        title: "Hành động",
        dataIndex: "action",
        key: "action",
        render: (_: any, record: any, index: any) => {
          // Show the button only if visitor data is present
          return selectedVisitors[index]?.visitorName ? (
            <Button
              id={record.id}
              onClick={() => handleClearVisitor(index)}
              danger
            >
              <DeleteOutlined />
            </Button>
          ) : null;
        },
      },
    ];

    const visitorsData = selectedVisitors.map((visitor, index) => {
      const frontImage =
        visitor?.visitorImage.length > 0 ? visitor.visitorImage[0] : null;

      return {
        id: index + 1,
        visitorName: visitor?.visitorName,
        startHour: visitor?.startHour,
        endHour: visitor?.endHour,
        companyName: visitor?.companyName,
        visitorImage: frontImage ? frontImage.imageURL : null,
        credentialsCard: visitor?.credentialsCard,
      };
    });

    return (
      <>
        {selectedVisitors.length === 0 && (
          <p className="mb-4 text-red-500">Chưa có khách nào được chọn!</p>
        )}
        <div className="overflow-auto custom-scrollbar">
          <Table
            dataSource={visitorsData}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </div>
      </>
    );
  };

  return (
    <Spin spinning={isSubmitting} tip="Đang xử lý...">
      <div>
        <div className="max-w mx-auto px-4 py-6">
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Basic Information - Now smaller */}
              <div className="lg:col-span-1 flex flex-col">
                <div className="bg-white rounded-lg shadow-2xl p-6 flex-grow">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    Thông tin cơ bản
                  </h2>

                  <Form.Item
                    required
                    name="title"
                    label="Tên chuyến thăm"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên chuyến thăm",
                      },
                      {
                        min: 5,
                        max: 100,
                        message:
                          "Tên chuyến thăm phải có ít nhất 5 ký tự và tối đa 100 ký tự",
                      },
                      {
                        pattern: /^[^!@#$%^&*+=\[\]{};"\\|<>?~`]+$/,
                        message:
                          "Tên chuyến thăm không được chứa ký tự đặc biệt",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập tên chuyến thăm"
                      className="rounded border-gray-300"
                    />
                  </Form.Item>

                  {scheduleTypeName !== "ProcessWeek" &&
                    scheduleTypeName !== "ProcessMonth" && (
                      <Form.Item
                        required
                        name="expectedStartTime"
                        label="Ngày đến thăm"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn thời gian",
                          },
                        ]}
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          placeholder="Chọn thời gian"
                          className="w-full rounded border-gray-300"
                          disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                          }
                        />
                      </Form.Item>
                    )}

                  {(scheduleTypeName === "ProcessWeek" ||
                    scheduleTypeName === "ProcessMonth") && (
                    <div className="space-y-2 ">
                      <Button
                        type="primary"
                        onClick={() => showModalCalendar(scheduleTypeName)}
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                      >
                        Xem lịch
                      </Button>

                      {expectedStartTime && expectedEndTime && (
                        <div className="p-3 bg-gray-50 rounded text-gray-600 text-sm">
                          Từ {formatDateLocal(expectedStartTime.toString())} Đến{" "}
                          {formatDateLocal(expectedEndTime.toString())}
                        </div>
                      )}
                      {!expectedStartTime && !expectedEndTime && (
                        <div className="text-red-500">
                          Vui lòng chọn thời gian
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description moved to its own card with full width */}
                <div className="bg-white rounded-lg shadow-2xl p-6 mt-4 flex-grow">
                  <Form.Item
                    required
                    name="description"
                    label="Mô tả"
                    rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                  >
                    <ReactQuill
                      value={editorState}
                      onChange={setEditorState}
                      className="h-64 mb-10" // Increased height
                      theme="snow"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["link", "image", "clean"],
                        ],
                      }}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Right Column - Visitor Details - Now wider */}
              {
                <div className="lg:col-span-2 flex flex-col">
                  <div className="bg-white rounded-lg shadow-2xl p-6 flex-grow">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-medium text-gray-900">
                        Chi tiết khách thăm
                      </h2>

                      <Button
                        type="primary"
                        onClick={handleAddVisitor}
                        className="bg-buttonColor hover:!bg-buttonColor hover:!scale-90"
                      >
                        Thêm khách
                      </Button>
                    </div>

                    {selectedVisitors.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-base font-medium text-gray-900 mb-3">
                          Chọn giờ cho tất cả khách:
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-2 flex flex-col">
                            <label className="text-sm text-gray-700 mb-1">
                              Giờ vào tất cả khách
                            </label>
                            <TimePicker
                              format="HH:mm"
                              placeholder="Giờ vào"
                              className="w-full rounded border-gray-300"
                              value={
                                startHourForAll
                                  ? dayjs(startHourForAll, "HH:mm")
                                  : null
                              }
                              onChange={handleStartHourChangeForAll}
                              style={{ width: "100%" }}
                            />
                          </div>
                          <div className="col-span-2 flex flex-col">
                            <label className="text-sm text-gray-700 mb-1">
                              Giờ ra tất cả khách
                            </label>
                            <TimePicker
                              format="HH:mm"
                              placeholder="Giờ ra"
                              className="w-full rounded border-gray-300"
                              value={
                                endHourForAll
                                  ? dayjs(endHourForAll, "HH:mm")
                                  : null
                              }
                              onChange={handleEndHourChangeForAll}
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ height: "420px" }}>
                      {renderVisitorsTable()}
                    </div>
                  </div>
                </div>
              }
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:!scale-95 hover:!border-gray-300 hover:!text-gray-300"
              >
                Quay lại
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setSelectedVisitors([]);
                  setStartHourForAll(null);
                  setEndHourForAll(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md bg-red-500 text-white hover:!bg-red-600 hover:!scale-95 hover:!border-red-600 hover:!text-white"
              >
                Xóa hết thông tin
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isSubmitting}
                className="px-4 py-2 bg-buttonColor hover:!bg-buttonColor hover:!scale-95 rounded-md"
              >
                Tạo mới
              </Button>
            </div>
          </Form>
        </div>

        {/* Modals */}
        <Modal
          title={<span className="text-lg font-medium">Xem lịch</span>}
          visible={isModalCalendarVisible}
          onCancel={handleCancelCalendar}
          onOk={handleOk}
          cancelText="Quay lại"
          className="rounded-lg"
          width={720}
        >
          <div className="min-h-[400px]">
            {scheduleTypeName === "ProcessMonth" && (
              <ReadOnlyMonthCalendar2
                daysOfSchedule={daysOfSchedule}
                expectedStartTime={expectedStartTime}
                expectedEndTime={expectedEndTime}
              />
            )}
            {scheduleTypeName === "ProcessWeek" && (
              <ReadOnlyWeekCalendar2
                daysOfSchedule={daysOfSchedule}
                expectedStartTime={expectedStartTime}
                expectedEndTime={expectedEndTime}
              />
            )}
          </div>
        </Modal>

        {isModalVisible && (
          <VisitorSearchModal
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            onVisitorSelected={handleVisitorSelection}
          />
        )}
      </div>
    </Spin>
  );
};

export default CreateNewVisitList;
