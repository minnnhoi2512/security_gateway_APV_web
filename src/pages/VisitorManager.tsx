import { useRef, useState } from "react";
import {
  Button,
  Table,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  notification,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import {
  useGetAllVisitorsQuery,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
} from "../services/visitor.service";
import CreateNewVisitor from "../form/CreateNewVisitor";

const { confirm } = Modal;
const { Option } = Select;
const VisitorManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingVisitor, setEditingVisitor] = useState<any>(null);
  const [faceImg, setFaceImg] = useState<File | null>(null);
  const [credentialCardTypeId, setCredentialCardTypeId] = useState<
    number | null
  >(null);
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  const [deleteVisitor] = useDeleteVisitorMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // State to store base64 image for preview
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const {
    data,
    isLoading: isLoadingData,
    error,
    refetch,
  } = useGetAllVisitorsQuery({
    pageNumber: currentPage,
    pageSize,
  });

  const visitors = data ? data : [];
  const totalVisitors = data ? data.length : 0;

  const filteredData = visitors.filter((visitor: any) =>
    visitor.visitorName.toLowerCase().includes(searchText.toLowerCase())
  );
  const handleCredentialCardTypeChange = (value: number) => {
    setCredentialCardTypeId(value);
  };
  const columns = [
    {
      title: "Tên khách",
      dataIndex: "visitorName",
      key: "visitorName",
      sorter: (a: any, b: any) => a.visitorName.localeCompare(b.visitorName),
    },
    {
      title: "Công ty",
      dataIndex: "companyName",
      key: "companyName",
      sorter: (a: any, b: any) => a.companyName.localeCompare(b.companyName),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a: any, b: any) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Thẻ nhận dạng",
      dataIndex: "credentialsCard",
      key: "credentialsCard",
      sorter: (a: any, b: any) =>
        a.credentialsCard.localeCompare(b.credentialsCard),
    },
    {
      title: "Loại thẻ nhận dạng",
      dataIndex: ["credentialCardType", "credentialCardTypeName"],
      key: "credentialCardType",
    },
    {
      title: "Hình ảnh thẻ nhận dạng",
      dataIndex: "visitorCredentialImage",
      key: "visitorCredentialImage",
      render: (text: string) => (
        <img
          src={`data:image/*;base64,${text}`}
          alt="Credential"
          style={{ width: "50px" }}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
      sorter: (a: any, b: any) =>
        new Date(a.createDate || "").getTime() -
        new Date(b.createDate || "").getTime(),
      render: (date: string) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updateDate",
      key: "updateDate",
      render: (date: string) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" onClick={() => openEditModal(record)}>
            Chỉnh sửa
          </Button>
          <Button danger onClick={() => showDeleteConfirm(record.visitorId)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const handleVisitorCreated = () => {
    // Call refetch after creating a visitor
    refetch();
  };
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 5);
  };

  const showModal = () => {
    setFaceImg(null);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setFaceImg(null);
    setIsModalVisible(false);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceImg(file);
      console.log("Form data: ", file);
    }
  };

  const handleCancel = () => {
    setFaceImg(null);
    setImageBase64(null); // Reset the image preview when closing the modal
    form.resetFields();
    setIsModalVisible(false);
    setIsEditModalVisible(false);

   
  };
  function base64ToBinary(base64String: any) {
    // Decode the base64 string to a binary string
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    // Convert binary string to bytes
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i); // Convert each character to a byte
    }

    return bytes; // This is the binary representation as a Uint8Array
  }

  const openEditModal = (visitor: any) => {
    console.log("Opening edit modal with visitor:", visitor);
   
    setEditingVisitor(visitor);
    const visitorImage = visitor.visitorCredentialImage
      ? visitor.visitorCredentialImage
      : null;

    form.setFieldsValue({
      visitorName: visitor.visitorName,
      companyName: visitor.companyName,
      phoneNumber: visitor.phoneNumber,
      credentialsCard: visitor.credentialsCard,
      credentialCardTypeId: visitor.credentialCardType.credentialCardTypeId,
      visitorCredentialImageFromRequest: base64ToBinary(
        visitor.visitorCredentialImage
      ),
    });
    // console.log(base64ToBinary(visitor.visitorCredentialImage));
    // console.log(form);
    if (visitorImage) {
      setImageBase64(visitorImage); // Show base64 image in the modal
    }

    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
  
      // Use faceImg or existing image from the form fields
      const finalValues = {
        ...values,
        visitorCredentialImageFromRequest:
          faceImg || form.getFieldValue("visitorCredentialImageFromRequest"),
      };
  
      // Update the visitor's information
      await updateVisitor({
        id: editingVisitor.visitorId,
        ...finalValues,
      }).unwrap();
  
      // Close modal and reset form
      setIsEditModalVisible(false);
      form.resetFields();
  
      // Clear the file input by resetting the ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  
      notification.success({
        message: "Thành công",
        description: "Cập nhật thông tin khách thành công.",
      });
  
      // Reset faceImg for the next operation
      setFaceImg(null);
      setImageBase64(null); // Optionally reset the displayed image
  
      // Refetch the updated data
      refetch();
    } catch (error) {
      console.error("Update visitor error:", error);
      notification.error({
        message: "Thất bại",
        description: "Cập nhật thông tin khách thất bại, vui lòng thử lại.",
      });
    }
  };
  const showDeleteConfirm = (visitorId: number) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa khách này?",
      icon: <ExclamationCircleOutlined />,
      content: "Việc xóa sẽ không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteVisitor({ id: visitorId }).unwrap();
          notification.success({
            message: `Xóa khách thành công!`,
          });
          refetch();
        } catch (error) {
          notification.error({
            message: "Xóa khách thất bại, vui lòng thử lại.",
          });
          console.error("Failed to delete visitor:", error);
        }
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  return (
    <Content className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-green-500 text-2xl font-bold">Quản lý khách</h1>
      </div>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Tìm kiếm theo tên khách"
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
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          style={{ borderRadius: 5 }}
        >
          Tạo mới khách
        </Button>
      </Space>
      {isModalVisible && (
        <CreateNewVisitor
          isModalVisible={isModalVisible}
          setIsModalVisible={closeModal}
          onVisitorCreated={handleVisitorCreated}
        />
      )}
      {/* <Modal
        title="Tạo mới khách"
        open={isModalVisible}
        onOk={handleOk}
        confirmLoading={isCreating}
        onCancel={handleCancel}
        okText="Tạo mới"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên khách" name="visitorName" rules={[{ required: true, message: "Vui lòng nhập tên khách!" }]}>
            <Input placeholder="Nhập tên khách" />
          </Form.Item>
          <Form.Item label="Công ty" name="companyName" rules={[{ required: true, message: "Vui lòng nhập tên công ty!" }]}>
            <Input placeholder="Nhập tên công ty" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item label="Thẻ nhận dạng" name="credentialsCard" rules={[{ required: true, message: "Vui lòng nhập mã thẻ!" }]}>
            <Input placeholder="Nhập mã thẻ" />
          </Form.Item>
          <Form.Item label="Loại thẻ nhận dạng" name="credentialCardTypeId" rules={[{ required: true, message: "Vui lòng chọn loại thẻ!" }]}>
            <Input placeholder="Chọn loại thẻ" />
          </Form.Item>
          <Form.Item label="Hình ảnh thẻ" name="visitorCredentialImage" rules={[{ required: true, message: "Vui lòng nhập hình ảnh thẻ!" }]}>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Item>
        </Form>
      </Modal> */}

      {/* Edit visitor modal */}
      <Modal
        title="Chỉnh sửa khách"
        open={isEditModalVisible}
        onOk={handleUpdate}
        confirmLoading={isUpdating}
        onCancel={handleCancel}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên khách"
            name="visitorName"
            rules={[{ required: true, message: "Vui lòng nhập tên khách!" }]}
          >
            <Input placeholder="Nhập tên khách" />
          </Form.Item>
          <Form.Item
            label="Công ty"
            name="companyName"
            rules={[{ required: true, message: "Vui lòng nhập tên công ty!" }]}
          >
            <Input placeholder="Nhập tên công ty" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            label="Thẻ nhận dạng"
            name="credentialsCard"
            rules={[{ required: true, message: "Vui lòng nhập mã thẻ!" }]}
          >
            <Input placeholder="Nhập mã thẻ" />
          </Form.Item>
          <Form.Item
            label="Loại nhận dạng"
            name="credentialCardTypeId"
            rules={[{ required: true, message: "Vui lòng chọn loại thẻ!" }]}
          >
            <Select
              placeholder="Chọn loại thẻ"
              onChange={handleCredentialCardTypeChange}
            >
              <Option value={1}>Căn cước công dân</Option>
              <Option value={2}>Giấy phép lái xe</Option>
            </Select>
          </Form.Item>
          <Form>
            {imageBase64 && (
              <img
                src={`data:image/jpeg;base64,${imageBase64}`}
                alt="Credential"
                style={{ width: "100px" }}
              />
            )}

            <Form.Item label="Hình ảnh thẻ">
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </Form.Item>
          </Form>
        </Form>
      </Modal>

      {error ? (
        <p>Đã xảy ra lỗi khi tải dữ liệu!</p>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalVisitors,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            size: "small",
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          rowKey="visitorId"
          bordered
        />
      )}
    </Content>
  );
};

export default VisitorManager;
