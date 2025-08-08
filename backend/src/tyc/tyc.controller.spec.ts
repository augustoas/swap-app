import { Test, TestingModule } from '@nestjs/testing';
import { TycController } from './tyc.controller';
import { TycService } from './tyc.service';
import { CreateTycDto } from './dto/create-tyc.dto';
import { UpdateTycDto } from './dto/update-tyc.dto';
import { TermsAndConditions } from '../database/entities/termsAndConditions.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

describe('TycController', () => {
  let controller: TycController;
  let service: TycService;

  const mockTyc: TermsAndConditions = {
    id: 1,
    title: 'Test Terms',
    text: 'Test Text',
    description: 'Test Description',
    createdDate: new Date(),
    updatedDate: new Date(),
    users: [],
  };

  const mockTycService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [
            PassportModule.register({ defaultStrategy: 'jwt' }),
            JwtModule.registerAsync({
              imports: [ConfigModule],
              useFactory: async () => ({
                secret: 'test-secret',
                signOptions: { expiresIn: '1h' },
              }),
              inject: [ConfigService],
            }),
          ],
      controllers: [TycController],
      providers: [
        {
          provide: TycService,
          useValue: mockTycService,
        },
      ],
    }).compile();

    controller = module.get<TycController>(TycController);
    service = module.get<TycService>(TycService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new terms and conditions', async () => {
      const createTycDto: CreateTycDto = {
        title: 'Test Terms',
        text: 'Test Text',
        description: 'Test Description',
      };

      mockTycService.create.mockResolvedValue(mockTyc);

      const result = await controller.create(createTycDto);

      expect(mockTycService.create).toHaveBeenCalledWith(createTycDto);
      expect(result).toEqual({
        message: 'Creado exitosamente',
        payload: mockTyc,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of terms and conditions', async () => {
      const mockTycs = [mockTyc];
      mockTycService.findAll.mockResolvedValue(mockTycs);

      const result = await controller.findAll();

      expect(mockTycService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: '',
        payload: mockTycs,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single terms and conditions', async () => {
      mockTycService.findOne.mockResolvedValue(mockTyc);

      const result = await controller.findOne('1');

      expect(mockTycService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: '',
        payload: mockTyc,
      });
    });
  });

  describe('update', () => {
    it('should update and return the terms and conditions', async () => {
      const updateTycDto: UpdateTycDto = {
        title: 'Updated Terms',
      };

      const updatedTyc = { ...mockTyc, ...updateTycDto };
      mockTycService.update.mockResolvedValue(updatedTyc);

      const result = await controller.update('1', updateTycDto);

      expect(mockTycService.update).toHaveBeenCalledWith(1, updateTycDto);
      expect(result).toEqual({
        message: 'Editado exitosamente',
        payload: updatedTyc,
      });
    });
  });

  describe('remove', () => {
    it('should delete the terms and conditions', async () => {
      mockTycService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(mockTycService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Eliminado exitosamente',
        payload: null,
      });
    });
  });
}); 