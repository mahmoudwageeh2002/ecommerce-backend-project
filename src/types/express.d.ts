import type {
  UserRole,
} from "../modules/users/user.types.js";

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };

      user?: {
        id: string;

        role: UserRole;
      };
    }
  }
}

export {};