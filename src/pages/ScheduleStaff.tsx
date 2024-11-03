import { Layout, Button, Table, Input, Tag, Row, Col, Divider } from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import { useGetListScheduleByStaffQuery } from "../services/schedule.service";
import { useGetSchedulesUserAssignQuery } from "../services/scheduleUser.service";
import ScheduleTable from "../components/TableScheduleUser";
const { Content } = Layout;
interface SchedulePageProps {
  status: 'assigned' | 'rejected' | 'all';
}
const ScheduleStaff : React.FC<SchedulePageProps> = ({ status }) => {
  const [scheduleUserFilter, setScheduleUserFilter] = useState([]);
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  if (userRole !== "Staff") {
    return <div>This page is only for staff.</div>;
  }

  const [searchText, setSearchText] = useState<string>("");

  const navigate = useNavigate();
  const {
    data: schedules,
    isLoading,
    isFetching,
    error,
  } = useGetSchedulesUserAssignQuery({
    pageNumber: 1,
    pageSize: 10,
    userId: Number(userId),
  });
  console.log(schedules);
  

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

        <ScheduleTable
          schedules={schedules || []}
          isLoading={isLoading || isFetching}
          totalCount={schedules?.totalCount || 0}
          scheduleUserStatus={status}
        />
      </Content>
    </Layout>
  );
};

export default ScheduleStaff;
