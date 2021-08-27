import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class UserModel extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column
  password: string;

  @Column
  username: string;

  @Column
  email: string;

  @Column
  phoneNumber: string;

  @Column
  bankSortCode: string;

  @Column
  bankAccountNumber: string;

  @Column
  bankAccountName: string;

  @Column({ defaultValue: true })
  isActive: boolean;
}
