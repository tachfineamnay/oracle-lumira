import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface FileUploadResult {
  url: string;
  key: string;
  size: number;
}

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(config: S3Config) {
    this.bucketName = config.bucketName;
    
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle || false,
    });
  }

  /**
   * Upload un fichier vers S3/MinIO
   */
  async uploadFile(
    buffer: Buffer, 
    originalName: string, 
    contentType: string,
    type: 'face_photo' | 'palm_photo'
  ): Promise<FileUploadResult> {
    try {
      const fileExtension = originalName.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const uuid = uuidv4();
      const key = `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${uuid}-${timestamp}-${type}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          'original-name': originalName,
          'upload-type': type,
          'upload-timestamp': timestamp.toString(),
        },
      });

      await this.s3Client.send(command);

      // Générer l'URL publique
      const url = this.getPublicUrl(key);

      return {
        url,
        key,
        size: buffer.length,
      };
    } catch (error) {
      console.error('Erreur upload S3:', error);
      throw new Error(`Échec upload S3: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprimer un fichier de S3/MinIO
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Erreur suppression S3:', error);
      return false;
    }
  }

  /**
   * Générer l'URL publique d'un fichier
   */
  public getPublicUrl(key: string): string {
    const endpoint = process.env.S3_ENDPOINT;
    if (endpoint) {
      // MinIO ou endpoint personnalisé
      return `${endpoint.replace(/\/$/, '')}/${this.bucketName}/${key}`;
    } else {
      // AWS S3 standard
      const region = process.env.AWS_REGION || 'us-east-1';
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    }
  }

  /**
   * Vérifier la connexion S3
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test simple avec un petit buffer
      const testBuffer = Buffer.from('test-connection');
      const testKey = `test/${Date.now()}-connection-test.txt`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: testKey,
        Body: testBuffer,
        ContentType: 'text/plain',
      });

      await this.s3Client.send(command);
      
      // Nettoyer le fichier de test
      await this.deleteFile(testKey);
      
      return true;
    } catch (error) {
      console.error('Test connexion S3 échoué:', error);
      return false;
    }
  }

  /**
   * Générer une URL signée (GET) temporaire pour accéder à un objet privé
   */
  async getPresignedGetUrl(key: string, expiresInSeconds: number = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    const url = await awsGetSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    return url;
  }

  /**
   * Generate a presigned PUT URL for direct uploads from the browser
   */
  async getPresignedPutUrl(key: string, contentType: string, expiresInSeconds: number = 900): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      // Optional: you can add ACL or Metadata here if your bucket policy allows
    });
    const url = await awsGetSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    return url;
  }
}

// Instance singleton du service S3
let s3ServiceInstance: S3Service | null = null;

export function getS3Service(): S3Service {
  if (!s3ServiceInstance) {
    // Mock mode: bypass real S3 interactions entirely
    if (process.env.S3_MOCK_MODE === 'true') {
      console.warn('[S3] S3_MOCK_MODE enabled - using in-memory/mock S3 service');
      class MockS3 extends S3Service {
        constructor() {
          super({
            accessKeyId: 'mock',
            secretAccessKey: 'mock',
            region: 'us-east-1',
            bucketName: process.env.AWS_S3_BUCKET_NAME || 'qa-test-bucket',
          } as any);
        }
        async uploadFile(buffer: Buffer, originalName: string, contentType: string, type: 'face_photo' | 'palm_photo') {
          const timestamp = Date.now();
          const key = `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${timestamp}-${type}-${originalName}`;
          const url = `https://mock-s3.local/${process.env.AWS_S3_BUCKET_NAME || 'qa-test-bucket'}/${key}`;
          return { url, key, size: buffer.length };
        }
        async deleteFile(_key: string): Promise<boolean> { return true; }
        async getPresignedGetUrl(key: string, _expiresInSeconds: number = 900): Promise<string> {
          const url = `https://mock-s3.local/${process.env.AWS_S3_BUCKET_NAME || 'qa-test-bucket'}/${key}?signature=mock&expires=900`;
          return url;
        }
      }
      s3ServiceInstance = new MockS3();
      return s3ServiceInstance;
    }
    const config: S3Config = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.LUMIRA_ACCESS_KEY || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.LUMIRA_SECRET_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucketName: process.env.AWS_S3_BUCKET_NAME || 'lumira-uploads',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    };

    // ----- DEBUT DU BLOC DE DIAGNOSTIC -----
    console.log(
      '[DIAGNOSTIC] getS3Service - Inspecting environment variables:', 
      JSON.stringify({
        aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
        aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY ? 'SECRET_IS_PRESENT' : 'SECRET_IS_MISSING',
        aws_region: process.env.AWS_REGION,
        aws_s3_bucket_name: process.env.AWS_S3_BUCKET_NAME,
        s3_endpoint: process.env.S3_ENDPOINT,
      }, null, 2)
    );
    // ----- FIN DU BLOC DE DIAGNOSTIC -----

    // Validation de la configuration (skip when using explicit mock mode only)
    if (!config.accessKeyId || !config.secretAccessKey) {
      throw new Error('Configuration S3 manquante: AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY requis');
    }

    s3ServiceInstance = new S3Service(config);
  }

  return s3ServiceInstance;
}
