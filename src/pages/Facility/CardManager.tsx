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
  Card,
  Divider,
  Popover,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  FilterOutlined,
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
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [cardTypeFilter, setCardTypeFilter] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useGetListQRCardQuery({
    pageNumber: 1,
    pageSize: 100,
  });
  console.log("card: ", data);

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
    .filter((card: QRCardType) => {
      if (!filterType || filterType === "all") return true;
      return card.qrCardTypename === filterType;
    })
    .filter((card: QRCardType) => {
      if (!filterStatus || filterStatus === "all") return true;
      return card.cardStatus === filterStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
    );

  // const filteredData = qrCards
  //   .filter((card: QRCardType) =>
  //     Object.values(card)
  //       .join(" ")
  //       .toLowerCase()
  //       .includes(searchText.toLowerCase())
  //   )
  //   .sort(
  //     (a, b) =>
  //       new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
  //   );

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
        <div className="flex flex-col items-center">
          <img
            src={`data:image/png;base64,${text}`}
            alt="Card Image"
            style={{ width: "100px", height: "130px" }}
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
    // {
    //   title: "Loại Thẻ",
    //   dataIndex: "qrCardTypename",
    //   key: "qrCardTypename",
    //   sorter: (a: QRCardType, b: QRCardType) =>
    //     (a.qrCardTypename || "").localeCompare(b.qrCardTypename || ""),
    //   render: (text: CardType) => {
    //     const { colorCardType, textCardType } = typeCardMap[text] || {};
    //     return <Tag color={colorCardType}>{textCardType}</Tag>;
    //   },
    // },
    {
      title: "Loại Thẻ",
      dataIndex: "qrCardTypename",
      key: "qrCardTypename",
      sorter: (a: QRCardType, b: QRCardType) =>
        (a.qrCardTypename || "").localeCompare(b.qrCardTypename || ""),
      filters: [
        { text: "Thẻ trong ngày", value: "DAILY_CARD" },
        { text: "Thẻ dài hạn", value: "LONG_TERM_CARD" },
      ],
      onFilter: (value: string, record: QRCardType) =>
        record.qrCardTypename === value,
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

  const filterContent = (
    <div className="w-64">
      <div className="mb-4">
        <div className="font-medium mb-2">Loại thẻ</div>
        <Select
          className="w-full"
          placeholder="Chọn loại thẻ"
          allowClear
          value={filterType}
          onChange={(value) => setFilterType(value)}
        >
          <Option value="all">Tất cả</Option>
          <Option value="ShotTermCard">Thẻ trong ngày</Option>
          <Option value="LongTermCard">Thẻ dài hạn</Option>
        </Select>
      </div>

      <Divider className="my-3" />

      <div>
        <div className="font-medium mb-2">Trạng thái</div>
        <Select
          className="w-full"
          placeholder="Chọn trạng thái"
          allowClear
          value={filterStatus}
          onChange={(value) => setFilterStatus(value)}
        >
          <Option value="all">Tất cả</Option>
          <Option value="Active">Còn sử dụng</Option>
          <Option value="Lost">Mất thẻ</Option>
        </Select>
      </div>
    </div>
  );

  return (
    <Content className="p-2 max-w-[1200px] mx-auto mt-10">
      <div className="flex flex-col mb-2">
        <div className="flex gap-4 items-center">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Tìm kiếm theo từ khóa (Mã Thẻ, Mã Xác Thực, ...)"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearchChange}
              className="max-w-xs"
            />
            <Popover
              content={filterContent}
              title="Bộ lọc"
              trigger="click"
              placement="bottomLeft"
            >
              <Button
                icon={<FilterOutlined />}
                className={`${
                  filterStatus || filterType
                    ? "border-blue-500 text-blue-500"
                    : ""
                }`}
              />
            </Popover>
          </div>
          <Button
            onClick={showModal}
            className="group relative px-6 py-4 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
          >
            <div className="flex items-center gap-2 text-white">
              <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
              <span className="font-medium text-lg">Tạo mới</span>
            </div>
          </Button>
        </div>
      </div>

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
        <Card className="shadow-lg rounded-xl border-0 mt-4">
          <Table
            columns={columns}
            showSorterTooltip={false}
            dataSource={filteredData}
            pagination={{
              total: filteredData?.total || 0,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10"],
              defaultPageSize: 5, // Set default page size to 5
              size: "small",
            }}
            loading={isLoading}
            rowKey="qrCardId"
            bordered={false}
            className="w-full [&_thead_th]:!bg-[#34495e] [&_thead_th]:!text-white [&_thead_th]:!font-medium [&_thead_th]:!py-3 [&_thead_th]:!text-sm hover:[&_tbody_tr]:bg-blue-50/30 [&_table]:!rounded-none [&_table-container]:!rounded-none [&_thead>tr>th:first-child]:!rounded-tl-none [&_thead>tr>th:last-child]:!rounded-tr-none [&_thead_th]:!transition-none"
          />
        </Card>
      )}
    </Content>
  );
};

export default CardManager;
