import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Button, notification, Image, Spin } from "antd";
import { Camera, Pencil, Plus, Upload } from "lucide-react";
import {
  useGetVisitorByIdQuery,
  useUpdateVisitorMutation,
} from "../../services/visitor.service";
import detectAPI from "../../api/detectAPI";
import "./animation.css";
import LoadingState from "../../components/State/LoadingState";

const { Option } = Select;

interface DetailVisitorProps {
  id: number;
  isEditModalVisible: boolean;
  setIsEditModalVisible: (visible: boolean) => void;
  onUpdateSuccess?: () => void;
}

const DetailVisitor: React.FC<DetailVisitorProps> = ({
  id,
  isEditModalVisible,
  setIsEditModalVisible,
  onUpdateSuccess,
}) => {
  const userRole = localStorage.getItem("userRole");
  const isEditable = userRole !== "Staff";

  const {
    data: visitorData,
    isLoading,
    refetch,
  } = useGetVisitorByIdQuery({ id });
  // console.log(visitorData)
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  const [formData, setFormData] = useState({
    visitorName: "",
    companyName: "",
    phoneNumber: "",
    credentialCardTypeId: 1,
    credentialsCard: "",
    // email : "",
    visitorCredentialFrontImageFromRequest: "",
    visitorCredentialBackImageFromRequest: "",
    visitorCredentialBlurImageFromRequest: "",
  });
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [blurImage, setBlurImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (visitorData) {
      const frontImage = visitorData.visitorImage.find(
        (image) => image.imageType === "CitizenIdentificationCard_FRONT"
      )?.imageURL;

      const backImage = visitorData.visitorImage.find(
        (image) => image.imageType === "CitizenIdentificationCard_BACK"
      )?.imageURL;

      const blurImage = visitorData.visitorImage.find(
        (image) => image.imageType === "CitizenIdentificationCard_BLUR"
      )?.imageURL;

      setFormData({
        visitorName: visitorData.visitorName,
        companyName: visitorData.companyName,
        phoneNumber: visitorData.phoneNumber,
        credentialsCard: visitorData.credentialsCard,
        credentialCardTypeId:
          visitorData.credentialCardType.credentialCardTypeId,
        visitorCredentialFrontImageFromRequest: frontImage,
        visitorCredentialBackImageFromRequest: backImage,
        visitorCredentialBlurImageFromRequest: blurImage,
      });

      setBlurImage(`data:image/jpeg;base64,${blurImage}` || null);
      setFrontImage(`data:image/jpeg;base64,${frontImage}` || null);
      setBackImage(`data:image/jpeg;base64,${backImage}` || null);
    }
  }, [visitorData]);

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

  const trimmedBase64 = (base64: string) => {
    return base64.replace(/^data:image\/jpeg;base64,/, "");
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    typeImage: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeImage === "front") {
          setFrontImage(reader.result as string);
          setFormData((prev) => ({
            ...prev,
            visitorCredentialFrontImageFromRequest: trimmedBase64(
              reader.result as string
            ),
          }));
        } else if (typeImage === "back") {
          setBackImage(reader.result as string);
          setFormData((prev) => ({
            ...prev,
            visitorCredentialBackImageFromRequest: trimmedBase64(
              reader.result as string
            ),
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedVisitor = {
        ...formData,
        id,
        visitorCredentialBlurImageFromRequest: trimmedBase64(blurImage),
      };
      await updateVisitor(updatedVisitor).unwrap();
      refetch();
      notification.success({ message: "Cập nhật thành công!" });
      setIsEditModalVisible(false);
      onUpdateSuccess?.();
    } catch (error) {
      notification.error({ message: "Đã có lỗi xảy ra khi cập nhật." });
    }
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 px-2 py-3">
          <Pencil className="w-6 h-6 text-buttonColor" />
          <h3 className="text-xl font-semibold text-buttonColor">
            Chỉnh sửa khách
          </h3>
        </div>
      }
      open={isEditModalVisible}
      onCancel={handleCancel}
      footer={[
        <div key="footer" className="flex justify-end items-center gap-3">
          <Button
            onClick={handleCancel}
            className="min-w-[120px] h-10 bg-buttonCancel text-white hover:!text-buttonCancel hover:!bg-white hover:!border-buttonCancel hover:!border-2 border border-gray-200"
          >
            Quay lại
          </Button>
          {isEditable && (
            <Button
              loading={isUpdating}
              onClick={handleUpdate}
              className="min-w-[120px] bg-buttonColor text-white hover:!text-buttonColor hover:!bg-white hover:!border-buttonColor hover:!border-2 border-0 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center h-10"
              icon={<Plus className="w-4 h-4 mr-1" />}
            >
              Cập nhật
            </Button>
          )}
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
              disabled={!isEditable}
              className="w-full"
            >
              <Option value={1}>Căn cước công dân</Option>
              <Option value={2}>Giấy phép lái xe</Option>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-all duration-300 group">
              {frontImage ? (
                <div className="relative group flex justify-center items-center">
                  {/* <Image
                    src={frontImage}
                    alt="Front Image"
                    preview={false}
                    className="max-h-48 w-full object-contain rounded-lg"
                  /> */}
                  <Image
                    src={frontImage}
                    alt="Front Image"
                    preview={false}
                    className="max-h-32  object-contain rounded-lg"
                  />
                  {isEditable && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-8">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-gray-500">Tải lên mặt trước thẻ</p>
                  <p className="text-xs text-gray-400">
                    Kéo thả hoặc{" "}
                    <span className="text-blue-500">chọn file</span>
                  </p>
                </div>
              )}
              {isEditable && (
                <Input
                  id="fileFrontInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "front")}
                  className="hidden"
                />
              )}
            </div>

            <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-all duration-300 group">
              {backImage ? (
                <div className="relative group flex justify-center items-center">
                  {/* <Image
                    src={backImage}
                    alt="Back Image"
                    preview={false}
                    className="max-h-48 w-full object-contain rounded-lg"
                  /> */}
                  <Image
                    src={backImage}
                    alt="Back Image"
                    preview={false}
                    className="max-h-32  object-contain rounded-lg"
                  />
                  {isEditable && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-8">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-gray-500">Tải lên mặt sau thẻ</p>
                  <p className="text-xs text-gray-400">
                    Kéo thả hoặc{" "}
                    <span className="text-blue-500">chọn file</span>
                  </p>
                </div>
              )}
              {isEditable && (
                <Input
                  id="fileBackInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "back")}
                  className="hidden"
                />
              )}
            </div>
          </div>
        </div>

        <div className="w-3/5 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên khách
            </label>
            <Input
              name="visitorName"
              value={formData.visitorName}
              onChange={handleInputChange}
              placeholder="Nhập tên khách"
              disabled={!isEditable}
            />
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
              disabled={!isEditable}
            />
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
                disabled={!isEditable}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Số thẻ
              </label>
              <Input
                name="credentialsCard"
                value={formData.credentialsCard}
                onChange={handleInputChange}
                placeholder="Nhập mã thẻ"
                disabled={!isEditable}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailVisitor;
