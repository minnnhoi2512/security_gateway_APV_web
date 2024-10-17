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
  Image,
  Tag,
} from "antd";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useGetVisitorByCredentialCardQuery } from "../services/visitor.service";
import { useCreateNewListDetailVisitMutation } from "../services/visitDetailList.service";
import moment from "moment";
import { EditorState } from "draft-js";
import { useDebounce } from "use-debounce";
import { stateToHTML } from "draft-js-export-html";
import CreateNewVisitor from "../form/CreateNewVisitor";
const { Step } = Steps;

interface FormValues {
  title: string;
  date: Dayjs;
  visitQuantity: number;
  scheduleId: number;
  scheduleType: number;
  visitName: string;
  expectedStartTime: Dayjs;
  expectedEndTime: Dayjs;
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
  const [credentialCard, setCredentialCard] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVisitors, setSelectedVisitors] = useState<
    {
      startHour: string;
      endHour: string;
      visitorId: number;
      visitorName: string;
      credentialsCard: string;
      visitorCredentialImage: string;
    }[]
  >([]);
  const [createNewListDetailVisit] = useCreateNewListDetailVisitMutation();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [debouncedCredentialCard] = useDebounce(credentialCard, 300);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: visitorData, isSuccess: isVisitorDataFetched } =
    useGetVisitorByCredentialCardQuery(
      { CredentialCard: debouncedCredentialCard },
      { skip: debouncedCredentialCard.length !== 12 }
    );
  const [isLoading, setIsLoading] = useState(false);
  const [startHourForAll, setStartHourForAll] = useState<string | null>(null);
  const [endHourForAll, setEndHourForAll] = useState<string | null>(null);
  const visitQuantity = form.getFieldValue("visitQuantity");
  const [showCreateVisitor, setShowCreateVisitor] = useState(false);
  const handleAddNewVisitor = () => {
    setShowCreateVisitor(true);
  };

  const handleCloseCreateVisitor = () => {
    setShowCreateVisitor(false);
  };
  const handleVisitorCreated = (visitorData: any) => {
    setSearchResults([visitorData]);
  };
  useEffect(() => {
    // Clear the timeout on every input change
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debouncedCredentialCard.length === 12) {
      // setSearchResults([]);
      setIsLoading(true); // Start loading
      // Set a timeout to delay the search
      console.log(visitorData);
      timeoutRef.current = setTimeout(() => {
        if (isVisitorDataFetched && visitorData) {
          setSearchResults([visitorData]);
          message.success("Đã tìm thấy khách này.");
        } else if (!isVisitorDataFetched) {
          setSearchResults([]);
        }
        setIsLoading(false); // Stop loading after fetching data
      }, 1000); // Delay the search for 1000 milliseconds (1 second)
    } else {
      setSearchResults([]); // Clear results if input is less than 12 characters
      setIsLoading(false); // Stop loading if input is invalid
    }

    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisitorDataFetched, visitorData, debouncedCredentialCard]);
  const handleCredentialCardChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setCredentialCard(newValue);
    if (newValue.length === 0) {
      setSearchResults([]); // Clear results if input is empty
    }
  };
  const onEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
  };
  const handleCancel = () => {
    Modal.confirm({
      title: "Bạn có muốn   hủy quá trình tạo mới lịch?",
      content: "Hành động này sẽ xóa hết dữ liệu.",
      okText: "Đồng ý",
      cancelText: "Quay lại",
      onOk() {
        navigate(-1); // Navigate back
      },
    });
  };

  const getHourString = (value: any, nameValue: string, index: any) => {
    const startHour = selectedVisitors[index]?.startHour; // Get the current startHour
    const currentDate = new Date();
    const expectedStartTime = form.getFieldValue("expectedStartTime");

    // Check if expectedStartTime is today
    const isToday =
      expectedStartTime &&
      new Date(expectedStartTime).toDateString() === currentDate.toDateString();

    // Define the minimum start time if today (current time + 30 minutes)
    const minStartHour = new Date(currentDate.getTime() + 30 * 60000);

    if (nameValue === "startHour") {
      if (isToday) {
        const [selectedHours, selectedMinutes] = value.split(":").map(Number);
        const selectedTime = new Date();
        selectedTime.setHours(selectedHours, selectedMinutes, 0, 0);

        // Check if the selected start time is before the minimum allowed start time
        if (selectedTime < minStartHour) {
          message.warning("Giờ vào phải hơn hiện tại ít nhất 30 phút.");
          return; // Prevent updating startHour if the condition fails
        }
      }

      selectedVisitors[index] = {
        ...selectedVisitors[index],
        startHour: value,
        // Reset endHour if the startHour changes and is after the new endHour
        endHour:
          startHour && value > startHour ? selectedVisitors[index].endHour : "",
      };
    } else if (nameValue === "endHour") {
      if (value <= startHour) {
        // Optionally show a message to the user
        message.warning("Giờ ra phải sau giờ vào!"); // Adjust the message to your needs
        return; // Do not update endHour if it is not valid
      }

      selectedVisitors[index] = {
        ...selectedVisitors[index],
        endHour: value,
      };
    }

    setSelectedVisitors([...selectedVisitors]); // Trigger a re-render
  };

  const handleClearVisitor = (index: number) => {
    if (selectedVisitors.length === 0) {
      message.warning("Không có khách nào để xóa.");
      return;
    }

    const updatedVisitors = [...selectedVisitors];
    if (!updatedVisitors[index]?.visitorName) {
      message.warning("Khách này không có thông tin để xóa.");
      return;
    }

    updatedVisitors.splice(index, 1);
    setSelectedVisitors(updatedVisitors);
  };
  const handleSubmit = async () => {
    try {
      const visitQuantity = form.getFieldValue("visitQuantity");
      const contentState = editorState.getCurrentContent();
      const htmlContent = stateToHTML(contentState);
      console.log(htmlContent);
      // Check if the selected visitors count matches the required visit quantity
      if (selectedVisitors.length < visitQuantity) {
        message.warning("Cần nhập đủ số lượng khách!");
        return; // Stop further execution
      }

      // Validate the form fields
      await form.validateFields();

      // Check if expectedStartHour and expectedEndHour are filled
      const hasMissingHours = selectedVisitors.some(
        (visitor) => !visitor.startHour || !visitor.endHour
      );

      if (hasMissingHours) {
        message.warning("Vui lòng nhập đủ thông tin giờ ra và giờ vào!");
        return; // Stop further execution
      }

      const formData = form.getFieldsValue(true);
      const requestData = {
        visitName: formData.title,
        visitQuantity: Number(formData.visitQuantity),
        expectedStartTime: formData.expectedStartTime
          ? formData.expectedStartTime.toDate()
          : null,
        expectedEndTime: formData.expectedStartTime
          ? formData.expectedStartTime.toDate()
          : null,
        createById: userId,
        description: htmlContent,
        scheduleId: 6,
        visitDetail: selectedVisitors.map((visitor) => ({
          expectedStartHour: visitor.startHour,
          expectedEndHour: visitor.endHour,
          visitorId: visitor.visitorId,
        })),
      };

      try {
        await createNewListDetailVisit({
          newVisitDetailList: requestData,
        }).unwrap(); // unwrapping for better error handling
        message.success("Lịch hẹn đã được tạo thành công!");
        navigate("/customerVisit");
      } catch (error) {
        message.error("Đã có lỗi xảy ra khi tạo lịch hẹn. Vui lòng thử lại.");
      }
    } catch (error) {
      message.error("Vui lòng kiểm tra thông tin đã nhập.");
    }
  };

  const next = () => {
    form
      .validateFields()
      .then(() => setCurrentStep(currentStep + 1))
      .catch(() =>
        message.error("Vui lòng điền đủ thông tin trước khi tiếp tục.")
      );
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSelectVisitor = (visitor: any) => {
    const isDuplicate = selectedVisitors.some(
      (v) => v.visitorId === visitor.visitorId
    );
    console.log(visitor);
    // Check if the visitor's status is "Unactive"
    if (visitor.status === "Unactive") {
      message.error("Không thể thêm khách trong sổ đen");
      return;
    }

    // Check if adding this visitor would exceed the limit
    if (selectedVisitors.length >= visitQuantity) {
      message.warning("Danh sách đã đầy, vui lòng kiểm tra lại thông tin.");
      return;
    }

    if (isDuplicate) {
      message.warning("Khách này đã được chọn.");
      return;
    }

    const updatedVisitors = [...selectedVisitors, visitor];
    setSelectedVisitors(updatedVisitors);
    setSearchResults([]); // Clear search results after selecting
    setCredentialCard(""); // Clear input after selection
  };

  const handleAddVisitor = () => {
    setIsModalVisible(true);
    setCredentialCard("");
    setSearchResults([]);
  };
  const handleStartHourChangeForAll = (time: any) => {
    const startHour = time?.format("HH:mm:ss");
    const currentDate = new Date();
    const expectedStartTime = form.getFieldValue("expectedStartTime");

    // Check if expectedStartTime is today
    const isToday =
      expectedStartTime &&
      new Date(expectedStartTime).toDateString() === currentDate.toDateString();

    // Define the minimum start time if today (current time + 30 minutes)
    const minStartHour = new Date(currentDate.getTime() + 30 * 60000);

    if (isToday) {
      const [selectedHours, selectedMinutes] = startHour.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(selectedHours, selectedMinutes, 0, 0);

      // Check if the selected start time is before the minimum allowed start time
      if (selectedTime < minStartHour) {
        message.warning("Giờ vào phải hơn hiện tại ít nhất 30 phút.");
        return; // Prevent updating startHour if the condition fails
      }
    }

    setStartHourForAll(startHour);

    // Reset end hour when start hour changes
    setEndHourForAll(null);

    // Update startHour for all selected visitors and reset endHour
    selectedVisitors.forEach((visitor, index) => {
      selectedVisitors[index] = {
        ...visitor,
        startHour: startHour,
        endHour: "",
      };
    });
    setSelectedVisitors([...selectedVisitors]); // Trigger a re-render
  };

  const handleEndHourChangeForAll = (time: any) => {
    let endHour = time?.format("HH:mm:ss");
    const isEndHourValid = dayjs(endHour, "HH:mm:ss").isAfter(
      dayjs(selectedVisitors[0]?.startHour, "HH:mm:ss") // Ensure startHour is valid
    );
    console.log(endHour);
    // If endHour is not valid, clear it and show a warning
    if (!isEndHourValid && endHour !== null && endHour !== undefined) {
      message.warning("Giờ ra phải sau giờ vào!");
      setEndHourForAll(null);
      const updatedVisitors = selectedVisitors.map((visitor) => ({
        ...visitor,
        endHour: "",
      }));
      setSelectedVisitors(updatedVisitors);
      return;
    }

    // Set endHour for all visitors
    setEndHourForAll(endHour);
    const updatedVisitors = selectedVisitors.map((visitor) => ({
      ...visitor,
      endHour: endHour,
    }));
    setSelectedVisitors(updatedVisitors); // Trigger a re-render
  };

  const renderVisitorsTable = () => {
    const visitQuantity = form.getFieldValue("visitQuantity");
    const columns = [
      {
        title: "Số thứ tự",
        dataIndex: "index",
        key: "index",
        render: (_: any, record: any, index: number) => (
          <span className="justify-center items-center">{index + 1}</span> // Display the index starting from 1
        ),
      },
      // {
      //   title: "Ảnh căn cước",
      //   dataIndex: "visitorCredentialImage",
      //   key: "visitorCredentialImage",
      //   render: (image: string) => {
      //     // Check if the image string is null, empty, or starts with the base64 prefix
      //     if (!image) {
      //       return null; // or return a placeholder, e.g., <div>No Image</div>
      //     }

      //     // Ensure the image string is in base64 format
      //     const base64Image = image.startsWith("data:image/jpeg;base64,")
      //       ? image
      //       : `data:image/jpeg;base64,${image}`;

      //     return (
      //       <Image
      //         src={base64Image}
      //         alt="Visitor Credential"
      //         width={50} // Set the width of the image
      //         height={50} // Set the height of the image
      //         preview={false} // Set to false if you don't want the preview functionality
      //         style={{ objectFit: "cover" }} // Maintain the aspect ratio
      //       />
      //     );
      //   },
      // },
      {
        title: "Tên khách",
        dataIndex: "visitorName",
        key: "visitorName",
      },
      {
        title: "Mã căn cước",
        dataIndex: "credentialsCard",
        key: "credentialsCard",
      },
      {
        title: "Giờ vào",
        dataIndex: "startHour",
        key: "startHour",
        render: (_: any, record: any, index: any) =>
          selectedVisitors[index]?.visitorName ? (
            <TimePicker
              format="HH:mm:ss"
              value={
                record.startHour ? dayjs(record.startHour, "HH:mm:ss") : null
              } // Display the current startHour
              onChange={(time) =>
                getHourString(time?.format("HH:mm:ss"), "startHour", index)
              }
            />
          ) : null,
      },
      {
        title: "Giờ ra",
        dataIndex: "endHour",
        key: "endHour",
        render: (_: any, record: any, index: any) =>
          selectedVisitors[index]?.visitorName ? (
            <TimePicker
              format="HH:mm:ss"
              value={record.endHour ? dayjs(record.endHour, "HH:mm:ss") : null} // Display the current endHour
              onChange={(time) =>
                getHourString(time?.format("HH:mm:ss"), "endHour", index)
              }
            />
          ) : null,
      },
      {
        title: "Hành động",
        dataIndex: "action",
        key: "action",
        render: (_: any, record: any, index: any) => {
          // Show the button only if visitor data is present
          return selectedVisitors[index]?.visitorName ? (
            <Button onClick={() => handleClearVisitor(index)} danger>
              Xóa thông tin
            </Button>
          ) : null;
        },
      },
    ];

    const visitorsData = Array.from({ length: visitQuantity }, (_, index) => {
      const visitor = selectedVisitors[index];
      return {
        id: index + 1,
        visitorName: visitor?.visitorName,
        startHour: visitor?.startHour,
        endHour: visitor?.endHour,
        credentialsCard: visitor?.credentialsCard,
        visitorCredentialImage: visitor?.visitorCredentialImage,
      };
    });

    return (
      <>
        {selectedVisitors.length === 0 && (
          <p style={{ color: "red" }}>Chưa có khách nào được chọn!</p>
        )}
        <Table dataSource={visitorsData} columns={columns} rowKey="id" />
      </>
    );
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
                onEditorStateChange={onEditorStateChange}
                toolbarClassName="flex justify-between px-2"
                wrapperClassName="border border-gray-300 rounded-lg"
                editorClassName="p-4 h-40 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Form.Item>
          </>
        )}
        {currentStep === 1 && (
          <>
            <Button type="primary" onClick={handleAddVisitor}>
              Thêm khách
            </Button>
            {selectedVisitors.length === visitQuantity && (
              <div className="flex flex-col mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  {" "}
                  {/* Add margin-bottom for spacing */}
                  Chọn giờ cho tất cả khách:
                </h3>
                <div className="flex space-x-4">
                  {/* Flex container for TimePickers */}
                  <div className="flex flex-col w-full">
                    <label className="mb-1" htmlFor="startHour">
                      Giờ vào
                    </label>
                    <TimePicker
                      id="startHour" // Add id for accessibility
                      format="HH:mm:ss"
                      placeholder="Giờ vào"
                      value={
                        startHourForAll
                          ? dayjs(startHourForAll, "HH:mm:ss")
                          : null
                      }
                      className="w-full"
                      onChange={handleStartHourChangeForAll}
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="mb-1" htmlFor="endHour">
                      Giờ ra
                    </label>
                    <TimePicker
                      id="endHour" // Add id for accessibility
                      format="HH:mm:ss"
                      placeholder="Giờ ra"
                      value={
                        endHourForAll ? dayjs(endHourForAll, "HH:mm:ss") : null
                      }
                      className="w-full"
                      onChange={handleEndHourChangeForAll}
                    />
                  </div>
                </div>
              </div>
            )}
            {renderVisitorsTable()}
          </>
        )}
      </Form>

      <div className="flex justify-between mt-4">
        {currentStep == 0 && <Button onClick={handleCancel}>Hủy</Button>}
        {currentStep > 0 && <Button onClick={prev}>Trở về</Button>}
        {currentStep < 1 && (
          <Button type="primary" onClick={next}>
            Tiếp theo
          </Button>
        )}
        {currentStep === 1 && (
          <Button type="primary" onClick={handleSubmit}>
            Tạo mới
          </Button>
        )}
      </div>

      <Modal
        title="Tìm kiếm khách"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form.Item
          validateStatus={credentialCard.length > 12 ? "error" : ""}
          help={credentialCard.length > 12 ? "Không được vượt quá 12 số." : ""}
        >
          <Input
            value={credentialCard}
            onChange={handleCredentialCardChange} // Use the new handler
            placeholder="Nhập mã căn cước hoặc giấy phép lái xe (12 số)"
          />
        </Form.Item>

        {searchResults.length > 0 ? (
          <Table
            dataSource={searchResults}
            columns={[
              // {
              //   title: "Ảnh căn cước",
              //   dataIndex: "visitorCredentialImage",
              //   key: "visitorCredentialImage",
              //   render: (image: string) => {
              //     const base64Image = image.startsWith(
              //       "data:image/jpeg;base64,"
              //     )
              //       ? image
              //       : `data:image/jpeg;base64,${image}`;

              //     return (
              //       <Image
              //         src={base64Image}
              //         alt="Visitor Credential"
              //         width={50}
              //         height={50}
              //         preview={false}
              //         style={{ objectFit: "cover" }}
              //       />
              //     );
              //   },
              // },
              {
                title: "Tên khách",
                dataIndex: "visitorName",
                key: "visitorName",
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
                render: (status: string) => {
                  let color = status === "Unactive" ? "red" : "green";
                  let displayText = status === "Unactive" ? "Sổ đen" : "Hợp lệ";

                  return <Tag color={color}>{displayText}</Tag>;
                },
              },
              {
                title: "Hành động",
                dataIndex: "action",
                key: "action",
                render: (_, visitor) => (
                  <Button onClick={() => handleSelectVisitor(visitor)}>
                    Chọn
                  </Button>
                ),
              },
            ]}
            rowKey="visitorId"
            loading={isLoading}
            pagination={false}
          />
        ) : (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <p>Không tìm thấy khách nào.</p>
            <br></br>
            {selectedVisitors.length < visitQuantity && (
              <Button type="primary" onClick={handleAddNewVisitor}>
                Thêm khách mới
              </Button>
            )}
          </div>
        )}
      </Modal>
      {showCreateVisitor && (
        <CreateNewVisitor
          isModalVisible={showCreateVisitor}
          setIsModalVisible={handleCloseCreateVisitor}
          onVisitorCreated={handleVisitorCreated}
        />
      )}
    </div>
  );
};

export default CreateNewVisitList;
