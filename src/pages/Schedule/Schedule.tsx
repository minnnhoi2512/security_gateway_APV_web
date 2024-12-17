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
  Avatar,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  PlusOutlined,
  FilterOutlined,
  CalendarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  UserOutlined,
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
interface FormData {
  title: string;
  description: string;
  note: string;
  deadlineTime: string;
  scheduleId: number;
  assignToId: number;
  startDate?: string;
  endDate?: string;
}
const Schedule = () => {
  type FormError = { [key in keyof FormData]?: string[] } | null;
  const [errorVisitor, setErrorVisitor] = useState<FormError>(null);
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
          <div className="text-center py-2">
            <h3 className="text-lg font-bold text-green-600">
              Giao Nhiệm Vụ Mới
            </h3>
            <div className="w-10 h-0.5 bg-green-600 mx-auto mt-1 rounded-full"></div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancelAssigned}
        width={800}
        centered
        footer={null}
        className="task-modal"
        styles={{
          body: {
            padding: "16px",
            background: "#f8fafc",
          },
          content: {
            padding: "0px",
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignSubmit}
          className="space-y-3"
        >
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <Form.Item
                label={
                  <span className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                    <FileTextOutlined className="text-green-600" />
                    Tên nhiệm vụ
                  </span>
                }
                name="title"
                rules={[
                  {
                    required: true,
                    message: "Tên nhiệm vụ không được để trống",
                  },
                  {
                    min: 5,
                    max: 100,
                    message:
                      "Tên nhiệm vụ phải có ít nhất 5 ký tự và tối đa 100 ký tự",
                  },,
                ]}
              >
                <Input
                  value={assignData.title}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="rounded-md h-8"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                    <UserOutlined className="text-green-600" />
                    Nhân viên phụ trách
                  </span>
                }
                name="assignToId"
                rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
              >
                <Select
                  value={assignData.assignToId}
                  onChange={(value) =>
                    setAssignData((prev) => ({
                      ...prev,
                      assignToId: value || 0,
                    }))
                  }
                  className="w-full rounded-md"
                  placeholder="Chọn nhân viên"
                  optionLabelProp="label"
                >
                  <Option value={0} disabled>
                    Chọn nhân viên
                  </Option>
                  {staffData?.map((user) => (
                    <Option
                      key={user.userId}
                      value={user.userId}
                      label={user.fullName}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={user.image}
                          icon={<UserOutlined />}
                          size="small"
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                    <CalendarOutlined className="text-green-600" />
                    Thời hạn
                  </span>
                }
                name="deadlineTime"
                rules={[
                  { required: true, message: "Vui lòng chọn thời hạn" },
                  {
                    validator: (_, value) => {
                      if (
                        value &&
                        moment(value).isSameOrAfter(moment(), "day")
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Thời hạn phải trong tương lai");
                    },
                  },
                ]}
              >
                <DatePicker
                  onChange={handleDateChange}
                  className="w-full rounded-md h-8"
                  format="DD/MM/YYYY"
                  status={errorAssignSchedule?.deadlineTime ? "error" : ""}
                />
                {errorAssignSchedule?.deadlineTime && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {errorAssignSchedule.deadlineTime[0]}
                  </p>
                )}
              </Form.Item>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3">
              <Form.Item
                label={
                  <span className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                    <CalendarOutlined className="text-green-600" />
                    Ngày bắt đầu
                  </span>
                }
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker
                  onChange={handleStartDateChange}
                  className="w-full rounded-md h-8"
                  format="DD/MM/YYYY"
                  status={errorAssignSchedule?.startDate ? "error" : ""}
                />
                {errorAssignSchedule?.startDate && (
                  <p className=" mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {errorAssignSchedule.startDate[0]}
                  </p>
                )}
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                    <CalendarOutlined className="text-green-600" />
                    Ngày kết thúc
                  </span>
                }
                name="endDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                  {
                    validator: (_, value) => {
                      if (
                        value &&
                        moment(value).isSameOrAfter(moment(), "day")
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        "Ngày kết thúc phải trong tương lai"
                      );
                    },
                  },
                ]}
              >
                <DatePicker
                  onChange={handleEndDateChange}
                  className="w-full rounded-md h-8"
                  format="DD/MM/YYYY"
                  status={errorAssignSchedule?.endDate ? "error" : ""}
                />
                {errorAssignSchedule?.endDate && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {errorAssignSchedule.endDate[0]}
                  </p>
                )}
              </Form.Item>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <Form.Item
              label={
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <FileTextOutlined className="text-green-600 text-base" />
                  <span className="text-base">Miêu tả chi tiết</span>
                </span>
              }
              name="description"
              rules={[
                { required: true, message: "Miêu tả không được để trống" },
                { max: 500, message: "Miêu tả không được quá 500 ký tự" },
              ]}
            >
              <Input.TextArea
                value={assignData.description}
                onChange={(e) =>
                  setAssignData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="rounded-md"
                rows={3}
                placeholder="Nhập miêu tả chi tiết về nhiệm vụ..."
              />
            </Form.Item>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <Form.Item
              label={
                <span className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                  <InfoCircleOutlined className="text-green-600" />
                  Ghi chú
                </span>
              }
              name="note"
              rules={[
                { required: true, message: "Ghi chú không được để trống" },
                { max: 300, message: "Ghi chú không được quá 300 ký tự" },
              ]}
            >
              <Input.TextArea
                value={assignData.note}
                onChange={(e) =>
                  setAssignData((prev) => ({ ...prev, note: e.target.value }))
                }
                className="rounded-md"
                rows={2}
                placeholder="Thêm ghi chú cho nhiệm vụ..."
              />
            </Form.Item>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={handleCancelAssigned}
              className="px-5 h-8 text-white rounded-md bg-buttonCancel hover:!bg-white hover:!border-1 hover:!border-buttonCancel hover:!text-buttonCancel text-sm "
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="px-5 h-8 rounded-md bg-green-600 hover:!bg-white  hover:!border-green-600 hover:!text-green-600 text-sm  "
            >
              Xác nhận
            </Button>
          </div>
        </Form>
      </Modal>
    </Content>
  );
};

export default Schedule;
