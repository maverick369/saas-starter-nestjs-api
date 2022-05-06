import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Tokens } from './types/tokens.type';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req, @Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refresh(@Request() req): Promise<Tokens> {
    return this.authService.refresh(req.user);
  }

  @Get('profile')
  profile(@Request() req) {
    return req.user;
  }
}
