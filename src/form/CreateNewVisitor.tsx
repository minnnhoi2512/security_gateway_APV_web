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
    credentialCardTypeId: 1,
    email : "",
    credentialsCard: "",
    imgBlur : null as File | null,
    visitorCredentialFrontImageFromRequest: null as File | null,
    visitorCredentialBackImageFromRequest: null as File | null,
  });
  const [isDetecting, setIsDetecting] = useState(false);

  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    typeImage: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          ...(typeImage === "front" && {
            visitorCredentialFrontImageFromRequest: file,
          }),
          ...(typeImage === "back" && {
            visitorCredentialBackImageFromRequest: file,
          }),
        };

        // Check if both images are present
        if (
          updatedFormData.visitorCredentialFrontImageFromRequest &&
          updatedFormData.visitorCredentialBackImageFromRequest
        ) {
          callDetectAPI(updatedFormData);
        }

        return updatedFormData;
      });
    }
  };

  const base64ToFile = (base64String: string, fileName: string = 'image.jpg'): File => {
    try {
      // Remove data URI prefix if present
      const base64Content = base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      
      // Convert base64 to binary
      const byteString = window.atob(base64Content);
      
      // Create array buffer
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Fill array buffer
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      
      // Create Blob and File
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      return new File([blob], fileName, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      throw new Error('Failed to convert base64 to file');
    }
  };
  const callDetectAPI = async (formData: any) => {
    setIsDetecting(true);
    try {
      const formDataDetect = new FormData();
      formDataDetect.append(
        "file",
        formData.visitorCredentialFrontImageFromRequest
      );
      let response = null;
      if (formData.credentialCardTypeId === 1) {
        response = await detectAPI.post("/IdentityCard", formDataDetect, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (formData.credentialCardTypeId === 2) {
        response = await detectAPI.post("/DrivingLicense", formDataDetect, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const { id, name, birth ,imgblur} = response.data;
      console.log(birth)

      if (!birth.toString().includes("/")) {
        return notification.warning({
          message: `Hệ thống không nhận diện được thẻ`,
          description: "Vui lòng nhập thông tin.",
        });
      }
      const convertFile = base64ToFile(imgblur)
      console.log(convertFile);
      setFormData((prevData) => ({
        ...prevData,
        visitorName: name,
        credentialsCard: id,
        imgBlur : convertFile,
      }));
    } catch (error) {
      notification.warning({
        message: `Hệ thống không nhận diện được thẻ`,
        description: "Vui lòng nhập thông tin.",
      });
    } finally {
      setIsDetecting(false);
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
    if (!formData.visitorCredentialFrontImageFromRequest) {
      notification.error({ message: "Vui lòng nhập hình ảnh thẻ!" });
      return;
    }
    try {
      const response = await createVisitor(formData).unwrap();
      console.log(response)
      onVisitorCreated?.(response);
      setIsModalVisible(false);
      setFormData({
        visitorName: "",
        companyName: "",
        phoneNumber: "",
        credentialCardTypeId: 0,
        email : "",
        credentialsCard: "",
        imgBlur : null as File | null,
        visitorCredentialFrontImageFromRequest: null as File | null,
        visitorCredentialBackImageFromRequest: null as File | null,
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
      email : "",
      credentialCardTypeId: 0,
      credentialsCard: "",
      imgBlur :  null as File | null,
      visitorCredentialFrontImageFromRequest: null as File | null,
      visitorCredentialBackImageFromRequest: null as File | null,
    });
  };

  const handleFileDrop = (
    e: React.DragEvent<HTMLDivElement>,
    typeImage: string
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(event, typeImage);
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
          <div>
            <label>Loại nhận dạng</label>
            <Select
              value={formData.credentialCardTypeId}
              onChange={handleSelectChange}
              placeholder="Chọn loại thẻ"
            >
              <Option value={1}>Căn cước công dân</Option>
              <Option value={2}>Giấy phép lái xe</Option>
            </Select>
          </div>
          <div
            className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            onDrop={(e) => {
              handleFileDrop(e, "front");
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileFrontInput")?.click()}
          >
            {formData.visitorCredentialFrontImageFromRequest ? (
              <Image
                src={URL.createObjectURL(
                  formData.visitorCredentialFrontImageFromRequest
                )}
                alt="Selected Image"
                preview={false}
                className="max-h-64"
              />
            ) : (
              <p className="text-center text-gray-500">
                Kéo và thả mặt trước ảnh thẻ vào đây hoặc{" "}
                <span className="text-blue-500 underline">nhấp để chọn</span>
              </p>
            )}
            <Input
              id="fileFrontInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e, "front");
              }}
              className="hidden"
            />
          </div>
          <div
            className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            onDrop={(e) => {
              handleFileDrop(e, "back");
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileBackInput")?.click()}
          >
            {formData.visitorCredentialBackImageFromRequest ? (
              <Image
                src={URL.createObjectURL(
                  formData.visitorCredentialBackImageFromRequest
                )}
                alt="Selected Image"
                preview={false}
                className="max-h-64"
              />
            ) : (
              <p className="text-center text-gray-500">
                Kéo và thả mặt sau ảnh thẻ vào đây hoặc{" "}
                <span className="text-blue-500 underline">nhấp để chọn</span>
              </p>
            )}
            <Input
              id="fileBackInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e, "back");
              }}
              className="hidden"
            />
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
            <label>Email</label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ email"
              status={errorVisitor?.email ? "error" : ""}
            />
            {errorVisitor?.email && (
              <p className="text-red-500 bg-red-100 p-2 rounded">
                {errorVisitor.email[0]}
              </p>
            )}
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
