import { z } from 'zod';
import { openCashRegisterSchema, closeCashRegisterSchema } from './cash-register.schema';

export type OpenCashRegisterDto = z.infer<typeof openCashRegisterSchema>;
export type CloseCashRegisterDto = z.infer<typeof closeCashRegisterSchema>;
