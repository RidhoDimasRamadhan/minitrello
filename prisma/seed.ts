import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@minitrello.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@minitrello.com",
      password: hashedPassword,
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      description: "Workspace untuk demo MiniTrello",
      createdById: user.id,
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });

  // Create board
  const board = await prisma.board.create({
    data: {
      title: "Project Development",
      backgroundColor: "#0079bf",
      workspaceId: workspace.id,
      createdById: user.id,
      members: {
        create: { userId: user.id, role: "ADMIN" },
      },
      labels: {
        createMany: {
          data: [
            { name: "Bug", color: "#eb5a46" },
            { name: "Feature", color: "#61bd4f" },
            { name: "Enhancement", color: "#f2d600" },
            { name: "Documentation", color: "#0079bf" },
            { name: "Design", color: "#c377e0" },
            { name: "Urgent", color: "#ff9f1a" },
          ],
        },
      },
    },
  });

  // Create lists with cards
  const lists = [
    {
      title: "Backlog",
      position: 65536,
      cards: [
        { title: "Research competitor features", position: 65536 },
        { title: "Design system documentation", position: 131072 },
        { title: "Performance audit", position: 196608 },
      ],
    },
    {
      title: "To Do",
      position: 131072,
      cards: [
        { title: "Implement user authentication", position: 65536 },
        { title: "Create dashboard layout", position: 131072 },
        { title: "Set up CI/CD pipeline", position: 196608 },
        { title: "Write API documentation", position: 262144 },
      ],
    },
    {
      title: "In Progress",
      position: 196608,
      cards: [
        { title: "Build kanban board UI", position: 65536 },
        { title: "Implement drag and drop", position: 131072 },
      ],
    },
    {
      title: "Review",
      position: 262144,
      cards: [
        { title: "Database schema design", position: 65536 },
      ],
    },
    {
      title: "Done",
      position: 327680,
      cards: [
        { title: "Project setup & configuration", position: 65536 },
        { title: "Initialize Next.js project", position: 131072 },
        { title: "Set up Prisma with PostgreSQL", position: 196608 },
      ],
    },
  ];

  for (const listData of lists) {
    const list = await prisma.list.create({
      data: {
        title: listData.title,
        position: listData.position,
        boardId: board.id,
      },
    });

    for (const cardData of listData.cards) {
      await prisma.card.create({
        data: {
          title: cardData.title,
          position: cardData.position,
          listId: list.id,
          createdById: user.id,
        },
      });
    }
  }

  // Create second board
  await prisma.board.create({
    data: {
      title: "Design System",
      backgroundColor: "#519839",
      workspaceId: workspace.id,
      createdById: user.id,
      members: {
        create: { userId: user.id, role: "ADMIN" },
      },
    },
  });

  // Create third board
  await prisma.board.create({
    data: {
      title: "Bug Tracker",
      backgroundColor: "#b04632",
      workspaceId: workspace.id,
      createdById: user.id,
      members: {
        create: { userId: user.id, role: "ADMIN" },
      },
    },
  });

  console.log("Seed completed!");
  console.log("Demo login: demo@minitrello.com / demo123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
