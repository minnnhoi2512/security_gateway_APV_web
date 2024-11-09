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
  Dropdown,
  Space,
  MenuProps,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useDeleteScheduleMutation } from "../../services/schedule.service";
import { useAssignScheduleMutation, useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import { ScheduleUserType } from "../../types/ScheduleUserType";
import TableScheduleUser from "../../components/TableScheduleUser";
import { isEntityError, isFerchBaseQueryError } from "../../utils/helpers";
import ScheduleUserDetailModal from "../../components/Modal/ScheduleUserDetailModal";

type FormError =
  |
  {
    [key in keyof ScheduleUserType]: string;
  }
  | null;


const { Content } = Layout;
type StatusType = 'All' | 'Assigned' | 'Pending' | 'Approved' | 'Rejected' | 'Cancel';

interface StatusOption {
  label: string;
  value: StatusType;
}
const ScheduleAssignedManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScheduleUserType | null>(null);
  const userId = Number(localStorage.getItem("userId"));

  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("All");
  const navigate = useNavigate();

  const statusOptions: StatusOption[] = [
    { label: 'Tất cả', value: 'All' },
    { label: 'Đang chờ xử lý', value: 'Assigned' },
    { label: 'Đang chờ duyệt', value: 'Pending' },
    { label: 'Đã chấp nhận', value: 'Approved' },
    { label: 'Đã từ chối', value: 'Rejected' },
    { label: 'Đã hủy', value: 'Cancel' }
  ];

  const getStatusColor = (status: StatusType): string => {
    const colors: Record<StatusType, string> = {
      All: '#f9fafb',
      Assigned: '#e0f2fe',
      Pending: '#fef9c3',
      Approved: '#dcfce7',
      Rejected: '#fee2e2',
      Cancel: '#f3e8ff'
    };
    return colors[status] || colors.All;
  };

  const getCurrentStatusLabel = (): string => {
    return statusOptions.find(option => option.value === statusFilter)?.label || 'Tất cả';
  };

  const menuItems: MenuProps['items'] = statusOptions.map((option) => ({
    key: option.value,
    label: option.label,
  }));

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setStatusFilter(e.key as StatusType);
  };
  //Nhật
  const {
    data: schedules,
    isLoading,
    isFetching,
    error,
    refetch   
  } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 100,
    userId: Number(userId),
    status: statusFilter,
  });

  console.log("TAO LOG RA schedules", schedules);
  
  

  const handleRowClick = (record: ScheduleUserType) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    //console.log(record);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };
  // const errorForm: FormError = useMemo(() => {
  //   if (isEntityError(error)) {
  //     return error.data.error as FormError;
  //   }
  //   return null;
  // }, [error]);
  // console.log(errorForm);
  // useEffect(() => {
  //   console.log(statusFilter);
  //   console.log(schedules);
  // }, [statusFilter]);

  // const { data: users = [], isLoading: usersLoading } =
  //   useGetListUsersByDepartmentIdQuery({
  //     departmentId: departmentIdUser,
  //     pageNumber: 1,
  //     pageSize: 100,
  //   });
  // console.log(users);

  const [deleteSchedule] = useDeleteScheduleMutation();

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
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa dự án.");
        }
      },
    });
  };


  // const handleDateChange = (date: moment.Moment | null) => {
  //   setAssignData((prev) => ({
  //     ...prev,
  //     deadlineTime: date ? date.toISOString() : "",
  //   }));
  // };

  // const handleAssignSubmit = async () => {
  //   try {
  //     const payload = { ...assignData };
  //     // console.log("Payload gửi:", payload); // Kiểm tra payload
  //     await assignSchedule(payload).unwrap();
  //     message.success("Phân công thành công!");
  //     setIsModalVisible(false);
  //   } catch (error) {
  //     message.error("Có lỗi xảy ra khi phân công.");
  //   }
  // };



  return (
    <Layout className="min-h-screen bg-gray-50">
    <Content className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">
              Danh sách lịch trình đã giao
          </h1>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4 w-full sm:w-auto flex-wrap">
            {/* Status Filter Dropdown */}
            <Dropdown 
              menu={{ 
                items: menuItems,
                onClick: handleMenuClick,
                selectedKeys: [statusFilter]
              }}
              trigger={['click']}
            >
              <Button
                style={{ 
                  backgroundColor: getStatusColor(statusFilter),
                  minWidth: '140px'
                }}
              >
                <Space>
                  {getCurrentStatusLabel()}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            {/* Search Input */}
            <Input
              placeholder="Tìm kiếm theo tiêu đề"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              style={{ width: 300 }}
            />
          </div>

          {/* Create New Project Button */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/createNewSchedule")}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            Tạo mới dự án
          </Button>
        </div>

        {/* Table Component */}
        <div className="mt-6">
          <TableScheduleUser
            data={schedules}
            isLoading={isLoading || isFetching}
            onRowClick={handleRowClick}
            error={error}
          />
        </div>
      </div>

      {/* Modal */}
      <ScheduleUserDetailModal
        isVisible={isModalVisible}
        handleClose={handleModalClose}
        selectedRecord={selectedRecord}
        refetch={refetch}
      />
    </Content>
  </Layout>
  );
};

export default ScheduleAssignedManager;
