// import { JWT_SECRET_KEY } from '@/constants/jwt.config';
import { createToken, verifyToken, UserPayload } from './token-utils';

// Mock JWT_SECRET_KEY
jest.mock('@/constants/jwt.config', () => ({
  JWT_SECRET_KEY: 'test-secret-key',
}));

describe('Token Utils', () => {
  const mockPayload: UserPayload = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
  };

  describe('createToken', () => {
    it('should create a valid JWT token', async () => {
      const token = await createToken(mockPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return the correct payload', async () => {
      const token = await createToken(mockPayload);
      const decodedPayload = await verifyToken(token);

      expect(decodedPayload).toMatchObject(mockPayload);
    });

    it('should throw an error for an invalid token', async () => {
      await expect(verifyToken('invalid.token.here')).rejects.toThrow();
    });

    it('should throw an error for a token with incomplete payload', async () => {
      const incompletePayload = { id: '123' };
      const token = await createToken(incompletePayload as UserPayload);
      await expect(verifyToken(token)).rejects.toThrow('Invalid token payload');
    });
  });
});
