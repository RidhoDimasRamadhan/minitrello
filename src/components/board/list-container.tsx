"use client";

import { useState, useCallback, useId, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ListItem } from "./list-item";
import { ListForm } from "./list-form";
import { CardItem } from "./card-item";
import { reorderLists } from "@/actions/list";
import { reorderCards } from "@/actions/card";
import { POSITION_GAP } from "@/lib/constants";
import { toast } from "sonner";

type CardType = {
  id: string;
  title: string;
  position: number;
  listId: string;
  description: string | null;
  dueDate: Date | null;
  isComplete: boolean;
  coverColor: string | null;
  labels: { label: { id: string; name: string | null; color: string } }[];
  assignees: { user: { id: string; name: string | null; image: string | null } }[];
  checklists: { items: { isChecked: boolean }[] }[];
  _count: { comments: number; attachments: number };
};

type ListType = {
  id: string;
  title: string;
  position: number;
  cards: CardType[];
};

interface ListContainerProps {
  board: {
    id: string;
    lists: ListType[];
    labels: { id: string; name: string | null; color: string }[];
  };
}

export function ListContainer({ board }: ListContainerProps) {
  const [lists, setLists] = useState(board.lists);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"list" | "card" | null>(null);

  // Sync with server data when board prop changes (after revalidation)
  useEffect(() => {
    setLists(board.lists);
  }, [board.lists]);

  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findList = useCallback(
    (id: string) => lists.find((l) => l.id === id),
    [lists]
  );

  const findCardAndList = useCallback(
    (cardId: string) => {
      for (const list of lists) {
        const card = list.cards.find((c) => c.id === cardId);
        if (card) return { card, list };
      }
      return null;
    },
    [lists]
  );

  // Optimistic: add card to local state instantly
  const addOptimisticCard = useCallback(
    (listId: string, card: CardType) => {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, cards: [...l.cards, card] } : l
        )
      );
    },
    []
  );

  // Optimistic: add list to local state instantly
  const addOptimisticList = useCallback(
    (list: ListType) => {
      setLists((prev) => [...prev, list]);
    },
    []
  );

  // Optimistic: remove list from local state
  const removeOptimisticList = useCallback(
    (listId: string) => {
      setLists((prev) => prev.filter((l) => l.id !== listId));
    },
    []
  );

  // Optimistic: update list title
  const updateOptimisticListTitle = useCallback(
    (listId: string, title: string) => {
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, title } : l))
      );
    },
    []
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const id = active.id as string;

    if (findList(id)) {
      setActiveType("list");
      setActiveId(id);
    } else if (findCardAndList(id)) {
      setActiveType("card");
      setActiveId(id);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || activeType !== "card") return;

    const activeCardData = findCardAndList(active.id as string);
    if (!activeCardData) return;

    const overId = over.id as string;
    let overListId: string;

    const overList = findList(overId);
    if (overList) {
      overListId = overList.id;
    } else {
      const overCardData = findCardAndList(overId);
      if (!overCardData) return;
      overListId = overCardData.list.id;
    }

    if (activeCardData.list.id === overListId) return;

    setLists((prev) => {
      const newLists = prev.map((l) => ({
        ...l,
        cards: [...l.cards],
      }));

      const sourceList = newLists.find((l) => l.id === activeCardData.list.id);
      const destList = newLists.find((l) => l.id === overListId);
      if (!sourceList || !destList) return prev;

      const cardIndex = sourceList.cards.findIndex(
        (c) => c.id === active.id
      );
      if (cardIndex === -1) return prev;

      const [movedCard] = sourceList.cards.splice(cardIndex, 1);
      movedCard.listId = overListId;

      const overCardIndex = destList.cards.findIndex((c) => c.id === overId);
      if (overCardIndex >= 0) {
        destList.cards.splice(overCardIndex, 0, movedCard);
      } else {
        destList.cards.push(movedCard);
      }

      return newLists;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const currentType = activeType;

    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    if (currentType === "list") {
      if (active.id === over.id) return;

      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newLists = arrayMove(lists, oldIndex, newIndex);
      const items = newLists.map((l, i) => ({
        id: l.id,
        position: (i + 1) * POSITION_GAP,
      }));

      setLists(newLists);
      const result = await reorderLists(board.id, items);
      if (result.error) toast.error(result.error);
    } else if (currentType === "card") {
      const items: { id: string; position: number; listId: string }[] = [];
      for (const list of lists) {
        list.cards.forEach((card, i) => {
          items.push({
            id: card.id,
            position: (i + 1) * POSITION_GAP,
            listId: list.id,
          });
        });
      }

      const result = await reorderCards(board.id, items);
      if (result.error) toast.error(result.error);
    }
  }

  const activeList = activeId && activeType === "list" ? findList(activeId) : null;
  const activeCardData =
    activeId && activeType === "card" ? findCardAndList(activeId) : null;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 h-full items-start">
        <SortableContext
          items={lists.map((l) => l.id)}
          strategy={horizontalListSortingStrategy}
        >
          {lists.map((list) => (
            <ListItem
              key={list.id}
              list={list}
              boardId={board.id}
              onAddCard={addOptimisticCard}
              onDeleteList={removeOptimisticList}
              onUpdateListTitle={updateOptimisticListTitle}
            />
          ))}
        </SortableContext>
        <ListForm boardId={board.id} onAddList={addOptimisticList} />
      </div>

      <DragOverlay>
        {activeList && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 w-72 shadow-xl opacity-90 rotate-3">
            <h3 className="font-semibold text-sm mb-2">{activeList.title}</h3>
            <div className="space-y-2">
              {activeList.cards.slice(0, 3).map((card) => (
                <div
                  key={card.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-2 text-sm shadow-sm"
                >
                  {card.title}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeCardData && (
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-xl w-64 rotate-3">
            <CardItem
              card={activeCardData.card}
              boardId={board.id}
              isDragOverlay
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
