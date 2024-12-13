import { useEffect, useState } from "react";
import { Modal, Input, Select, Button, notification } from "antd";
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
}

const DetailVisitor: React.FC<DetailVisitorProps> = ({
  id,
  isEditModalVisible,
  setIsEditModalVisible,
}) => {
  const userRole = localStorage.getItem("userRole");
  const {
    data: visitorData,
    isLoading,
    refetch,
  } = useGetVisitorByIdQuery({ id });
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  const [formData, setFormData] = useState({
    visitorName: "",
    companyName: "",
    phoneNumber: "",
    credentialCardTypeId: 1,
    credentialsCard: "",
    visitorCredentialFrontImageFromRequest: "",
    visitorCredentialBackImageFromRequest: "",
    visitorCredentialBlurImageFromRequest : "",
  });
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [blurImage, setBlurImage] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
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
      // console.log(blurImage)
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
            visitorCredentialFrontImageFromRequest: trimmedBase64(reader.result as string),
          }));
        } else if (typeImage === "back") {
          setBackImage(reader.result as string);
          setFormData((prev) => ({
            ...prev,
            visitorCredentialBackImageFromRequest: trimmedBase64(reader.result as string),
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const trimmedBase64 = (base64: string) => {
    // console.log(base64.replace(/^data:image\/jpeg;base64,/, ""))
    return base64.replace(/^data:image\/jpeg;base64,/, "");
  };
  const handleUpdate = async () => {
    try {
      const updatedVisitor = {
        ...formData,
        id,
        visitorCredentialBlurImageFromRequest: trimmedBase64(blurImage),
      };
      console.log(updatedVisitor)
      await updateVisitor(updatedVisitor).unwrap();
      refetch();
      notification.success({ message: "Cập nhật thành công!" });
      setIsEditModalVisible(false); // Close the modal after successful update
    } catch (error) {
      notification.error({ message: "Đã có lỗi xảy ra khi cập nhật." });
    }
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const isEditable = userRole !== "Staff";

  if (isLoading) {
    return (
      <div>
        <LoadingState />
      </div>
    );
  }

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
      <div className="space-y-4">
        <div>
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
        <div>
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
        <div>
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thẻ nhận dạng
          </label>
          <Input
            name="credentialsCard"
            value={formData.credentialsCard}
            onChange={handleInputChange}
            placeholder="Nhập mã thẻ"
            disabled={!isEditable}
          />
        </div>
        <div>
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
        <div
          className="flip-container"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`flipper ${isFlipped ? "flipped" : ""}`}>
            {frontImage && (
              <div className="front mb-2 flex flex-col justify-center items-center">
                <span className="text-sm text-gray-600 mb-1">
                  Ảnh mặt trước
                </span>
                <img
                  src={`${frontImage}`}
                  alt="frontImage"
                  className="w-24 h-auto border border-gray-300 rounded object-cover"
                />
              </div>
            )}
            {backImage && (
              <div className="back mb-2 flex flex-col justify-center items-center">
                <span className="text-sm text-gray-600 mb-1">Ảnh mặt sau</span>
                <img
                  src={`${backImage}`}
                  alt="backImage"
                  className="w-24 h-auto border border-gray-300 rounded object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {isEditable && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hình ảnh mặt trước
              </label>
              <Input
                id="fileFrontInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "front")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hình ảnh mặt sau
              </label>
              <Input
                id="fileBackInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "back")}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default DetailVisitor;
