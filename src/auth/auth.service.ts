import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './types/jwt-payload.type';
import { Tokens } from './types/tokens.type';
import { JwtPayloadWithRefresh } from './types/jwt-payload-with-refresh.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      return (await bcrypt.compare(pass, user.password)) && user;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;
    return this.usersService.create(createUserDto);
  }

  async login(payload: JwtPayload): Promise<Tokens> {
    const tokens: Tokens = await this.generateTokens(payload);

    // Update refresh token in DB
    await this.usersService.updateRefreshToken(
      payload.sub,
      tokens.refresh_token,
    );

    return tokens;
  }

  async refresh(payload: JwtPayloadWithRefresh): Promise<Tokens> {
    const user = await this.usersService.findOne(payload.sub);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException();
    }

    // Compare request token with token in DB
    if (payload.refreshToken !== user.refresh_token) {
      throw new UnauthorizedException();
    }

    // Generate new tokens
    const tokens: Tokens = await this.generateTokens({
      sub: payload.sub,
      email: payload.email,
    });

    // Update refresh token in DB
    user.refresh_token = tokens.refresh_token;
    await this.usersService.update(user._id.toString(), user);

    return tokens;
  }

  async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
        ),
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
