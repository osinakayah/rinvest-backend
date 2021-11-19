import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInvestmentRequestDto {
  @IsNotEmpty()
  @IsString()
  readonly amount: string;

  @IsNotEmpty()
  @IsString()
  readonly assetId: string;
}
