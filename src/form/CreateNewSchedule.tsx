import {
  Form,
  Input,
  Button,
  Select,
  message,
  Checkbox,
  Modal,
  Card,
  Typography,
  notification,
} from "antd";
import { useCreateNewScheduleMutation } from "../services/schedule.service";
import ScheduleType from "../types/scheduleType";
import { useNavigate } from "react-router-dom";
import { useGetListScheduleTypeQuery } from "../services/scheduleType.service";
import { useState } from "react";
import ReadOnlyMonthCalendar from "../components/ReadOnlyMonthCalendar";
import ReadOnlyWeekCalendar from "../components/ReadOnlyWeekCalendar";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { useGetListStaffByDepartmentManagerQuery } from "../services/user.service";
import ReactQuill from "react-quill";

const { Option } = Select;
const { Title } = Typography;

const CreateNewSchedule: React.FC = () => {
  const [form] = Form.useForm();
  const [createNewSchedule, { isLoading }] = useCreateNewScheduleMutation();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const { data } = useGetListScheduleTypeQuery();

  const [selectedScheduleType, setSelectedScheduleType] = useState<
    number | null
  >(null);
  const [isProcessWeek, setIsProcessWeek] = useState(false);
  const [isProcessMonth, setIsProcessMonth] = useState(false);
  const [isVisitDaily, setIsVisitDaily] = useState(false);
  const [daysOfSchedule, setDaysOfSchedule] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [editorState, setEditorState] = useState<string>("");
  const dayOptions = [
    { label: "Hai", value: 1 },
    { label: "Ba", value: 2 },
    { label: "Tư", value: 3 },
    { label: "Năm", value: 4 },
    { label: "Sáu", value: 5 },
    { label: "Bảy", value: 6 },
    { label: "CN", value: 7 },
  ];

  const handlePreviewCalendar = () => {
    setShowCalendarModal(true);
  };
  const onEditorStateChange = (newState: string) => {
    setEditorState(newState);
  };
  const handleCloseModal = () => {
    setShowCalendarModal(false);
  };
  const filteredScheduleTypes =
    userRole === "Admin"
      ? data // Admin can see all types
      : data?.filter((type) => type.scheduleTypeName !== "VisitDaily"); // Non-admins cannot see VisitDaily

  const handleScheduleTypeChange = (value: number) => {
    setDaysOfSchedule("");
    setSelectedDays([]); // Clear the checkbox selections
    form.setFieldsValue({ daysOfSchedule: undefined });

    const selectedType = filteredScheduleTypes?.find(
      (type) => type.scheduleTypeId === value
    );
    if (selectedType) {
      setSelectedScheduleType(value);
      setIsProcessWeek(selectedType.scheduleTypeName === "ProcessWeek");
      setIsProcessMonth(selectedType.scheduleTypeName === "ProcessMonth");
      setIsVisitDaily(selectedType.scheduleTypeName === "VisitDaily");
    }
  };

  const handleDaysOfScheduleChange = (checkedValues: any) => {
    const dayString = checkedValues.join(",");
    setDaysOfSchedule(dayString);
    setSelectedDays(checkedValues);
  };

  const handleFinish = async (values: ScheduleType) => {
    try {
      const parsedValues: any = {
        ...values,
        description: editorState,
        duration: 1,
        status: true,
        createById: parseInt(userId || "0", 10),
        daysOfSchedule: daysOfSchedule,
        scheduleTypeId: selectedScheduleType,
      };
      await createNewSchedule(parsedValues).unwrap();
      notification.success({ message: "Lịch trình đã được tạo thành công!" });
      form.resetFields();
      navigate("/schedule");
    } catch (error) {
      console.error("Error creating new schedule:", error);
      notification.error({ message: "Đã xảy ra lỗi khi tạo lịch trình." });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-sm rounded-lg">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="space-y-6"
      >
        {/* Form Header */}
        <div className="text-xl font-medium text-gray-800 mb-6">
          Tạo lịch trình mới
        </div>



        {/* Schedule Type */}
        <div className="bg-white rounded-lg p-4">
        <Form.Item
          label={<span className="font-medium">Tiêu đề</span>}
          name="scheduleName"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề lịch trình" className="w-full" />
        </Form.Item>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📅</span>
            <span className="font-medium">Loại lịch trình</span>
          </div>
          {/* <Form.Item
            name="scheduleTypeId"
            className="mb-4"
            rules={[
              { required: true, message: "Vui lòng chọn loại lịch trình!" },
            ]}
          >
            <Select
              placeholder="Chọn loại lịch trình"
              onChange={handleScheduleTypeChange}
              className="w-full"
            >
              {filteredScheduleTypes?.map((scheduleType) => (
                <Option
                  key={scheduleType.scheduleTypeId}
                  value={scheduleType.scheduleTypeId}
                >
                  <div className="flex items-center gap-2">
                    {scheduleType.scheduleTypeName === "ProcessWeek" ? (
                      <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                        Theo tuần
                      </div>
                    ) : scheduleType.scheduleTypeName === "ProcessMonth" ? (
                      <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                        Theo tháng
                      </div>
                    ) : (
                      scheduleType.scheduleTypeName
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item> */}
          <Form.Item
            name="scheduleTypeId"
            className="mb-4"
            rules={[
              { required: true, message: "Vui lòng chọn loại lịch trình!" },
            ]}
          >
            <Select
              placeholder="Chọn loại lịch trình"
              onChange={handleScheduleTypeChange}
              className="w-full"
            >
              {filteredScheduleTypes?.map((scheduleType) => (
                <Option
                  key={scheduleType.scheduleTypeId}
                  value={scheduleType.scheduleTypeId}
                >
                  <div className="flex items-center gap-2">
                    {scheduleType.scheduleTypeName === "ProcessWeek" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Theo tuần</span>
                      </div>
                    ) : scheduleType.scheduleTypeName === "ProcessMonth" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Theo tháng</span>
                      </div>
                    ) : (
                      scheduleType.scheduleTypeName
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Week/Month Selection */}
          {(isProcessWeek || isProcessMonth) && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">📅</span>
                <span className="font-medium">
                  {isProcessWeek ? "Chọn thứ" : "Chọn ngày"}
                </span>
              </div>
              <Form.Item name="daysOfSchedule" className="mb-4">
                {isProcessWeek ? (
                  <Checkbox.Group
                    value={selectedDays}
                    onChange={handleDaysOfScheduleChange}
                    className="flex flex-wrap gap-2"
                  >
                    {dayOptions.map((day) => (
                      <label
                        key={day.value}
                        className={`inline-flex items-center justify-center px-6 py-2 rounded-md cursor-pointer select-none transition-colors ${
                          selectedDays.includes(day.value)
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-600 border border-gray-200"
                        }`}
                      >
                        <Checkbox value={day.value} className="hidden" />
                        {day.label}
                      </label>
                    ))}
                  </Checkbox.Group>
                ) : (
                  <Checkbox.Group
                    value={selectedDays}
                    onChange={handleDaysOfScheduleChange}
                    className="grid grid-cols-7 gap-2"
                  >
                    {Array.from({ length: 31 }, (_, index) => (
                      <label
                        key={index + 1}
                        className={`inline-flex items-center justify-center p-2 rounded-md cursor-pointer select-none transition-colors ${
                          selectedDays.includes(index + 1)
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-600 border border-gray-200"
                        }`}
                      >
                        <Checkbox value={index + 1} className="hidden" />
                        <span>{index + 1}</span>
                      </label>
                    ))}
                  </Checkbox.Group>
                )}
              </Form.Item>

              {daysOfSchedule.length > 0 && (
                <Button
                  type="primary"
                  onClick={handlePreviewCalendar}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Xem trước lịch
                </Button>
              )}
            </>
          )}
        </div>

        {/* Title & Description */}
        <div className="bg-white rounded-lg p-4">
          {/* <Form.Item
            label={<span className="font-medium">Tiêu đề</span>}
            name="scheduleName"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề lịch trình" className="w-full" />
          </Form.Item> */}

          <Form.Item
            name="description"
            label={<span className="font-medium">Mô tả</span>}
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <ReactQuill
              value={editorState}
              onChange={setEditorState}
              className="bg-white"
              style={{ height: "200px" }}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "clean"],
                ],
              }}
            />
          </Form.Item>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 hover:!border-gray-200 hover:!text-gray-400"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="bg-buttonColor hover:!bg-buttonColor hover:!scale-95"
          >
            Tạo mới lịch trình
          </Button>
        </div>

        {/* Calendar Preview Modal */}
        <Modal
          visible={showCalendarModal}
          onCancel={handleCloseModal}
          footer={null}
          title={<span className="font-medium">Xem lịch</span>}
          width={600}
          className="rounded-lg"
        >
          {isProcessMonth ? (
            <ReadOnlyMonthCalendar daysOfSchedule={daysOfSchedule} />
          ) : isProcessWeek ? (
            <ReadOnlyWeekCalendar daysOfSchedule={daysOfSchedule} />
          ) : null}
        </Modal>
      </Form>
    </Card>
  );
};

export default CreateNewSchedule;
