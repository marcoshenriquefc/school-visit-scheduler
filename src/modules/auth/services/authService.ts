import { UserStatus } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { comparePassword } from '../../../utils/password';
import { signToken } from '../../../utils/jwt';
import { UserRepository } from '../../users/repositories/userRepository';

export class AuthService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);
    if (user.status === UserStatus.INACTIVE) throw new AppError('Inactive user', 403);
    const match = await comparePassword(password, user.passwordHash);
    if (!match) throw new AppError('Invalid credentials', 401);
    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    return { token };
  }
}
