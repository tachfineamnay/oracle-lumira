# Architecture de Stockage Objet S3/MinIO - Oracle Lumira

## Vue d'ensemble

Cette architecture résout les erreurs `EACCES` liées aux uploads de fichiers dans les conteneurs Docker en remplaçant le stockage sur système de fichiers local par une solution de stockage objet externe compatible S3. Cette solution garantit la persistance, la scalabilité et la compatibilité avec les pipelines d'IA nécessitant l'accès aux fichiers bruts.

### Contexte Technique

Le système Oracle Lumira utilise actuellement `multer` avec `diskStorage` pour sauvegarder les fichiers clients (photos de visage et de paume) directement sur le système de fichiers du conteneur. Cette approche génère des erreurs `EACCES` dans l'environnement Coolify et pose des problèmes de persistance lors des redéploiements.

### Objectifs de l'Architecture

- **Résolution des erreurs EACCES** : Éliminer les problèmes de permissions système
- **Persistance garantie** : Assurer la conservation des fichiers lors des redéploiements
- **Scalabilité** : Support d'un volume croissant de fichiers
- **Compatibilité IA** : Maintenir l'accès aux fichiers bruts pour le fine-tuning
- **Flexibilité** : Support de MinIO auto-hébergé et AWS S3

## Architecture du Système

### Composants Principaux

```mermaid
graph TB
    A[Client Web] -->|Upload fichiers| B[API Backend]
    B -->|Multer MemoryStorage| C[Buffer en Mémoire]
    C -->|Upload S3/MinIO| D[Service de Stockage]
    B -->|Métadonnées fichiers| E[Base de Données MongoDB]
    F[Expert Desk] -->|Consultation fichiers| D
    
    subgraph "Stockage Objet"
        D --> G[MinIO Auto-hébergé]
        D --> H[AWS S3]
    end
    
    style D fill:#4A90E2
    style G fill:#FF6B6B
    style H fill:#FF8C42
```

### Flow de Traitement des Fichiers

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Backend
    participant M as Multer Memory
    participant S3 as Service S3/MinIO
    participant DB as MongoDB
    participant EX as Expert Desk

    C->>API: POST /by-payment-intent/:id/client-submit
    API->>M: Traitement fichiers (memoryStorage)
    M->>API: Retour buffers fichiers
    
    loop Pour chaque fichier
        API->>API: Génération nom unique (UUID)
        API->>S3: Upload buffer vers bucket
        S3->>API: Retour URL publique
        API->>DB: Sauvegarde métadonnées + URL
    end
    
    API->>C: Confirmation upload
    
    Note over EX: Consultation fichiers
    EX->>DB: Récupération métadonnées ordre
    EX->>S3: Affichage fichiers via URL
```

## Configuration du Stockage

### Service de Configuration S3

Le service de configuration centralise la gestion des connexions au stockage objet, supportant à la fois MinIO et AWS S3 via des variables d'environnement.

#### Paramètres de Configuration

| Variable | Description | Exemple MinIO | Exemple AWS S3 |
|----------|-------------|---------------|----------------|
| `S3_ENDPOINT` | Point d'accès du service | `https://minio.example.com` | (non requis) |
| `S3_ACCESS_KEY` | Clé d'accès | `minioadmin` | `AKIAI...` |
| `S3_SECRET_KEY` | Clé secrète | `minioadmin123` | `wJalr...` |
| `S3_BUCKET_NAME` | Nom du bucket | `lumira-uploads` | `lumira-prod-files` |
| `S3_REGION` | Région | `us-east-1` | `eu-west-1` |
| `S3_FORCE_PATH_STYLE` | Style de chemin | `true` (MinIO) | `false` (AWS) |

#### Stratégie de Nommage des Fichiers

- **Format** : `{uuid}-{timestamp}-{originalname}`
- **UUID** : Garantit l'unicité globale
- **Timestamp** : Permet le tri chronologique
- **Original Name** : Conserve le nom original pour l'utilisateur

### Gestion des Types de Fichiers

| Type | Extension Support | Taille Max | Validation |
|------|------------------|------------|------------|
| Images | `.jpg, .jpeg, .png, .gif, .webp, .heic, .heif` | 10 MB | MIME type + extension |
| Documents | `.pdf` (futur) | 5 MB | Type validation |

## Modifications de l'API Backend

### Nouvelle Route d'Upload

La route existante `/by-payment-intent/:paymentIntentId/client-submit` sera modifiée pour utiliser le stockage objet au lieu du système de fichiers local.

#### Changements Multer

```mermaid
graph LR
    A[diskStorage] -->|Migration| B[memoryStorage]
    B --> C[Buffer en RAM]
    C --> D[Upload S3/MinIO]
    
    style A fill:#FF6B6B
    style B fill:#4CAF50
```

#### Structure des Métadonnées Fichier

```mermaid
erDiagram
    ORDER ||--o{ FILE : contains
    
    FILE {
        string filename "UUID généré"
        string originalName "Nom original"
        string url "URL publique S3"
        string key "Clé S3 pour suppression"
        string contentType "Type MIME"
        number size "Taille en octets"
        string type "face_photo | palm_photo"
        date uploadedAt "Date upload"
    }
```

### Service S3 Client

Le service client S3 encapsule les opérations de stockage et fournit une interface uniforme pour MinIO et AWS S3.

#### Opérations Supportées

| Opération | Description | Retour |
|-----------|-------------|--------|
| `uploadFile()` | Upload buffer vers bucket | `{ url, key }` |
| `getFileUrl()` | Génération URL signée | `string` |
| `deleteFile()` | Suppression fichier | `boolean` |
| `listFiles()` | Liste fichiers commande | `Array<FileMetadata>` |

## Modifications Expert Desk

### Affichage des Fichiers

L'interface Expert Desk sera mise à jour pour utiliser les URLs publiques S3 au lieu des chemins de fichiers locaux.

#### Composant ContentGenerator

| Fonctionnalité | Implémentation |
|----------------|----------------|
| **Affichage Images** | `<img src={file.url}>` |
| **Bouton Téléchargement** | `<a href={file.url} download>` |
| **Prévisualisation** | Lightbox avec URL S3 |
| **Gestion Erreurs** | Fallback si URL indisponible |

### Sécurité et Accès

```mermaid
graph TB
    A[Expert Desk] --> B{Vérification Auth}
    B -->|Autorisé| C[Accès URLs S3]
    B -->|Non autorisé| D[Erreur 403]
    
    C --> E[Affichage Fichiers]
    C --> F[Téléchargement Direct]
    
    style B fill:#FFE135
    style D fill:#FF6B6B
```

## Architecture de Déploiement

### Option 1 : MinIO Auto-hébergé

MinIO offre une solution de stockage objet compatible S3 qui peut être déployée aux côtés de l'application Oracle Lumira.

#### Configuration Coolify MinIO

| Service | Configuration |
|---------|---------------|
| **Image** | `minio/minio:latest` |
| **Commande** | `server /data --console-address ":9001"` |
| **Ports** | `9000` (API), `9001` (Console) |
| **Volumes** | `/data` (persistant) |
| **Variables** | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` |

#### Avantages MinIO

- **Contrôle Total** : Gestion complète des données
- **Coût Prévisible** : Pas de frais de stockage cloud
- **Latence Réduite** : Hébergement proche de l'application
- **Conformité** : Données restent sur infrastructure contrôlée

### Option 2 : AWS S3

AWS S3 fournit un service de stockage objet géré avec haute disponibilité et durabilité.

#### Configuration AWS S3

| Paramètre | Configuration |
|-----------|---------------|
| **Bucket Policy** | Lecture publique pour fichiers clients |
| **CORS** | Autorisation domaines Oracle Lumira |
| **Lifecycle** | Archivage automatique après 1 an |
| **Versioning** | Activé pour récupération |

#### Avantages AWS S3

- **Fiabilité** : 99.999999999% de durabilité
- **Scalabilité** : Croissance automatique
- **Intégrations** : Services AWS complémentaires
- **Maintenance** : Zéro administration

### Matrice de Décision

| Critère | MinIO | AWS S3 | Recommandation |
|---------|-------|---------|----------------|
| **Coût Initial** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | MVP : MinIO |
| **Simplicité** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Production : AWS S3 |
| **Contrôle** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Données sensibles : MinIO |
| **Scalabilité** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Croissance : AWS S3 |

## Variables d'Environnement

### Configuration Production

#### Variables MinIO

```
# Configuration MinIO
S3_ENDPOINT=https://minio.oraclelumira.com
S3_ACCESS_KEY=lumira_access_key
S3_SECRET_KEY=lumira_secret_key_secure_2025
S3_BUCKET_NAME=lumira-client-files
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# Configuration MinIO Admin
MINIO_ROOT_USER=lumira_admin
MINIO_ROOT_PASSWORD=LumiraMinIO2025!Secure
```

#### Variables AWS S3

```
# Configuration AWS S3 (pas de S3_ENDPOINT)
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=lumira-prod-client-files
S3_REGION=eu-west-1
S3_FORCE_PATH_STYLE=false

# Variables AWS additionnelles
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Variables de Développement

```
# Mode développement (optionnel)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=lumira-dev
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

## Sécurité et Conformité

### Stratégie de Sécurité

```mermaid
graph TB
    A[Client Upload] --> B[Validation Backend]
    B --> C[Scan Antivirus]
    C --> D[Upload S3/MinIO]
    D --> E[URL Signée]
    E --> F[Accès Temporaire]
    
    subgraph "Contrôles Sécurité"
        G[Type de fichier]
        H[Taille maximum]
        I[Scan malware]
        J[Chiffrement transit]
        K[Chiffrement repos]
    end
    
    B --> G
    B --> H
    C --> I
    D --> J
    D --> K
    
    style C fill:#FF6B6B
    style J fill:#4CAF50
    style K fill:#4CAF50
```

### Mesures de Protection

| Niveau | Mesure | Implementation |
|--------|--------|----------------|
| **Transport** | HTTPS/TLS | Certificats SSL/TLS |
| **Stockage** | Chiffrement AES-256 | Paramètres bucket |
| **Accès** | URLs signées | Expiration 24h |
| **Validation** | Scan fichiers | ClamAV/VirusTotal |
| **Audit** | Logs accès | CloudTrail/MinIO logs |

### Conformité RGPD

| Principe | Implémentation |
|----------|----------------|
| **Minimisation** | Suppression automatique après traitement |
| **Droit suppression** | API endpoint de suppression |
| **Portabilité** | Export fichiers client |
| **Sécurité** | Chiffrement et contrôle d'accès |

## Gestion des Erreurs et Résilience

### Stratégies de Récupération

```mermaid
graph TB
    A[Upload Tentative] --> B{S3 Disponible?}
    B -->|Oui| C[Upload Normal]
    B -->|Non| D[Fallback Temporaire]
    
    D --> E[Base64 en DB]
    E --> F[Job de Migration]
    F -->|S3 Restauré| C
    
    C --> G[Confirmation Client]
    
    style D fill:#FFE135
    style E fill:#FF6B6B
    style F fill:#4CAF50
```

### Gestion des Pannes

| Scenario | Action | Récupération |
|----------|--------|--------------|
| **S3 Indisponible** | Stockage temporaire Base64 | Migration automatique |
| **Upload Échoué** | Retry avec backoff | 3 tentatives maximum |
| **Bucket Plein** | Alerte monitoring | Extension automatique |
| **Corruption Fichier** | Validation checksum | Re-upload demandé |

## Monitoring et Observabilité

### Métriques Clés

| Métrique | Seuil | Alerte |
|----------|-------|--------|
| **Taux Upload Réussi** | > 95% | Warning < 95% |
| **Latence Upload** | < 5s | Critical > 10s |
| **Taille Stockage** | < 80% quota | Warning > 80% |
| **Coût Mensuel** | Budget défini | Alert dépassement |

### Tableaux de Bord

```mermaid
graph LR
    A[Grafana Dashboard] --> B[Uploads par Jour]
    A --> C[Latence S3]
    A --> D[Erreurs Upload]
    A --> E[Stockage Utilisé]
    
    style A fill:#4A90E2
```

## Migration et Tests

### Plan de Migration

| Phase | Action | Durée | Validation |
|-------|--------|-------|------------|
| **1. Setup S3** | Déploiement MinIO/S3 | 2h | Connexion test |
| **2. Code Update** | Modification API | 4h | Tests unitaires |
| **3. Tests** | Validation complète | 3h | Scenarios end-to-end |
| **4. Déploiement** | Mise en production | 1h | Monitoring actif |
| **5. Migration** | Fichiers existants | 2h | Vérification intégrité |

### Stratégie de Tests

```mermaid
graph TB
    A[Tests Unitaires] --> B[Tests Intégration]
    B --> C[Tests E2E]
    C --> D[Tests Performance]
    
    A --> A1[Upload Service]
    A --> A2[S3 Client]
    A --> A3[File Validation]
    
    B --> B1[API Routes]
    B --> B2[Database Integration]
    
    C --> C1[Upload Flow Complet]
    C --> C2[Expert Desk Display]
    
    D --> D1[Load Testing]
    D --> D2[Stress Testing]
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
```

### Critères de Validation

| Test | Critère de Succès |
|------|------------------|
| **Upload Fonctionnel** | Fichier accessible via URL |
| **Performance** | Upload < 5s pour 10MB |
| **Résilience** | Récupération automatique pannes |
| **Sécurité** | Validation types et tailles |
| **Expert Desk** | Affichage et téléchargement OK |

## Points d'Attention

### Limitations Techniques

- **Taille Mémoire** : Multer `memoryStorage` limite la taille des fichiers uploadés simultanément
- **Latence Réseau** : Upload vers S3 externe peut augmenter le temps de réponse
- **Dépendance Externe** : Disponibilité du service S3 impact critique

### Recommandations

1. **Monitoring Proactif** : Surveillance continue de la disponibilité S3
2. **Cache Local** : Mise en cache des fichiers fréquemment accédés
3. **Compression** : Optimisation automatique des images (WebP)
4. **CDN** : Distribution via CloudFront pour AWS S3
