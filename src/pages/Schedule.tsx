import {
  Layout,
  Button,
  Table,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import type { ColumnsType } from "antd/es/table";

import {
  useGetListScheduleQuery,
  useDeleteScheduleMutation,
  useAssignScheduleMutation,
  useGetDepartmentSchedulesQuery,
} from "../services/schedule.service";
import { useGetListUsersByDepartmentIdQuery } from "../services/user.service";
import ScheduleType from "../types/scheduleType";
import UserType from "../types/userType";

const { Content } = Layout;
const { Option } = Select;

const ScheduleManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const userId = Number(localStorage.getItem("userId"));
  const departmentIdUser = Number(localStorage.getItem("departmentId"));
  const [assignData, setAssignData] = useState({
    title: "",
    description: "",
    note: "",
    deadlineTime: "",
    scheduleId: 0,
    assignToId: 0,
    assignFromId: parseInt(localStorage.getItem("userId") || "0"),
  });

  const [searchText, setSearchText] = useState<string>("");

  const navigate = useNavigate();
  let schedules;
  let refetch;
  let isLoading;

  if (userRole === "DepartmentManager") {
    const result = useGetDepartmentSchedulesQuery({
      departmenManagerId: userId,
      pageNumber: -1,
      pageSize: -1,
    });

    schedules = result.data;
    refetch = result.refetch;
    isLoading = result.isLoading;
  } else {
    const result = useGetListScheduleQuery({
      pageNumber: -1,
      pageSize: -1,
    });

    schedules = result.data;
    refetch = result.refetch;
    isLoading = result.isLoading;
  }

  const { data: users = [], isLoading: usersLoading } =
    useGetListUsersByDepartmentIdQuery({
      departmentId: departmentIdUser,
      pageNumber: 1,
      pageSize: 100,
    });
  // console.log(users);
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [assignSchedule] = useAssignScheduleMutation();
  useEffect(() => {
    refetch();
  }, []);

  const handleDeleteSchedule = (scheduleId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa dự án này?",
      okText: "Có",
      cancelText: "Không",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSchedule(scheduleId).unwrap();
          message.success("Dự án đã được xóa thành công!");
          refetch();
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa dự án.");
        }
      },
    });
  };
  
  // const handleAssignUser = (scheduleId?: number) => {
  //   if (!scheduleId) {
  //     message.error("Lỗi: Không tìm thấy ID dự án.");
  //     return;
  //   }
  //   setAssignData((prev) => ({ ...prev, scheduleId }));
  //   setIsModalVisible(true);
  // };
  const handleAssignUser = (scheduleId?: number, status?: boolean) => {
    if (!scheduleId) {
      message.error("Lỗi: Không tìm thấy ID dự án.");
      return;
    }

    if (status === false && !status) {
      message.warning("Không thể phân công vì dự án đã hết hiệu lực.");
      return;
    }

    setAssignData((prev) => ({ ...prev, scheduleId }));
    setIsModalVisible(true);
  };


  
  const handleDateChange = (date: moment.Moment | null) => {
    setAssignData((prev) => ({
      ...prev,
      deadlineTime: date ? date.toISOString() : "",
    }));
  };
  const filteredSchedules = schedules?.filter(
    (schedule: ScheduleType) => schedule.scheduleType?.scheduleTypeName !== "VisitDaily"
  );


  const handleAssignSubmit = async () => {
    if (!assignData.title) {
      message.error("Vui lòng nhập tiêu đề.");
      return;
    }
    if (!assignData.description) {
      message.error("Vui lòng nhập miêu tả.");
      return;
    }
    if (!assignData.deadlineTime) {
      message.error("Vui lòng chọn thời hạn.");
      return;
    }
    if (!assignData.assignToId) {
      message.error("Vui lòng chọn một nhân viên để phân công.");
      return;
    }

    if (!assignData.title || assignData.title.length < 3 || assignData.title.length > 100 || /[!@#$%^&*(),?":{}|<>]/.test(assignData.title)) {
      message.error("Tiêu đề không hợp lệ. Vui lòng kiểm tra độ dài và ký tự đặc biệt.");
      return;
    }
  

    if (!assignData.description || assignData.description.length < 10 || assignData.description.length > 100) {
      message.error("Miêu tả phải có ít nhất 10  ký tự.");
      return;
    }
  
    if (assignData.note && assignData.note.length > 200) {
      message.error("Ghi chú không được vượt quá 200 ký tự.");
      return;
    }
  
    if (!assignData.deadlineTime) {
      message.error("Vui lòng chọn thời hạn.");
      return;
    } else if (moment(assignData.deadlineTime).isAfter(moment().add(3, 'months'), 'day')) {
      message.error("Thời hạn không hợp lệ. Vui lòng chọn trong khoảng 3 tháng.");
      return;
    }else if (moment(assignData.deadlineTime).isBefore(moment(), 'day')) {
      message.error("Thời hạn không hợp lệ. Vui lòng chọn ngày hiện tại hoặc trong tương lai.");
      return;
    } else if ([0, 6].includes(moment(assignData.deadlineTime).day())) {
      message.error("Thời hạn không thể vào ngày cuối tuần.");
      return;
    }
  
    if (!assignData.assignToId) {
      message.error("Vui lòng chọn một nhân viên để phân công.");
      return;
    } else {

      const isEmployeeOverloaded = false; 
      const isEmployeeEligible = true; 
      const isEmployeeInDepartment = true; 
      const isEmployeeAvailable = true;
  
      if (isEmployeeOverloaded || !isEmployeeEligible || !isEmployeeInDepartment || !isEmployeeAvailable) {
        message.error("Nhân viên không đáp ứng yêu cầu hoặc đang có lịch trình khác. Vui lòng chọn nhân viên khác.");
        return;
      }
    }
  
    try {
      const payload = { ...assignData };
      await assignSchedule(payload).unwrap();
      message.success("Phân công thành công!");
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error("Có lỗi xảy ra khi phân công.");
    }
  };

  const columns: ColumnsType<ScheduleType> = [
    {
      title: "Tiêu đề",
      dataIndex: "scheduleName",
      key: "scheduleName",
      align: "center",
      sorter: (a, b) => a.scheduleName.localeCompare(b.scheduleName),
    },
    {
      title: "Kéo dài (ngày)",
      dataIndex: "duration",
      key: "duration",
      align: "center",
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
      render: (duration: number) => `${duration} ngày`,
    },
    {
      title: "Loại",
      dataIndex: "scheduleType",
      key: "scheduleType",
      align: "center",
      render: (text) => {
        const scheduleTypeName = text.scheduleTypeName;
        let tagColor = "default";

        switch (scheduleTypeName) {
          case "DailyVisit":
            return <Tag color="blue">Theo ngày</Tag>;
          case "ProcessWeek":
            return <Tag color="green">Theo tuần</Tag>;
          case "ProcessMonth":
            return <Tag color="orange">Theo tháng</Tag>;
          default:
            return <Tag color={tagColor}>{scheduleTypeName}</Tag>;
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-green-600 hover:text-green-800"
            onClick={() => navigate(`/detailSchedule/${record.scheduleId}`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSchedule(record.scheduleId!)}
          />
          <Button
            type="text"
            icon={<UserAddOutlined />}
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAssignUser(record.scheduleId, record.status)}
          />
        </div>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
          Danh sách Dự án Công ty
        </h1>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Input
              placeholder="Tìm kiếm theo tiêu đề"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-500"
              onClick={() => navigate("/createNewSchedule")}
            >
              Tạo mới dự án
            </Button>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={filteredSchedules  || []}
          rowKey="scheduleId"
          loading={isLoading}
          pagination={{
            total: filteredSchedules?.length || 0,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          bordered
          className="bg-white shadow-md rounded-lg"
        />

        <Modal
          title="Phân công nhân viên"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleAssignSubmit}>
              Phân công
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề.' }]}>
              <Input
                value={assignData.title}
                onChange={(e) =>
                  setAssignData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Miêu tả" rules={[{ required: true, message: 'Vui lòng nhập miêu tả.' }]}>
              <Input
                value={assignData.description}
                onChange={(e) =>
                  setAssignData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Form.Item>
            <Form.Item label="Ghi chú">
              <Input
                value={assignData.note}
                onChange={(e) =>
                  setAssignData((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Thời hạn" rules={[{ required: true, message: 'Vui lòng chọn thời hạn.' }]}>
              <DatePicker
                onChange={handleDateChange}
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
            <Form.Item label="Chọn nhân viên" rules={[{ required: true, message: 'Vui lòng chọn một nhân viên.' }]}>
              <Select
                placeholder="Chọn nhân viên"
                onChange={(value) =>
                  setAssignData((prev) => ({ ...prev, assignToId: value }))
                }
                loading={usersLoading}
              >
                {users.map((user: UserType) => (
                  <Option key={user.userId} value={user.userId}>
                    {user.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ScheduleManager;
