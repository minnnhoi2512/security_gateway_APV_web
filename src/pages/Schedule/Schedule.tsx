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
  Table,
  Space,
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
import {
  useGetListScheduleQuery,
  useDeleteScheduleMutation,
  useGetDepartmentSchedulesQuery,
} from "../../services/schedule.service";
import { useGetListUsersByDepartmentIdQuery } from "../../services/user.service";
import UserType from "../../types/userType";
import { convertToVietnamTime } from "../../utils/ultil";
import { useAssignScheduleMutation } from "../../services/scheduleUser.service";
import { isEntityError } from "../../utils/helpers";
import TableSchedule from "../../components/TableSchedule";

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
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const {
    data: schedules,
    isLoading: schedulesIsLoading,
    refetch: scheduleUserRefetch,
  } = userRole === "DepartmentManager"
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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const staffData = users.filter((user: any) => user.role?.roleId === 4);
  useEffect(() => {
    if (schedules) {
      const filtered = schedules.filter((item: any) =>
        item?.scheduleName.toLowerCase().includes(searchText.toLowerCase())
      );



      setFilteredData(filtered);
    }
  }, [schedules, searchText]);
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
      const payload = { ...assignData };
      await assignSchedule(payload).unwrap();
      notification.success({ message: "Giao nhiệm vụ thành công!" });
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
      notification.error({ message: "Có lỗi xảy ra khi giao nhiệm vụ." });
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
    <Layout className="min-h-screen bg-white">
      <Content className="px-6">
        <Space
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Input
            placeholder="Tìm kiếm theo tên lịch trình"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{
              width: 300,
              borderColor: "#1890ff",
              borderRadius: 5,
            }}
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => console.log("Haha")}
            style={{ borderRadius: 12 }}
          >
            Tạo mới
          </Button>
        </Space>
        <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
          <Button>Theo tuần</Button>
          <Button>Theo tháng</Button>
        </Space>
        <Space style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
          <Button>Còn hiệu lực</Button>
          <Button>Hết hiệu lực</Button>
        </Space>
        <TableSchedule
          schedules={filteredData || []}
          schedulesIsLoading={schedulesIsLoading}
          totalCount={schedules?.totalCount || 0}
          handleDeleteSchedule={handleDeleteSchedule}
          handleAssignUser={handleAssignUser}
        />

        <Modal
          title={
            <span className="text-xl font-semibold">
              Giao nhiệm vụ cho nhân viên
            </span>
          }
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
              Giao nhiệm vụ
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
              label="Tên nhiệm vụ"
              name="title"
              className="text-base font-medium"
              rules={[
                {
                  required: true,
                  message: "Tên nhiệm vụ không được để trống.",
                },
                { min: 5, message: "Tên nhiệm vụ phải có ít nhất 5 ký tự." },
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
                    return Promise.reject(
                      "Thời hạn phải là ngày trong tương lai."
                    );
                  },
                },
              ]}
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
                    value && value !== 0
                      ? Promise.resolve()
                      : Promise.reject("Vui lòng chọn nhân viên hợp lệ."),
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
                {staffData.map((user: any) => (
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
