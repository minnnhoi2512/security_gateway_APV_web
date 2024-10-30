import {
  Form,
  Input,
  Button,
  Select,
  message,
  Checkbox,
  Modal,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import {
  useUpdateScheduleMutation,
  useGetDetailScheduleQuery,
} from "../services/schedule.service";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { stateFromHTML } from "draft-js-import-html";
import ReadOnlyMonthCalendar from "../components/ReadOnlyMonthCalendar";
import ReadOnlyWeekCalendar from "../components/ReadOnlyWeekCalendar";
import Schedule from "../types/scheduleType";

const { Option } = Select;

const DetailSchedule = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const scheduleId = Number(id);
  const { data: scheduleData, refetch } = useGetDetailScheduleQuery({
    idSchedule: scheduleId,
  });
  const [updateSchedule, { isLoading }] = useUpdateScheduleMutation();

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [daysOfSchedule, setDaysOfSchedule] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  // const [isCreateSuccess, setIsCreateSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (scheduleData) {
      const initialContentState = stateFromHTML(scheduleData.description);

      const daysArray = scheduleData.daysOfSchedule
        ? scheduleData.daysOfSchedule.split(",").map(Number)
        : [];
      setSelectedDays(daysArray);

      form.setFieldsValue({
        ...scheduleData,
        status: scheduleData.status === true,
        scheduleTypeName: scheduleData.scheduleType?.scheduleTypeName,
        daysOfSchedule: scheduleData.daysOfSchedule,
      });

      const scheduleTypeName = scheduleData.scheduleType?.scheduleTypeName;
      setDaysOfSchedule(scheduleData?.daysOfSchedule);
      setEditorState(EditorState.createWithContent(initialContentState));
      setIsProcessWeek(scheduleTypeName === "ProcessWeek");
      setIsProcessMonth(scheduleTypeName === "ProcessMonth");
    }
  }, [scheduleData, form]);

  const onEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
  };

  const handleCloseModal = () => {
    setShowCalendarModal(false);
  };

  const handlePreviewCalendar = () => {
    setShowCalendarModal(true);
  };

  const handleDaysOfScheduleChange = (checkedValues: any) => {
    const dayString = checkedValues.join(",");
    setDaysOfSchedule(dayString);
    setSelectedDays(checkedValues);
  };

  const dayOptions = [
    { label: "Hai", value: 1 },
    { label: "Ba", value: 2 },
    { label: "Tư", value: 3 },
    { label: "Năm", value: 4 },
    { label: "Sáu", value: 5 },
    { label: "Bảy", value: 6 },
    { label: "CN", value: 7 },
  ];

  const renderScheduleTypeTag = (scheduleTypeName: any) => {
    let tagColor = "default"; // Default color

    switch (scheduleTypeName) {
      case "VisitDaily":
        return <Tag color="blue">Theo ngày</Tag>;
      case "ProcessWeek":
        return <Tag color="green">Theo tuần</Tag>;
      case "ProcessMonth":
        return <Tag color="orange">Theo tháng</Tag>;
      default:
        return <Tag color={tagColor}>{scheduleTypeName}</Tag>; // Fallback if needed
    }
  };

  const [isProcessWeek, setIsProcessWeek] = useState(false);
  const [isProcessMonth, setIsProcessMonth] = useState(false);

  const handleFinish = async (values: any) => {
    try {
      // console.log(values);
      const contentState = editorState.getCurrentContent();
      const htmlContent = stateToHTML(contentState);

      // Construct parsedValues with form values or existing schedule data
      const parsedValues: Schedule = {
        scheduleName: values.scheduleName || scheduleData.scheduleName,
        description: htmlContent,
        status: values.status === true || scheduleData.status,
        daysOfSchedule: daysOfSchedule || scheduleData.daysOfSchedule,
        duration: scheduleData.duration || 1,
      };
      console.log(parsedValues);
      const result = await updateSchedule({
        schedule: parsedValues,
        idSchedule: scheduleId,
      }).unwrap();
      // setIsCreateSuccess()
      refetch();
      message.success("Dự án đã được cập nhật thành công!");
      navigate("/schedule", { state: { result: result } });
    } catch (error) {
      console.log(error);
      message.error("Đã xảy ra lỗi khi cập nhật dự án.");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        label="Tiêu đề"
        name="scheduleName"
        rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
      >
        <Input placeholder="Nhập tiêu đề dự án" />
      </Form.Item>
      {renderScheduleTypeTag(scheduleData?.scheduleType?.scheduleTypeName)}
      <Form.Item
        label="Miêu tả"
        name="description"
        rules={[{ required: true, message: "Vui lòng nhập miêu tả!" }]}
      >
        <Editor
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
          toolbarClassName="flex justify-between px-2"
          wrapperClassName="border border-gray-300 rounded-lg"
          editorClassName="p-4 h-40 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Form.Item>

      <Form.Item
        label="Trạng thái"
        name="status"
        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
      >
        <Select placeholder="Chọn trạng thái" style={{ width: "100%" }}>
          <Option value={true}>Còn hiệu lực</Option>
          <Option value={false}>Hết hiệu lực</Option>
        </Select>
      </Form.Item>

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
      {scheduleData?.daysOfSchedule.length > 0 && (
        <Button type="primary" onClick={handlePreviewCalendar} className="mt-4">
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

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Cập nhật lịch trình
        </Button>
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DetailSchedule;
