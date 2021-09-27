export interface IUser {
  email: string;
  password: string;

  firstName: string;
  lastName: string;

  isActive?: boolean;
  id?: string;
}
