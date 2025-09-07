# 🛠️ Oracle Lumira - Guide Migration Next.js & Roadmap

## 🎯 **VISION STRATÉGIQUE**

### Objectifs Migration Next.js
- **SEO Optimization**: Server-Side Rendering (SSR) + Static Site Generation (SSG)
- **Performance**: Image optimization, code splitting, caching intelligent
- **Developer Experience**: Hot reload, TypeScript natif, API routes
- **Scalabilité**: App Router, middleware avancé, edge functions

---

## 📊 **ANALYSE COMPARATIVE**

### Current Stack (React + Vite)
| Aspect | Score | Notes |
|---------|-------|-------|
| **SEO** | 3/10 | SPA → contenu non indexé |
| **Performance** | 7/10 | Build rapide, bundle optimisé |
| **DX** | 8/10 | HMR excellent, tooling moderne |
| **Déploiement** | 6/10 | Nginx statique, PM2 API |

### Target Stack (Next.js 14)
| Aspect | Score | Notes |
|---------|-------|-------|
| **SEO** | 9/10 | SSR/SSG, meta dynamiques |
| **Performance** | 9/10 | Image opt, edge caching |
| **DX** | 9/10 | Turbopack, App Router |
| **Déploiement** | 8/10 | Standalone mode, edge ready |

---

## 🛣️ **ROADMAP MIGRATION (3 PHASES)**

### **Phase 1: Préparation & Coexistence (2-3 semaines)**
```bash
# Étape 1.1: Setup Next.js en parallèle
mkdir apps/main-app-nextjs
cd apps/main-app-nextjs
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

```bash
# Étape 1.2: Migration des composants réutilisables  
cp -r ../main-app/src/components ./src/components
cp -r ../main-app/src/utils ./src/utils
cp -r ../main-app/src/hooks ./src/hooks
```

```bash
# Étape 1.3: Configuration Tailwind & TypeScript
# Réutiliser les configs existantes
cp ../main-app/tailwind.config.js ./
cp ../main-app/tsconfig.json ./
```

### **Phase 2: Migration Progressive (3-4 semaines)**
```typescript
// Étape 2.1: Page d'accueil SSR
// app/page.tsx
import { Metadata } from 'next'
import Hero from '@/components/Hero'
import LevelsSection from '@/components/LevelsSection'

export const metadata: Metadata = {
  title: 'Oracle Lumira - Voyance & Guidance Spirituelle',
  description: 'Découvrez votre avenir avec nos oracles expérimentés...',
  openGraph: {
    title: 'Oracle Lumira',
    description: 'Voyance & Guidance Spirituelle',
    url: 'https://oraclelumira.com',
    siteName: 'Oracle Lumira'
  }
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <LevelsSection />
    </main>
  )
}
```

```typescript
// Étape 2.2: API Routes Next.js (optionnel)
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Proxy vers Express API ou logique directe
  const body = await request.json()
  
  const response = await fetch(`${process.env.API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  return NextResponse.json(await response.json())
}
```

```typescript
// Étape 2.3: Layout avec metadata dynamiques
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Oracle Lumira',
    default: 'Oracle Lumira - Voyance & Guidance Spirituelle'
  },
  description: 'Plateforme de voyance en ligne avec oracles certifiés',
  keywords: ['voyance', 'oracle', 'tarot', 'spiritualité', 'guidance'],
  authors: [{ name: 'Oracle Lumira' }],
  creator: 'Oracle Lumira',
  publisher: 'Oracle Lumira',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

### **Phase 3: Optimisation & Mise en Production (2 semaines)**
```typescript
// Étape 3.1: Optimisation images
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['oraclelumira.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  output: 'standalone', // Pour Docker
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react']
  }
}
```

```bash
# Étape 3.2: Build optimisé pour production
npm run build
npm run start
```

---

## 🐳 **DOCKERFILE NEXT.JS OPTIMISÉ**

```dockerfile
# Dockerfile.nextjs - Multi-stage optimisé pour Next.js 14
FROM node:20.18.1-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
COPY apps/main-app-nextjs/package*.json ./
RUN npm ci --frozen-lockfile

# Stage 2: Builder  
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY apps/main-app-nextjs ./
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create lumira user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## 🔄 **STRATÉGIE DE TRANSITION**

### Option A: Migration Complète (Recommandée)
```yaml
# docker-compose.nextjs.yml
services:
  nextjs-app:
    build: 
      context: .
      dockerfile: Dockerfile.nextjs
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api-backend:3001/api
    depends_on:
      - api-backend

  api-backend:
    # Configuration API existante inchangée
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
```

### Option B: Transition Progressive
```nginx
# nginx.conf - Routing hybride
upstream nextjs_app {
    server nextjs:3000;
}

upstream legacy_app {
    server nginx:8080;
}

server {
    listen 80;
    server_name oraclelumira.com;

    # Nouvelles pages → Next.js
    location ~ ^/(dashboard|profile|orders) {
        proxy_pass http://nextjs_app;
    }

    # Pages existantes → React legacy
    location / {
        proxy_pass http://legacy_app;
    }
}
```

---

## 📈 **MÉTRIQUES & PERFORMANCE**

### Objectifs Performance Next.js
- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **Core Web Vitals**: 95% pages "Good"

### Monitoring Configuration
```javascript
// app/lib/analytics.js
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 💰 **ANALYSE COÛT/BÉNÉFICE**

### Coûts de Migration
- **Temps développement**: 6-8 semaines (1 dev senior)
- **Tests & validation**: 2 semaines
- **Formation équipe**: 1 semaine
- **Risques transition**: Moyen (rollback possible)

### Bénéfices Attendus
- **SEO**: +300% trafic organique (estimation)
- **Performance**: +40% Core Web Vitals score
- **Conversion**: +15% (pages plus rapides)
- **Maintenance**: -30% effort (tooling moderne)

### ROI Estimé: **+250% en 12 mois**

---

## ✅ **PLAN D'ACTION IMMÉDIAT**

### Semaine 1-2: Setup & Prototypage
```bash
# 1. Créer la branche migration
git checkout -b feature/nextjs-migration

# 2. Setup Next.js 14
mkdir apps/main-app-nextjs
cd apps/main-app-nextjs
npx create-next-app@latest . --typescript --tailwind --eslint --app

# 3. Premier prototype (page d'accueil)
# Migration Hero + LevelsSection

# 4. Tests performance
npm run build && npm run start
# Lighthouse audit + Core Web Vitals
```

### Semaine 3-4: Migration Composants Core
```bash
# 5. Migration des composants principaux
# Hero, LevelsSection, Footer, Layout

# 6. Configuration API routes ou proxy

# 7. Setup metadata dynamiques + SEO

# 8. Tests fonctionnels complets
```

### Semaine 5-6: Integration & Tests
```bash
# 9. Docker configuration Next.js

# 10. Tests Coolify deployment

# 11. Performance optimization

# 12. SEO validation (Google Search Console)
```

---

## 🚀 **DÉCISION: GO/NO-GO**

### Critères de Validation Phase 1
- [ ] Page d'accueil Next.js ≥ performance Vite ✅
- [ ] SEO score Lighthouse > 90 ✅  
- [ ] Build Docker < 5 minutes ✅
- [ ] Compatibilité API existante 100% ✅

### Green Light Indicators  
- Performance gains mesurables
- SEO score amélioré
- Developer Experience positive
- Déploiement Coolify stable

**👥 Recommandation**: **GO** pour migration Next.js
**🕐 Timeline**: 8 semaines pour migration complète
**⚡ Quick Win**: Commencer par la page d'accueil (SEO max impact)

---

**🎯 Next.js migration = Oracle Lumira future-ready!**
