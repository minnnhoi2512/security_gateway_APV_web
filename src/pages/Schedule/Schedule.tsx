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
  notification,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import type { ColumnsType } from "antd/es/table";

import {
  useGetListScheduleQuery,
  useDeleteScheduleMutation,
  useGetDepartmentSchedulesQuery,
} from "../../services/schedule.service";
import { useGetListUsersByDepartmentIdQuery } from "../../services/user.service";
import ScheduleType from "../../types/scheduleType";
import UserType from "../../types/userType";
import { convertToVietnamTime, formatDate } from "../../utils/ultil";
import { useAssignScheduleMutation } from "../../services/scheduleUser.service";
import { isEntityError } from "../../utils/helpers";

const { Content } = Layout;
const { Option } = Select;

const Schedule = () => {
  type FormError = { [key in keyof typeof assignData]: string } | null;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorAssignSchedule, setErrorAssignSchedule] = useState<FormError>();
  const location = useLocation();
  const result = location?.state?.result;

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
  });
  

  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();

  const { data: schedules, isLoading: schedulesIsLoading, refetch: scheduleUserRefetch } = userRole === "DepartmentManager"
    ? useGetDepartmentSchedulesQuery({
      departmenManagerId: userId,
      pageNumber: -1,
      pageSize: -1,
    })
    : useGetListScheduleQuery({
      pageNumber: -1,
      pageSize: -1,
    });

  const { data: users = [], isLoading: usersLoading } =
    useGetListUsersByDepartmentIdQuery({
      departmentId: departmentIdUser,
      pageNumber: 1,
      pageSize: 100,
    });
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [assignSchedule] = useAssignScheduleMutation();

  const staffData = users.filter((user: any) => user.role?.roleId === 4);

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
          scheduleUserRefetch();
          message.success("Dự án đã được xóa thành công!");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa dự án.");
        }
      },
    });
  };

  const handleAssignUser = (scheduleId?: number) => {
    if (!scheduleId) {
      message.error("Lỗi: Không tìm thấy ID dự án.");
      return;
    }
    setAssignData((prev) => ({ ...prev, scheduleId }));
    setIsModalVisible(true);
  };

  const handleDateChange = (date: moment.Moment | null) => {
    setAssignData((prev) => ({
      ...prev,
      deadlineTime: date ? convertToVietnamTime(date).toISOString() : "",
    }));
  };

  const handleAssignSubmit = async () => {
    if (assignData.assignToId === 0) {
      message.error("Vui lòng chọn nhân viên.");
      return;
    }
  
    try {
      await assignSchedule({ ...assignData }).unwrap();
      notification.success({ message: "Phân công thành công!" });
      setAssignData({
        title: "",
        description: "",
        note: "",
        deadlineTime: "",
        scheduleId: 0,
        assignToId: 0,
      });
      setIsModalVisible(false);
      scheduleUserRefetch();
    } catch (error) {
      if (isEntityError(error)) {
        setErrorAssignSchedule(error.data.errors as FormError);
      }
    }
  };
  
  
  const columns: ColumnsType<ScheduleType> = [
    {
      title: "Tiêu đề",
      dataIndex: "scheduleName",
      key: "scheduleName",
      align: "left",
      width: "40%",
      sorter: (a, b) => a.scheduleName?.localeCompare(b.scheduleName),
    },
    {
      title: "Lịch trình",
      dataIndex: "scheduleType",
      key: "scheduleType",
      align: "left",
      width: "15%",
      render: (text) => {
        const scheduleTypeName = text.scheduleTypeName;
        let tagColor = "default";

        switch (scheduleTypeName) {
          case "VisitDaily":
            return <Tag color="blue" style={{ minWidth: "80px", textAlign: "center" }}>Theo ngày</Tag>;
          case "ProcessWeek":
            return <Tag color="green" style={{ minWidth: "80px", textAlign: "center" }}>Theo tuần</Tag>;
          case "ProcessMonth":
            return <Tag color="orange" style={{ minWidth: "80px", textAlign: "center" }}>Theo tháng</Tag>;
          default:
            return <Tag color={tagColor} style={{ minWidth: "80px", textAlign: "center" }}>{scheduleTypeName}</Tag>;
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "left",
      width: "15%",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"} style={{ minWidth: "80px", textAlign: "center" }}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Ngày tạo</div>,
      dataIndex: "createTime",
      key: "createTime",
      align: "left",
      width: "10%",
      render: (createDate: string) => (
        <div>{moment(createDate).format("DD/MM/YYYY")}</div>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Số lịch hẹn đã tạo</div>,
      dataIndex: "scheduleUser",
      key: "scheduleUser",
      align: "center",
      width: "10%",
      render: (scheduleUser: any) => (
        <div>
          <div>{scheduleUser.length}</div>
          {scheduleUser.length !== 0 ? <button>xem</button> : null}
        </div>
      ),
    },
    {
      title: <div style={{ textAlign: "left" }}>Ngày tạo</div>,
      key: "action",
      align: "center",
      width: "10%",
      render: (_, record: any) => (
        <div className="flex justify-center space-x-2">
          {record.scheduleUser.length === 0 && (
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 hover:text-green-800"
              onClick={() => navigate(`/detailSchedule/${record.scheduleId}`)}
            />
          )}
          {record.scheduleUser.length === 0 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSchedule(record.scheduleId!)}
            />
          )}
          <Button
            type="text"
            icon={<UserAddOutlined />}
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAssignUser(record.scheduleId)}
          />
        </div>
      ),
    },
  ];

  const handleCancelAssigned = () => {
    setAssignData({
      title: "",
      description: "",
      note: "",
      deadlineTime: "",
      scheduleId: 0,
      assignToId: 0,
    });
    setIsModalVisible(false);
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <h1 className="text-3xl font-bold text-titleMain text-center mb-4">
          Danh sách Dự án của phòng ban
        </h1>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <div className="flex items-center bg-white rounded-full shadow-sm p-2 border border-gray-300 focus-within:border-blue-500 transition-all duration-200 ease-in-out">
              <SearchOutlined className="text-gray-500 ml-2" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="ml-2 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
                style={{ width: 300 }}
              />
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-sm"
              onClick={() => navigate("/createNewSchedule")}
            >
              Tạo mới dự án
            </Button>
          </Col>
        </Row>

        <Divider />
        <Table
          dataSource={schedules || []}
          loading={schedulesIsLoading}
          columns={columns}
          rowKey="scheduleId"
          pagination={{
            pageSizeOptions: ["5", "10"],
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          className="shadow-lg rounded-md overflow-hidden"
          bordered
          rowClassName="hover:bg-gray-100"
        />

<Modal
  title={<span className="text-xl font-semibold">Phân công nhân viên</span>}
  visible={isModalVisible}
  onCancel={handleCancelAssigned}
  footer={[
    <Button
      key="cancel"
      onClick={handleCancelAssigned}
      className="rounded-full px-4 py-2 border-gray-300"
    >
      Hủy
    </Button>,
    <Button
      key="submit"
      type="primary"
      onClick={handleAssignSubmit}
      className="rounded-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
    >
      Phân công
    </Button>,
  ]}
  className="rounded-lg p-6 shadow-xl"
  bodyStyle={{
    padding: "20px",
    borderRadius: "12px",
  }}
>
  <Form
    layout="vertical"
    className="space-y-4"
    onFinish={handleAssignSubmit}
    initialValues={assignData}
  >
    <Form.Item
      label="Tiêu đề"
      name="title"
      className="text-base font-medium"
      rules={[
        { required: true, message: "Tiêu đề không được để trống." },
        { min: 5, message: "Tiêu đề phải có ít nhất 5 ký tự." },
      ]}
    >
      <Input
        value={assignData.title}
        onChange={(e) =>
          setAssignData((prev) => ({ ...prev, title: e.target.value }))
        }
        className="rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </Form.Item>
    <Form.Item
      label="Miêu tả"
      name="description"
      className="text-base font-medium"
      rules={[
        { required: true, message: "Miêu tả không được để trống." },
        { max: 500, message: "Miêu tả không được vượt quá 500 ký tự." },
      ]}
    >
      <Input
        value={assignData.description}
        onChange={(e) =>
          setAssignData((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
        className="rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </Form.Item>
    <Form.Item
      label="Ghi chú"
      name="note"
      className="text-base font-medium"
      rules={[
        { required: true, message: "Ghi chú không được để trống." },
        { max: 300, message: "Ghi chú không được vượt quá 300 ký tự." },
      ]}
    >
      <Input
        value={assignData.note}
        onChange={(e) =>
          setAssignData((prev) => ({ ...prev, note: e.target.value }))
        }
        className="rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </Form.Item>
    <Form.Item
  label="Thời hạn"
  name="deadlineTime"
  className="text-base font-medium"
  rules={[
    { required: true, message: "Vui lòng chọn thời hạn." },
    {
      validator: (_, value) => {
        if (value && moment(value).isSameOrAfter(moment(), "day")) {
          return Promise.resolve();
        }
        return Promise.reject("Thời hạn phải là ngày trong tương lai.");
      },
    },
  ]}
>
  <DatePicker
    onChange={handleDateChange}
    style={{ width: "100%" }}
    format="DD/MM/YYYY"
    className="rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  />
</Form.Item>
<Form.Item
  label="Chọn nhân viên"
  name="assignToId"
  className="text-base font-medium"
  rules={[
    { required: true, message: "Vui lòng chọn nhân viên." },
    {
      validator: (_, value) =>
        value && value !== 0 ? Promise.resolve() : Promise.reject("Vui lòng chọn nhân viên hợp lệ."),
    },
  ]}
>
  <Select
    placeholder="Chọn nhân viên"
    value={assignData.assignToId}
    onChange={(value) =>
      setAssignData((prev) => ({ ...prev, assignToId: value || 0 }))
    }
    className="rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  >
    <Option value={0} disabled>
      Chọn nhân viên
    </Option>
    {staffData.map((user) => (
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

export default Schedule;
