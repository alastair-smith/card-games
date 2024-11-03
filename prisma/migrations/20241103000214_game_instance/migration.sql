-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('Yaniv', 'Blob', 'Shithead');

-- CreateTable
CREATE TABLE "GameInstance" (
    "joinCode" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameInstance_pkey" PRIMARY KEY ("joinCode")
);

-- CreateTable
CREATE TABLE "_GameInstanceToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GameInstanceToUser_AB_unique" ON "_GameInstanceToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GameInstanceToUser_B_index" ON "_GameInstanceToUser"("B");

-- AddForeignKey
ALTER TABLE "GameInstance" ADD CONSTRAINT "GameInstance_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameInstanceToUser" ADD CONSTRAINT "_GameInstanceToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "GameInstance"("joinCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameInstanceToUser" ADD CONSTRAINT "_GameInstanceToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
