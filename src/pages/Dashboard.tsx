import { Card, Col, Row, Statistic, Table, Progress, List, Avatar } from "antd";
import {
  LineChartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const columns = [
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  const data = [
    {
      key: "1",
      activity: "User login",
      date: "2023-10-01",
    },
    {
      key: "2",
      activity: "Purchase made",
      date: "2023-10-02",
    },
    {
      key: "3",
      activity: "Profile updated",
      date: "2023-10-03",
    },
  ];

  const recentMessages = [
    {
      title: "John Doe",
      description: "Sent a message about the new product.",
    },
    {
      title: "Jane Smith",
      description: "Asked for a refund on her recent purchase.",
    },
    {
      title: "Michael Johnson",
      description: "Left a review on the latest blog post.",
    },
  ];

  const chartData = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
  ];

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={9321}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Visits"
              value={421}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Orders"
              value={128}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Recent Activities">
            <Table columns={columns} dataSource={data} pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Messages">
            <List
              itemLayout="horizontal"
              dataSource={recentMessages}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<MessageOutlined />} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Progress">
            <Progress percent={75} status="active" />
            <Progress percent={50} status="exception" />
            <Progress percent={100} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Sales Overview">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;