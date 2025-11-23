import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invitation.entity';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  private readonly INVITATION_EXPIRY_HOURS = 48;

  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private calculateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + this.INVITATION_EXPIRY_HOURS);
    return expiryDate;
  }

  async create(
    email: string,
    invitedById: string,
  ): Promise<InvitationResponseDto> {
    const existingInvitation = await this.invitationRepository.findOne({
      where: { email, isUsed: false },
    });

    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      throw new BadRequestException(
        'An active invitation already exists for this email',
      );
    }

    const token = this.generateToken();
    const expiresAt = this.calculateExpiryDate();

    let invitation: Invitation;

    if (existingInvitation) {
      existingInvitation.token = token;
      existingInvitation.expiresAt = expiresAt;
      existingInvitation.isUsed = false;
      invitation = await this.invitationRepository.save(existingInvitation);
    } else {
      invitation = this.invitationRepository.create({
        email,
        token,
        expiresAt,
        invitedById,
      });
      invitation = await this.invitationRepository.save(invitation);
    }

    console.log(`Invitation token for ${email}: ${token}`);

    return {
      id: invitation.id,
      email: invitation.email,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      isUsed: invitation.isUsed,
      createdAt: invitation.createdAt,
    };
  }

  async validateInvitation(token: string): Promise<Invitation | null> {
    const invitation = await this.invitationRepository.findOne({
      where: { token, isUsed: false },
    });

    if (!invitation) {
      return null;
    }

    if (invitation.expiresAt < new Date()) {
      return null;
    }

    return invitation;
  }

  async markAsUsed(invitationId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (invitation) {
      invitation.isUsed = true;
      await this.invitationRepository.save(invitation);
    }
  }

  async resendInvitation(
    invitationId: string,
    invitedById: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedById !== invitedById) {
      throw new BadRequestException(
        'You can only resend invitations you created',
      );
    }

    const token = this.generateToken();
    const expiresAt = this.calculateExpiryDate();

    invitation.token = token;
    invitation.expiresAt = expiresAt;
    invitation.isUsed = false;

    const updatedInvitation = await this.invitationRepository.save(invitation);

    console.log(`Resent invitation token for ${invitation.email}: ${token}`);

    return {
      id: updatedInvitation.id,
      email: updatedInvitation.email,
      token: updatedInvitation.token,
      expiresAt: updatedInvitation.expiresAt,
      isUsed: updatedInvitation.isUsed,
      createdAt: updatedInvitation.createdAt,
    };
  }

  async findAll(invitedById?: string): Promise<InvitationResponseDto[]> {
    const where = invitedById ? { invitedById } : {};
    const invitations = await this.invitationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      isUsed: invitation.isUsed,
      createdAt: invitation.createdAt,
    }));
  }
}
