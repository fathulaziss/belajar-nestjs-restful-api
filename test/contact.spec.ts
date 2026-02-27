import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('ContactController', () => {
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

  describe('POST /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('authorization', 'test')
        .send({
          first_name: '',
          last_name: '',
          email: 'salah',
          phone: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to create contact', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('authorization', 'test')
        .send({
          first_name: 'test',
          last_name: 'test',
          email: 'test@example.com',
          phone: '9999',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          first_name: 'test',
          last_name: 'test',
          email: 'test@example.com',
          phone: '9999',
        },
      });
    });
  });

  describe('GET /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if contact is not found', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact!.id + 1}`)
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to get contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact!.id}`)
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          first_name: 'test',
          last_name: 'test',
          email: 'test@example.com',
          phone: '9999',
        },
      });
    });
  });

  describe('PUT /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if request is invalid', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact!.id}`)
        .set('authorization', 'test')
        .send({
          first_name: '',
          last_name: '',
          email: 'salah',
          phone: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be rejected if contact is not found', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact!.id + 1}`)
        .set('authorization', 'test')
        .send({
          first_name: 'test',
          last_name: 'test',
          email: 'test@example.com',
          phone: '9999',
        });
      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to update contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact!.id}`)
        .set('authorization', 'test')
        .send({
          first_name: 'test updated',
          last_name: 'test updated',
          email: 'testupdated@example.com',
          phone: '8888',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          first_name: 'test updated',
          last_name: 'test updated',
          email: 'testupdated@example.com',
          phone: '8888',
        },
      });
    });
  });

  describe('DELETE /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if contact is not found', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${contact!.id + 1}`)
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to remove contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${contact!.id}`)
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: true,
      });
    });
  });

  describe('GET /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
    });

    it('should be able to search contacts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as { data: [] };
      expect(body.data).toHaveLength(1);
    });

    it('should be able to search contacts by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          name: 'es',
        })
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as { data: [] };
      expect(body.data).toHaveLength(1);
    });

    it('should be able to search contacts by name not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          name: 'wrong',
        })
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as { data: [] };
      expect(body.data).toHaveLength(0);
    });

    it('should be able to search contacts by email', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          email: 'es',
        })
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as { data: [] };
      expect(body.data).toHaveLength(1);
    });

    it('should be able to search contacts by email not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          email: 'wrong',
        })
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as { data: [] };
      expect(body.data).toHaveLength(0);
    });

    it('should be able to search contacts by phone', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          phone: '99',
        })
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as { data: [] };
      expect(body.data).toHaveLength(1);
    });

    it('should be able to search contacts by phone not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          phone: '88',
        })
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as { data: [] };
      expect(body.data).toHaveLength(0);
    });

    it('should be able to search contacts with page', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          size: 1,
          page: 2,
        })
        .set('authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      const body = response.body as {
        data: [];
        paging: {
          current_page: number;
          total_page: number;
          size: number;
        };
      };
      expect(body.data).toHaveLength(0);
      expect(body.paging.current_page).toBe(2);
      expect(body.paging.total_page).toBe(1);
      expect(body.paging.size).toBe(1);
    });
  });
});
