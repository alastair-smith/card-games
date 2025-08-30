import { Input } from '~/components/ui/input';

export function GameCode({
  code,
  setCode,
}: {
  code: string;
  setCode?: (code: string) => void;
}) {
  return (
    <Input
      placeholder='Code'
      className='h-20 min-w-60 max-w-80 text-center font-mono text-4xl uppercase'
      name='code'
      data-1p-ignore
      autoComplete='off'
      value={code}
      onChange={
        setCode
          ? (event) => {
              event.preventDefault();

              setCode(event.target.value);
            }
          : undefined
      }
      readOnly={!setCode}
    />
  );
}
