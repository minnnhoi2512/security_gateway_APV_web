import { Form, Input, Button, Select, message } from "antd";
import {
  useCreateNewScheduleMutation,
  useGetListScheduleQuery,
} from "../services/schedule.service";
import ScheduleType from "../types/scheduleType";
import { useNavigate } from "react-router-dom";
import { useGetListScheduleTypeQuery } from "../services/scheduleType.service";
import { useState } from "react";

const { Option } = Select;

const CreateNewSchedule: React.FC = () => {
  const [form] = Form.useForm();
  const [createNewSchedule, { isLoading }] = useCreateNewScheduleMutation();
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const { data } = useGetListScheduleTypeQuery();
  const { refetch: refetchScheduleList } = useGetListScheduleQuery({
    pageNumber: -1,
    pageSize: -1,
  });

  // State to track selected schedule type
  const [selectedScheduleType, setSelectedScheduleType] = useState<
    number | null
  >(null);
  const [isProcessWeek, setIsProcessWeek] = useState(false);
  const [isProcessMonth, setIsProcessMonth] = useState(false);
  const [showDaysInput, setShowDaysInput] = useState(false); // State to track showing days input
  console.log(selectedScheduleType);
  const dayOptions = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 7 },
  ];

  const handleScheduleTypeChange = (value: number) => {
    // Find selected schedule type
    const selectedType = data?.find((type) => type.scheduleTypeId === value);

    if (selectedType) {
      setSelectedScheduleType(value);
      setIsProcessWeek(selectedType.scheduleTypeName === "ProcessWeek");
      setIsProcessMonth(selectedType.scheduleTypeName === "ProcessMonth");
      setShowDaysInput(true); // Show days input for all types

      // If "VisitDaily" is selected, set duration to 1 and hide days input
      if (selectedType.scheduleTypeName === "VisitDaily") {
        form.setFieldsValue({ duration: 1 }); // Set duration to 1
        setShowDaysInput(false); // Hide daysOfProcess input
      }
    } else {
      setShowDaysInput(false); // Hide if no type selected
    }
  };

  const handleFinish = async (values: ScheduleType) => {
    try {
      const parsedValues: any = {
        ...values,
        duration: Number(values.duration),
        status: values.status === true,
        createById: parseInt(userId || "0", 10),
        // Join daysOfProcess as comma-separated values if 'ProcessWeek' or 'ProcessMonth' is selected
        daysOfProcess: Array.isArray(values.daysOfProcess)
          ? values.daysOfProcess.join(",")
          : values.daysOfProcess,
      };
      await createNewSchedule(parsedValues).unwrap();
      message.success("Dự án đã được tạo thành công!");
      await refetchScheduleList();
      navigate(-1);
      form.resetFields();
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tạo dự án.");
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

      <Form.Item
        label="Thời gian kéo dài (ngày)"
        name="duration"
        rules={[
          { required: true, message: "Vui lòng nhập thời gian kéo dài!" },
        ]}
      >
        <Input type="number" placeholder="Nhập số ngày" />
      </Form.Item>

      <Form.Item
        label="Miêu tả"
        name="description"
        rules={[{ required: true, message: "Vui lòng nhập miêu tả!" }]}
      >
        <Input.TextArea placeholder="Nhập miêu tả dự án" rows={4} />
      </Form.Item>

      <Form.Item
        label="Trạng thái"
        name="status"
        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
      >
        <Select placeholder="Chọn trạng thái">
          <Option value="true">Còn hiệu lực</Option>
          <Option value="false">Hết hiệu lực</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Loại dự án"
        name="scheduleTypeId"
        rules={[{ required: true, message: "Vui lòng chọn loại lịch trình!" }]}
      >
        <Select
          placeholder="Chọn loại lịch trình"
          onChange={handleScheduleTypeChange}
        >
          {data?.map((scheduleType) => (
            <Option
              key={scheduleType.scheduleTypeId}
              value={scheduleType.scheduleTypeId}
            >
              {scheduleType.scheduleTypeName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {showDaysInput && (
        <Form.Item
          label={
            isProcessWeek
              ? "Chọn ngày thực hiện"
              : isProcessMonth
              ? "Chọn ngày trong tháng"
              : "Ngày thực hiện"
          }
          name="daysOfProcess"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn hoặc nhập ngày thực hiện!",
            },
          ]}
        >
          {isProcessWeek ? (
            <Select mode="multiple" placeholder="Chọn ngày trong tuần">
              {dayOptions.map((day) => (
                <Option key={day.value} value={day.value}>
                  {day.label}
                </Option>
              ))}
            </Select>
          ) : isProcessMonth ? (
            <Select mode="multiple" placeholder="Chọn ngày trong tháng">
              {Array.from({ length: 31 }, (_, index) => (
                <Option key={index + 1} value={index + 1}>
                  {index + 1}
                </Option>
              ))}
            </Select>
          ) : (
            <Input placeholder="Nhập ngày thực hiện" />
          )}
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Tạo mới dự án
        </Button>
        <Button
          type="default"
          onClick={() => {
            navigate(-1);
          }}
        >
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateNewSchedule;
