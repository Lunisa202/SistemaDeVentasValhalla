import { describe, it, expect, vi, beforeEach } from 'vitest';

// close() uses sequelize.transaction + models; mock database to avoid loading config.
vi.mock('../../../config/database', () => ({
  sequelize: { transaction: vi.fn() },
}));

import { CashRegisterService } from '../cash-register.service';
import { NotFoundError } from '../../../common/errors/not-found.error';
import { ConflictError } from '../../../common/errors/conflict.error';

/**
 * Unit tests for CashRegisterService — the parts driven by the injectable
 * repository: the single-open-register rule, getActiveId, getStatus, getById.
 * The transactional close() is covered by integration tests.
 */
describe('CashRegisterService', () => {
  let service: CashRegisterService;
  let repo: {
    findOpen: ReturnType<typeof vi.fn>;
    findOpenDetailed: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repo = {
      findOpen: vi.fn(),
      findOpenDetailed: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      open: vi.fn(),
    };
    service = new CashRegisterService(repo as never);
  });

  describe('getActiveId', () => {
    it('devuelve el id de la caja abierta', async () => {
      repo.findOpen.mockResolvedValue({ id: 7 });
      expect(await service.getActiveId()).toBe(7);
    });

    it('devuelve null si no hay caja abierta', async () => {
      repo.findOpen.mockResolvedValue(null);
      expect(await service.getActiveId()).toBeNull();
    });
  });

  describe('getStatus', () => {
    it('reporta isOpen true con el id cuando hay caja abierta', async () => {
      repo.findOpen.mockResolvedValue({ id: 3 });
      expect(await service.getStatus()).toEqual({ isOpen: true, cashRegisterId: 3 });
    });

    it('reporta isOpen false cuando no hay caja', async () => {
      repo.findOpen.mockResolvedValue(null);
      expect(await service.getStatus()).toEqual({ isOpen: false, cashRegisterId: null });
    });
  });

  describe('open', () => {
    it('abre una caja cuando no hay ninguna abierta', async () => {
      repo.findOpen.mockResolvedValue(null);
      repo.open.mockResolvedValue({ id: 10 });
      repo.findById.mockResolvedValue({ id: 10, status: 'OPEN' });

      const result = await service.open('user-1', { openingAmount: 100 } as never);

      expect(repo.open).toHaveBeenCalledWith(
        expect.objectContaining({ openedBy: 'user-1', openingAmount: 100 }),
      );
      expect(result).toMatchObject({ id: 10, status: 'OPEN' });
    });

    it('lanza ConflictError si ya existe una caja abierta', async () => {
      repo.findOpen.mockResolvedValue({ id: 1, status: 'OPEN' });
      await expect(service.open('user-1', { openingAmount: 50 } as never)).rejects.toThrow(
        ConflictError,
      );
      expect(repo.open).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('lanza NotFoundError si la caja no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });
});
