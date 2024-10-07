import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Steps,
  Button,
  message,
  Checkbox,
  Row,
  Col,
  Table,
  TimePicker,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useCreateNewListDetailVisitMutation } from "../services/visitDetailList.service";
import { useGetListScheduleQuery } from "../services/schedule.service";
import Schedule from "../types/scheduleType";
import { Dayjs } from "dayjs";
const { Step } = Steps;

interface FormValues {
  title: string;
  date: Dayjs; // Changed Moment to Dayjs
  visitQuantity: number;
  scheduleId: number;
  scheduleType: number;
  visitName: string;
  expectedStartTime: Dayjs; // Changed Moment to Dayjs
  expectedEndTime: Dayjs; // Changed Moment to Dayjs
  description: string;
  daysOfSchedule: number[] | null;
  [key: string]: any;
}

const CreateNewVisitList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedScheduleType, setSelectedScheduleType] = useState<
    number | null
  >(null);
  const [daysOfSchedule, setDaysOfSchedule] = useState<number[] | null>(null);
  const { data: schedules, isLoading: loadingSchedules } =
    useGetListScheduleQuery({ pageNumber: -1, pageSize: -1 });
  // const [createNewListDetailVisit] = useCreateNewListDetailVisitMutation();
  const [selectedVisitors, setSelectedVisitors] = useState<
    { startHour: Dayjs; endHour: Dayjs; visitorId: number }[]
  >([]); // Track selected visitors' time slots
  const filteredSchedules = schedules?.filter(
    (schedule: Schedule) =>
      schedule.scheduleType?.scheduleTypeId === selectedScheduleType
  );

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      // const formData = form.getFieldsValue();
      // Here you can submit your data (formData) to the server
      message.success("Lịch hẹn đã được tạo thành công!");
      navigate("/some-route");
    } catch (error) {
      message.error("Vui lòng kiểm tra thông tin đã nhập.");
    }
  };

  // Handle next step
  const next = () => {
    form
      .validateFields()
      .then(() => setCurrentStep(currentStep + 1))
      .catch(() =>
        message.error("Vui lòng điền đủ thông tin trước khi tiếp tục.")
      );
  };

  // Handle previous step
  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle scheduleId change
  const handleScheduleChange = (scheduleId: number) => {
    const selectedSchedule = schedules?.find(
      (schedule: Schedule) => schedule.scheduleId === scheduleId
    );
    if (selectedSchedule) {
      setDaysOfSchedule(selectedSchedule.daysOfSchedule); // Ensure this is an array of numbers
    }
  };

  // Handle schedule type change
  const handleScheduleTypeChange = (value: number) => {
    setSelectedScheduleType(value);
    setDaysOfSchedule(null); // Reset daysOfSchedule on schedule type change
    form.setFieldsValue({ scheduleId: undefined }); // Reset scheduleId and expectedEndTime in the form
  };

  // Calculate expectedEndTime based on expectedStartTime and duration
  const handleStartTimeChange = (date: Dayjs) => {
    const selectedSchedule = schedules?.find(
      (schedule: Schedule) =>
        schedule.scheduleId === form.getFieldValue("scheduleId")
    );
    if (selectedSchedule && date) {
      const duration = selectedSchedule.duration; // Ensure duration is defined in your schedule type
      const endTime = date.add(duration, "day"); // Adjust duration based on your needs
      form.setFieldsValue({
        expectedStartTime: date,
        expectedEndTime: endTime, // Update expectedEndTime when expectedStartTime changes
      });
    } else {
      form.setFieldsValue({
        expectedStartTime: date,
        expectedEndTime: undefined,
      }); // Reset expectedEndTime if no schedule is selected
    }
  };

  const handleVisitorChange = (
    visitorId: number,
    startHour: Dayjs,
    endHour: Dayjs
  ) => {
    const updatedSelection = [...selectedVisitors];
    const index = updatedSelection.findIndex((v) => v.visitorId === visitorId);
    if (index > -1) {
      // If already selected, update the time
      updatedSelection[index] = { startHour, endHour, visitorId };
    } else {
      // Add new selection
      updatedSelection.push({ startHour, endHour, visitorId });
    }
    setSelectedVisitors(updatedSelection);
  };

  const renderVisitorsTable = () => {
    const visitQuantity = form.getFieldValue("visitQuantity");

    const columns = [
      {
        title: "Visitor Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Start Hour",
        dataIndex: "startHour",
        key: "startHour",
        render: (record: any) => (
          <TimePicker
            onChange={(date) =>
              handleVisitorChange(record.id, date!, record.expectedEndHour)
            }
          />
        ),
      },
      {
        title: "End Hour",
        dataIndex: "endHour",
        key: "endHour",
        render: (record: any) => (
          <TimePicker
            onChange={(date) =>
              handleVisitorChange(record.id, record.expectedStartHour, date!)
            }
          />
        ),
      },
    ];

    // Create an array of visitors based on visitQuantity
    const visitorsData = Array.from({ length: visitQuantity }, (_, index) => ({
      id: index + 1,
      name: `Visitor ${index + 1}`,
    }));

    return <Table dataSource={visitorsData} columns={columns} rowKey="id" />;
  };

  // Render checkboxes for daysOfSchedule
  const renderDaysOfSchedule = () => {
    if (selectedScheduleType === 1) {
      // Process Week
      const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      return (
        <Row gutter={[16, 16]}>
          {weekDays.map((day, index) => (
            <Col key={index} span={3}>
              <Form.Item>
                <Checkbox
                  checked={daysOfSchedule?.includes(index + 1)}
                  disabled
                >
                  {day}
                </Checkbox>
              </Form.Item>
            </Col>
          ))}
        </Row>
      );
    } else if (selectedScheduleType === 2) {
      // Process Month
      return (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 31 }, (_, index) => (
            <Col key={index} span={3}>
              <Form.Item>
                <Checkbox
                  checked={daysOfSchedule?.includes(index + 1)}
                  disabled
                >
                  Ngày {index + 1}
                </Checkbox>
              </Form.Item>
            </Col>
          ))}
        </Row>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <h1 className="text-green-500 text-2xl font-bold">Tạo mới lịch hẹn</h1>
      <Steps current={currentStep}>
        <Step title="Loại lịch" />
        <Step title="Thông tin lịch thăm" />
        <Step title="Xác nhận" />
      </Steps>

      <Form form={form} layout="vertical">
        {currentStep === 0 && (
          <>
            <Form.Item
              name="scheduleType"
              label="Loại lịch"
              rules={[{ required: true, message: "Vui lòng chọn loại lịch" }]}
            >
              <Select
                placeholder="Chọn loại lịch"
                onChange={handleScheduleTypeChange}
              >
                <Select.Option value={3}>Lịch trình hàng ngày</Select.Option>
                <Select.Option value={1}>Lịch trình tuần</Select.Option>
                <Select.Option value={2}>Lịch trình tháng</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="scheduleId"
              label="Chọn lịch"
              rules={[{ required: true, message: "Vui lòng chọn lịch" }]}
            >
              <Select
                loading={loadingSchedules}
                placeholder="Chọn lịch"
                onChange={handleScheduleChange}
              >
                {filteredSchedules?.map((schedule: Schedule) => (
                  <Select.Option
                    key={schedule.scheduleId}
                    value={schedule.scheduleId}
                  >
                    {schedule.scheduleName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Conditionally render checkboxes based on daysOfSchedule */}
            {daysOfSchedule !== null && renderDaysOfSchedule()}
          </>
        )}

        {currentStep === 1 && (
          <>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề" />
            </Form.Item>
            <Form.Item
              name="visitQuantity"
              label="Số lượng khách"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng khách" },
              ]}
            >
              <InputNumber min={1} max={10} />
            </Form.Item>

            <Form.Item
              name="expectedStartTime"
              label="Thời gian bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker onChange={handleStartTimeChange} />
            </Form.Item>

            <Form.Item
              name="expectedEndTime"
              label="Thời gian kết thúc"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker disabled />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input.TextArea placeholder="Nhập mô tả" />
            </Form.Item>

            {/* Render visitors table */}
          </>
        )}

        {currentStep === 2 && <div>{renderVisitorsTable()}</div>}
      </Form>
      <div className="mt-4">
        {currentStep > 0 && (
          <Button onClick={prev} style={{ marginRight: 8 }}>
            Quay lại
          </Button>
        )}
        {currentStep < 2 && (
          <Button type="primary" onClick={next}>
            Tiếp theo
          </Button>
        )}
        {currentStep === 2 && (
          <Button type="primary" onClick={handleSubmit}>
            Tạo lịch hẹn
          </Button>
        )}
        <Button
          onClick={() => navigate("/customerVisit")}
          style={{ marginLeft: 8 }}
        >
          Hủy
        </Button>
      </div>
    </div>
  );
};

export default CreateNewVisitList;
