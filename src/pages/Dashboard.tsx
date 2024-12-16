import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Spin,
  Radio,
  Button,
  Select,
  List,
  Tag,
} from "antd";
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
import { UserOutlined, IdcardOutlined } from "@ant-design/icons";
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
  useGetRecentSessionQuery,
  useGetTaskQuery,
} from "../services/dashboard.service";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
const { Option } = Select;

interface UserData {
  admin: number;
  manager: number;
  departmentManager: number;
  staff: number;
  security: number;
}

interface RecentSession {
  visitorSessionId: number;
  checkinTime: string;
  checkoutTime: string;
  status: string;
  visitDetail: {
    visitor: {
      visitorName: string;
    };
  };
}

interface MonthlyCount {
  month: number;
  count: number;
}

interface DailyCount {
  day: number;
  count: number;
}
interface VisitorSessionMonthResponse {
  monthlyCounts: MonthlyCount[];
  dailyCounts: DailyCount[];
}
const Dashboard: React.FC = () => {
  const [dataSession, setDataSession] =
    useState<VisitorSessionMonthResponse | null>(null);
  const [isScheduleView, setIsScheduleView] = useState(true);
  const navigate = useNavigate();
  const showScheduleView = () => {
    setIsScheduleView(true);
  };

  const showTaskView = () => {
    setIsScheduleView(false);
  };
  const [visitMode, setVisitMode] = useState<"type" | "status">("type");
  const [selectedYear, setSelectedYear] = useState<any>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    new Date().getMonth() + 1
  );
  const {
    data: visitData,
    isLoading: isLoadingVisit,
    refetch: refetchVisitData,
  } = useGetDashboardVisitQuery({});
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUserData,
  } = useGetDashboardUserQuery({});
  const {
    data: visitorData,
    isLoading: isLoadingVisitor,
    refetch: refetchVisitorData,
  } = useGetDashboardVisitorQuery({});
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    refetch: refetchScheduleData,
  } = useGetDashboardScheduleQuery({});
  const {
    data: visitorSessionStatusTodayData,
    isLoading: isLoadingvstst,
    refetch: refetchVisitorSessionStatusTodayData,
  } = useGetDashboardVisitorSessionStatusTodayQuery({});
  const {
    data: cardStatus,
    isLoading: isLoadingCardStatus,
    refetch: refetchCardStatus,
  } = useGetDashboardCardStatusQuery({});
  const {
    data: cardIssue,
    isLoading: isLoadingCardIssue,
    refetch: refetchCardIssue,
  } = useGetDashboardCardIssuesQuery({});
  const { data: sessionYear, refetch: refetchSessionYear } =
    useGetDashboardVisitorSSYearQuery({
      year: selectedYear,
    });
  const { data, refetch: refetchSessionMonth } =
    useGetDashboardVisitorSessionMonthQuery({
      year: selectedYear,
      month: selectedMonth,
    });
  const {
    data: task,
    isLoading: taskLoading,
    refetch: refetchTask,
  } = useGetTaskQuery({});
  const {
    data: recentSession,
    isLoading: isLoadingRecentSession,
    refetch: refetchRecentSession,
  } = useGetRecentSessionQuery({});

  useEffect(() => {
    if (selectedMonth === 0) {
      setDataSession(sessionYear);
    } else {
      setDataSession(data);
    }
  }, [data, sessionYear, selectedYear, selectedMonth]);

  // console.log(recentSession);
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

  let chartData = [];

  if (selectedMonth === 0) {
    chartData =
      dataSession?.monthlyCounts?.map((item) => ({
        name: `Tháng ${item.month}`,
        visitors: item.count,
      })) || [];
  } else {
    chartData =
      dataSession?.dailyCounts?.map((item) => ({
        name: `Ngày ${item.day}`,
        visitors: item.count,
      })) || [];
  }
  useEffect(() => {
    const interval = setInterval(() => {
      refetchVisitData();
      refetchUserData();
      refetchVisitorData();
      refetchScheduleData();
      refetchVisitorSessionStatusTodayData();
      refetchCardStatus();
      refetchCardIssue();
      refetchSessionYear();
      refetchSessionMonth();
      refetchTask();
      refetchRecentSession();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [
    refetchVisitData,
    refetchUserData,
    refetchVisitorData,
    refetchScheduleData,
    refetchVisitorSessionStatusTodayData,
    refetchCardStatus,
    refetchCardIssue,
    refetchSessionYear,
    refetchSessionMonth,
    refetchTask,
    refetchRecentSession,
  ]);

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
      { name: "Tuần", value: scheduleData.week },
      { name: "Tháng", value: scheduleData.month },
    ];
  };
  const getTaskData = () => {
    console.log(task);
    if (!task) return [];
    return [
      { name: "Chờ phê duyệt", value: task.pending },
      { name: "Đã phê duyệt", value: task.approved },
      { name: "Chờ tạo", value: task.assigned },
      { name: "Đã từ chối", value: task.rejected },
      { name: "Đã hết hạn", value: task.expired },
    ];
  };
  const getVisitByType = () => {
    if (!visitData) return [];
    return [
      { name: "Ngày", value: visitData.daily },
      { name: "Tuần", value: visitData.week },
      { name: "Tháng", value: visitData.month },
    ];
  };
  const getVisitByStatus = () => {
    if (!visitData) return [];
    return [
      { name: "Đã vô hiệu hóa", value: visitData.cancel || 0 },
      { name: "Đã hết hạn", value: visitData.inactive || 0 },
      { name: "Vi phạm", value: visitData.violation || 0 },
      { name: "Cần duyệt", value: visitData.activeTemporary || 0 },
      { name: "Còn hiệu lực", value: visitData.active || 0 },
      { name: "Chờ phê duyệt", value: visitData.pending || 0 },
    ];
  };
  const getSessionStatusData = () => {
    if (visitorSessionStatusTodayData.every(item => item.count === 0)) {
      return [];
    } else {
      const translations: { [key: string]: string } = {
        CheckIn: "Đã vào",
        CheckOut: "Đã ra",
        // UnCheckOut: "Đã ra",
      };
      return visitorSessionStatusTodayData.map((item) => ({
        name: translations[item.status] || item.status,
        value: item.count || 0,
      }));
    }
  };
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const COLORS = {
    users: ["#1890FF", "#13C2C2", "#52C41A", "#FAAD14", "#F5222D"],
    schedule: ["#1890FF", "#13C2C2"],
    session: ["#722ED1", "#1890FF", "#13C2C2"],
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-[200px]">
      <Spin size="large" />
    </div>
  );

  // console.log("CARD: ", userData);

  const CardTitle = () => (
    <div className="flex justify-between items-center">
      <span>Chuyến thăm</span>
      <div className="flex gap-1">
        <Button
          size="small"
          type={visitMode === "type" ? "primary" : "default"}
          onClick={() => setVisitMode("type")}
        >
          Loại
        </Button>
        <Button
          size="small"
          type={visitMode === "status" ? "primary" : "default"}
          onClick={() => setVisitMode("status")}
        >
          Trạng thái
        </Button>
      </div>
    </div>
  );
  return (
    <div className="p-6 bg-gray-50">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card size="small" style={{ minHeight: "200px" }}>
            <Statistic
              title="Thẻ ra vào của hệ thống"
              value={cardStatus?.[0]?.count ?? 0}
              prefix={<IdcardOutlined className="text-green-500" />}
              suffix={`/ ${cardIssue?.totalCard ?? 0}`}
            />
            <div className="mt-2 text-sm text-gray-600">
              <div>Đã cấp: {cardIssue?.totalCardIssue ?? 0}</div>
              <div>Đã mất: {cardStatus?.[1]?.count ?? 0}</div>
              <div>
                Còn trong hệ thống:{" "}
                {cardStatus?.[0]?.count - cardIssue?.totalCardIssue}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ minHeight: "200px" }}>
            <Statistic
              title="Khách trong hệ thống"
              value={visitorData?.active ?? 0}
              prefix={<UserOutlined className="text-purple-500" />}
              suffix={`/ ${visitorData?.total ?? 0}`}
            />
            <div className="mt-2 text-sm text-gray-600">
              <div>Tổng số khách: {visitorData?.total ?? 0}</div>
              <div>Số khách hợp lệ: {visitorData?.active ?? 0}</div>
              <div>
                Số khách trong danh sách đen:{" "}
                {visitorData?.total - visitorData?.active}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title="Phân bố người dùng"
            className="h-full"
            style={{ minHeight: "300px" }}
          >
            {isLoadingUser ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {isScheduleView ? "Lịch trình tổng quan" : "Nhiệm vụ"}
                </span>
                <div>
                  <Button
                    onClick={showScheduleView}
                    size="small"
                    type={isScheduleView ? "primary" : "default"}
                  >
                    Lịch trình
                  </Button>
                  <Button
                    onClick={showTaskView}
                    size="small"
                    type={!isScheduleView ? "primary" : "default"}
                    style={{ marginLeft: 8 }}
                  >
                    Nhiệm vụ
                  </Button>
                </div>
              </div>
            }
            className="h-full"
            style={{ minHeight: "300px" }}
          >
            {isScheduleView ? (
              isLoadingSchedule ? (
                <LoadingSpinner />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
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
              )
            ) : taskLoading ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getTaskData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {getTaskData().map((entry, index) => (
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
          <Card
            title={<CardTitle />}
            className="h-full"
            style={{ minHeight: "300px" }}
          >
            {isLoadingVisit ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={
                      visitMode === "type"
                        ? getVisitByType()
                        : getVisitByStatus()
                    }
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {(visitMode === "type"
                      ? getVisitByType()
                      : getVisitByStatus()
                    ).map((entry, index) => (
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
          <Card
            title="Trạng thái lượt ra vào hôm nay"
            className="h-full"
            style={{ minHeight: "300px" }}
          >
            {isLoadingvstst ? (
              <LoadingSpinner />
            ) : getSessionStatusData().length === 0 ? (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                Hôm nay chưa có khách nào đến công ty
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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
        <Col xs={24} lg={16}>
          <Card
            title="Lượt ra vào gần đây"
            className="h-full"
            style={{ minHeight: "300px" }}
          >
            {isLoadingRecentSession ? (
              <LoadingSpinner />
            ) : !recentSession?.length ? (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                Chưa có lượt ra vào nào gần đây
              </div>
            ) : (
              <List
                dataSource={recentSession}
                renderItem={(session: RecentSession) => (
                  <List.Item onClick={()=> navigate(`/dashboard/sessionDetail/${session.visitorSessionId}`)}>
                    <List.Item.Meta
                      title={`Phiên #${session?.visitorSessionId}`}
                      description={
                        <Row gutter={8}>
                          <Col span={6}>
                            <span>
                              Khách: {session.visitDetail.visitor.visitorName}
                            </span>
                          </Col>
                          <Col span={6}>
                            <span>
                              Thời gian vào :{" "}
                              {dayjs(session.checkinTime).format(
                                "DD/MM/YYYY HH:mm"
                              )}
                            </span>
                          </Col>
                          <Col span={6}>
                            <span>
                              Thời gian ra :{" "}
                              {session.checkoutTime
                                ? dayjs(session.checkoutTime).format(
                                    "DD/MM/YYYY HH:mm"
                                  )
                                : "N/A"}
                            </span>
                          </Col>
                          <Col span={6}>
                            <Tag
                              color={
                                session.status === "CheckOut" ? "gray" : "green"
                              }
                            >
                              {session.status === "CheckOut"
                                ? "Đã ra"
                                : "Đã vào"}
                            </Tag>
                          </Col>
                        </Row>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card
            title="Thống kê lượt ra vào"
            className="h-full"
            extra={
              <div className="flex items-center gap-4">
                <Radio.Group
                  value={selectedMonth}
                  buttonStyle="solid"
                  size="small"
                >
                  {months.map((month) => (
                    <Radio.Button
                      key={month.value}
                      value={month.value}
                      onClick={() => {
                        const newValue = month.value;
                        setSelectedMonth(
                          selectedMonth === newValue ? 0 : newValue
                        );
                      }}
                    >
                      {month.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
                <Select
                  value={selectedYear}
                  onChange={(value) => setSelectedYear(value)}
                  style={{ width: 120 }}
                >
                  {years.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>
            }
            style={{ minHeight: "400px" }}
          >
            {chartData?.length ? (
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
                    name="Số lượt ra vào"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[400px] text-gray-500">
                Không có lượt ra vào nào
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <div className="text-right mt-4 text-gray-500 text-sm">
        Cập nhật lúc: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Dashboard;
