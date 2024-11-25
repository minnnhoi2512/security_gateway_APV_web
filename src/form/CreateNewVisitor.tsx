import { Modal, Input, notification, Image, Select, Spin } from "antd";
import { useState } from "react";
import { useCreateVisitorMutation } from "../services/visitor.service";
import detectAPI from "../api/detectAPI";
import { isEntityError } from "../utils/helpers";
const { Option } = Select;

interface CreateNewVisitorProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onVisitorCreated?: (visitorData: any) => void;
}

const CreateNewVisitor: React.FC<CreateNewVisitorProps> = ({
  isModalVisible,
  setIsModalVisible,
  onVisitorCreated,
}) => {
  type FormError = { [key in keyof typeof formData]: string } | null;
  const [errorVisitor, seterrorVisitor] = useState<FormError>();
  const [formData, setFormData] = useState({
    visitorName: "",
    companyName: "",
    phoneNumber: "",
    credentialCardTypeId: 2,
    credentialsCard: "",
    visitorCredentialImageFromRequest: null as File | null,
  });
  const [isDetecting, setIsDetecting] = useState(false);

  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        visitorCredentialImageFromRequest: file,
      }));
      setIsDetecting(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await detectAPI.post("/IdentityCard", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { id, name } = response.data;
        setFormData((prevData) => ({
          ...prevData,
          visitorName: name,
          credentialsCard: id,
        }));
      } catch (error) {
        return;
      } finally {
        setIsDetecting(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: number) => {
    setFormData((prevData) => ({
      ...prevData,
      credentialCardTypeId: value,
    }));
  };

  const handleOk = async () => {
    if (!formData.visitorCredentialImageFromRequest) {
      notification.error({ message: "Vui lòng nhập hình ảnh thẻ!" });
      return;
    }
    try {
      const response = await createVisitor(formData).unwrap();

      onVisitorCreated?.(response);
      setIsModalVisible(false);
      setFormData({
        visitorName: "",
        companyName: "",
        phoneNumber: "",
        credentialCardTypeId: 0,
        credentialsCard: "",
        visitorCredentialImageFromRequest: null as File | null,
      });
      notification.success({
        message: "Thành công",
        description: "Khách mới đã được tạo thành công.",
      });
    } catch (error) {
      if (isEntityError(error)) {
        seterrorVisitor(error.data.errors as FormError);
      }
      notification.error({ message: "Có lỗi xảy ra khi tạo mới khách." });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFormData({
      visitorName: "",
      companyName: "",
      phoneNumber: "",
      credentialCardTypeId: 0,
      credentialsCard: "",
      visitorCredentialImageFromRequest: null,
    });
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(event);
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
      <div className="flex">
        <div className="w-1/2 p-4">
          <div
            className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {formData.visitorCredentialImageFromRequest ? (
              <Image
                src={URL.createObjectURL(formData.visitorCredentialImageFromRequest)}
                alt="Selected Image"
                preview={false}
                className="max-h-64"
              />
            ) : (
              <p className="text-center text-gray-500">
                Kéo và thả hình ảnh thẻ vào đây hoặc <span className="text-blue-500 underline">nhấp để chọn</span>
              </p>
            )}
            <Input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </div>
        <div className="w-1/2 p-4 space-y-4">
          <div>
            <label>Tên khách</label>
            <Spin spinning={isDetecting}>
              <Input
                name="visitorName"
                value={formData.visitorName}
                onChange={handleInputChange}
                placeholder="Nhập tên khách"
                status={errorVisitor?.visitorName ? "error" : ""}
              />
            </Spin>
            {errorVisitor?.visitorName && (
              <p className="text-red-500 bg-red-100 p-2 rounded">
                {errorVisitor.visitorName[0]}
              </p>
            )}
          </div>
          <div>
            <label>Công ty</label>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Nhập tên công ty"
              status={errorVisitor?.companyName ? "error" : ""}
            />
            {errorVisitor?.companyName && (
              <p className="text-red-500 bg-red-100 p-2 rounded">
                {errorVisitor.companyName[0]}
              </p>
            )}
          </div>
          <div>
            <label>Số điện thoại</label>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              status={errorVisitor?.phoneNumber ? "error" : ""}
            />
            {errorVisitor?.phoneNumber && (
              <p className="text-red-500 bg-red-100 p-2 rounded">
                {errorVisitor.phoneNumber[0]}
              </p>
            )}
          </div>
          <div>
            <label>Loại nhận dạng</label>
            <Select
              value={formData.credentialCardTypeId}
              onChange={handleSelectChange}
              placeholder="Chọn loại thẻ"
            >
              <Option value={2}>Căn cước công dân</Option>
            </Select>
          </div>
          {formData.credentialCardTypeId && (
            <div>
              <label>Số thẻ</label>
              <Spin spinning={isDetecting}>
                <Input
                  name="credentialsCard"
                  value={formData.credentialsCard}
                  onChange={handleInputChange}
                  placeholder="Nhập mã thẻ"
                  status={errorVisitor?.credentialsCard ? "error" : ""}
                />
              </Spin>
              {errorVisitor?.credentialsCard && (
                <p className="text-red-500 bg-red-100 p-2 rounded">
                  {errorVisitor.credentialsCard[0]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateNewVisitor;