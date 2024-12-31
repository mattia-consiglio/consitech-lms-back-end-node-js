import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Provider } from '@prisma/client';
import { User } from 'src/users/models/user.model';

interface OAuthProfile {
  provider: string;
  id: string;
  emails: { value: string }[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    emailOrUsername: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
      include: { role: { include: { capabilities: true } } },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.roleId };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user,
    };
  }

  async validateOAuthUser(profile: OAuthProfile): Promise<User> {
    const { provider, id: providerId, emails } = profile;

    const email = emails[0].value;
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          {
            AND: [
              { providerId },
              { provider: provider.toUpperCase() as Provider },
            ],
          },
        ],
      },
      include: { role: { include: { capabilities: true } } },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: email,
          provider: provider.toUpperCase() as Provider,
          providerId,
          role: {
            connect: {
              name: 'Student',
            },
          },
        },
        include: { role: { include: { capabilities: true } } },
      });
    }

    return user;
  }

  private async createRefreshToken(userId: number) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    return this.prisma.refreshToken.create({
      data: {
        token: this.jwtService.sign({ sub: userId }, { expiresIn: '7d' }),
        userId,
        expiresAt,
      },
    });
  }

  async refreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign({
      email: refreshToken.user.email,
      sub: refreshToken.user.id,
      role: refreshToken.user.roleId,
    });

    return {
      accessToken: newAccessToken,
    };
  }
}
