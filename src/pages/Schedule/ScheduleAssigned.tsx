import { Layout, Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import TableScheduleUser from "../../components/TableScheduleUser";
import ScheduleUserDetailModal from "../../components/Modal/ScheduleUserDetailModal";
import NotFoundState from "../../components/State/NotFoundState";

const { Content } = Layout;

type StatusType =
  | "All"
  | "Assigned"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancel";

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
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const userRole = localStorage.getItem("userRole");
  const {
    data: schedules,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 100,
    userId: Number(localStorage.getItem("userId")),
    status: statusFilter,
  });

  useEffect(() => {
    if (schedules) {
      setFilteredSchedules(
        schedules.filter((schedule: any) =>
          schedule.title.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [schedules, searchText]);

  const handleRowClick = useCallback(
    (record: any) => {
      if (actionType === "view") {
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

  const handleEditOrView = (record: any) => {
    setActionType("view");
    handleRowClick(record);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  if (userRole === "Staff") {
    return <div><NotFoundState></NotFoundState></div>;
  }
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
            placeholder="Tìm kiếm theo tên nhiệm vụ"
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
            className="invisible"
            style={{ borderRadius: 12 }}
          >
            Tạo mới
          </Button>
        </Space>

        <div className="bg-white shadow-lg rounded-md overflow-hidden">
          <TableScheduleUser
            data={filteredSchedules}
            isLoading={isLoading || isFetching}
            onRowClick={handleEditOrView}
            error={error}
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
