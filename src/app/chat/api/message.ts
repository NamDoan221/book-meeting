import { User } from './user';

export interface Message {
  user?: User;
  message?: string;
  time?: Date;
}
