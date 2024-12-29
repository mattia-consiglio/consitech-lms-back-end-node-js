import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refresh-token.input';

/**
 * Resolver for handling authentication-related operations
 */
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticates a user and returns a login response with access token
   * @param loginInput - The login credentials containing email and password
   * @returns LoginResponse containing the access token and user info
   * @throws Error if credentials are invalid
   */
  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  /**
   * Refreshes an expired access token
   * @param token - The refresh token to use for generating a new access token
   * @returns LoginResponse containing the new access token
   */
  @Mutation(() => LoginResponse)
  async refreshToken(@Args('input') { token }: RefreshTokenInput) {
    return this.authService.refreshToken(token);
  }
}
