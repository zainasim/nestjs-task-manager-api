import { ApiProperty } from '@nestjs/swagger';

export class InvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  isUsed: boolean;

  @ApiProperty()
  createdAt: Date;
}

