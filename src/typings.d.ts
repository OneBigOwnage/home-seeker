import { Commands, RedisClient as SynchronousRedis } from 'redis';

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
declare type Omitted = Omit<SynchronousRedis, keyof Commands<boolean>>;
declare interface RedisClient<T = SynchronousRedis> extends Omitted, Commands<Promise<boolean>> { }
