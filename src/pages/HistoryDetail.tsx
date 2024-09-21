import { Layout, Button, Table, Tag, Modal } from "antd";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const { Content } = Layout;

interface DataType {
  key: string;
  name: string;
  images: string[];
  area: string[];
  checkin: string;
  checkout: string;
}

const HistoryDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { title } = location.state || {};

  const [data] = useState<DataType[]>([
    {
      key: "1",
      name: "Hà Thảo",
      images: ["/api/placeholder/32"],
      area: ["Sản xuất"],
      checkin: "2024-09-05 13:00",
      checkout: "2024-09-05 13:30",
    },
    {
      key: "2",
      name: "Mai",
      images: ["/api/placeholder/32"],
      area: ["Sản xuất"],
      checkin: "2024-09-05 13:00",
      checkout: "2024-09-05 13:30",
    },
    {
      key: "3",
      name: "Hà Thảo",
      images: ["/api/placeholder/32"],
      area: ["Sản xuất"],
      checkin: "2024-09-05 13:00",
      checkout: "2024-09-05 13:30",
    },
  ]);

  // State for modal visibility and selected user
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DataType | null>(null);

  // Function to show modal and set selected user
  const showModal = (user: DataType) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  // Function to close modal
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: any) => (
        <div className="flex items-center">
          <span className="ml-2">{text}</span>
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      render: (images: any) => (
        <div className="flex">
          {images.map((img: any, index: any) => (
            <img
              key={index}
              src={img}
              alt="User Image"
              className="w-8 h-8 rounded-full mr-1"
            />
          ))}
        </div>
      ),
    },
    {
      title: "Khu vực",
      key: "area",
      dataIndex: "area",
      render: (_: any, { area }: { area: string[] }) => (
        <>
          {area.map((areaItem) => {
            let color = areaItem.length > 5 ? "geekblue" : "green";
            return (
              <Tag color={color} key={areaItem}>
                {areaItem.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: DataType) => (
        <>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 mr-2"
            onClick={() => showModal(record)}
          >
            Kiểm tra
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="p-6">
          <div className="flex justify-center mb-4">
            <h1 className="text-green-500 text-2xl font-bold">
              Lịch sử của : {title}
            </h1>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg mb-4">
            <span className="font-bold">Thời gian: 05/09/2048</span>
            <span className="ml-4">Vào lúc: 13h00 - 13h30</span>
            <span className="ml-4">Số lượng: 7 người</span>
          </div>

          <Table columns={columns} dataSource={data} pagination={false} />
          <div className="flex justify-end mt-4">
            <Button className="mr-2" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </div>
        </Content>
      </Layout>

      {/* Modal for user details */}
      <Modal
        title="Chi tiết người dùng"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
      >
        {selectedUser && (
          <div>
            <p>
              <strong>Tên:</strong> {selectedUser.name}
            </p>
            <p>
              <strong>Check-in:</strong> {selectedUser.checkin}
            </p>
            <p>
              <strong>Check-out:</strong> {selectedUser.checkout}
            </p>
            <div className="flex">
              {selectedUser.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full mr-2"
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default HistoryDetail;
