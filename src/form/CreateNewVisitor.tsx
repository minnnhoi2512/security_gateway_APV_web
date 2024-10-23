import { Modal, Form, Input, notification, Image, Select } from "antd";
import { useState } from "react";
import { useCreateVisitorMutation } from "../services/visitor.service";

const { Option } = Select;

interface CreateNewVisitorProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onVisitorCreated: (visitorData: any) => void;
}
const CreateNewVisitor: React.FC<CreateNewVisitorProps> = ({
  isModalVisible,
  setIsModalVisible,
  onVisitorCreated,
}) => {
  const [form] = Form.useForm();
  const [faceImg, setFaceImg] = useState<File | null>(null);
  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();

  const [credentialCardTypeId, setCredentialCardTypeId] = useState<
    number | null
  >(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceImg(file);
      // console.log("Form data: ", file);
    }
  };
  const handleCredentialCardTypeChange = (value: number) => {
    setCredentialCardTypeId(value);
  };

  const handleOk = async () => {
    try {
      // Validate form fields and get values
      const values = await form.validateFields();

      // Prepare final values to be sent
      const finalValues = {
        ...values,
        visitorCredentialImageFromRequest: faceImg,
      };

      // Send request to create a visitor
      const response = await createVisitor({
        companyName: finalValues.companyName,
        credentialCardTypeId: finalValues.credentialCardTypeId,
        credentialsCard: finalValues.credentialsCard,
        phoneNumber: finalValues.phoneNumber,
        visitorCredentialImageFromRequest:
          finalValues.visitorCredentialImageFromRequest,
        visitorName: finalValues.visitorName,
      }).unwrap(); // Use unwrap to handle the response directly

      // On success
      onVisitorCreated(response);
      setIsModalVisible(false);
      form.resetFields();
      setFaceImg(null);
      notification.success({
        message: "Thành công",
        description: "Khách mới đã được tạo thành công.",
      });
    } catch (err: any) {
      // This block catches errors from the mutation
      let errorMessage = "";
      // console.error("Create visitor error:", err.data.errors.CredentialsCard);
      if (err.data.errors.CredentialsCard)
        errorMessage = "Căn cước công dân đã tồn tại";
      {
        // Handle any other unexpected errors
        notification.error({
          message: "Lỗi trong quá trình tạo",
          description: errorMessage,
        });
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFaceImg(null);
  };

  return (
    <Modal
      title="Tạo mới khách"
      open={isModalVisible}
      onOk={handleOk}
      confirmLoading={isCreating}
      onCancel={handleCancel}
      okText="Tạo mới"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên khách"
          name="visitorName"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên khách!",
            },
            {
              pattern: /^[A-Za-zÀ-ỹ\s]+$/,
              message: "Tên khách không hợp lệ!",
            },
          ]}
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
            {
              len: 10,
              // message: "Số điện thoại phải có đúng 10 chữ số!",
            },
            {
              pattern: /^0\d{9}$/, // Must start with 0 followed by 9 digits
              message:
                "Số điện thoại phải bắt đầu bằng 0 và chỉ được chứa các chữ số!",
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
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
            <Option value={2}>Căn cước công dân</Option>
            <Option value={1}>Giấy phép lái xe</Option>
          </Select>
        </Form.Item>
        {credentialCardTypeId && (
          <Form.Item
            label="Số thẻ"
            name="credentialsCard"
            rules={[
              { required: true, message: "Vui lòng nhập số thẻ!" },
              {
                len: 12,
                message: "Số thẻ phải có đúng 12 chữ số!",
              },
              {
                pattern: /^\d{12}$/,
                message: "Số thẻ chỉ được chứa các chữ số!",
              },
            ]}
          >
            <Input placeholder="Nhập mã thẻ" />
          </Form.Item>
        )}
        {/* Conditionally render the file input based on credentialCardTypeId */}
        {credentialCardTypeId && (
          <Form.Item
            label="Hình ảnh thẻ"
            rules={[{ required: true, message: "Vui lòng nhập hình ảnh thẻ!" }]}
          >
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Item>
        )}

        {/* Display the selected image for preview */}
        {faceImg && (
          <Image
            src={URL.createObjectURL(faceImg)}
            alt="Selected Image"
            preview={false} // Prevent default preview
          />
        )}
      </Form>
    </Modal>
  );
};

export default CreateNewVisitor;
