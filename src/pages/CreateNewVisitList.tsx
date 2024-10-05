import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Button,
  message,
  InputNumber,
  Select,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import moment, { Moment } from "moment";
import VisitDetailList from "../types/visitDetailListType";
import VisitDetail from "../types/visitDetailType";
import Visitor from "../types/visitorType";
import { useCreateNewListDetailVisitMutation } from "../services/visitDetailList.service";
import * as XLSX from "xlsx"; // Import the xlsx library
import { useGetListScheduleQuery } from "../services/schedule.service";
import Schedule from "../types/scheduleType";

interface FormValues {
  title: string;
  date: Moment;
  time: Moment;
  expectedTimeOut: Moment;
  area: string;
  visitQuantity: number;
  scheduleId: number; // Add scheduleId to FormValues
  [key: string]: any; // Dynamic fields for visitors
}

const CreateNewVisitList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [visitCount, setVisitCount] = useState<number>(1); // Default to 1 visitor
  const userIdString = localStorage.getItem("userId"); // Retrieve user ID as a string
  const userId = userIdString ? parseInt(userIdString, 10) : null; // Parse it as an integer, default to null if not found
  const [createNewListDetailVisit] = useCreateNewListDetailVisitMutation();

  // Fetch schedules using the query
  const { data: schedules, isLoading: loadingSchedules } =
    useGetListScheduleQuery({ pageNumber: -1, pageSize: -1 });
  console.log(schedules);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      // Assuming the JSON data contains fields like visitorName, companyName, phoneNumber, and credentialsCard
      const visitors: Visitor[] = jsonData.map((row: any) => ({
        visitorName: row.visitorName,
        companyName: row.companyName,
        phoneNumber: row.phoneNumber,
        credentialsCard: row.credentialsCard,
        createdDate: new Date(),
        updatedDate: new Date(),
        status: true,
        credentialCardTypeId: 0, // Adjust if needed
      }));
      // Clear the form before setting new fields
      form.resetFields();
      // Update the form with the imported visitor data
      visitors.forEach((visitor, index) => {
        form.setFieldsValue({
          [`visitorName${index}`]: visitor.visitorName,
          [`companyName${index}`]: visitor.companyName,
          [`phoneNumber${index}`]: visitor.phoneNumber,
          [`credentialsCard${index}`]: visitor.credentialsCard,
        });
      });
      setVisitCount(visitors.length);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteVisitor = (index: number) => {
    // Clear the visitor fields for the specified index
    form.setFieldsValue({
      [`visitorName${index}`]: "",
      [`companyName${index}`]: "",
      [`phoneNumber${index}`]: "",
      [`credentialsCard${index}`]: "",
    });
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const visitDetails: VisitDetail[] = Array.from({
          length: visitCount,
        }).map((_) => {
          // const newVisitor: Visitor = {
          //   visitorName: values[`visitorName${index}`],
          //   companyName: values[`companyName${index}`],
          //   phoneNumber: values[`phoneNumber${index}`],
          //   createdDate: new Date(),
          //   updatedDate: new Date(),
          //   credentialsCard: values[`credentialsCard${index}`],
          //   status: true,
          //   credentialCardTypeId: 0, // Adjust if needed
          // };
          return {
            expectedStartHour: values.time
              ? moment(values.time).format("HH:mm:ss")
              : "07:00:00",
            expectedEndHour: values.expectedTimeOut
              ? moment(values.expectedTimeOut).format("HH:mm:ss")
              : "12:00:00",
            visitorId: 0, // You may want to replace this with the actual visitor ID if available
          };
        });
        const visitData: VisitDetailList = {
          visitName: values.title,
          visitQuantity: visitCount,
          expectedStartTime: new Date(), // Combine date and time for expectedStartTime
          createById: userId || 0,
          description: values.title,
          scheduleId: values.scheduleId || 0, // Use the selected scheduleId
          visitDetail: visitDetails,
        };
        try {
          await createNewListDetailVisit({
            newVisitDetailList: visitData,
          }).unwrap();
          message.success("Lịch hẹn đã được tạo thành công!");
          navigate(-1);
        } catch (error) {
          console.error("Failed to create visit:", error);
          message.error("Đã có lỗi xảy ra khi tạo lịch hẹn.");
        }
      })
      .catch((errorInfo) => {
        console.error("Failed to validate fields:", errorInfo);
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-green-500 text-2xl font-bold">Tạo mới lịch hẹn</h1>
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="date"
          label="Ngày"
          rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
        >
          <DatePicker format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item
          name="time"
          label="Thời gian vào"
          rules={[{ required: true, message: "Vui lòng chọn thời gian vào" }]}
        >
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item
          name="expectedTimeOut"
          label="Thời gian ra"
          rules={[{ required: true, message: "Vui lòng chọn thời gian ra" }]}
        >
          <TimePicker format="HH:mm" />
        </Form.Item>
        {/* Schedule selection */}
        <Form.Item
          name="scheduleId"
          label="Chọn lịch"
          rules={[{ required: true, message: "Vui lòng chọn lịch" }]}
        >
          <Select loading={loadingSchedules} placeholder="Chọn lịch">
            {schedules?.map((schedule : Schedule) => (
              <Select.Option key={schedule.scheduleId} value={schedule.scheduleId}>
                {schedule.scheduleName}{" "}
                {/* Adjust this to the correct property for display */}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* Number of visitors */}
        <Form.Item
          name="visitQuantity"
          label="Số lượng khách"
          rules={[{ required: true, message: "Vui lòng nhập số lượng khách" }]}
        >
          <InputNumber
            min={1}
            defaultValue={visitCount}
            value={visitCount}
            onChange={(value) => {
              setVisitCount(value ?? 1);
              form.setFieldsValue({ visitQuantity: value ?? 1 }); // Update form's visitQuantity field
            }}
          />
        </Form.Item>
        {/* File upload for visitor details */}
        <Form.Item label="Nhập thông tin khách từ file Excel">
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </Form.Item>
        {/* Visitor details form fields - dynamically rendered based on visitCount */}
        <h2 className="text-xl font-bold mt-4">Thông tin khách</h2>
        {Array.from({ length: visitCount }).map((_, index) => (
          <div key={index} className="visitor-section">
            <h3 className="text-lg font-semibold mt-2">Khách {index + 1}</h3>
            <Form.Item
              name={`visitorName${index}`}
              label="Tên khách"
              rules={[
                {
                  required: true,
                  message: `Vui lòng nhập tên khách ${index + 1}`,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={`companyName${index}`}
              label="Tên công ty"
              rules={[
                {
                  required: true,
                  message: `Vui lòng nhập tên công ty khách ${index + 1}`,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={`phoneNumber${index}`}
              label="Số điện thoại"
              rules={[
                {
                  required: true,
                  message: `Vui lòng nhập số điện thoại khách ${index + 1}`,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={`credentialsCard${index}`}
              label="CCCD"
              rules={[
                {
                  required: true,
                  message: `Vui lòng nhập CCCD khách ${index + 1}`,
                },
              ]}
            >
              <Input />
            </Form.Item>
            {/* Delete button for visitor */}
            <Button type="dashed" onClick={() => handleDeleteVisitor(index)}>
              Xóa thông tin khách
            </Button>
          </div>
        ))}
        <Form.Item>
          <Button type="primary" onClick={handleSubmit}>
            Tạo lịch hẹn
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateNewVisitList;
