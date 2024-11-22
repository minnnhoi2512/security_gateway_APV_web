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
      message.success("Dự án đã được tạo thành công!");
      form.resetFields();
      navigate("/schedule");
    } catch (error) {
      console.error("Error creating new schedule:", error);
      message.error("Đã xảy ra lỗi khi tạo dự án.");
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: "auto", padding: 24 }}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Loại dự án"
          name="scheduleTypeId"
          rules={[
            { required: true, message: "Vui lòng chọn loại lịch trình!" },
          ]}
        >
          <Select
            placeholder="Chọn loại lịch trình"
            onChange={handleScheduleTypeChange}
          >
            {filteredScheduleTypes?.map((scheduleType) => (
              <Option
                key={scheduleType.scheduleTypeId}
                value={scheduleType.scheduleTypeId}
              >
                {scheduleType.scheduleTypeName === "ProcessWeek"
                  ? "Theo tuần"
                  : scheduleType.scheduleTypeName === "ProcessMonth"
                  ? "Theo tháng"
                  : scheduleType.scheduleTypeName === "Project"
                  ? "Dự án"
                  : scheduleType.scheduleTypeName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={
            isProcessWeek
              ? "Chọn thứ trong tuần"
              : isProcessMonth
              ? "Chọn ngày trong tháng"
              : "Ngày thực hiện"
          }
          name="daysOfSchedule"
        >
          {isProcessWeek ? (
            <Checkbox.Group
              options={dayOptions}
              value={selectedDays}
              onChange={handleDaysOfScheduleChange}
            />
          ) : isProcessMonth ? (
            <Checkbox.Group
              value={selectedDays}
              onChange={handleDaysOfScheduleChange}
              className="grid grid-cols-7 gap-2"
            >
              {Array.from({ length: 31 }, (_, index) => (
                <Checkbox key={index + 1} value={index + 1}>
                  Ngày {index + 1}
                </Checkbox>
              ))}
            </Checkbox.Group>
          ) : null}

          {daysOfSchedule.length > 0 && (
            <Button
              type="primary"
              onClick={handlePreviewCalendar}
              className="mt-4"
            >
              Xem trước lịch
            </Button>
          )}

          <Modal
            visible={showCalendarModal}
            onCancel={handleCloseModal}
            footer={null}
            title="Xem lịch"
          >
            {isProcessMonth ? (
              <ReadOnlyMonthCalendar daysOfSchedule={daysOfSchedule} />
            ) : isProcessWeek ? (
              <ReadOnlyWeekCalendar daysOfSchedule={daysOfSchedule} />
            ) : null}
          </Modal>
        </Form.Item>
        <Form.Item
          label="Tiêu đề"
          name="scheduleName"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề dự án" />
        </Form.Item>
        <Form.Item
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
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Tạo mới dự án
          </Button>
          <Button
            type="default"
            onClick={() => {
              navigate(-1);
            }}
            style={{ marginLeft: 8 }}
          >
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateNewSchedule;
