import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message, Button } from "antd";
import {
  useGetVisitorByIdQuery,
  useUpdateVisitorMutation,
} from "../../services/visitor.service";
import detectAPI from "../../api/detectAPI";

const { Option } = Select;

interface DetailVisitorProps {
  id: number;
  isEditModalVisible: boolean;
  setIsEditModalVisible: (visible: boolean) => void;
}

const DetailVisitor: React.FC<DetailVisitorProps> = ({
  id,
  isEditModalVisible,
  setIsEditModalVisible,
}) => {
  const userRole = localStorage.getItem("userRole");
  const { data: visitorData,refetch } = useGetVisitorByIdQuery({ id });
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  const [form] = Form.useForm();
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    if (visitorData) {
      form.setFieldsValue({
        visitorName: visitorData.visitorName,
        companyName: visitorData.companyName,
        phoneNumber: visitorData.phoneNumber,
        credentialsCard: visitorData.credentialsCard,
        credentialCardTypeId:
          visitorData.credentialCardType.credentialCardTypeId,
        visitorCredentialImageFromRequest:
          visitorData.visitorCredentialImageFromRequest,
      });
      setImageBase64(
        `data:image/jpeg;base64,${visitorData.visitorCredentialImage}` || null
      );
    }
  }, [visitorData, form]);

  const handleUpdate = async () => {
    try {
      const trimmedBase64 = imageBase64
        ? imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "")
        : "";

      const values = await form.validateFields();
      const updatedVisitor = {
        ...values,
        id,
        visitorCredentialImageFromRequest: trimmedBase64,
      };

      await updateVisitor(updatedVisitor).unwrap();
      refetch();
      message.success("Cập nhật thành công!");
      setIsEditModalVisible(false); // Close the modal after successful update
    } catch (error) {
      message.error("Đã có lỗi xảy ra khi cập nhật.");
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
      try {
        const formData = new FormData();
        formData.append("file", file);
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        const response = await detectAPI.post("/IdentityCard", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { id, name } = response.data;
        // Optionally, you can set these values in the form
        form.setFieldsValue({
          visitorName: name,
          credentialsCard: id,
        });
      } catch (error) {
        return;
      }
    }
  };
  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const isEditable = userRole !== "Staff";

  return (
    <Modal
      title="Chỉnh sửa khách"
      open={isEditModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Quay lại
        </Button>,
        // Conditionally render the "Cập nhật" button based on isEditable
        isEditable && (
          <Button
            key="update"
            type="primary"
            onClick={handleUpdate}
            loading={isUpdating}
          >
            Cập nhật
          </Button>
        ),
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên khách"
          name="visitorName"
          rules={[{ required: true, message: "Vui lòng nhập tên khách!" }]}
        >
          <Input placeholder="Nhập tên khách" disabled={!isEditable} />
        </Form.Item>
        <Form.Item
          label="Công ty"
          name="companyName"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty!" }]}
        >
          <Input placeholder="Nhập tên công ty" disabled={!isEditable} />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="Nhập số điện thoại" disabled={!isEditable} />
        </Form.Item>
        <Form.Item
          label="Thẻ nhận dạng"
          name="credentialsCard"
          rules={[{ required: true, message: "Vui lòng nhập mã thẻ!" }]}
        >
          <Input placeholder="Nhập mã thẻ" disabled={!isEditable} />
        </Form.Item>
        <Form.Item
          label="Loại nhận dạng"
          name="credentialCardTypeId"
          rules={[{ required: true, message: "Vui lòng chọn loại thẻ!" }]}
        >
          <Select placeholder="Chọn loại thẻ" disabled={!isEditable}>
            <Option value={1}>Căn cước công dân</Option>
            <Option value={2}>Giấy phép lái xe</Option>
          </Select>
        </Form.Item>

        {imageBase64 && (
          <img
            src={`${imageBase64}`}
            alt="Credential"
            style={{ width: "100px", marginBottom: "10px" }}
          />
        )}

        {isEditable && (
          <Form.Item label="Hình ảnh thẻ">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default DetailVisitor;
