import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}
  private endpoint = this.configService.get('AMO_CRM_ENDPOINT');
  private clientId = this.configService.get('AMO_CRM_ID');
  private clientSecret = this.configService.get('AMO_CRM_KEY');

  /**
   * Get access token with auth code
   * @returns
   */
  async getInitialToken(code: string) {
    const res = await this.httpService.axiosRef({
      url: `${this.endpoint}/oauth2/access_token`,
      method: 'POST',
      data: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://52ef-77-236-80-6.ngrok-free.app/',
      },
    });

    return this.prismaService.auth.create({
      data: {
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token,
        expires_in: res.data.expires_in,
        token_type: res.data.token_type,
      },
    });
  }

  /**
   * Refresh token
   * @returns
   */
  async getRefreshToken(refresh_token: string) {
    const res = await this.httpService.axiosRef({
      url: `${this.endpoint}/oauth2/access_token`,
      method: 'POST',
      data: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        redirect_uri: 'https://52ef-77-236-80-6.ngrok-free.app/',
      },
    });

    return this.prismaService.auth.create({
      data: {
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token,
        expires_in: res.data.expires_in,
        token_type: res.data.token_type,
      },
    });
  }

  /**
   * Get access token or refresh token if it expired
   * @returns
   */
  async accessToken() {
    const token = await this.prismaService.auth.findFirst({ orderBy: { id: 'desc' } });

    if (!token) {
      throw new Error(
        'No token found. Please, get initial token with auth code "/code/{code}"',
      );
    }

    if (token.createdAt.getTime() + token.expires_in * 1000 < Date.now()) {
      return (await this.getRefreshToken(token.refresh_token)).access_token;
    }

    return token.access_token;
  }
}
