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
    const scheduleNewName = form.getFieldValue('scheduleName');
    try {
      const parsedValues = {
        ...scheduleData,
        scheduleName : scheduleNewName,
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
      notification.success({ message: "Dự án đã được cập nhật thành công!" });
      onUpdateSuccess(); // Call the callback to close the modal
    } catch (error) {
      notification.error({ message: "Đã xảy ra lỗi khi cập nhật dự án." });
    }
  };
  return (
    <div className="flex justify-center items-center p-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="grid grid-cols-3 gap-6"
      >
        <div className="col-span-2 space-y-4">
          <Form.Item
            label={
              <span className="text-blue-500 font-semibold text-lg">
                Tên lịch trình
              </span>
            }
            name="scheduleName"
            rules={[
              { required: true, message: "Vui lòng nhập tên lịch trình!" },
              { min: 5, message: "tên lịch trình phải có ít nhất 5 ký tự" },
              {
                pattern: /^[\p{L}\d\s.,!?;:()-]+$/u,
                message: "tên lịch trình chỉ chứa chữ cái, số và dấu câu cơ bản",
              },
            ]}
          >
            <Input placeholder="Nhập tên lịch trình" className="rounded-md" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-blue-500 font-semibold text-lg">
                Trạng thái
              </span>
            }
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái" className="rounded-md">
              <Option value="true">Còn hiệu lực</Option>
              <Option value="false">Hết hiệu lực</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span className="text-blue-500 font-semibold text-lg">
                Miêu tả
              </span>
            }
            name="description"
          >
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
          </Form.Item>
        </div>

        <div className="col-span-1 space-y-4">
          <Form.Item
            label={
              <span className="text-blue-500 font-semibold text-lg">
                Loại lịch trình
              </span>
            }
          >
            {renderScheduleTypeTag(
              scheduleData?.scheduleType?.scheduleTypeName
            )}
          </Form.Item>
          {isProcessWeek && (
            <div>
              <h2 className="text-lg text-gray-600 font-semibold">
                Chọn Thứ cho Lịch trình
              </h2>
              <div className="flex space-x-2 p-4 bg-blue-50 rounded-lg shadow-lg">
                {dayOptions.map((day, index) => (
                  <div
                    key={day}
                    className={clsx(
                      "flex items-center justify-center w-12 h-10 rounded-full cursor-pointer transition-all duration-200",
                      {
                        "bg-purple-600 text-white": selectedDays.includes(
                          dayValues[index]
                        ),
                        "text-gray-600": !selectedDays.includes(
                          dayValues[index]
                        ),
                        "hover:bg-gray-100": !selectedDays.includes(
                          dayValues[index]
                        ),
                        "border-2 border-transparent hover:border-purple-600":
                          true, // Add consistent border effect
                      }
                    )}
                    onClick={() => handleDayClick(dayValues[index])}
                  >
                    <span className="text-xs font-semibold">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProcessMonth && (
            <div>
              <h2 className="text-lg text-gray-600 font-semibold">
                Chọn Ngày cho Lịch trình
              </h2>
              <div className="p-4 bg-blue-50 rounded-lg shadow-lg w-full">
                <div className="grid grid-cols-7 gap-2 p-4 bg-white rounded-lg shadow-md max-w-xs mx-auto">
                  {Array.from({ length: 31 }, (_, index) => index + 1).map(
                    (date) => (
                      <div
                        key={date}
                        className={clsx(
                          "flex items-center justify-center w-9 h-10 rounded-full cursor-pointer transition-all duration-200",
                          {
                            "bg-purple-600 text-white":
                              selectedDates.includes(date),
                            "text-gray-600": !selectedDates.includes(date),
                            "hover:bg-gray-100": !selectedDates.includes(date),
                          }
                        )}
                        onClick={() => handleDateClick(date)}
                      >
                        <span className="text-xs font-semibold">{date}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-3 flex justify-center space-x-6 mt-6">
          <Button
            onClick={handlePreviewCalendar}
            className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg px-6 py-2 font-semibold"
          >
            Xem trước lịch
          </Button>

          <Button
            htmlType="submit"
            loading={isLoading}
            className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-lg px-6 py-2 font-semibold"
          >
            Cập nhật lịch trình
          </Button>
        </div>
      </Form>

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
    </div>
  );
};

export default DetailSchedule;
