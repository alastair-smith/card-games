const wrap = <T extends object>(eventName: string, data: T) => ({
  name: eventName,
  data: data,
});

const unwrap = <T extends object>(wrappedEvent: { name: string, data: T }) => wrappedEvent.data;