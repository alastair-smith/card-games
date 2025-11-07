import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { FlippableBack, FlippableFront, FlippableRoot } from '.';

export const fippableExample = () => {
  const [showFront, setShowFront] = useState<boolean>(true);
  return (
    <Card>
      <CardHeader>Flippable</CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <FlippableRoot showFront={showFront} className='w-[100px] h-[100px]'>
          <FlippableFront>
            <div className='bg-green-600 flex justify-center items-center size-full'>
              Front
            </div>
          </FlippableFront>
          <FlippableBack>
            <div className='bg-red-600 flex justify-center items-center size-full'>
              Back
            </div>
          </FlippableBack>
        </FlippableRoot>

        <Button onClick={() => setShowFront((value) => !value)}>Flip</Button>
      </CardContent>
    </Card>
  );
};
