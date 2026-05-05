import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refreshSession(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshSession(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  revokeSession(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.revokeSession(refreshTokenDto.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  revokeAllSessions(@Body() body: { userId: string }) {
    return this.authService.revokeAllSessions(body.userId);
  }
}
