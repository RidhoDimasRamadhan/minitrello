import type {
  Board,
  List,
  Card,
  Label,
  CardLabel,
  Checklist,
  ChecklistItem,
  Comment,
  Activity,
  User,
  Attachment,
  CardAssignee,
  BoardMember,
  WorkspaceMember,
  Workspace,
  BoardStar,
} from "@prisma/client";

export type CardWithDetails = Card & {
  labels: (CardLabel & { label: Label })[];
  assignees: (CardAssignee & { user: User })[];
  checklists: (Checklist & { items: ChecklistItem[] })[];
  comments: (Comment & { user: User })[];
  attachments: Attachment[];
  activities: (Activity & { user: User })[];
  createdBy: User;
};

export type ListWithCards = List & {
  cards: CardWithDetails[];
};

export type BoardWithDetails = Board & {
  lists: ListWithCards[];
  labels: Label[];
  members: (BoardMember & { user: User })[];
  stars: BoardStar[];
  workspace: Workspace;
  createdBy: User;
};

export type WorkspaceWithDetails = Workspace & {
  members: (WorkspaceMember & { user: User })[];
  boards: (Board & { stars: BoardStar[] })[];
};

export type ActivityWithUser = Activity & {
  user: User;
};

export type ActionState = {
  error?: string;
  success?: string;
};
