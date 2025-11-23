import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { InvitationsService } from '../invitations/invitations.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly invitationsService: InvitationsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const invitation = await this.invitationsService.validateInvitation(
      signupDto.inviteToken,
    );
    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = await this.usersService.create(
      signupDto.email,
      hashedPassword,
      undefined,
      signupDto.firstName,
      signupDto.lastName,
    );

    await this.invitationsService.markAsUsed(invitation.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
