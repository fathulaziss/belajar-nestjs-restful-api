import { createParamDecorator, HttpException } from '@nestjs/common';
import { User } from '@prisma/client';

export const Auth = createParamDecorator((data, context) => {
  const request = context.switchToHttp().getRequest<{ user?: User }>();
  const user = request.user;
  if (user) {
    return user;
  } else {
    throw new HttpException('Unauthorized', 401);
  }
});
