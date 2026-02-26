import { Injectable } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
class ContactValidation {
  static readonly CREATE = z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().min(1).max(20).optional(),
    // ✅ Backslash sebelum titik di dalam kurung siku pertama sudah dihapus
    email: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
        message: 'Invalid email format',
      })
      .optional(),
  });
}

export default ContactValidation;
