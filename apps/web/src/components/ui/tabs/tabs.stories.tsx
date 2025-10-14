import { Tabs, TabsContent, TabsList, TabsTrigger } from '.';

export function TwoTabs() {
  return (
    <Tabs defaultValue='hand' className='w-[400px]'>
      <TabsContent value='hand'>View your cards</TabsContent>
      <TabsContent value='board'>View the table</TabsContent>

      <TabsList>
        <TabsTrigger value='hand'>Hand</TabsTrigger>
        <TabsTrigger value='board'>Board</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
