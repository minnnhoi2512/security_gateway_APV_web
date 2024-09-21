import {
  Layout,
  Button,
  Table,
  Tag,
  Modal,
  Descriptions,
  Upload,
  message,
  Form,
  Input,
} from "antd";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
const { Content } = Layout;

interface DataType {
  key: string;
  name: string;
  images: string[];
  area: string[];
}

const DetailProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { title, startDate, endDate, numberOfPeople, status } = location.state;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false); // State for add modal
  const [selectedCustomer, setSelectedCustomer] = useState<DataType | null>(
    null
  );
  const [newImage, setNewImage] = useState<string | null>(null); // Single image state
  const [newCustomerImage, setNewCustomerImage] = useState<string | null>(null); // New customer image state
  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      name: "Hà Thảo",
      images: ["/api/placeholder/32"],
      area: ["Sản xuất"],
    },
    {
      key: "2",
      name: "Mai",
      images: ["/api/placeholder/32"],
      area: ["Sản xuất"],
    },
    {
      key: "3",
      name: "Hà Thảo",
      images: ["/api/placeholder/32"],
      area: ["Sản xuất"],
    },
  ]);

  const [form] = Form.useForm(); // Form for the add modal

  const showModal = (customer: DataType) => {
    setSelectedCustomer(customer);
    setNewImage(customer.images[0]);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedCustomer(null);
    setNewImage(null);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
    setNewCustomerImage(null);
  };

  const handleSave = () => {
    if (selectedCustomer && newImage) {
      const updatedData = data.map((customer) =>
        customer.key === selectedCustomer.key
          ? { ...customer, images: [newImage] }
          : customer
      );
      setData(updatedData);
      message.success("Cập nhật thành công!");
      setIsModalVisible(false);
    }
  };

  const handleUploadChange = (info: any) => {
    const file = info.file.originFileObj;
    const newUploadedImage = URL.createObjectURL(file);
    setNewImage(newUploadedImage);
  };

  const handleNewUploadChange = (info: any) => {
    const file = info.file.originFileObj;
    const newUploadedImage = URL.createObjectURL(file);
    setNewCustomerImage(newUploadedImage);
  };

  const handleAddCustomer = () => {
    form.validateFields().then((values) => {
      const newCustomer: DataType = {
        key: (data.length + 1).toString(),
        name: values.name,
        images: [newCustomerImage || "/api/placeholder/32"], // Use default image if not uploaded
        area: ["Sản xuất"], // Default area, or you can make it dynamic
      };
      setData([newCustomer, ...data]);
      message.success("Thêm nhân viên thành công!");
      setIsAddModalVisible(false);
      form.resetFields();
      setNewCustomerImage(null);
    });
  };

  // Handle deleting a customer
  const handleDeleteCustomer = (key: string) => {
    const updatedData = data.filter((customer) => customer.key !== key);
    setData(updatedData);
    message.success("Xóa nhân viên thành công!");
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
              alt=""
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
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteCustomer(record.key)}
          >
            Xóa
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
            <h1 className="text-green-500 text-2xl font-bold">{title}</h1>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg mb-4">
            <p>Bắt đầu: {moment(startDate).format("DD/MM/YYYY HH:mm")}</p>
            <p>Kết thúc: {moment(endDate).format("DD/MM/YYYY HH:mm")}</p>
            <p>Số người: {numberOfPeople}</p>
            <p>Trạng thái: {status}</p>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={showAddModal}
          >
            Thêm khách hàng mới
          </Button>
          <Table columns={columns} dataSource={data} pagination={false} />
          <div className="flex justify-end mt-4">
            <Button className="mr-2" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button
              type="primary"
              className="mr-2 bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                message.success("Cập nhật thành công!");
                navigate("/staffCustomerVisit");
              }}
            >
              Cập nhật
            </Button>
            <Button
              type="primary"
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                message.success("Cập nhật thành công!");
                navigate("/staffCustomerVisit");
              }}
            >
              Duyệt
            </Button>
          </div>
        </Content>

        {/* Modal for Customer Detail */}
        <Modal
          title="Chi tiết khách hàng"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Hủy bỏ
            </Button>,
            <Button key="save" type="primary" onClick={handleSave}>
              Lưu
            </Button>,
          ]}
        >
          {selectedCustomer && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Họ và tên">
                {selectedCustomer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Khu vực">
                {selectedCustomer.area.join(", ")}
              </Descriptions.Item>
              <Descriptions.Item label="Hình ảnh">
                <div className="flex">
                  {newImage && (
                    <img
                      src={newImage}
                      alt=""
                      className="w-8 h-8 rounded-full mr-1"
                    />
                  )}
                </div>
                <Upload
                  listType="picture"
                  onChange={handleUploadChange}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Thay đổi hình ảnh</Button>
                </Upload>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Modal for Adding New Customer */}
        <Modal
          title="Thêm khách hàng mới"
          visible={isAddModalVisible}
          onCancel={handleAddCancel}
          footer={[
            <Button key="cancel" onClick={handleAddCancel}>
              Hủy bỏ
            </Button>,
            <Button key="save" type="primary" onClick={handleAddCustomer}>
              Thêm
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Hình ảnh">
              <Upload
                listType="picture"
                onChange={handleNewUploadChange}
                showUploadList={false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
              </Upload>
              {newCustomerImage && (
                <img
                  src={newCustomerImage}
                  alt=""
                  className="w-8 h-8 rounded-full mt-2"
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  );
};

export default DetailProject;
