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
  Card,
  Slider,
  Popover,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  PlusOutlined,
  FilterOutlined,
  CalendarOutlined,
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
import NotFoundState from "../../components/State/NotFoundState";
import { CalendarDays, CalendarRange, Clock4, Plus } from "lucide-react";
import { ScheduleType } from "../../types/Enum/ScheduleType";
import { Dayjs } from "dayjs";
import { VisitStatus } from "../../types/Enum/VisitStatus";

const { Content } = Layout;
const { Option } = Select;

interface Filters {
  expectedStartTime: Dayjs | null;
  expectedEndTime: Dayjs | null;
  visitQuantity: [number, number];
  visitStatus: VisitStatus[];
  scheduleTypeId: any[];
}

const Schedule = () => {
  type FormError = { [key in keyof typeof assignData]: string } | null;
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorAssignSchedule, setMysit] = useState<FormError>();
  const [filterScheduleTypeId, setFilterScheduleTypeId] = useState<
    number | null
  >(null);
  const [form] = Form.useForm();

  const [staffData, setStaffData] = useState<any[]>([]);
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

  useEffect(() => {
    setStaffData(users.filter((user: any) => user.role?.roleId === 4));
    if (schedules) {
      let filtered = schedules;

      if (filterStatus !== null) {
        filtered = filtered.filter((item: any) => item.status === filterStatus);
      }

      if (filterScheduleTypeId !== null) {
        filtered = filtered.filter(
          (item: any) =>
            item.scheduleType.scheduleTypeId === filterScheduleTypeId
        );
      }

      if (searchText) {
        filtered = filtered.filter((item: any) =>
          item?.scheduleName.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setFilteredData(filtered);
    }
  }, [schedules, searchText, filterStatus, filterScheduleTypeId]);

  const handleFilterStatus = (status: boolean | null) => {
    setFilterStatus((prevStatus) => (prevStatus === status ? null : status));
  };

  const handleFilterScheduleTypeId = (scheduleTypeId: number | null) => {
    setFilterScheduleTypeId((prevTypeId) =>
      prevTypeId === scheduleTypeId ? null : scheduleTypeId
    );
  };
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
          notification.success({ message: "Dự án đã được xóa thành công!" });
        } catch (error) {
          notification.error({ message: "Có lỗi xảy ra khi xóa dự án." });
        }
      },
    });
  };

  const handleAssignUser = (scheduleId?: number) => {
    if (!scheduleId) {
      notification.error({ message: "Lỗi: Không tìm thấy dự án." });
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
  const handleStartDateChange = (date: moment.Moment | null) => {
    setAssignData((prev) => ({
      ...prev,
      startDate: date ? convertToVietnamTime(date).toISOString() : "",
    }));
  };
  const handleEndDateChange = (date: moment.Moment | null) => {
    setAssignData((prev) => ({
      ...prev,
      endDate: date ? convertToVietnamTime(date).toISOString() : "",
    }));
  };
  const handleAssignSubmit = async () => {
    if (assignData.assignToId === 0) {
      notification.error({ message: "Vui lòng chọn nhân viên." });
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
        scheduleId: null,
        assignToId: null,
      });
      form.resetFields();
      setIsModalVisible(false);
      scheduleUserRefetch();
    } catch (error) {
      if (isEntityError(error)) {
        setMysit(error.data.errors as FormError);
      }
      notification.error({ message: "Có lỗi xảy ra khi giao nhiệm vụ." });
    }
  };

  const [filters, setFilters] = useState<Filters>({
    expectedStartTime: null,
    expectedEndTime: null,
    visitQuantity: [1, 100],
    visitStatus: [],
    scheduleTypeId: [],
  });

  const handleTypeFilter = (type: ScheduleType | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      scheduleTypeId: prevFilters.scheduleTypeId.includes(type) ? [] : [type],
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      expectedStartTime: null,
      expectedEndTime: null,
      visitQuantity: [1, 100],
      visitStatus: [],
      scheduleTypeId: [],
    });
  };

  const handleCancelAssigned = () => {
    setAssignData({
      title: "",
      description: "",
      note: "",
      deadlineTime: "",
      scheduleId: null,
      assignToId: null,
    });
    form.resetFields();
    setIsModalVisible(false);
  };
  if (userRole === "Staff") {
    return (
      <div>
        <NotFoundState />
      </div>
    );
  }

  return (
    <Content className="p-2 max-w-[1200px] mx-auto mt-10">
      <div className="flex gap-4 mb-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Tìm kiếm chuyến thăm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={handleSearchChange}
            className="max-w-xs"
          />
          <Popover
            content={
              <Space direction="vertical" className="w-64">
                <DatePicker
                  placeholder="Ngày bắt đầu"
                  className="w-full"
                  // onChange={(date) =>
                  //   handleFilterChange("expectedStartTime", date)
                  // }
                />
                <DatePicker
                  placeholder="Ngày kết thúc"
                  className="w-full"
                  // onChange={(date) =>
                  //   handleFilterChange("expectedEndTime", date)
                  // }
                />

                <div className="mt-4">
                  <small className="text-gray-500 block mb-2">Trạng thái</small>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => setFilterStatus(true)}
                      className={`
              relative 
              rounded-full 
              px-3 
              py-1 
              h-auto 
              text-xs 
              transition-all 
              duration-200 
              ${
                filterStatus === true
                  ? "bg-[#34495e] text-white hover:bg-primary/90"
                  : "bg-[white] text-primary border-primary hover:bg-primary/10"
              }
            `}
                    >
                      <span className="relative z-10">Còn hiệu lực</span>
                    </Button>
                    <Button
                      onClick={() => setFilterStatus(false)}
                      className={`
              relative 
              rounded-full 
              px-3 
              py-1 
              h-auto 
              text-xs 
              transition-all 
              duration-200 
              ${
                filterStatus === false
                  ? "bg-[#34495e] text-white hover:bg-primary/90"
                  : "bg-[white] text-primary border-primary hover:bg-primary/10"
              }
            `}
                    >
                      <span className="relative z-10">Hết hiệu lực</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-1">
                  <small className="text-gray-500">Số lượng khách</small>
                  <Slider
                    range
                    min={1}
                    max={100}
                    defaultValue={[1, 100]}
                    // onChange={(value) =>
                    //   handleFilterChange("visitQuantity", value)
                    // }
                  />
                </div>
                <Button
                  type="default"
                  block
                  onClick={() => {
                    setFilterStatus(null);
                  }}
                  size="small"
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            }
            trigger="click"
            placement="bottomRight"
          >
            <Button icon={<FilterOutlined />} />
          </Popover>
        </div>
        <Button
          onClick={() => navigate("/schedule/createNewSchedule")}
          className="group relative px-6 py-4 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
        >
          <div className="flex items-center gap-2 text-white">
            <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
            <span className="font-medium text-lg">Tạo mới</span>
          </div>
        </Button>
      </div>

      <TableSchedule
        schedules={filteredData || []}
        schedulesIsLoading={schedulesIsLoading}
        totalCount={filteredData?.length || 0}
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
          form={form}
          layout="vertical"
          className="space-y-4"
          onFinish={handleAssignSubmit}
          // initialValues={assignData}
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
            label="Ngày bắt đầu"
            name="startDate"
            className="text-base font-medium"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu." }]}
          >
            <DatePicker
              onChange={handleStartDateChange}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              className="rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </Form.Item>
          <Form.Item
            label="Ngày kết thúc"
            name="endDate"
            className="text-base font-medium"
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc." },
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
          >
            <DatePicker
              onChange={handleEndDateChange}
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
  );
};

export default Schedule;
