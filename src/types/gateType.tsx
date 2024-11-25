import CameraType from "./cameraType";

type Gate = {
  gateId: number;
  gateName: string;
  createDate: Date;
  description: string;
  status: boolean;
  cameras: CameraType[];
};

export default Gate;
