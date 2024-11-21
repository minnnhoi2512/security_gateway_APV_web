import { Layout, Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import TableScheduleUser from "../../components/TableScheduleUser";
import { ScheduleUserType } from "../../types/ScheduleUserType";
import ScheduleUserDetailModal from "../../components/Modal/ScheduleUserDetailModal";
import NotFoundState from "../../components/State/NotFoundState";

const { Content } = Layout;

interface SchedulePageProps {
  status: "Assigned" | "Rejected" | "All";
}

const ScheduleStaff: React.FC<SchedulePageProps> = ({ status }) => {
  const [selectedRecord, setSelectedRecord] = useState<ScheduleUserType | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const [searchText, setSearchText] = useState<string>("");
  const [filteredSchedules, setFilteredSchedules] = useState<
    ScheduleUserType[]
  >([]);

  const {
    data: schedules,
    isLoading,
    refetch,
    error,
  } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 100,
    userId: Number(userId),
    status: status,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (schedules) {
      setFilteredSchedules(
        schedules.filter((schedule: any) =>
          schedule.title.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [schedules, searchText]);

  const handleRowClick = (record: ScheduleUserType) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    console.log(record);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  if (userRole !== "Staff") {
    return <div><NotFoundState></NotFoundState></div>;
  }

  return (
    <Content className="px-6">
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Tìm kiếm theo tiêu đề"
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

      <TableScheduleUser
        data={filteredSchedules}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        error={error}
      />

      {selectedRecord && (
        <ScheduleUserDetailModal
          selectedRecord={selectedRecord}
          isVisible={isModalVisible}
          handleClose={handleModalClose}
          refetch={() => console.log("")}
        />
      )}
    </Content>
  );
};

export default ScheduleStaff;
