export enum CardType {
    ShotTermCard = "ShotTermCard",
    LongTermCard = "LongTermCard"
}

export const typeCardMap: { [key in CardType]: { colorCardType: string; textCardType: string } } = {
    [CardType.ShotTermCard]: { colorCardType: "blue", textCardType: "Thẻ trong ngày" },
    [CardType.LongTermCard]: { colorCardType: "green", textCardType: "Thẻ dài hạn" },
};