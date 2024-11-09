import {
  Form,
  Input,
  Button,
  Select,
  message,
  Modal,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import {
  useUpdateScheduleMutation,
  useGetDetailScheduleQuery,
} from "../../services/schedule.service";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { stateFromHTML } from "draft-js-import-html";
import ReadOnlyMonthCalendar from "../../components/ReadOnlyMonthCalendar";
import ReadOnlyWeekCalendar from "../../components/ReadOnlyWeekCalendar";
import clsx from "clsx";

const { Option } = Select;

const dayOptions = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];
const dayValues = [1, 2, 3, 4, 5, 6, 7];

type ScheduleType = "DailyVisit" | "ProcessWeek" | "ProcessMonth" | string;

const DetailSchedule = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const scheduleId = Number(id);
  const { data: scheduleData } = useGetDetailScheduleQuery({
    idSchedule: scheduleId,
  });
  const [updateSchedule, { isLoading }] = useUpdateScheduleMutation();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [daysOfSchedule, setDaysOfSchedule] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const navigate = useNavigate();

  const [isProcessWeek, setIsProcessWeek] = useState(false);
  const [isProcessMonth, setIsProcessMonth] = useState(false);

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

  const renderScheduleTypeTag = (scheduleTypeName: ScheduleType | undefined) => {
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
    try {
      const contentState = editorState.getCurrentContent();
      const htmlContent = stateToHTML(contentState);
      const parsedValues = {
        ...scheduleData,
        duration: 1,
        description: htmlContent,
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
      message.success("Dự án đã được cập nhật thành công!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi cập nhật dự án.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pt-8 px-4">
      <div className="w-full bg-white shadow-lg rounded-xl p-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-4">Cập nhật Lịch trình</h1>

        <Form form={form} layout="vertical" onFinish={handleFinish} className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-start">
            <Form.Item
              label={<span className="text-blue-500 font-semibold">Tiêu đề</span>}
              name="scheduleName"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề!" },
                { min: 5, message: "Tiêu đề phải có ít nhất 5 ký tự" },
                {
                  pattern: /^[\p{L}\d\s.,!?;:()-]+$/u,
                  message: "Tiêu đề chỉ chứa chữ cái, số và dấu câu cơ bản",
                },
              ]}
              className="col-span-2"
            >
              <Input
                placeholder="Nhập tiêu đề dự án"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item label="Loại">
              {renderScheduleTypeTag(scheduleData?.scheduleType?.scheduleTypeName)}
            </Form.Item>

            <Form.Item
              label={<span className="text-blue-500 font-semibold">Trạng thái</span>}
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
              className="col-span-3"
            >
              <Select placeholder="Chọn trạng thái" className="rounded-md">
                <Option value="true">Còn hiệu lực</Option>
                <Option value="false">Hết hiệu lực</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="text-blue-500 font-semibold">Miêu tả</span>}
            name="description"
            validateTrigger="onBlur"
            rules={[
              { required: true, message: "Vui lòng nhập miêu tả!" },
              { min: 5, message: "Miêu tả phải có ít nhất 5 ký tự" },
              {
                pattern: /^[\p{L}\d\s.,!?;:()-]+$/u,
                message: "Miêu tả chỉ chứa chữ cái, số và dấu câu cơ bản",
              },
            ]}
          >
            <Editor
              editorState={editorState}
              onEditorStateChange={onEditorStateChange}
              toolbarClassName="flex justify-between px-2"
              wrapperClassName="border border-gray-200 rounded-md shadow-sm"
              editorClassName="p-4 h-40 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Form.Item>

          {isProcessWeek && (
            <div>
              <h2 className="text-lg text-gray-600 mb-4 font-semibold">Chọn Thứ cho Lịch trình</h2>
              <div className="p-4 bg-blue-50 rounded-lg shadow-lg">
                <div className="flex items-center justify-between p-4 bg-white rounded-full shadow-md space-x-2">
                  {dayOptions.map((day, index) => (
                    <div
                      key={day}
                      className={clsx(
                        "flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200",
                        {
                          "bg-purple-600 text-white": selectedDays.includes(dayValues[index]),
                          "text-gray-600": !selectedDays.includes(dayValues[index]),
                          "hover:bg-gray-100": !selectedDays.includes(dayValues[index]),
                        }
                      )}
                      onClick={() => handleDayClick(dayValues[index])}
                    >
                      <span className="text-sm font-semibold">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isProcessMonth && (
            <div>
              <h2 className="text-lg text-gray-600 mb-4 font-semibold">Chọn Ngày cho Lịch trình</h2>
              <div className="p-4 bg-blue-50 rounded-lg shadow-lg">
                <div className="grid grid-cols-7 gap-2 p-4 bg-white rounded-lg shadow-md">
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((date) => (
                    <div
                      key={date}
                      className={clsx(
                        "flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200",
                        {
                          "bg-purple-600 text-white": selectedDates.includes(date),
                          "text-gray-600": !selectedDates.includes(date),
                          "hover:bg-gray-100": !selectedDates.includes(date),
                        }
                      )}
                      onClick={() => handleDateClick(date)}
                    >
                      <span className="text-sm font-semibold">{date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-6">
            <Button
              onClick={handlePreviewCalendar}
              className="w-1/3 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 ease-in-out rounded-lg py-2 shadow-md hover:shadow-lg font-semibold"
            >
              Xem trước lịch
            </Button>

            <Button
              htmlType="submit"
              loading={isLoading}
              className="w-1/3 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300 ease-in-out rounded-lg py-2 shadow-md hover:shadow-lg font-semibold"
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
          style={{ top: "-5%" }}
        >
          {isProcessMonth ? (
            <ReadOnlyMonthCalendar daysOfSchedule={daysOfSchedule} />
          ) : isProcessWeek ? (
            <ReadOnlyWeekCalendar daysOfSchedule={daysOfSchedule} />
          ) : null}
        </Modal>
      </div>
    </div>
  );
};

export default DetailSchedule;
