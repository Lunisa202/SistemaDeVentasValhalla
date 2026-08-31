import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { UserService } from '../user.service';
import { NotFoundError } from '../../../common/errors/not-found.error';
import { ConflictError } from '../../../common/errors/conflict.error';

/**
 * Unit tests for UserService.
 * Repository mocked. We verify password hashing and email-uniqueness rules.
 */
describe('UserService', () => {
  let service: UserService;
  let repo: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    softDelete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    service = new UserService(repo as never);
  });

  describe('create', () => {
    it('hashea el password antes de guardar', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue({ id: 'new-id' });
      repo.findById.mockResolvedValue({ id: 'new-id', email: 'a@a.com' });

      await service.create({
        email: 'a@a.com',
        password: 'plain123',
        firstName: 'A',
        lastName: 'B',
      } as never);

      // El password pasado al repo NO debe ser el plano
      const dataPassedToCreate = repo.create.mock.calls[0][0];
      expect(dataPassedToCreate.password).not.toBe('plain123');
      // Debe ser un hash bcrypt válido
      const isHash = await bcrypt.compare('plain123', dataPassedToCreate.password);
      expect(isHash).toBe(true);
    });

    it('lanza ConflictError si el email ya está registrado', async () => {
      repo.findByEmail.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ email: 'dup@a.com', password: 'x' } as never),
      ).rejects.toThrow(ConflictError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('re-hashea el password si se envía uno nuevo', async () => {
      repo.update.mockResolvedValue({ id: 'u1' });
      repo.findById.mockResolvedValue({ id: 'u1' });

      await service.update('u1', { password: 'newpass123' } as never);

      const dataPassedToUpdate = repo.update.mock.calls[0][1];
      expect(dataPassedToUpdate.password).not.toBe('newpass123');
      expect(await bcrypt.compare('newpass123', dataPassedToUpdate.password)).toBe(true);
    });

    it('lanza ConflictError si el nuevo email pertenece a otro usuario', async () => {
      repo.findByEmail.mockResolvedValue({ id: 'other' });
      await expect(service.update('u1', { email: 'taken@a.com' } as never)).rejects.toThrow(
        ConflictError,
      );
    });

    it('lanza NotFoundError si el usuario no existe', async () => {
      repo.update.mockResolvedValue(null);
      await expect(service.update('nope', { firstName: 'X' } as never)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('lanza NotFoundError si no existe', async () => {
      repo.softDelete.mockResolvedValue(null);
      await expect(service.delete('nope')).rejects.toThrow(NotFoundError);
    });
  });
});
