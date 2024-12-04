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
import { CalendarDays, CalendarRange, Clock4 } from "lucide-react";

const { Content } = Layout;
const { Option } = Select;

const Schedule = () => {
  type FormError = { [key in keyof typeof assignData]: string } | null;
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorAssignSchedule, setMysit] = useState<FormError>();
  const [filterScheduleTypeId, setFilterScheduleTypeId] = useState<
    number | null
  >(null);
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
  if (userRole === "Staff") {
    return (
      <div>
        <NotFoundState />
      </div>
    );
  }
  return (
    <Content className="p-4 max-w-[1400px] mx-auto">
      <div className="flex justify-end items-center mb-4">
        {/* <h1 className="text-2xl font-bold text-mainColor">
          Quản lý lịch trình
        </h1> */}
        <Button
          icon={<PlusOutlined />}
          onClick={() => navigate("/schedule/createNewSchedule")}
          className="px-4 py-4 text-lg   rounded-lg bg-mainColor hover:bg-opacity-90 transition-all   shadow-md text-white flex items-center justify-center"
        >
          <span className="mb-[2px]">Tạo mới</span>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 flex-1">
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
                  // onClick={handleClearFilters}
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

        <div className="flex gap-2">
          <Button
            className={`min-w-[120px] border-2 bg-yellow-50 border-yellow-500 text-yellow-600 hover:bg-yellow-50`}
            onClick={() => handleFilterScheduleTypeId(2)} // Assuming 1 is the ScheduleTypeId for "Theo tuần"
          >
            <CalendarDays size={17} />
            Theo tuần
          </Button>
          <Button
            className={`min-w-[120px] border-2 bg-purple-50 border-purple-500 text-purple-600 hover:bg-purple-50`}
            onClick={() => handleFilterScheduleTypeId(3)} // Assuming 2 is the ScheduleTypeId for "Theo tháng"
          >
            <CalendarRange size={17} />
            Theo tháng
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        {/* Status Filter Tabs */}
        <div className="">
          <Button
            className={`rounded-t-3xl mr-[2px] relative bg-mainColor text-white border-none hover:bg-mainColor border-mainColor hover:text-mainColor hover:border-mainColor`}
            onClick={() => handleFilterStatus(true)}
          >
            Còn hiệu lực
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
              {schedules?.filter((item) => item?.status === true).length}
            </div>
          </Button>
          <Button
            className={`rounded-t-3xl mr-[2px] relative bg-mainColor text-white border-none hover:bg-mainColor border-mainColor hover:text-mainColor hover:border-mainColor`}
            onClick={() => handleFilterStatus(false)}
          >
            Hết hiệu lực
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
              {schedules?.filter((item) => item?.status === false).length}
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
        
      </Card>

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
