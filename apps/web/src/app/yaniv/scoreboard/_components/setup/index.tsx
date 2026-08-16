import { Reorder, ReorderItem } from '~/components/ui/reorder';

export type SetupProps = {
  players: {
    id: string;
    name: string;
  }[];
  setPlayers: (newPlayers: string[]) => void;
};

export default function Setup({ players, setPlayers }: SetupProps) {
  return (
    <div>
      <h2>Enter Player Names</h2>

      <Reorder
        itemIds={[]}
        label={''}
        onReorder={(newItemIds: string[]): void => {
          throw new Error('Function not implemented.');
        }}
      >
        <ReorderItem id={''} label={''}>
          <div>example</div>
        </ReorderItem>
      </Reorder>
    </div>
  );
}
