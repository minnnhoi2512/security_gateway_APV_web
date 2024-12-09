import React, { useState } from "react";
import { Card, Col, Row, Statistic, Spin, Radio } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { UserOutlined, TeamOutlined, IdcardOutlined } from "@ant-design/icons";
import {
  useGetDashboardCardIssuesQuery,
  useGetDashboardCardStatusQuery,
  useGetDashboardScheduleQuery,
  useGetDashboardUserQuery,
  useGetDashboardVisitorQuery,
  useGetDashboardVisitorSessionMonthQuery,
  useGetDashboardVisitorSessionStatusTodayQuery,
  useGetDashboardVisitorSSYearQuery,
  useGetDashboardVisitQuery,
} from "../services/dashboard.service";

interface UserData {
  admin: number;
  manager: number;
  departmentManager: number;
  staff: number;
  security: number;
}

interface VisitorData {
  total: number;
  active: number;
  inavtive: number;
}

interface ScheduleData {
  week: number;
  month: number;
}

interface SessionStatus {
  count: number;
  status: string;
}

interface CardStatus {
  count: number;
  status: string;
}

interface CardIssue {
  totalCard: number;
  totalCardIssue: number;
}

interface MonthlyCount {
  month: number;
  count: number;
}

interface VisitorSSYear {
  monthlyCounts: MonthlyCount[];
}

interface DailyVisitorsProps {
  year?: number;
}

const Dashboard: React.FC = () => {
  const { data: visitData, isLoading: isLoadingVisit } =
    useGetDashboardVisitQuery({});
  const { data: userData, isLoading: isLoadingUser } = useGetDashboardUserQuery(
    {}
  );
  const { data: visitorData, isLoading: isLoadingVisitor } =
    useGetDashboardVisitorQuery({});
  const { data: scheduleData, isLoading: isLoadingSchedule } =
    useGetDashboardScheduleQuery({});
  const { data: visitorSessionStatusTodayData, isLoading: isLoadingvstst } =
    useGetDashboardVisitorSessionStatusTodayQuery({});
  const { data: cardStatus, isLoading: isLoadingCardStatus } =
    useGetDashboardCardStatusQuery({});
  const { data: cardIssue, isLoading: isLoadingCardIssue } =
    useGetDashboardCardIssuesQuery({});
  const { data: vstSSYear, isLoading: isLoadingVstSSYear } =
    useGetDashboardVisitorSSYearQuery({});

  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const { data, isLoading } = useGetDashboardVisitorSessionMonthQuery({
    year: currentYear,
    month: selectedMonth,
  });

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const chartData =
    data?.dailyCounts.map((item) => ({
      name: `Ngày ${item.day}`,
      visitors: item.count,
    })) || [];

  const getUserData = () => {
    if (!userData) return [];
    const translations: { [key: string]: string } = {
      admin: "Quản trị viên",
      manager: "Quản lý",
      departmentManager: "Quản lý phòng ban",
      staff: "Nhân viên",
      security: "Bảo vệ",
    };
    return Object.entries(userData as UserData).map(([role, value]) => ({
      name: translations[role] || role,
      value: value,
    }));
  };

  const getScheduleData = () => {
    if (!scheduleData) return [];
    return [
      { name: "Tuần này", value: scheduleData.week },
      { name: "Tháng này", value: scheduleData.month },
    ];
  };

  const getSessionStatusData = () => {
    if (!visitorSessionStatusTodayData) return [];
    const translations: { [key: string]: string } = {
      CheckIn: "Đã vào",
      CheckOut: "Đã ra",
    };
    return visitorSessionStatusTodayData.map((item) => ({
      name: translations[item.status] || item.status,
      value: item.count,
    }));
  };

  const getMonthlyVisitorData = () => {
    if (!vstSSYear?.monthlyCounts) return [];

    const monthNames = {
      1: "Tháng 1",
      2: "Tháng 2",
      3: "Tháng 3",
      4: "Tháng 4",
      5: "Tháng 5",
      6: "Tháng 6",
      7: "Tháng 7",
      8: "Tháng 8",
      9: "Tháng 9",
      10: "Tháng 10",
      11: "Tháng 11",
      12: "Tháng 12",
    };

    return vstSSYear.monthlyCounts.map((item) => ({
      name: monthNames[item.month as keyof typeof monthNames],
      visitors: item.count,
    }));
  };

  const COLORS = {
    users: ["#1890FF", "#13C2C2", "#52C41A", "#FAAD14", "#F5222D"],
    schedule: ["#1890FF", "#13C2C2"],
    session: ["#722ED1"],
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-[200px]">
      <Spin size="large" />
    </div>
  );

 
console.log("CARD: ",userData );

  return (
    <div className="p-6 bg-gray-50">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Thẻ hoạt động"
              value={cardStatus?.[0]?.count ?? 0}
              prefix={<IdcardOutlined className="text-green-500" />}
              suffix={`/ ${cardIssue?.totalCard ?? 0}`}
            />
            <div className="mt-2 text-sm text-gray-600">
              <div>Tổng số thẻ: {cardIssue?.totalCard ?? 0}</div>
              <div>Đã cấp: {cardIssue?.totalCardIssue ?? 0}</div>
              <div>
                Trạng thái:{" "}
                {cardStatus?.[0]?.status === "Active"
                  ? "Hoạt động"
                  : "Không hoạt động"}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Khách đang có mặt"
              value={visitorData?.active ?? 0}
              prefix={<UserOutlined className="text-purple-500" />}
              suffix={`/ ${visitorData?.total ?? 0}`}
            />
            <div className="mt-2 text-sm text-gray-600">
              <div>Tổng số khách: {visitorData?.total ?? 0}</div>
              <div>Đang hoạt động: {visitorData?.active ?? 0}</div>
              <div>Không hoạt động: {visitorData?.inavtive ?? 0}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Thẻ đã cấp"
              value={cardIssue?.totalCardIssue ?? 0}
              prefix={<TeamOutlined className="text-blue-500" />}
              suffix={`/ ${cardIssue?.totalCard ?? 0}`}
            />
            <div className="mt-2 text-sm text-gray-600">
              <div>
                Còn trống:{" "}
                {(cardIssue?.totalCard ?? 0) - (cardIssue?.totalCardIssue ?? 0)}
              </div>
              <div>
                Tỷ lệ sử dụng:{" "}
                {cardIssue
                  ? Math.round(
                      (cardIssue.totalCardIssue / cardIssue.totalCard) * 100
                    )
                  : 0}
                %
              </div>
            </div>
          </Card>
        </Col>
      </Row>

 
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Phân bố người dùng" className="h-full">
            {isLoadingUser ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={getUserData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {getUserData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.users[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Lịch trình tổng quan" className="h-full">
            {isLoadingSchedule ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={getScheduleData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {getScheduleData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.schedule[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái phiên hôm nay" className="h-full">
            {isLoadingvstst ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={getSessionStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {getSessionStatusData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.session[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card title="Thống kê khách thăm theo tháng" className="h-full">
            {isLoadingVstSSYear ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getMonthlyVisitorData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="visitors"
                    name="Số lượng khách"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title="Thống kê khách theo ngày"
        className="h-full"
        extra={
          <Radio.Group
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            buttonStyle="solid"
            size="small"
          >
            {months.map((month) => (
              <Radio.Button key={month.value} value={month.value}>
                {month.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        }
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Spin size="large" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="visitors"
                name="Số lượng khách"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="text-right mt-4 text-gray-500 text-sm">
        Cập nhật lúc: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Dashboard;
