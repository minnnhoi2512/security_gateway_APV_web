import {
  Layout,
  Button,
  Table,
  Tag,
  Modal,
  message,
  Form,
  Input,
  DatePicker,
} from "antd";
import { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

interface DataType {
  key: string;
  title: string;
  startDate: string;
  endDate: string;
  numberOfPeople: number;
  status: string;
}

const ProjectManager = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      title: "Dự án A",
      startDate: "2024-09-01 10:00",
      endDate: "2024-09-01 12:00",
      numberOfPeople: 5,
      status: "Đang tiến hành",
    },
    {
      key: "2",
      title: "Dự án B",
      startDate: "2024-09-05 14:00",
      endDate: "2024-09-05 16:00",
      numberOfPeople: 3,
      status: "Đã hoàn thành",
    },
    {
      key: "3",
      title: "Dự án C",
      startDate: "2024-09-10 09:00",
      endDate: "2024-09-10 11:00",
      numberOfPeople: 4,
      status: "Chưa bắt đầu",
    },
  ]);

  const [form] = Form.useForm();

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleAddProject = () => {
    form.validateFields().then((values) => {
      const newProject: DataType = {
        key: (data.length + 1).toString(),
        title: values.title,
        startDate: values.startDate.format("YYYY-MM-DD HH:mm"),
        endDate: values.endDate.format("YYYY-MM-DD HH:mm"),
        numberOfPeople: values.numberOfPeople,
        status: "Chưa bắt đầu", // Default status
      };
      setData([newProject, ...data]);
      message.success("Thêm dự án thành công!");
      setIsAddModalVisible(false);
      form.resetFields();
    });
  };

  const handleDeleteProject = (key: string) => {
    const updatedData = data.filter((project) => project.key !== key);
    setData(updatedData);
    message.success("Xóa dự án thành công!");
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter the data based on search text
  const filteredData = data.filter((project) =>
    project.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: (a: DataType, b: DataType) => a.title.localeCompare(b.title),
      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a: DataType, b: DataType) =>
        moment(a.startDate).unix() - moment(b.startDate).unix(),
      render: (date: any) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a: DataType, b: DataType) =>
        moment(a.endDate).unix() - moment(b.endDate).unix(),
      render: (date: any) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số người",
      dataIndex: "numberOfPeople",
      key: "numberOfPeople",
      sorter: (a: DataType, b: DataType) => a.numberOfPeople - b.numberOfPeople,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color =
          status === "Đang tiến hành"
            ? "orange"
            : status === "Đã hoàn thành"
            ? "green"
            : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: DataType) => (
        <>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 mr-2"
            onClick={() =>
              navigate("/detailProject", {
                state: {
                  title: record.title,
                  startDate: record.startDate,
                  endDate: record.endDate,
                  numberOfPeople: record.numberOfPeople,
                  status: record.status,
                },
              })
            }
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteProject(record.key)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

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
            onClick={showAddModal}
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
            dataSource={filteredData}
            pagination={false}
          />
        </Content>

        {/* Modal for Adding New Project */}
        <Modal
          title="Thêm dự án mới"
          visible={isAddModalVisible}
          onCancel={handleAddCancel}
          footer={[
            <Button key="cancel" onClick={handleAddCancel}>
              Hủy bỏ
            </Button>,
            <Button key="save" type="primary" onClick={handleAddProject}>
              Thêm
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Tiêu đề dự án"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề dự án" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn thời gian bắt đầu" },
              ]}
            >
              <DatePicker showTime />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn thời gian kết thúc" },
              ]}
            >
              <DatePicker showTime />
            </Form.Item>
            <Form.Item
              name="numberOfPeople"
              label="Số người"
              rules={[{ required: true, message: "Vui lòng nhập số người" }]}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  );
};

export default ProjectManager;
