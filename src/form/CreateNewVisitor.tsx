import { Modal, Input, notification, Image, Select } from "antd";
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

  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        visitorCredentialImageFromRequest: file,
      }));
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
      <div>
        <label>Tên khách</label>
        <Input
          name="visitorName"
          value={formData.visitorName}
          onChange={handleInputChange}
          placeholder="Nhập tên khách"
          status={errorVisitor?.visitorName ? "error" : ""}
        />
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
          <Option value={1}>Giấy phép lái xe</Option>
        </Select>
      </div>
      {formData.credentialCardTypeId && (
        <div>
          <label>Số thẻ</label>
          <div>
            <Input
              name="credentialsCard"
              value={formData.credentialsCard}
              onChange={handleInputChange}
              placeholder="Nhập mã thẻ"
              status={errorVisitor?.credentialsCard ? "error" : ""}
            />
            {errorVisitor?.credentialsCard && (
              <p className="text-red-500 bg-red-100 p-2 rounded">
                {errorVisitor.credentialsCard[0]}
              </p>
            )}
          </div>
        </div>
      )}
      {formData.credentialCardTypeId && (
        <div>
          <label>Hình ảnh thẻ</label>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
      )}
      {formData.visitorCredentialImageFromRequest && (
        <Image
          src={URL.createObjectURL(formData.visitorCredentialImageFromRequest)}
          alt="Selected Image"
          preview={false}
        />
      )}
    </Modal>
  );
};

export default CreateNewVisitor;
