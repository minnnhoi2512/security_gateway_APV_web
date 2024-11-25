type QRCard = {
  cardId: number;
  cardVerification: string;
  createDate: Date;
  lastCancelDate: Date;
  cardImage: string;
  cardStatus: string;
  qrCardTypename: string;
};

export default QRCard;
