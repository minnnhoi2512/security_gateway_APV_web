import { Form, Input, Button, Select, message, Spin } from "antd";
import { useEffect, useState } from "react";
import {
  useUpdateScheduleMutation,
  useGetListScheduleQuery,
  useGetDetailScheduleQuery,
} from "../services/schedule.service";
import { useNavigate, useParams } from "react-router-dom";

const { Option } = Select;

const DetailSchedule = () => {
  const [form] = Form.useForm();
  const [updateSchedule, { isLoading }] = useUpdateScheduleMutation();
  const { id } = useParams();
  const scheduleId = Number(id);

  const { refetch: refetchScheduleList } = useGetListScheduleQuery({
    pageNumber: -1,
    pageSize: -1,
  });
  const navigate = useNavigate();
  const {
    data: scheduleData,
    isLoading: isFetchingSchedule,
    isError,
  } = useGetDetailScheduleQuery({
    idSchedule: scheduleId,
  });

  // Define day options
  const dayOptions = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 7 },
  ];

  const [isProcessWeek, setIsProcessWeek] = useState(false);
  const [isProcessMonth, setIsProcessMonth] = useState(false);

  useEffect(() => {
    if (scheduleData) {
      form.setFieldsValue({
        ...scheduleData,
        status: scheduleData.status.toString(),
        scheduleTypeName: scheduleData.scheduleType?.scheduleTypeName,
        daysOfSchedule:
          scheduleData.daysOfSchedule?.split(",").map(Number) || [],
      });

      // Determine the type of schedule and set flags
      if (scheduleData.scheduleType?.scheduleTypeName === "ProcessWeek") {
        setIsProcessWeek(true);
        setIsProcessMonth(false);
      } else if (
        scheduleData.scheduleType?.scheduleTypeName === "ProcessMonth"
      ) {
        setIsProcessMonth(true);
        setIsProcessWeek(false);
      }
    }
  }, [scheduleData, form]);

  const handleFinish = async (values: any) => {
    console.log(scheduleData)
    try {
      const parsedValues = {
        ...scheduleData,
        duration: Number(values.duration),
        createById : scheduleData.createBy.userId,
        scheduleTypeId : scheduleData.scheduleType.scheduleTypeId,
        status: values.status === "true",
        daysOfSchedule: values.daysOfSchedule.join(","),
      };

      await updateSchedule({
        schedule: parsedValues,
        idSchedule: scheduleId, // use scheduleId instead of detailSchedule.scheduleId
      }).unwrap();
      message.success("Dự án đã được cập nhật thành công!");
      await refetchScheduleList();
      navigate(-1);
    } catch (error) { 
      console.log(error)
      message.error("Đã xảy ra lỗi khi cập nhật dự án.");
    }
  };

  // Handle loading and error states
  if (isFetchingSchedule) return <Spin tip="Loading schedule details..." />;
  if (isError) return <div>Error loading schedule details.</div>;

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

      {/* Display Schedule Type Name as disabled */}
      <Form.Item label="Loại lịch trình" name="scheduleTypeName">
        <Input disabled />
      </Form.Item>

      {/* Render input fields based on schedule type */}
      {isProcessWeek ? (
        <Form.Item
          label="Ngày trong tuần"
          name="daysOfSchedule"
          rules={[
            { required: true, message: "Vui lòng chọn ngày trong tuần!" },
          ]}
        >
          <Select mode="multiple" placeholder="Chọn ngày trong tuần">
            {dayOptions.map((day) => (
              <Option key={day.value} value={day.value}>
                {day.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ) : isProcessMonth ? (
        <Form.Item
          label="Ngày trong tháng"
          name="daysOfSchedule"
          rules={[
            { required: true, message: "Vui lòng chọn ngày trong tháng!" },
          ]}
        >
          <Select mode="multiple" placeholder="Chọn ngày trong tháng">
            {Array.from({ length: 31 }, (_, index) => (
              <Option key={index + 1} value={index + 1}>
                {index + 1}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item
          label="Ngày thực hiện"
          name="daysOfSchedule"
          rules={[{ required: true, message: "Vui lòng nhập ngày thực hiện!" }]}
        >
          <Input placeholder="Nhập ngày thực hiện" />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Cập nhật dự án
        </Button>
      </Form.Item>
      <Form.Item>
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

export default DetailSchedule;
