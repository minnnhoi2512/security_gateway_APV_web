import {
  Layout,
  Button,
  Table,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  message,
} from "antd";
import { useState, useEffect } from "react";
import {
  useGetListScheduleQuery,
  useCreateNewScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} from "../services/schedule.service";
import ScheduleType from "../types/scheduleType";

const { Content } = Layout;
const { Option } = Select;

const ScheduleManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  const [form] = Form.useForm();
  const userId = localStorage.getItem("userId");

  if (userId === null) return;

  const { data, refetch } = useGetListScheduleQuery({
    pageNumber: -1,
    pageSize: -1,
  });

  const [createNewSchedule, { isLoading: isCreating }] = useCreateNewScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSchedule = (record: ScheduleType) => {
    setSelectedSchedule(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    try {
      const parsedValues = {
        ...values,
        duration: Number(values.duration),
        status: values.status === "true",
        createById: parseInt(userId, 10),
      };
      if (selectedSchedule) {
        await updateSchedule({
          schedule: parsedValues,
          idSchedule: selectedSchedule.scheduleId,
        }).unwrap();
        message.success("Dự án đã được cập nhật thành công!");
      } else {
        await createNewSchedule(parsedValues).unwrap();
        message.success("Dự án đã được tạo thành công!");
      }
      refetch();
      handleCancel();
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tạo hoặc cập nhật dự án.");
      console.error(error);
    }
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa dự án này?",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await deleteSchedule(scheduleId).unwrap();
          message.success("Dự án đã được xóa thành công!");
          refetch();
        } catch (error) {
          message.error("Đã xảy ra lỗi khi xóa dự án.");
          console.error(error);
        }
      },
    });
  };

  useEffect(() => {
    if (selectedSchedule) {
      form.setFieldsValue({
        ...selectedSchedule,
        status: selectedSchedule.status.toString(),
      });
    }
  }, [selectedSchedule, form]);

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "scheduleName",
      key: "scheduleName",
      sorter: (a: ScheduleType, b: ScheduleType) =>
        a.scheduleName.localeCompare(b.scheduleName),
      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Kéo dài",
      dataIndex: "duration",
      key: "duration",
      render: (text: any) => (
        <div className="flex items-center">{text} ngày</div>
      ),
    },
    {
      title: "Miêu tả",
      dataIndex: "description",
      key: "description",
      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ScheduleType) => (
        <>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 mr-2"
            onClick={() => handleEditSchedule(record)}
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteSchedule(record.scheduleId)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  const initialValues = {
    scheduleTypeId: 3,
    createById: parseInt(userId, 10),
    status: true,
    scheduleName: "",
    daysOfProcess: "",
    duration: "",
    description: "",
  };

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="p-6">
          <div className="flex justify-center mb-4">
            <h1 className="text-green-500 text-2xl font-bold">
              Danh sách dự án công ty
            </h1>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={handleCreateSchedule}
          >
            Tạo mới dự án
          </Button>
          <Input
            placeholder="Tìm kiếm theo tiêu đề"
            value={searchText}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, width: 300 }}
          />
          <Table
            columns={columns}
            dataSource={data} // Assuming data contains schedules
            pagination={{
              total: data?.totalCount, // Assuming totalCount is provided in the response
            }}
          />
          <Modal
            title={selectedSchedule ? "Chỉnh sửa dự án" : "Tạo mới dự án"}
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={initialValues}
            >
              <Form.Item
                label="Tiêu đề"
                name="scheduleName"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input placeholder="Nhập tiêu đề dự án" />
              </Form.Item>
              <Form.Item
                label="Ngày thực hiện"
                name="daysOfProcess"
                rules={[
                  { required: true, message: "Vui lòng nhập ngày thực hiện!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Thời gian kéo dài (ngày)"
                name="duration"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thời gian kéo dài!",
                  },
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
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="true">Còn hiệu lực</Option>
                  <Option value="false">Hết hiệu lực</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Loại dự án"
                name="scheduleTypeId"
                rules={[
                  { required: true, message: "Vui lòng chọn loại dự án!" },
                ]}
              >
                <Select placeholder="Chọn loại dự án">
                  <Option value={1}>Lịch trình theo tuần</Option>
                  <Option value={2}>Lịch trình theo tháng</Option>
                  <Option value={3}>Lịch trình cho khách</Option>
                </Select>
              </Form.Item>
              <Form.Item
                hidden={true}
                label="Người tạo"
                name="createById"
                rules={[
                  { required: true, message: "Người tạo không xác định!" },
                ]}
              >
                <Input disabled value={parseInt(userId, 10)} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                >
                  {selectedSchedule ? "Cập nhật dự án" : "Tạo mới dự án"}
                </Button>
              </Form.Item>
              <Form.Item>
                <Button type="default" onClick={handleCancel}>
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ScheduleManager;