import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class AddressModel extends Model {
  @Column
  address: string;

  @Column
  userId: string;

  @Column
  publicAddress: string;

  @Column
  code: string;
}
