import Redis from 'ioredis';

export const publisher = new Redis();
export const subscriber = new Redis();
