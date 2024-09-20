import { Layout, Input, Table, Button } from 'antd';
import { SearchOutlined, BellOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const History = () => {

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    { title: 'Khung giờ', dataIndex: 'timeframe', key: 'timeframe' },
    { title: 'Khu vực', dataIndex: 'area', key: 'area', render: (text:any) => <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{text}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (text:any) => <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{text}</span> },
  ];

  const data = [
    { key: 1, title: 'Lịch hẹn khảo sát', time: '05/09/2021', timeframe: '11h00 am - 12h00 pm', area: 'Sản xuất', status: 'Đã duyệt' },
    { key: 2, title: 'Lịch hẹn tham quan', time: '05/09/2021', timeframe: '11h00 am - 12h00 pm', area: 'Sản xuất', status: 'Đã duyệt' },
    { key: 3, title: 'Lịch hẹn khảo sát', time: '05/09/2021', timeframe: '11h00 am - 12h00 pm', area: 'Sản xuất', status: 'Đã duyệt' },
    { key: 4, title: 'Lịch hẹn tham quan', time: '05/09/2021', timeframe: '11h00 am - 12h00 pm', area: 'Sản xuất', status: 'Đã duyệt' },
    { key: 5, title: 'Lịch hẹn khảo sát', time: '05/09/2021', timeframe: '11h00 am - 12h00 pm', area: 'Sản xuất', status: 'Đã duyệt' },
    { key: 6, title: 'Lịch hẹn tham quan', time: '05/09/2021', timeframe: '11h00 am - 12h00 pm', area: 'Sản xuất', status: 'Đã duyệt' },
  ];

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Header className="bg-white flex justify-between items-center px-4">
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            className="w-64"
          />
          <BellOutlined className="text-xl" />
        </Header>
        <Content className="m-4 p-4 bg-white">
          <h2 className="text-xl font-bold mb-4">Danh sách lịch sử ghé thăm công ty</h2>
          <Table columns={columns} dataSource={data} pagination={false} />
          <div className="mt-4 flex justify-end">
            <Button type="primary" className="bg-green-500 hover:bg-green-600">
              In
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default History;