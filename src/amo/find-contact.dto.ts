import { IsNotEmpty } from 'class-validator';

export class FindContactDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  email: string;
}
