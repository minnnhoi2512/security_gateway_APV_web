import { useState } from "react";
import { Button, Input, Form, notification } from "antd";
import { useCreateQRCardMutation, useGenerateQRCardMutation, useGetListQRCardQuery } from "../services/qrCard.service";
import { useNavigate } from "react-router-dom";
import QRCardType from "../types/QRCardType";

const CreateQRCard = () => {
  const [form] = Form.useForm();
  const [createQRCard, { isLoading: isCreating }] = useCreateQRCardMutation();
  const [generateQRCard, { isLoading: isGenerating }] = useGenerateQRCardMutation();
  const [cardGuid, setCardGuid] = useState<string>("");
  const navigate = useNavigate(); 


  const { data: existingCards, isLoading: isFetchingCards } = useGetListQRCardQuery({
    pageNumber: 1,
    pageSize: 1000, 
  });

  const handleCreateQRCard = async () => {
    try {

      const isDuplicate = existingCards?.qrCards?.some((card: QRCardType) => card.cardVerification === cardGuid);

      if (isDuplicate) {
        notification.error({
          message: "Mã xác thực đã tồn tại",
          description: "Không thể tạo thẻ với mã xác thực đã tồn tại.",
        });
        return; 
      }

      await createQRCard(cardGuid).unwrap();
      notification.success({
        message: "Thẻ QR đã được tạo thành công",
      });

      await generateQRCard(cardGuid).unwrap();
      notification.success({
        message: "QR Code đã được tạo thành công",
      });

      form.resetFields(); 
      setCardGuid("");
      navigate("/card");
    } catch (error) {
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Đã xảy ra lỗi trong quá trình tạo thẻ hoặc QR Code.",
      });
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Tạo mới thẻ QR</h1>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleCreateQRCard}
      >
        <Form.Item
          label="Mã Thẻ (Card GUID)"
          name="cardGuid"
          rules={[
            { required: true, message: "Vui lòng nhập Mã Thẻ" },
            {
              pattern: /^[a-zA-Z0-9]+$/,
              message: "Mã thẻ chỉ chứa chữ cái và số, không có ký tự đặc biệt",
            },
          ]}
        >
          <Input
            placeholder="Nhập Mã Thẻ"
            value={cardGuid}
            onChange={(e) => setCardGuid(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isGenerating || isFetchingCards}
            disabled={isCreating || isGenerating || isFetchingCards}
          >
            Tạo và Generate QR Card
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateQRCard;
