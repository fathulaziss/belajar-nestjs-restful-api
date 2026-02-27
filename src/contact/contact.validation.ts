import { Injectable } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
class ContactValidation {
  static readonly CREATE = z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().min(1).max(20).optional(),
    email: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
        message: 'Invalid email format',
      })
      .optional(),
  });

  static readonly UPDATE = z.object({
    id: z.number().positive(),
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().min(1).max(20).optional(),
    email: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
        message: 'Invalid email format',
      })
      .optional(),
  });

  static readonly SEARCH = z.object({
    name: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}

export default ContactValidation;
