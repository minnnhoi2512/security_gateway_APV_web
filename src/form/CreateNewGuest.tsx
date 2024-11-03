import React, { useState } from "react";
import { Modal, Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface CreateNewGuestProps {
  onAddGuest: (guest: { name: string; image: string | null }) => void;
  onCancel: () => void;
}

const CreateNewGuest: React.FC<CreateNewGuestProps> = ({ onAddGuest, onCancel }) => {
  const [form] = Form.useForm();
  const [newImage, setNewImage] = useState<string | null>(null);

  const handleUploadChange = (info: any) => {
    const file = info.file.originFileObj;
    const newUploadedImage = URL.createObjectURL(file);
    setNewImage(newUploadedImage);
  };

  const handleFinish = (values: any) => {
    onAddGuest({ name: values.name, image: newImage });
    form.resetFields();
    setNewImage(null);
    onCancel();
  };

  return (
    <Modal
      title="Thêm khách hàng mới"
      visible={true}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
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
            onChange={handleUploadChange}
            showUploadList={false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
          </Upload>
          {newImage && (
            <img src={newImage} alt="" className="w-8 h-8 rounded-full mt-2" />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onCancel}>
            Hủy bỏ
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateNewGuest;
