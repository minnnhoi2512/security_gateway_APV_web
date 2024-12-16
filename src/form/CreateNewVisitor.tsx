import React, { useState } from "react";
import {
  Modal,
  Input,
  notification,
  Image,
  Select,
  Spin,
  Upload,
  Button,
} from "antd";
import { Camera, Plus } from "lucide-react";
import { useCreateVisitorMutation } from "../services/visitor.service";
import detectAPI from "../api/detectAPI";
import { isEntityError } from "../utils/helpers";

const { Option } = Select;

interface FormData {
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  credentialCardTypeId: number;
  email: string;
  credentialsCard: string;
  imgBlur: File | null;
  visitorCredentialFrontImageFromRequest: File | null;
  visitorCredentialBackImageFromRequest: File | null;
}

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
  type FormError = { [key in keyof FormData]?: string[] } | null;
  const [errorVisitor, setErrorVisitor] = useState<FormError>(null);
  const [formData, setFormData] = useState<FormData>({
    visitorName: "",
    companyName: "",
    phoneNumber: "",
    credentialCardTypeId: 1,
    email: "",
    credentialsCard: "",
    imgBlur: null,
    visitorCredentialFrontImageFromRequest: null,
    visitorCredentialBackImageFromRequest: null,
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      credentialCardTypeId: value,
    }));
  };

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
      // console.error('Error converting base64 to file:', error);
      throw new Error('Failed to convert base64 to file');
    }
  };
  const capitalizeFirstLetter = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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


      if (!birth.toString().includes("/")) {
        setFormData((prev) => ({
          ...prev,
          visitorName: "",
          companyName: "",
          phoneNumber: "",
          email : "",
          credentialsCard: "",
          imgBlur : null,
          visitorCredentialFrontImageFromRequest: null,
          visitorCredentialBackImageFromRequest: null ,
        }));
        return notification.warning({
          message: `Hệ thống không nhận diện được ảnh`,
          description: "Vui lòng chọn đúng loại giấy tờ.",
        });
      }
      const formattedName = capitalizeFirstLetter(name);
      const convertFile = base64ToFile(imgblur)
      // console.log(convertFile);
      setFormData((prevData) => ({
        ...prevData,
        visitorName: formattedName,
        credentialsCard: id,
        imgBlur : convertFile,
      }));
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        visitorName: "",
        companyName: "",
        phoneNumber: "",
        email : "",
        credentialsCard: "",
        imgBlur : null,
        visitorCredentialFrontImageFromRequest: null ,
        visitorCredentialBackImageFromRequest: null ,
      }));
      notification.warning({
        message: `Hệ thống không nhận diện được ảnh`,
        description: "Vui lòng chọn đúng loại giấy tờ.",
      });
    } finally {
      setIsDetecting(false);
    }
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
        setErrorVisitor(error.data.errors as FormError);
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
      title={ <div className="flex items-center gap-3 px-2 py-3">
        <Plus className="w-6 h-6 text-buttonColor" />
        <h3 className="text-xl font-semibold text-buttonColor">
          Tạo mới khách
        </h3>
      </div>}
      open={isModalVisible}
      onOk={handleOk}
      confirmLoading={isCreating}
      onCancel={handleCancel}
      footer={[
        <div key="footer" className="flex justify-end items-center gap-3">
          <Button
            onClick={handleCancel}
            className="min-w-[120px] h-10 bg-buttonCancel text-white hover:!text-buttonCancel hover:!bg-white hover:!border-buttonCancel hover:!border-2 border border-gray-200"
          >
            Hủy
          </Button>
          <Button
            loading={isCreating}
            onClick={handleOk}
            className="min-w-[120px] bg-buttonColor text-white hover:!text-buttonColor hover:!bg-white hover:!border-buttonColor hover:!border-2 border-0 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center h-10"
            icon={<Plus className="w-4 h-4 mr-1" />}
          >
            Tạo mới
          </Button>
        </div>,
      ]}
      centered
      maskClosable={false}
      width={1000}
      className="modal-center"
      styles={{
        mask: {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
        },
        content: {
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
        footer: {
          padding: "20px 24px",
          borderTop: "1px solid #e5e7eb",
        },
      }}
    >
      <div className="flex gap-8 mt-6">
        <div className="w-2/5 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Loại nhận dạng
            </label>
            <Select
              value={formData.credentialCardTypeId}
              onChange={handleSelectChange}
              placeholder="Chọn loại thẻ"
              className="w-full"
            >
              <Option value={1}>Căn cước công dân</Option>
              <Option value={2}>Giấy phép lái xe</Option>
            </Select>
          </div>

          <div className="space-y-4">
            <div
              className="relative border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-all duration-300 group"
              onDrop={(e) => handleFileDrop(e, "front")}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("fileFrontInput")?.click()}
            >
              {formData.visitorCredentialFrontImageFromRequest ? (
                <div className="relative group flex justify-center items-center">
                  <Image
                    src={URL.createObjectURL(
                      formData.visitorCredentialFrontImageFromRequest
                    )}
                    alt="Selected Image"
                    preview={false}
                    className="max-h-32  object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
              ) : (
       
                <div className="flex flex-col items-center space-y-3 py-8 max-h-32">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-gray-500">Tải lên mặt trước thẻ</p>
                  <p className="text-xs text-gray-400">
                    Kéo thả hoặc{" "}
                    <span className="text-blue-500">chọn file</span>
                  </p>
                </div>
              )}
              <Input
                id="fileFrontInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "front")}
                className="hidden"
              />
            </div>

            <div
              className="relative border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-all duration-300 group"
              onDrop={(e) => handleFileDrop(e, "back")}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("fileBackInput")?.click()}
            >
              {formData.visitorCredentialBackImageFromRequest ? (
                <div className="relative group flex justify-center items-center">
                  <Image
                    src={URL.createObjectURL(
                      formData.visitorCredentialBackImageFromRequest
                    )}
                    alt="Selected Image"
                    preview={false}
                   className="max-h-32  object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-8 max-h-32">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-gray-500">Tải lên mặt sau thẻ</p>
                  <p className="text-xs text-gray-400">
                    Kéo thả hoặc{" "}
                    <span className="text-blue-500">chọn file</span>
                  </p>
                </div>
              )}
              <Input
                id="fileBackInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "back")}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="w-3/5 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên khách
            </label>
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
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {errorVisitor.visitorName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Công ty
            </label>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Nhập tên công ty"
              status={errorVisitor?.companyName ? "error" : ""}
            />
            {errorVisitor?.companyName && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {errorVisitor.companyName[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                status={errorVisitor?.phoneNumber ? "error" : ""}
              />
              {errorVisitor?.phoneNumber && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {errorVisitor.phoneNumber[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ email"
                status={errorVisitor?.email ? "error" : ""}
              />
              {errorVisitor?.email && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {errorVisitor.email[0]}
                </p>
              )}
            </div>
          </div>

          {formData.credentialCardTypeId ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Số thẻ
              </label>
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
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {errorVisitor.credentialsCard[0]}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default CreateNewVisitor;
