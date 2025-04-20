import { gameCodeSchema } from "@/types/game";
import HighCard from "./client";

export default async function HighCardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: codeFromUrl } = await params;
  const code = gameCodeSchema.parse(codeFromUrl);

  return <HighCard code={code} />
}