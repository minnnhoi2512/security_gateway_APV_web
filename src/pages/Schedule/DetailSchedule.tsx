import {
  Form,
  Input,
  Button,
  Select,
  message,
  Modal,
  Tag,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import {
  useUpdateScheduleMutation,
  useGetDetailScheduleQuery,
  useGetDepartmentSchedulesQuery,
  useGetListScheduleQuery,
} from "../../services/schedule.service";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { stateFromHTML } from "draft-js-import-html";
import ReadOnlyMonthCalendar from "../../components/ReadOnlyMonthCalendar";
import ReadOnlyWeekCalendar from "../../components/ReadOnlyWeekCalendar";
import clsx from "clsx";
import { useNavigate } from "react-router";
import ReactQuill from "react-quill";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const dayOptions = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];
const dayValues = [1, 2, 3, 4, 5, 6, 7];

type ScheduleType = "DailyVisit" | "ProcessWeek" | "ProcessMonth" | string;

const DetailSchedule = ({ scheduleId, onUpdateSuccess }: any) => {
  const [form] = Form.useForm();
  const userId = Number(localStorage.getItem("userId"));
  const { data: scheduleData, refetch } = useGetDetailScheduleQuery({
    idSchedule: scheduleId,
  });
  const [updateSchedule, { isLoading }] = useUpdateScheduleMutation();
  const { refetch: scheduleUserRefetch } = useGetDepartmentSchedulesQuery({
    departmenManagerId: userId,
    pageNumber: -1,
    pageSize: -1,
  });
  const { refetch: refetchAll } = useGetListScheduleQuery({
    pageNumber: -1,
    pageSize: -1,
  });
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [daysOfSchedule, setDaysOfSchedule] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const navigate = useNavigate();

  const [isProcessWeek, setIsProcessWeek] = useState(false);
  const [isProcessMonth, setIsProcessMonth] = useState(false);
  const [editableDescription, setEditableDescription] = useState<string>("");

  useEffect(() => {
    if (scheduleData) {
      const daysArray = scheduleData.daysOfSchedule
        ? scheduleData.daysOfSchedule.split(",").map(Number)
        : [];
      setSelectedDays(daysArray);
      setEditableDescription(scheduleData.description || "");
      form.setFieldsValue({
        ...scheduleData,
        status: scheduleData.status.toString(),
        scheduleTypeName: scheduleData.scheduleType?.scheduleTypeName,
        daysOfSchedule: scheduleData.daysOfSchedule,
      });
      setDaysOfSchedule(scheduleData.daysOfSchedule || "");
      const scheduleTypeName = scheduleData.scheduleType?.scheduleTypeName;
      setIsProcessWeek(scheduleTypeName === "ProcessWeek");
      setIsProcessMonth(scheduleTypeName === "ProcessMonth");

      if (scheduleTypeName === "ProcessMonth" && scheduleData.daysOfSchedule) {
        setSelectedDates(daysArray);
      }
    }
  }, [scheduleData, form]);

  const initialContentState = scheduleData?.description
    ? stateFromHTML(scheduleData.description)
    : null;

  const [editorState, setEditorState] = useState<EditorState>(
    initialContentState
      ? EditorState.createWithContent(initialContentState)
      : EditorState.createEmpty()
  );

  const onEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
  };

  const handleCloseModal = () => setShowCalendarModal(false);
  const handleDescriptionChange = (value: string) => {
    setEditableDescription(value);
  };
  const handlePreviewCalendar = () => {
    setDaysOfSchedule(
      isProcessMonth ? selectedDates.join(",") : selectedDays.join(",")
    );
    setShowCalendarModal(true);
  };

  const handleDayClick = (dayValue: number) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(dayValue)
        ? prevDays.filter((d) => d !== dayValue)
        : [...prevDays, dayValue]
    );
  };

  const handleDateClick = (date: number) => {
    setSelectedDates((prevDates) =>
      prevDates.includes(date)
        ? prevDates.filter((d) => d !== date)
        : [...prevDates, date]
    );
  };

  const renderScheduleTypeTag = (
    scheduleTypeName: ScheduleType | undefined
  ) => {
    const tagColors: Record<ScheduleType, string> = {
      DailyVisit: "blue",
      ProcessWeek: "green",
      ProcessMonth: "orange",
    };
    return (
      <Tag
        color={tagColors[scheduleTypeName as ScheduleType] || "default"}
        className="px-3 py-1 rounded-full text-sm font-medium"
      >
        {scheduleTypeName === "DailyVisit"
          ? "Theo ngày"
          : scheduleTypeName === "ProcessWeek"
          ? "Theo tuần"
          : scheduleTypeName === "ProcessMonth"
          ? "Theo tháng"
          : scheduleTypeName}
      </Tag>
    );
  };

  const handleFinish = async (values: { status: string }) => {
    // console.log(scheduleData);
    const scheduleNewName = form.getFieldValue("scheduleName");
    try {
      const parsedValues = {
        ...scheduleData,
        scheduleName: scheduleNewName,
        duration: 1,
        description: editableDescription,
        createById: scheduleData!.createBy.userId,
        scheduleTypeId: scheduleData!.scheduleType!.scheduleTypeId,
        status: values.status === "true",
        daysOfSchedule: isProcessMonth
          ? selectedDates.join(",")
          : selectedDays.join(","),
      };
      await updateSchedule({
        schedule: parsedValues,
        idSchedule: scheduleId,
      }).unwrap();
      refetch();
      scheduleUserRefetch();
      refetchAll();
      notification.success({ message: "Dự án đã được cập nhật thành công!" });
      onUpdateSuccess(); // Call the callback to close the modal
    } catch (error) {
      notification.error({ message: "Đã xảy ra lỗi khi cập nhật dự án." });
    }
  };
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="space-y-4"
      >
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-8 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Form.Item
                label={
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                    <EditOutlined className="text-blue-500" />
                    Tên lịch trình
                  </span>
                }
                name="scheduleName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên lịch trình!" },
                  { min: 5, message: "Tên lịch trình phải có ít nhất 5 ký tự" },
                ]}
              >
                <Input
                  placeholder="Nhập tên lịch trình"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                    <FileTextOutlined className="text-blue-500" />
                    Miêu tả
                  </span>
                }
                name="description"
              >
                <ReactQuill
                  value={editableDescription}
                  onChange={handleDescriptionChange}
                  className="h-40 bg-white rounded-md"
                  theme="snow"
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "clean"],
                    ],
                  }}
                  placeholder="Nhập mô tả chi tiết..."
                />
              </Form.Item>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Form.Item
                label={
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                    <CalendarOutlined className="text-blue-500" />
                    Loại lịch trình
                  </span>
                }
                className="mb-4"
              >
                {renderScheduleTypeTag(
                  scheduleData?.scheduleType?.scheduleTypeName
                )}
              </Form.Item>

              <Form.Item
                label={
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                    <CheckCircleOutlined className="text-blue-500" />
                    Trạng thái
                  </span>
                }
                name="status"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái" className="rounded-md">
                  <Option value="true">
                    <span className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-green-500" />
                      Còn hiệu lực
                    </span>
                  </Option>
                  <Option value="false">
                    <span className="flex items-center gap-2">
                      <CloseCircleOutlined className="text-red-500" />
                      Hết hiệu lực
                    </span>
                  </Option>
                </Select>
              </Form.Item>

              {isProcessWeek && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">
                    Chọn thứ
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {dayOptions.map((day, index) => (
                      <div
                        key={day}
                        onClick={() => handleDayClick(dayValues[index])}
                        className={clsx(
                          "flex items-center justify-center h-8 rounded-md cursor-pointer transition-all text-xs font-medium",
                          selectedDays.includes(dayValues[index])
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isProcessMonth && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">
                    Chọn ngày
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                      <div
                        key={date}
                        onClick={() => handleDateClick(date)}
                        className={clsx(
                          "flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-all text-xs font-medium",
                          selectedDates.includes(date)
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {date}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handlePreviewCalendar}
            icon={<CalendarOutlined />}
            className="rounded-md px-4 h-8 border-blue-500 text-blue-500 hover:text-blue-600 hover:border-blue-600"
          >
            Xem lịch
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            icon={<CheckCircleOutlined />}
            className="rounded-md px-4 h-8 bg-green-500 border-none hover:!bg-green-600"
          >
            Cập nhật
          </Button>
        </div>
        <Modal
        visible={showCalendarModal}
        onCancel={handleCloseModal}
        footer={null}
        title="Xem lịch"
        centered
        width="30%"
        style={{ top: "-5.5%" }}
      >
        {isProcessMonth ? (
          <ReadOnlyMonthCalendar daysOfSchedule={daysOfSchedule} />
        ) : isProcessWeek ? (
          <ReadOnlyWeekCalendar daysOfSchedule={daysOfSchedule} />
        ) : null}
      </Modal>
      </Form>
 
    </div>
  );
};

export default DetailSchedule;
