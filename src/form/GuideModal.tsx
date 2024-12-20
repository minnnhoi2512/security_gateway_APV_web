import React, { useState } from 'react';
import { Button, Modal, Image } from 'antd';
import { HelpCircle } from 'lucide-react';

import imageCCCD from '../assets/formcccd.jpg'
import imageGPLX from '../assets/formgplx.jpg'

interface GuideModalProps {
  credentialType: number;
}

const GuideModal: React.FC<GuideModalProps> = ({ credentialType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getGuideImage = () => {
    return credentialType === 1 
      ? imageCCCD  
      : imageGPLX; 
  };

  const getGuideTitle = () => {
    return credentialType === 1 
      ? "Mẫu Căn cước công dân"
      : "Mẫu Giấy phép lái xe";
  };

  return (
    <>
      <Button
        type="text"
        icon={<HelpCircle className="w-4 h-4 text-gray-500 hover:text-blue-500" />}
        onClick={() => setIsOpen(true)}
        className="!flex items-center justify-center p-1 min-w-0 h-8"
      />

      <Modal
        title={getGuideTitle()}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[
          <Button 
            key="close"
            onClick={() => setIsOpen(false)}
            className="min-w-[80px]"
          >
            Đóng
          </Button>
        ]}
        width={800}
        centered
        maskClosable={false}
        styles={{
          mask: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
          },
          content: {
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <div className="pt-4">
          <p className="text-gray-500 mb-4">
            Mẫu tham khảo cho việc tải lên ảnh
          </p>
          <Image
            src={getGuideImage()}
            alt={getGuideTitle()}
            className="w-full rounded-lg"
            preview={false}
          />
        </div>
      </Modal>
    </>
  );
};

export default GuideModal;