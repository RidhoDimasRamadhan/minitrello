import { create } from "zustand";

interface CardModalState {
  isOpen: boolean;
  cardId: string | null;
  boardId: string | null;
  onOpen: (cardId: string, boardId: string) => void;
  onClose: () => void;
}

export const useCardModal = create<CardModalState>((set) => ({
  isOpen: false,
  cardId: null,
  boardId: null,
  onOpen: (cardId, boardId) => set({ isOpen: true, cardId, boardId }),
  onClose: () => set({ isOpen: false, cardId: null, boardId: null }),
}));
