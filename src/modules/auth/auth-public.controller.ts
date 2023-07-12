import { AuthService } from "@module/auth/auth.service";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@Controller("auth")
@ApiTags("auth")
export class AuthPublicController {
    constructor(private readonly authService: AuthService) {}

    // @ApiRecordResponse(LoginResponseDto)
    // @Post("login")
    // async login(@Req() req: Request, @Body() dto: LoginRequestDto) {
    //     return this.authService.login(req, dto);
    // }

    // @ApiRecordResponse(Auth)
    // @Post("logout")
    // async logout(@Body() dto: LogoutDto) {
    //     await this.authService.logout(dto);
    // }

    // @ApiRecordResponse(LoginRequestDto)
    // @Post("refresh")
    // async refreshToken(@Body() dto: RefreshTokenDto) {
    //     return this.authService.refreshTokens(dto);
    // }
}
