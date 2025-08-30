'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { gameCodeSchema } from '~/types/game';
import { cn } from '~/utils/cn';

const joinSchema = z.object({
  code: gameCodeSchema,
});

export function JoinGame({ className }: { className?: string }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = (values: z.infer<typeof joinSchema>) => {
    router.push(`/lobby/${values.code}`);
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle>Join Game</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col justify-center'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-1.5'
          >
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormItem>
                    <FormLabel className='sr-only'>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Code'
                        className='h-20 min-w-60 text-center font-mono text-4xl uppercase'
                        data-1p-ignore
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormItem>
              )}
            ></FormField>

            <Button type='submit'>Join</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
