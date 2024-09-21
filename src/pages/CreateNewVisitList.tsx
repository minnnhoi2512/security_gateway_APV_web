import { Form, Input, Select, DatePicker, TimePicker, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const CreateNewVisitList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(() => {
      // Logic to handle new visit creation
      message.success("Lịch hẹn đã được tạo thành công!");
      navigate(-1); // Redirect back
    }).catch((errorInfo) => {
      console.error("Failed to create visit:", errorInfo);
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
          label="Thời gian"
          rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
        >
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item
          name="area"
          label="Khu vực"
          rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
        >
          <Select>
            <Option value="Sản xuất">Sản xuất</Option>
            <Option value="Kinh doanh">Kinh doanh</Option>
            <Option value="Nhân sự">Nhân sự</Option>
          </Select>
        </Form.Item>
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
