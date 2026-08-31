import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../product.service';
import { NotFoundError } from '../../../common/errors/not-found.error';
import { ConflictError } from '../../../common/errors/conflict.error';

/**
 * Unit tests for ProductService.
 * The repository is mocked — we test business logic in isolation, no DB.
 */
describe('ProductService', () => {
  let service: ProductService;
  let repo: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByCode: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    softDelete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByCode: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    service = new ProductService(repo as never);
  });

  describe('getAll', () => {
    it('devuelve data + meta de paginación', async () => {
      repo.findAll.mockResolvedValue({ rows: [{ id: '1' }], count: 1 });
      const result = await service.getAll({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filtra por isActive true por defecto', async () => {
      repo.findAll.mockResolvedValue({ rows: [], count: 0 });
      await service.getAll({ page: 1, limit: 20 }, { search: 'coca' });
      expect(repo.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 20 },
        expect.objectContaining({ isActive: true, search: 'coca' }),
      );
    });
  });

  describe('getById', () => {
    it('devuelve el producto cuando existe', async () => {
      const product = { id: 'uuid-1', name: 'Coca Cola' };
      repo.findById.mockResolvedValue(product);
      expect(await service.getById('uuid-1')).toEqual(product);
    });

    it('lanza NotFoundError cuando no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById('nope')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getByCode', () => {
    it('lanza NotFoundError cuando el código no existe', async () => {
      repo.findByCode.mockResolvedValue(null);
      await expect(service.getByCode('0000')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('crea el producto cuando el código es único', async () => {
      repo.findByCode.mockResolvedValue(null);
      const created = { id: 'new', code: '123' };
      repo.create.mockResolvedValue(created);
      const result = await service.create({ code: '123', name: 'X', salePrice: 5 } as never);
      expect(result).toEqual(created);
    });

    it('lanza ConflictError si el código ya existe', async () => {
      repo.findByCode.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ code: '123', name: 'X', salePrice: 5 } as never),
      ).rejects.toThrow(ConflictError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('lanza ConflictError si el nuevo código pertenece a otro producto', async () => {
      repo.findByCode.mockResolvedValue({ id: 'other-id' });
      await expect(service.update('my-id', { code: 'DUP' } as never)).rejects.toThrow(
        ConflictError,
      );
    });

    it('permite actualizar si el código es del mismo producto', async () => {
      repo.findByCode.mockResolvedValue({ id: 'my-id' });
      repo.update.mockResolvedValue({ id: 'my-id' });
      repo.findById.mockResolvedValue({ id: 'my-id', code: 'DUP' });
      const result = await service.update('my-id', { code: 'DUP' } as never);
      expect(result).toMatchObject({ id: 'my-id' });
    });

    it('lanza NotFoundError si el producto no existe', async () => {
      repo.update.mockResolvedValue(null);
      await expect(service.update('nope', { name: 'X' } as never)).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('lanza NotFoundError si no existe', async () => {
      repo.softDelete.mockResolvedValue(null);
      await expect(service.delete('nope')).rejects.toThrow(NotFoundError);
    });

    it('completa sin error cuando el soft delete tiene éxito', async () => {
      repo.softDelete.mockResolvedValue({ id: 'x', isActive: false });
      await expect(service.delete('x')).resolves.toBeUndefined();
    });
  });
});
