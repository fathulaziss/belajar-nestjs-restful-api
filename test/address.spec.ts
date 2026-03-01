import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('AddressController', () => {
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

  describe('POST /api/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if request is invalid', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .post(`/api/contacts/${contact?.id}/addresses`)
        .set('authorization', 'test')
        .send({
          street: '',
          city: '',
          province: '',
          country: '',
          postal_code: '',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to create address', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .post(`/api/contacts/${contact?.id}/addresses`)
        .set('authorization', 'test')
        .send({
          street: 'street test',
          city: 'city test',
          province: 'province test',
          country: 'country test',
          postal_code: '1111',
        });
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.id');
      expect(response.body).toMatchObject({
        data: {
          street: 'street test',
          city: 'city test',
          province: 'province test',
          country: 'country test',
          postal_code: '1111',
        },
      });
    });
  });

  describe('GET /api/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if contact is not found', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact!.id + 1}/addresses/${address?.id}`)
        .set('authorization', 'test');
      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be rejected if address is not found', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact?.id}/addresses/${address!.id + 1}`)
        .set('authorization', 'test');
      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('errors');
    });

    it('should be able to get address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact?.id}/addresses/${address?.id}`)
        .set('authorization', 'test');
      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.id');
      expect(response.body).toMatchObject({
        data: {
          street: 'street test',
          city: 'city test',
          province: 'province test',
          country: 'country test',
          postal_code: '1111',
        },
      });
    });
  });
});
