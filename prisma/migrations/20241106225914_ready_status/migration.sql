/*
  Warnings:

  - You are about to drop the `_GameInstanceToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "GameType" ADD VALUE 'Fool';

-- DropForeignKey
ALTER TABLE "_GameInstanceToUser" DROP CONSTRAINT "_GameInstanceToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameInstanceToUser" DROP CONSTRAINT "_GameInstanceToUser_B_fkey";

-- DropTable
DROP TABLE "_GameInstanceToUser";

-- CreateTable
CREATE TABLE "GameInstancePlayer" (
    "gameInstanceJoinCode" TEXT NOT NULL,
    "playerUserId" TEXT NOT NULL,
    "ready" BOOLEAN NOT NULL,

    CONSTRAINT "GameInstancePlayer_pkey" PRIMARY KEY ("gameInstanceJoinCode","playerUserId")
);

-- AddForeignKey
ALTER TABLE "GameInstancePlayer" ADD CONSTRAINT "GameInstancePlayer_gameInstanceJoinCode_fkey" FOREIGN KEY ("gameInstanceJoinCode") REFERENCES "GameInstance"("joinCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameInstancePlayer" ADD CONSTRAINT "GameInstancePlayer_playerUserId_fkey" FOREIGN KEY ("playerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
