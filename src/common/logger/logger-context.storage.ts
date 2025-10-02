import { AsyncLocalStorage } from 'node:async_hooks';
import { ILoggingContext } from '../interfaces/express';

export const requestContext = new AsyncLocalStorage<ILoggingContext>();
