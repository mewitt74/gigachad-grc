import { StorageProvider, StorageConfig, StorageType } from './storage.interface';
import { LocalStorageProvider } from './local.storage';
import { S3StorageProvider } from './s3.storage';
import { AzureBlobStorage } from './azure-blob.storage';

export function createStorageProvider(config: StorageConfig): StorageProvider {
  switch (config.type) {
    case 'local':
      return new LocalStorageProvider(config);
    
    case 'minio':
    case 's3':
      return new S3StorageProvider(config);
    
    case 'azure':
      return new AzureBlobStorage(config);
    
    default:
      throw new Error(`Unsupported storage type: ${config.type}`);
  }
}

export function getStorageConfigFromEnv(): StorageConfig {
  const type = (process.env.STORAGE_TYPE || 'local') as StorageType;

  if (type === 'local') {
    return {
      type: 'local',
      localPath: process.env.LOCAL_STORAGE_PATH || './storage',
      localBaseUrl: process.env.LOCAL_STORAGE_BASE_URL || '/files',
    };
  }

  if (type === 'azure') {
    return {
      type: 'azure',
      azureConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      azureAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      azureAccountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
      azureSasToken: process.env.AZURE_STORAGE_SAS_TOKEN,
      azureContainerName: process.env.AZURE_STORAGE_CONTAINER || 'gigachad-grc',
    };
  }

  // S3 or MinIO
  return {
    type,
    endpoint: process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT || process.env.S3_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true' || process.env.S3_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.MINIO_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.MINIO_BUCKET || process.env.S3_BUCKET || 'grc-storage',
    region: process.env.AWS_REGION || 'us-east-1',
  };
}

// NestJS module for dependency injection
import { Module, DynamicModule, Global } from '@nestjs/common';

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

@Global()
@Module({})
export class StorageModule {
  static forRoot(config?: StorageConfig): DynamicModule {
    const storageConfig = config || getStorageConfigFromEnv();

    return {
      module: StorageModule,
      providers: [
        {
          provide: STORAGE_PROVIDER,
          useFactory: () => createStorageProvider(storageConfig),
        },
      ],
      exports: [STORAGE_PROVIDER],
    };
  }
}



