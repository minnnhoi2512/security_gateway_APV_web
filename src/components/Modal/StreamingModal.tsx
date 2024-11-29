import React from "react";
import { Modal } from "antd";
import ReactPlayer from "react-player";
import Gate from "../../types/gateType";

interface StreamingModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedGate: Gate;
}

const StreamingModal: React.FC<StreamingModalProps> = ({
  isVisible,
  onClose,
  selectedGate,
}) => {
  return (
    <Modal visible={isVisible} onCancel={onClose} footer={null} width={800}>
      <div className="grid grid-cols-2 gap-4">
        {selectedGate?.cameras.length > 0 ? (
          selectedGate.cameras.slice(0, 4).map((camera, index) => (
            <div key={index} className="mb-4">
              <div className="text-lg font-semibold mb-2">{camera.description}</div>
              <ReactPlayer
                url={`${camera.captureURL}libs/index.m3u8`}
                playing
                controls
                width="100%"
                height="100%"
              />
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-lg font-semibold">
            Cổng này không có camera
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StreamingModal;