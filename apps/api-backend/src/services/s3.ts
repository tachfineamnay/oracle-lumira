import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configuration S3 sécurisée
const s3Config = {
  region: process.env.AWS_REGION || 'eu-west-3',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  },
  maxAttempts: 3, // Retry automatique
  requestTimeout: 30000 // 30 secondes timeout
};

const s3Client = new S3Client(s3Config);

export interface S3UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export interface FileUploadData {
  buffer: Buffer;
  originalName: string;
  contentType: string;
  size: number;
  type?: 'face_photo' | 'palm_photo';
}

class S3Service {
  private bucketName: string;
  private baseUrl?: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
    this.baseUrl = process.env.AWS_S3_BASE_URL;
    
    // Validation des variables d'environnement requises
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID environment variable is required');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS_SECRET_ACCESS_KEY environment variable is required');
    }
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
    }
  }

  /**
   * Génère une clé unique pour le fichier dans S3
   * Format: uploads/{année}/{mois}/{uuid}-{nom-original}
   */
  private generateS3Key(originalName: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const uuid = uuidv4();
    
    // Nettoyer le nom original pour éviter les caractères problématiques
    const cleanName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `uploads/${year}/${month}/${uuid}-${cleanName}`;
  }

  /**
   * Génère l'URL publique d'accès au fichier
   */
  private generatePublicUrl(key: string): string {
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }
    
    return `https://${this.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
  }

  /**
   * Valide le type de fichier autorisé
   */
  private validateFileType(contentType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    return allowedTypes.includes(contentType.toLowerCase());
  }

  /**
   * Upload un fichier vers S3
   */
  async uploadFile(fileData: FileUploadData): Promise<S3UploadResult> {
    try {
      // Validation du type de fichier
      if (!this.validateFileType(fileData.contentType)) {
        throw new Error(`Type de fichier non autorisé: ${fileData.contentType}`);
      }

      // Validation de la taille (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileData.size > maxSize) {
        throw new Error(`Fichier trop volumineux: ${fileData.size} bytes (max: ${maxSize})`);
      }

      // Génération de la clé S3
      const key = this.generateS3Key(fileData.originalName);
      
      // Configuration de l'upload
      const uploadParams: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileData.buffer,
        ContentType: fileData.contentType,
        ContentLength: fileData.size,
        ServerSideEncryption: 'AES256', // Chiffrement côté serveur
        Metadata: {
          'original-name': fileData.originalName,
          'upload-timestamp': new Date().toISOString(),
          'file-type': fileData.type || 'unknown'
        }
      };

      // Upload vers S3
      console.log(`[S3] Uploading file: ${key}`);
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Génération de l'URL publique
      const url = this.generatePublicUrl(key);

      console.log(`[S3] File uploaded successfully: ${url}`);
      
      return {
        key,
        url,
        contentType: fileData.contentType,
        size: fileData.size
      };

    } catch (error: any) {
      console.error('[S3] Upload error:', error);
      
      // Gestion des erreurs spécifiques
      if (error.name === 'CredentialsProviderError') {
        throw new Error('Erreur d\'authentification AWS - Vérifiez vos credentials');
      }
      
      if (error.name === 'NetworkingError') {
        throw new Error('Erreur réseau lors de l\'upload - Réessayez plus tard');
      }
      
      if (error.Code === 'NoSuchBucket') {
        throw new Error(`Le bucket S3 '${this.bucketName}' n'existe pas`);
      }
      
      // Erreur générique
      throw new Error(`Erreur upload S3: ${error.message}`);
    }
  }

  /**
   * Upload multiple files en parallèle
   */
  async uploadMultipleFiles(filesData: FileUploadData[]): Promise<S3UploadResult[]> {
    try {
      console.log(`[S3] Uploading ${filesData.length} files in parallel`);
      
      const uploadPromises = filesData.map(fileData => this.uploadFile(fileData));
      const results = await Promise.all(uploadPromises);
      
      console.log(`[S3] Successfully uploaded ${results.length} files`);
      return results;
      
    } catch (error: any) {
      console.error('[S3] Batch upload error:', error);
      throw error;
    }
  }

  /**
   * Vérifie la connectivité et les permissions S3
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test simple d'upload d'un petit fichier
      const testKey = `health-check/${Date.now()}-test.txt`;
      const testData = Buffer.from('S3 health check test', 'utf-8');
      
      const uploadParams: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: testKey,
        Body: testData,
        ContentType: 'text/plain'
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);
      
      console.log('[S3] Health check passed');
      return true;
      
    } catch (error: any) {
      console.error('[S3] Health check failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const s3Service = new S3Service();