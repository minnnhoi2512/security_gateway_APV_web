type QRCard = {
    qrCardId: number;
    cardVerification: string;
    createDate: Date;
    lastCancelDate: Date;
    cardImage: string;
    qrCardTypename: string;
    qrCardStatusName: string;
  };
  
export default QRCard;