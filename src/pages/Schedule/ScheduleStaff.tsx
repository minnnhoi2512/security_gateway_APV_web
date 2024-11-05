import { Layout, Button, Table, Input, Tag, Row, Col, Divider } from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import ScheduleTable from "../../components/TableScheduleUser";
import TableScheduleUser from "../../components/TableScheduleUser";
import { ScheduleUserType } from "../../types/ScheduleUserType";
const { Content } = Layout;
interface SchedulePageProps {
  status: 'Assigned' | 'Rejected' | 'All';
}
const ScheduleStaff: React.FC<SchedulePageProps> = ({ status }) => {
  const [selectedRecord, setSelectedRecord] = useState<ScheduleUserType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  if (userRole !== "Staff") {
    return <div>This page is only for staff.</div>;
  }
  const [searchText, setSearchText] = useState<string>("");
  const {
    data: schedules,
    isLoading,
    isFetching,
    error,
  } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 10,
    userId: Number(userId),
    status: status,
  });
  console.log(schedules)
  const handleRowClick = (record: ScheduleUserType) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    //console.log(record);
  };
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
          Danh sách Dự án Công ty
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
        </Row>

        <Divider />
        <TableScheduleUser
          data={schedules}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          error={"fdsfas"}
        />
        {/* <ScheduleTable
          schedules={schedules || []}
          isLoading={isLoading || isFetching}
          totalCount={schedules?.totalCount || 0}
          scheduleUserStatus={status}
        /> */}
      </Content>
    </Layout>
  );
};

export default ScheduleStaff;
