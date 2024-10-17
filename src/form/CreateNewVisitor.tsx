import { Modal, Form, Input, notification, Image } from 'antd';
import { useState } from 'react';
import { useCreateVisitorMutation } from '../services/visitor.service';

interface CreateNewVisitorProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
}

const CreateNewVisitor: React.FC<CreateNewVisitorProps> = ({ isModalVisible, setIsModalVisible }) => {
  const [form] = Form.useForm();
  const [faceImg, setFaceImg] = useState<string | null>(null);
  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaceImg(reader.result as string); // Set base64 image for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const base64ToBlob = (base64: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert base64 to Blob
      const blobImage = faceImg ? base64ToBlob(faceImg, 'image/jpeg') : null;

      const finalValues = {
        ...values,
        visitorCredentialImageFromRequest: blobImage,
      };

      console.log("Form data: ", finalValues);

      await createVisitor(finalValues).unwrap();
      setIsModalVisible(false);
      form.resetFields();
      notification.success({
        message: "Thành công",
        description: "Khách mới đã được tạo thành công.",
      });
      setFaceImg(null);
    } catch (error) {
      console.error("Create visitor error:", error);
      notification.error({
        message: "Thất bại",
        description: "Tạo khách mới thất bại, vui lòng thử lại.",
      });
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
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
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
          label="Loại thẻ nhận dạng" 
          name="credentialCardTypeId" 
          rules={[{ required: true, message: "Vui lòng chọn loại thẻ!" }]}
        >
          <Input placeholder="Chọn loại thẻ" />
        </Form.Item>
        <Form.Item 
          label="Hình ảnh thẻ" 
          rules={[{ required: true, message: "Vui lòng nhập hình ảnh thẻ!" }]}
        >
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          {faceImg && <Image src={faceImg} alt="Credential Preview" width={100} />}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateNewVisitor;
