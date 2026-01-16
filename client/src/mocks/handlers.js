import { authHandlers } from './handlers/authHandlers';
import { attendanceHandlers } from './handlers/attendanceHandlers';
import { sessionsHandlers } from './handlers/sessionsHandlers';
import { filesHandlers } from './handlers/filesHandlers';

export const handlers = [
  ...authHandlers,
  ...attendanceHandlers,
  ...sessionsHandlers,
  ...filesHandlers,
];
