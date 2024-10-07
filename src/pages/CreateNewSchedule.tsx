import { Form, Input, Button, Select, message, Steps } from "antd";
import {
  useCreateNewScheduleMutation,
  useGetListScheduleQuery,
} from "../services/schedule.service";
import ScheduleType from "../types/scheduleType";
import { useNavigate } from "react-router-dom";
import { useGetListScheduleTypeQuery } from "../services/scheduleType.service";
import { useState } from "react";

const { Option } = Select;
const { Step } = Steps;

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
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedScheduleType, setSelectedScheduleType] = useState<number | null>(null);
  const [isProcessWeek, setIsProcessWeek] = useState(false);
  const [isProcessMonth, setIsProcessMonth] = useState(false);
  const [isVisitDaily, setIsVisitDaily] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [daysOfSchedule, setDaysOfSchedule] = useState<string>("");

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
    const selectedType = data?.find((type) => type.scheduleTypeId === value);
    if (selectedType) {
      setSelectedScheduleType(value);
      if (value === 3) { // Assuming 3 is the ID for VisitDaily
        setDuration(1);
        setDaysOfSchedule("1");
      }
      setIsProcessWeek(selectedType.scheduleTypeName === "ProcessWeek");
      setIsProcessMonth(selectedType.scheduleTypeName === "ProcessMonth");
      setIsVisitDaily(selectedType.scheduleTypeName === "VisitDaily");

      // If the selected type is VisitDaily, skip to step 2
      if (selectedType.scheduleTypeName === "VisitDaily") {
        setCurrentStep(2);
      } else {
        setCurrentStep(0); // Reset to step 0 for other types
      }
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDuration(value);
  };

  const handleDaysOfScheduleChange = (value: number[]) => {
    const dayString = value.join(",");
    setDaysOfSchedule(dayString);
  };

  const next = async () => {
    try {
      if (currentStep === 0 && isVisitDaily) {
        setCurrentStep(2); // Go to step 2 if VisitDaily
      } else {
        if (currentStep === 0) {
          await form.validateFields(["scheduleTypeId", "duration"]);
        } else if (currentStep === 1) {
          await form.validateFields(["daysOfSchedule"]);
        }
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const prev = () => {
    if (currentStep === 2 && isVisitDaily) {
      setCurrentStep(0); // Go back to step 0 if VisitDaily
    } else {
      setCurrentStep(currentStep - 1); // Otherwise, go to the previous step
    }
  };

  const handleFinish = async (values: ScheduleType) => {
    try {
      const parsedValues: any = {
        ...values,
        duration: duration,
        status: true,
        createById: parseInt(userId || "0", 10),
        daysOfSchedule: daysOfSchedule,
        scheduleTypeId: selectedScheduleType,
      };
      await createNewSchedule(parsedValues).unwrap();
      message.success("Dự án đã được tạo thành công!");
      await refetchScheduleList();
      navigate(-1);
      form.resetFields();
    } catch (error) {
      console.error("Error creating new schedule:", error);
      message.error("Đã xảy ra lỗi khi tạo dự án.");
    }
  };

  return (
    <>
      <Steps current={currentStep}>
        <Step title="Chọn loại dự án" />
        <Step title="Chọn ngày thực hiện" />
        <Step title="Nhập thông tin dự án" />
      </Steps>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {currentStep === 0 && (
          <>
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
            {/* Conditionally render duration field */}
            {!isVisitDaily && (
              <Form.Item
                label="Thời gian kéo dài (ngày)"
                name="duration"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian kéo dài!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số ngày"
                  disabled={isVisitDaily}
                  value={isVisitDaily ? 1 : undefined}
                  onChange={!isVisitDaily ? handleDurationChange : undefined}
                />
              </Form.Item>
            )}
          </>
        )}
        {currentStep === 1 && (
          <Form.Item
            label={
              isProcessWeek
                ? "Chọn ngày thực hiện"
                : isProcessMonth
                ? "Chọn ngày trong tháng"
                : "Ngày thực hiện"
            }
            name="daysOfSchedule"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn hoặc nhập ngày thực hiện!",
              },
            ]}
          >
            {isProcessWeek ? (
              <Select
                mode="multiple"
                placeholder="Chọn ngày trong tuần"
                onChange={handleDaysOfScheduleChange}
              >
                {dayOptions.map((day) => (
                  <Option key={day.value} value={day.value}>
                    {day.label}
                  </Option>
                ))}
              </Select>
            ) : isProcessMonth ? (
              <Select
                mode="multiple"
                placeholder="Chọn ngày trong tháng"
                onChange={handleDaysOfScheduleChange}
              >
                {Array.from({ length: 31 }, (_, index) => (
                  <Option key={index + 1} value={index + 1}>
                    {index + 1}
                  </Option>
                ))}
              </Select>
            ) : isVisitDaily ? (
              <Input disabled value={"1"} placeholder="Nhập ngày thực hiện" />
            ) : null}
          </Form.Item>
        )}
        {currentStep === 2 && (
          <>
            <Form.Item
              label="Tiêu đề"
              name="scheduleName"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề dự án" />
            </Form.Item>
            <Form.Item
              label="Miêu tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập miêu tả!" }]}
            >
              <Input.TextArea placeholder="Nhập miêu tả dự án" rows={4} />
            </Form.Item>
          </>
        )}
        <Form.Item>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prev}>
              Quay lại
            </Button>
          )}
          {currentStep < 2 ? (
            <Button type="primary" onClick={next}>
              Tiếp tục
            </Button>
          ) : (
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Tạo mới dự án
            </Button>
          )}
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
    </>
  );
};

export default CreateNewSchedule;