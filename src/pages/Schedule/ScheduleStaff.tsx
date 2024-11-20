import { Layout, Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import TableScheduleUser from "../../components/TableScheduleUser";
import { ScheduleUserType } from "../../types/ScheduleUserType";
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
  // console.log(userRole !== "Staff");
  const [searchText, setSearchText] = useState<string>("");
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
  }, []);
  const handleRowClick = (record: ScheduleUserType) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    console.log(record)
  };
  if (userRole !== "Staff") {
    return <div>This page is only for staff.</div>;
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
          // onChange={handleSearchChange}
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
        data={schedules}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        error={error}
      />
    </Content>
  );
};

export default ScheduleStaff;
