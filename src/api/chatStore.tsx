import { create } from "zustand";
import { useGetDetailUserQuery } from "../services/user.service";


export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId: any, user: any) => {
    const currentUser = useGetDetailUserQuery(Number(localStorage.getItem("userId") || 0)).data;

    // CHECK IF CURRENT USER IS BLOCKED
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    // CHECK IF RECEIVER IS BLOCKED
    else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state: any) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));
