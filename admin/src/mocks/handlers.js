import { authHandlers } from "./handlers/authHandlers";
import { attendanceHandlers } from "./handlers/attendanceHandlers";
import { sessionsHandlers } from "./handlers/sessionsHandlers";
import { filesHandlers } from "./handlers/filesHandlers";
import { usersHandlers } from "./handlers/usersHandlers";

export const handlers = [
  ...authHandlers,
  ...attendanceHandlers,
  ...sessionsHandlers,
  ...filesHandlers,
  ...usersHandlers,
];
