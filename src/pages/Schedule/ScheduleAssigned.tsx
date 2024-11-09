import {
  Layout,
  Button,
  Input,
  Dropdown,
  Menu,
  Space,
  message,
  Modal,
  Divider,
} from "antd";
import { SearchOutlined, PlusOutlined, DownOutlined, FilterOutlined } from "@ant-design/icons";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteScheduleMutation } from "../../services/schedule.service";
import { useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import TableScheduleUser from "../../components/TableScheduleUser";
import ScheduleUserDetailModal from "../../components/Modal/ScheduleUserDetailModal";

const { Content } = Layout;

type StatusType = 'All' | 'Assigned' | 'Pending' | 'Approved' | 'Rejected' | 'Cancel';

interface StatusOption {
  label: string;
  value: StatusType;
}

const ScheduleAssignedManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("All");
  const [actionType, setActionType] = useState<string | null>(null);
  const navigate = useNavigate();

  const statusOptions: StatusOption[] = [
    { label: 'Tất cả', value: 'All' },
    { label: 'Chờ tạo', value: 'Assigned' },
    { label: 'Chờ phê duyệt', value: 'Pending' },
    { label: 'Đã phê duyệt', value: 'Approved' },
    { label: 'Đã từ chối', value: 'Rejected' },
    { label: 'Đã hủy', value: 'Cancel' }
  ];

  const getStatusColor = (status: StatusType): string => {
    const colors: Record<StatusType, string> = {
      All: 'bg-gray-100',
      Assigned: 'bg-blue-100',
      Pending: 'bg-yellow-100',
      Approved: 'bg-green-100',
      Rejected: 'bg-red-100',
      Cancel: 'bg-purple-100'
    };
    return colors[status] || 'bg-gray-100';
  };

  const getCurrentStatusLabel = (): string => {
    return statusOptions.find(option => option.value === statusFilter)?.label || 'Tất cả';
  };

  const menuItems = statusOptions.map((option) => ({
    key: option.value,
    label: option.label,
  }));

  const handleMenuClick = (e) => {
    setStatusFilter(e.key as StatusType);
  };

  const { data: schedules, isLoading, isFetching, error, refetch } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 10,
    userId: Number(localStorage.getItem("userId")),
    status: statusFilter,
  });

  const handleRowClick = useCallback(
    (record) => {
      if (actionType === 'view') {
        setSelectedRecord(record);
        setIsModalVisible(true);
      }
    },
    [actionType]
  );

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
    setActionType(null);
  };

  const [deleteSchedule] = useDeleteScheduleMutation();

  const handleDeleteSchedule = async (scheduleId: number): Promise<void> => {
    setActionType('delete'); 

    return new Promise((resolve) => {
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
            resolve();
          } catch (error) {
            message.error("Có lỗi xảy ra khi xóa dự án.");
            resolve();
          }
        },
        onCancel: () => resolve(),
      });
    });
  };

  const handleEditOrView = (record) => {
    setActionType('view');
    handleRowClick(record);
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-titleMain">Danh sách lịch trình đã giao</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center bg-white rounded-full shadow-sm p-2 border border-gray-300 focus-within:border-blue-500 transition-all duration-200 ease-in-out w-[300px]">
              <SearchOutlined className="text-gray-500 ml-2" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="ml-2 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            <Dropdown
              overlay={
                <Menu
                  items={menuItems}
                  onClick={handleMenuClick}
                  selectedKeys={[statusFilter]}
                />
              }
              trigger={['click']}
            >
              <Button
                className={`${getStatusColor(statusFilter)} flex items-center justify-between text-gray-700 px-4 py-2 rounded-md shadow-sm`}
              >
                <Space>
                  <FilterOutlined className="mr-1" />
                  <span className="font-semibold">{getCurrentStatusLabel()}</span>
                </Space>
              </Button>
            </Dropdown>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/createNewSchedule")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-sm"
          >
            Tạo mới dự án
          </Button>
        </div>
        <Divider />

        <div className="bg-white shadow-lg rounded-md overflow-hidden">
          <TableScheduleUser
            data={schedules}
            isLoading={isLoading || isFetching}
            onRowClick={handleEditOrView}
            error={error}
            deleteSchedule={handleDeleteSchedule}
            refetch={refetch}
          />
        </div>

        {isModalVisible && (
          <ScheduleUserDetailModal
            isVisible={isModalVisible}
            handleClose={handleModalClose}
            selectedRecord={selectedRecord}
            refetch={refetch}
          />
        )}
      </Content>
    </Layout>
  );
};

export default ScheduleAssignedManager;
