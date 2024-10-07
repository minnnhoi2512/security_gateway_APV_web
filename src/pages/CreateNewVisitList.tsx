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
  Modal,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useCreateNewListDetailVisitMutation } from "../services/visitDetailList.service";
import { useGetListScheduleQuery } from "../services/schedule.service";
import Schedule from "../types/scheduleType";
import { Dayjs } from "dayjs";
import { useGetVisitorByCredentialCardQuery } from "../services/visitor.service";
import { useCreateNewListDetailVisitMutation } from "../services/visitDetailList.service";
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
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const userId = Number(localStorage.getItem("userId"));
  const [selectedScheduleType, setSelectedScheduleType] = useState<
    number | null
  >(null);
  const [daysOfSchedule, setDaysOfSchedule] = useState<number[] | null>(null);
  const [credentialCard, setCredentialCard] = useState<string>(""); // Track input value for search
  const [searchResult, setSearchResult] = useState<any>(null); // Store search result
  const { data: schedules, isLoading: loadingSchedules } =
    useGetListScheduleQuery({ pageNumber: -1, pageSize: -1 });
  const [createNewListDetailVisit] = useCreateNewListDetailVisitMutation();
  const [selectedVisitors, setSelectedVisitors] = useState<
    {
      startHour: string;
      endHour: string;
      visitorId: number;
      visitorName: string;
      credentialsCard: string;
    }[]
  >([]); // Track selected visitors' time slots
  const filteredSchedules = schedules?.filter(
    (schedule: Schedule) =>
      schedule.scheduleType?.scheduleTypeId === selectedScheduleType
  );
  const { refetch: refetchVisitor } = useGetVisitorByCredentialCardQuery(
    { CredentialCard: credentialCard },
    { skip: credentialCard === "" }
  );
  // Handle form submission
  const handleSubmit = async () => {
    try {
      console.log(selectedVisitors);
      await form.validateFields();
      const formData = form.getFieldsValue(true); // or form.getFieldsValue({ all: true });
      // console.log(formData);
      const requestData = {
        visitName: formData.title,
        visitQuantity: Number(formData.visitQuantity),
        expectedStartTime: formData.expectedStartTime
          ? formData.expectedStartTime.toDate()
          : null,
        expectedEndTime: formData.expectedEndTime
          ? formData.expectedEndTime.toDate()
          : null,
        createById: userId, // Replace with dynamic userId if available
        description: formData.description,
        scheduleId: formData.scheduleId,
        visitDetail: selectedVisitors.map((visitor) => ({
          expectedStartHour: visitor.startHour,
          expectedEndHour: visitor.endHour,
          visitorId: visitor.visitorId,
        })),
      };
      // console.log(requestData);
      await createNewListDetailVisit({ newVisitDetailList: requestData });
      message.success("Lịch hẹn đã được tạo thành công!");
      navigate("/customerVisit");
    } catch (error) {
      console.log(error);
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
  const handleAddVisitor = () => {
    setCredentialCard("");
    setSearchResult(null);
    setIsModalVisible(true);
  };
  const getHourString = (
    value: any,
    nameValue: string,
    index: any,
    record: any
  ) => {
    console.log(record);
    // console.log("index : ", index);
    if (nameValue === "startHour") {
      selectedVisitors[index] = {
        ...selectedVisitors[index],
        startHour: value,
      };
      // console.log(selectedVisitors[index]);
    } else if (nameValue === "endHour") {
      selectedVisitors[index] = {
        ...selectedVisitors[index],
        endHour: value,
      };
    }
  };

  const handleSearch = async () => {
    if (!credentialCard) {
      message.error("Please enter a valid Credential Card number.");
      return;
    }
    try {
      const { data } = await refetchVisitor();
      // console.log(data);
      if (data) {
        setSearchResult(data); // Update search result if visitor is found
        message.success("Visitor found!");
      } else {
        setSearchResult(null); // No result found
        message.error("No visitor found with this CredentialCard.");
      }
    } catch (error) {
      message.error("An error occurred while searching for the visitor.");
    }
  };
  const handleSelectVisitor = (visitor: any) => {
    const updatedVisitors = [...selectedVisitors];
    // console.log(visitor);
    const index = updatedVisitors.findIndex(
      (v) => v.visitorId === visitor.visitorId
    );
    // console.log(index);
    if (index > -1) {
      // If already selected, update the visitor
      updatedVisitors[index] = visitor;
    } else {
      // Add new visitor
      updatedVisitors.push(visitor);
    }
    // console.log(updatedVisitors);
    setSelectedVisitors(updatedVisitors);
    setIsModalVisible(false);
  };
  const renderVisitorsTable = () => {
    const visitQuantity = form.getFieldValue("visitQuantity");

    const columns = [
      {
        title: "Visitor Name",
        dataIndex: "visitorName",
        key: "visitorName",
      },
      {
        title: "Mã căn cước",
        dataIndex: "credentialsCard",
        key: "credentialsCard",
      },
      {
        title: "Start Hour",
        dataIndex: "startHour",
        key: "startHour",
        render: (_: any, record: any, index: any) => (
          <TimePicker
            format="HH:mm:ss"
            onChange={(time) =>
              getHourString(
                time?.format("HH:mm:ss"),
                "startHour",
                index,
                record
              )
            }
          />
        ),
      },
      {
        title: "End Hour",
        dataIndex: "endHour",
        key: "endHour",
        render: (_: any, record: any, index: any) => (
          <TimePicker
            format="HH:mm:ss"
            onChange={(time) =>
              getHourString(time?.format("HH:mm:ss"), "endHour", index, record)
            }
          />
        ),
      },
      {
        title: "Hành động",
        dataIndex: "action",
        key: "action",
        render: (_: any) => (
          <Button onClick={handleAddVisitor}>Thêm thông tin</Button> // Opens the modal
        ),
      },
    ];

    // Create an array of visitors based on visitQuantity
    const visitorsData = Array.from({ length: visitQuantity }, (_, index) => {
      const visitor = selectedVisitors[index];
      return {
        id: index + 1,
        visitorName: visitor?.visitorName || `Visitor ${index + 1}`,
        startHour: visitor?.startHour,
        endHour: visitor?.endHour,
        credentialsCard: visitor?.credentialsCard,
      };
    });

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
                  className={
                    daysOfSchedule?.includes(index + 1) ? "bg-orange-200" : ""
                  }
                >
                  <span
                    className={
                      daysOfSchedule?.includes(index + 1) ? "font-bold" : ""
                    }
                  >
                    {day}
                  </span>
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
                  className={
                    daysOfSchedule?.includes(index + 1) ? "bg-orange-200" : ""
                  }
                >
                  <span
                    className={
                      daysOfSchedule?.includes(index + 1) ? "font-bold" : ""
                    }
                  >
                    Ngày {index + 1}
                  </span>
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
        <Step title="Thông tin khách đến thăm" />
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
              <InputNumber min={1} max={20} />
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

        {currentStep === 2 && (
          <div>
            {renderVisitorsTable()}
            {/* Modal for adding new visitor */}
            <Modal
              title="Thêm thông tin khách thăm"
              visible={isModalVisible}
              footer={null}
              onCancel={() => setIsModalVisible(false)}
            >
              <Form layout="vertical">
                <Form.Item label="Nhập mã Căn cước (CredentialCard)">
                  <Input
                    value={credentialCard}
                    onChange={(e) => setCredentialCard(e.target.value)}
                    placeholder="Nhập mã căn cước"
                  />
                </Form.Item>
                <Button onClick={handleSearch}>Tìm kiếm khách thăm</Button>
                {searchResult && (
                  <Table
                    columns={[
                      {
                        title: "Tên khách thăm",
                        dataIndex: "visitorName",
                        key: "visitorName",
                      },
                      {
                        title: "Tên công ty",
                        dataIndex: "companyName",
                        key: "companyName",
                      },
                      {
                        title: "Mã căn cước",
                        dataIndex: "credentialsCard",
                        key: "credentialsCard",
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                      },
                      {
                        title: "Hành động",
                        dataIndex: "action",
                        key: "action",
                        render: (_: any, record: any) => (
                          <div>
                            <Button onClick={() => handleSelectVisitor(record)}>
                              Chọn
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    dataSource={[searchResult]}
                    pagination={false}
                  />
                )}
                {!searchResult && (
                  <Button
                    type="dashed"
                    onClick={() => navigate("/createVisitor")}
                  >
                    Tạo khách thăm mới
                  </Button>
                )}
              </Form>
            </Modal>
          </div>
        )}
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
