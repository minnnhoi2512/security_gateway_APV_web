import { Layout, Button, Table, Tag, message, Input, Modal } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetListGateQuery } from "../../services/gate.service";
import Gate from "../../types/gateType";
import { formatDateWithourHour } from "../../utils/ultil";
import { VideoCameraOutlined } from "@ant-design/icons";
import StreamingModal from "../../components/Modal/StreamingModal";
import CreateGate from "../../form/CreateGate";

const { Content } = Layout;

const GateManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const { data } = useGetListGateQuery({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const showVideoModal = (record: any) => {
    setSelectedGate(record);
    setIsModalVisible(true);
  };

  const handleVideoClose = () => {
    setIsModalVisible(false);
  };

  const handleCreateCancel = () => {
    setCreateForm(false);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const columns = [
    {
      title: "Cổng số",
      dataIndex: "gateId",
      key: "gateId",
    },
    {
      title: "Tên cổng",
      dataIndex: "gateName",
      key: "gateName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
      render: (createDate: string) => {
        return formatDateWithourHour(createDate);
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => {
        let color = status === true ? "green" : "volcano";
        return (
          <Tag color={color}>
            {status === true ? "Còn hoạt động" : "Đã vô hiệu hóa"}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Gate) => (
        <>
          <Button
            type="primary"
            className="mr-2"
            onClick={() => showVideoModal(record)}
          >
            <VideoCameraOutlined />
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-white">
      <Content className="p-6">
        <Button
          type="primary"
          className="mb-4 bg-blue-500 hover:bg-blue-600"
          onClick={() => setCreateForm(true)}
        >
          Tạo mới cổng
        </Button>
        <Modal
          title="Tạo mới cổng"
          visible={createForm}
          onCancel={handleCreateCancel}
          footer={null}
        >
          <CreateGate />
        </Modal>
        <StreamingModal
          selectedGate={selectedGate}
          isVisible={isModalVisible}
          onClose={handleVideoClose}
        />
        <Table columns={columns} dataSource={data} pagination={false} />
      </Content>
    </Layout>
  );
};

export default GateManager;
