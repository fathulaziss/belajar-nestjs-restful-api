import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('UserController', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
          password: '',
          name: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          username: 'test',
          name: 'test',
        },
      });
    });

    it('should be rejected if username already exists', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: '',
          password: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          username: 'test',
          name: 'test',
        },
      });
      expect(response.body).toHaveProperty('data.token');
    });
  });

  describe('GET /api/users/current', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('authorization', 'wrong');
      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to get user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('authorization', 'test');
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          username: 'test',
          name: 'test',
        },
      });
    });
  });

  describe('PATCH /api/users/current', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('authorization', 'test')
        .send({
          password: '',
          name: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to update name', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('authorization', 'test')
        .send({
          name: 'test updated',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          username: 'test',
          name: 'test updated',
        },
      });
    });

    it('should be able to update password', async () => {
      let response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('authorization', 'test')
        .send({
          password: 'updated',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          username: 'test',
          name: 'test',
        },
      });

      response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'updated',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.token');
    });
  });

  describe('DELETE /api/users/current', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/current')
        .set('authorization', 'wrong');
      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to logout user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/current')
        .set('authorization', 'test');
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: true,
      });

      const user = await testService.getUser();
      expect(user?.token).toBeNull();
    });
  });
});
