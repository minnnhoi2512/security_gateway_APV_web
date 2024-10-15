import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Steps,
  Button,
  message,
  Table,
  TimePicker,
  Modal,
} from "antd";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useCreateNewListDetailVisitMutation } from "../services/visitDetailList.service";
import { Dayjs } from "dayjs";
import { useGetVisitorByCredentialCardQuery } from "../services/visitor.service";
import { useCreateNewListDetailVisitMutation } from "../services/visitDetailList.service";
import moment from "moment";
import { EditorState } from "draft-js";
import { useDebounce } from "use-debounce";
import { useQueryClient } from 'react-query';
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
  const [credentialCard, setCredentialCard] = useState<string>(""); // Track input value for search
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState<number | null>(
    null
  ); // Track which visitor is being edited
  const [debouncedCredentialCard] = useDebounce(credentialCard, 300); // 300ms debounce
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [visitor, setVisitor] = useState<any>();
  const [createNewListDetailVisit] = useCreateNewListDetailVisitMutation();
  const [isFetching, setIsFetching] = useState(false); 
  const [selectedVisitors, setSelectedVisitors] = useState<
    {
      startHour: string;
      endHour: string;
      visitorId: number;
      visitorName: string;
      credentialsCard: string;
    }[]
  >([]);
  const queryClient = useQueryClient(); // Get the query client instance
  const {
    refetch: visitorData,
    data,
    isSuccess,
    isError,
  } = useGetVisitorByCredentialCardQuery(
    { CredentialCard: credentialCard },
    { skip: credentialCard.length !== 12 }
  );
  const onEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
  };
  const handleClearVisitor = (index: number) => {
    const updatedVisitors = [...selectedVisitors];
    updatedVisitors.splice(index, 1); // Remove the visitor at the specified index
    setSelectedVisitors(updatedVisitors);
  };
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
        expectedEndTime: formData.expectedStartTime
          ? formData.expectedStartTime.toDate()
          : null,
        createById: userId, // Replace with dynamic userId if available
        description: formData.description,
        scheduleId: 6,
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
  };
  const handleStartTimeChange = (date: Dayjs) => {
    if (date) {
      form.setFieldsValue({
        expectedStartTime: date,
      });
    }
  };
  useEffect(() => {
    if (isSuccess && data) {
      // Check for a specific condition in your data
      if (data.message) {
        // Handle specific error returned from your API
        message.error(data.message); // Assuming data.error holds the error message
        setIsFetching(false); // Reset fetching state
        return;
      }
  
      setSearchResults((prevResults) => {
        const isDuplicate = prevResults.some(
          (visitor) => visitor.credentialsCard === data.credentialsCard
        );
  
        if (!isDuplicate) {
          return [...prevResults, data]; // Append new data
        } else {
          // Only show the message if it's a duplicate
          message.info("Wrong"); // Assuming data.error holds the error message
          return prevResults; // Return existing results to avoid duplicates
        }
      });
      setIsFetching(false); // Reset fetching state
    } else if (isError) {
      message.error("Khách đến thăm không có trong hệ thống!");
      setIsFetching(false); // Reset fetching state
    }
    setCredentialCard("");
  }, [isSuccess, data, isError]);
  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setCredentialCard(value); // Update the credential card state

    // Clear the cache data for visitorData when input changes
    if (value.length === 12) {
      value.length = 0;
      visitorData(); // Call the API to fetch visitor data
    }
  };

  const handleAddVisitor = () => {
    setIsModalVisible(true);
  };
  const getHourString = (value: any, nameValue: string, index: any) => {
    // console.log("index : ", index);
    if (nameValue === "startHour") {
      selectedVisitors[index] = {
        ...selectedVisitors[index],
        startHour: value,
      };
    } else if (nameValue === "endHour") {
      selectedVisitors[index] = {
        ...selectedVisitors[index],
        endHour: value,
      };
    }
    console.log(selectedVisitors[index]);
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
              getHourString(time?.format("HH:mm:ss"), "startHour", index)
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
              getHourString(time?.format("HH:mm:ss"), "endHour", index)
            }
          />
        ),
      },
      {
        title: "Hành động",
        dataIndex: "action",
        key: "action",
        render: (_: any, record: any, index: any) => (
          <div>
            <Button
              onClick={() => handleClearVisitor(index)}
              danger
              style={{ marginRight: "8px" }} // Optional: add some margin for spacing
            >
              Xóa
            </Button>
          </div>
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

  return (
    <div className="p-6">
      <h1 className="text-green-500 text-2xl font-bold">Tạo mới lịch hẹn</h1>
      <Steps current={currentStep}>
        <Step title="Thông tin lịch thăm" />
        <Step title="Thông tin khách đến thăm" />
      </Steps>

      <Form form={form} layout="vertical">
        {currentStep === 0 && (
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
                {
                  validator: (_, value) => {
                    if (value <= 0 && value != null) {
                      return Promise.reject("Số lượng khách phải lớn hơn 0");
                    }
                    if (value > 20) {
                      return Promise.reject(
                        "Số lượng khách không được vượt quá 20"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber />
            </Form.Item>

            <Form.Item
              name="expectedStartTime"
              label="Ngày đến thăm"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker
                onChange={handleStartTimeChange}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Editor
                editorState={editorState}
                toolbarClassName="border border-gray-300 bg-gray-100 rounded-t-md p-2"
                wrapperClassName="border border-gray-300 rounded-md shadow-sm"
                editorClassName="p-4 min-h-[200px] bg-white rounded-b-md"
                onEditorStateChange={onEditorStateChange}
              />
            </Form.Item>
          </>
        )}
        <Modal
          title="Thêm thông tin khách thăm"
          visible={isModalVisible}
          footer
          onCancel={() => setIsModalVisible(false)}
        >
          <Form layout="vertical">
            <Form.Item label="Nhập mã Căn cước công dân">
              <Input
                value={credentialCard}
                onChange={handleInputChange} // Use the updated change handler
                placeholder="Nhập mã căn cước"
              />
            </Form.Item>
            {/* Add any additional fields if needed */}
          </Form>
        </Modal>
        {currentStep === 1 && (
          <div>
            {" "}
            <Button
              className="my-5 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition duration-200"
              onClick={handleAddVisitor}
            >
              Thêm thông tin
            </Button>
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
                    onChange={(e) => setCredentialCard(e.target.value)} // This only updates the state, no API call
                    placeholder="Nhập mã căn cước"
                  />
                </Form.Item>
                {/* This triggers the API call only on click */}
                {searchResults.length > 0 && (
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
                    dataSource={searchResults}
                    pagination={false}
                  />
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
        {currentStep < 1 && (
          <Button type="primary" onClick={next}>
            Tiếp theo
          </Button>
        )}
        {currentStep === 1 && (
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
