import {
  Layout,
  Button,
  Input,
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
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  useGetListScheduleQuery,
  useDeleteScheduleMutation,
  useGetDepartmentSchedulesQuery,
} from "../../services/schedule.service";
import { useGetListUsersByDepartmentIdQuery } from "../../services/user.service";
import UserType from "../../types/userType";
import { convertToVietnamTime } from "../../utils/ultil";
import { useAssignScheduleMutation } from "../../services/scheduleUser.service";
import TableSchedule from "../../components/TableSchedule";
import { isEntityError } from "../../utils/helpers";

const { Content } = Layout;
const { Option } = Select;

const Schedule = () => {
  type FormError = { [key in keyof typeof assignData]: string } | null;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorAssignSchedule, setMysit] = useState<FormError>();
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

  const {
    data: schedules,
    isLoading: schedulesIsLoading,
    refetch: scheduleUserRefetch,
  } =
    userRole === "DepartmentManager"
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

  useEffect(() => {
    scheduleUserRefetch();
  }, []);

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
    try {
      const payload = { ...assignData };
      await assignSchedule(payload).unwrap();
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
        setMysit(error.data.errors as FormError);
      }
      notification.error({ message: "Có lỗi xảy ra khi phân công." });
    }
  };

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
        <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
          Danh sách Dự án của phòng ban
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
        <TableSchedule
          schedules={schedules || []}
          schedulesIsLoading={schedulesIsLoading}
          totalCount={schedules?.totalCount || 0}
          handleDeleteSchedule={handleDeleteSchedule}
          handleAssignUser={handleAssignUser}
        />  

        <Modal
          title="Phân công nhân viên"
          visible={isModalVisible}
          onCancel={handleCancelAssigned}
          footer={[
            <Button key="cancel" onClick={handleCancelAssigned}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleAssignSubmit}>
              Phân công
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item label="Tiêu đề">
              <Input
                value={assignData.title}
                onChange={(e) =>
                  setAssignData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Miêu tả">
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
            <Form.Item
              label="Thời hạn"
              validateStatus={errorAssignSchedule?.deadlineTime ? "error" : ""}
              help={
                errorAssignSchedule?.deadlineTime
                  ? errorAssignSchedule.deadlineTime[0]
                  : ""
              }
            >
              <DatePicker
                onChange={handleDateChange}
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
            <Form.Item label="Chọn nhân viên">
              <Select
                placeholder="Chọn nhân viên"
                onChange={(value) =>
                  setAssignData((prev) => ({ ...prev, assignToId: value }))
                }
                loading={usersLoading}
              >
                {staffData.map((user: UserType) => (
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
