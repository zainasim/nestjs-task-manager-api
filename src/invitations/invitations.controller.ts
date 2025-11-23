import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Invitations')
@Controller('invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new invitation (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or active invitation exists',
  })
  async create(
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req: { user: { id: string } },
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.create(
      createInvitationDto.email,
      req.user.id,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all invitations (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of invitations',
    type: [InvitationResponseDto],
  })
  async findAll(
    @Request() req: { user: { id: string } },
  ): Promise<InvitationResponseDto[]> {
    return this.invitationsService.findAll(req.user.id);
  }

  @Patch(':id/resend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resend an invitation (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Invitation resent successfully',
    type: InvitationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async resend(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.resendInvitation(id, req.user.id);
  }
}
