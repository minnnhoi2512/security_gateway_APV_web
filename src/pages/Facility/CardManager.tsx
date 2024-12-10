import { useState } from "react";
import {
  Button,
  Table,
  Input,
  Tag,
  Space,
  Modal,
  Select,
  Form,
  Upload,
  notification,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import QRCardType from "../../types/QRCardType";
import {
  useCreateQRCardMutation,
  useGetListQRCardQuery,
} from "../../services/QRCard.service";
import LoadingState from "../../components/State/LoadingState";
import { CardStatusType, typeCardStatusMap } from "../../types/Enum/CardStatus";
import { CardType, typeCardMap } from "../../types/Enum/CardType";
import { v4 as uuidv4 } from "uuid";
import { Plus } from "lucide-react";

const { Option } = Select;
const CardManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const { data, isLoading, error, refetch } = useGetListQRCardQuery({
    pageNumber: 1,
    pageSize: 100,
  });
  const qrCards = data?.qrCards || data || [];
  const [visibleCardVerifications, setVisibleCardVerifications] = useState<{
    [key: string]: boolean;
  }>({});

  const filteredData = qrCards
    .filter((card: QRCardType) =>
      Object.values(card)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
    );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };
  const [createQRCard] = useCreateQRCardMutation();

  const toggleCardVerificationVisibility = (key: string) => {
    setVisibleCardVerifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const numberOfCards = Number(values.numberOfCards);
      const cardTypeId = values.cardType;
      // console.log(values.imageLogo[0])
      const imageLogo = values.imageLogo[0].originFileObj;

      for (let i = 0; i < numberOfCards; i++) {
        const cardVerified = uuidv4();
        await createQRCard({
          CardTypeId: cardTypeId,
          CardVerified: cardVerified,
          ImageLogo: imageLogo,
        });
      }
      refetch();
      notification.success({ message: "Thẻ đã được tạo thành công!" });
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log(error);
      notification.error({ message: "Đã xảy ra lỗi khi tạo thẻ!" });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Mã Thẻ",
      dataIndex: "cardId",
      key: "cardId",
      sorter: (a: QRCardType, b: QRCardType) => a.cardId - b.cardId,
    },
    {
      title: "Ảnh",
      dataIndex: "cardImage",
      key: "cardImage",
      render: (text: any) => (
        <div>
          <img
            src={`data:image/png;base64,${text}`}
            alt="Card Image"
            style={{ width: "100px", height: "auto" }}
          />
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => {
              const link = document.createElement("a");
              link.href = `data:image/png;base64,${text}`;
              link.download = "card_image.png";
              link.click();
            }}
          >
            Tải xuống thẻ
          </Button>
        </div>
      ),
    },
    {
      title: "Mã Xác Thực",
      dataIndex: "cardVerification",
      key: "cardVerification",
      width: "20%", // Set the width to 20%
      sorter: (a: QRCardType, b: QRCardType) =>
        a.cardVerification.localeCompare(b.cardVerification),
      render: (text: string, record: QRCardType) => (
        <div className="">
          <Tag color="blue" style={{ cursor: "pointer" }}>
            {visibleCardVerifications[record.cardId] ? text : "******"}
          </Tag>
          {visibleCardVerifications[record.cardId] ? (
            <EyeInvisibleOutlined
              onClick={() =>
                toggleCardVerificationVisibility(record.cardId.toString())
              }
            />
          ) : (
            <EyeFilled
              onClick={() =>
                toggleCardVerificationVisibility(record.cardId.toString())
              }
            />
          )}
        </div>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createDate",
      key: "createDate",
      sorter: (a: QRCardType, b: QRCardType) =>
        new Date(a.createDate || "").getTime() -
        new Date(b.createDate || "").getTime(),
      render: (date: Date | undefined) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Ngày Hủy",
      dataIndex: "lastCancelDate",
      key: "lastCancelDate",
      sorter: (a: QRCardType, b: QRCardType) =>
        new Date(a.lastCancelDate || "").getTime() -
        new Date(b.lastCancelDate || "").getTime(),
      render: (date: Date | undefined) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Loại Thẻ",
      dataIndex: "qrCardTypename",
      key: "qrCardTypename",
      sorter: (a: QRCardType, b: QRCardType) =>
        (a.qrCardTypename || "").localeCompare(b.qrCardTypename || ""),
      render: (text: CardType) => {
        const { colorCardType, textCardType } = typeCardMap[text] || {};
        return <Tag color={colorCardType}>{textCardType}</Tag>;
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "cardStatus",
      key: "cardStatus",
      render: (status: CardStatusType) => {
        const { colorCardStatusType, textCardStatusType } =
          typeCardStatusMap[status] || {};
        return <Tag color={colorCardStatusType}>{textCardStatusType}</Tag>;
      },
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  if (isLoading) {
    return (
      <div>
        <LoadingState></LoadingState>
      </div>
    );
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
          placeholder="Tìm kiếm theo từ khóa (Mã Thẻ, Mã Xác Thực, ...)"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{
            marginBottom: 16,
            width: 300,
            borderColor: "#1890ff",
            borderRadius: 5,
          }}
        />
        <Button
          // type="primary"
          // icon={<PlusOutlined />}
          onClick={showModal}
          className="group relative px-6 py-4 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
        >
          <div className="flex items-center gap-2 text-white">
            <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
            <span className="font-medium text-lg">Tạo mới</span>
          </div>
        </Button>
      </Space>

      <Modal
        title="Tạo mới thẻ"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="numberOfCards"
            label="Số lượng thẻ"
            rules={[{ required: true, message: "Vui lòng nhập số lượng thẻ!" }]}
          >
            <Input type="number" placeholder="Nhập số lượng thẻ" />
          </Form.Item>
          <Form.Item
            name="cardType"
            label="Loại thẻ"
            rules={[{ required: true, message: "Vui lòng chọn loại thẻ!" }]}
          >
            <Select placeholder="Chọn loại thẻ">
              <Option value="1">Thẻ cho ra vào hằng ngày</Option>
              <Option value="2">Thẻ cho ra vào theo lịch trình</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="imageLogo"
            label="Logo"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Vui lòng tải lên logo!" }]}
          >
            <Upload
              name="logo"
              listType="picture"
              beforeUpload={() => false}
              maxCount={1} // Ensure only one image can be uploaded
            >
              <Button icon={<UploadOutlined />}>Tải lên logo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      {error ? (
        <p>Đã xảy ra lỗi khi tải dữ liệu!</p>
      ) : (
        <Table
          columns={columns}
          showSorterTooltip={false}
          dataSource={filteredData}
          pagination={{
            total: filteredData?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["5"],
            defaultPageSize: 5, // Set default page size to 5
            size: "small",
          }}
          loading={isLoading}
          rowKey="qrCardId"
          bordered
        />
      )}
    </Content>
  );
};

export default CardManager;
