import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Provider } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateOAuthUser(profile: any): Promise<any> {
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
      });
    }

    return user;
  }

  private async createRefreshToken(userId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    return this.prisma.refreshToken.create({
      data: {
        token: this.jwtService.sign({ sub: userId }, { expiresIn: '7d' }),
        userId: parseInt(userId),
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
