/**
 * Represents the payload data for JWT tokens
 * Contains essential user information for authentication and authorization
 */
export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: "admin" | "investor" | "super_admin" | null;
  createdAt?: Date;
}