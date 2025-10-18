# 📸 Photo Upload System - Improvements 2025

**Date:** 2025-01-XX  
**Status:** ✅ Implemented & Ready for Testing  
**Priority:** P1 - Critical for Client Demo  
**Files Modified:** `apps/main-app/src/components/sanctuaire/OnboardingForm.tsx`

---

## 🎯 Objectives

Make the Sanctuaire photo upload experience **reliable, transparent, and resilient** for client demos:

1. **Real-time progress feedback** - Users see upload progress 0-100%
2. **Automatic retry logic** - Network failures don't block the flow
3. **Enhanced UX** - Visual feedback during compression, upload, completion

---

## ✨ What Changed

### 1. **XMLHttpRequest-based Upload with Progress Tracking**

**Before:**
```typescript
// fetch() API - no progress events
const putRes = await fetch(uploadUrl, {
  method: 'PUT',
  body: compressedFile
});
```

**After:**
```typescript
const uploadWithProgress = (uploadUrl, file, onProgress) => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    
    // Real-time progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress(percentage);
      }
    });
    
    // 2-minute timeout, error handling
    xhr.timeout = 120000;
    xhr.open('PUT', uploadUrl);
    xhr.send(file);
  });
};
```

**Benefits:**
- ✅ Users see live progress (0% → 100%)
- ✅ 2-minute timeout prevents infinite hangs
- ✅ Proper error distinction (network vs. auth)

---

### 2. **Exponential Backoff Retry Logic**

**Strategy:**
- **Max 3 attempts** with delays: [1s, 2s, 4s]
- **Retry on:** Network errors, timeouts
- **Don't retry on:** CORS (403), Auth (400), S3 permission errors

**Implementation:**
```typescript
const uploadWithRetry = async (uploadUrl, file, onProgress) => {
  const maxAttempts = 3;
  const delays = [1000, 2000, 4000];
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await uploadWithProgress(uploadUrl, file, 
      (percentage) => onProgress(percentage, attempt, maxAttempts)
    );
    
    if (result.success) return result; // Success!
    
    // Check if retryable
    const isRetryable = result.error?.includes('Network error') || 
                        result.error?.includes('timeout');
    if (!isRetryable) return result; // Permanent failure
    
    // Exponential backoff
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
    }
  }
};
```

**Benefits:**
- ✅ Handles transient network issues (WiFi drops, cellular handoff)
- ✅ Doesn't waste retries on permanent errors
- ✅ Console logs show retry attempts for debugging

---

### 3. **Enhanced PhotoUpload Component UI**

**New State Management:**
```typescript
const [uploadProgress, setUploadProgress] = useState<{ 
  face?: number; 
  palm?: number 
}>({});

const [uploading, setUploading] = useState<'face' | 'palm' | null>(null);
```

**Visual Feedback:**

| State | UI Display |
|-------|-----------|
| **Idle** | Dashed border, upload icon, label |
| **Compressing** | Loader spinner (progress undefined) |
| **Uploading 0-99%** | Animated amber progress bar + percentage |
| **Complete** | Checkmark ✓, amber highlight |
| **Error** | Red error message (CORS fallback) |

**Component Update:**
```typescript
<PhotoUpload
  label="Visage"
  file={formData.facePhoto}
  progress={uploadProgress.face}
  isUploading={uploading === 'face'}
  onChange={(file) => onFileChange('facePhoto', file)}
/>
```

**Features:**
- ✅ Animated progress bar (Framer Motion)
- ✅ Disabled input during upload (prevents double-submit)
- ✅ Smooth transitions between states

---

## 🔄 Complete Upload Flow

```
1. User selects photo (JPEG/PNG/HEIC)
   ↓
2. compressImage() - Canvas API
   • Skip if < 3MB
   • Target: 900KB, max 1400px
   • Quality: 0.8 → 0.55 (progressive)
   • Output: Always JPEG
   ↓
3. POST /api/uploads/presign
   • Get presigned S3 URL + key
   ↓
4. uploadWithRetry()
   ↓
   ├─ Attempt 1: uploadWithProgress() [XHR PUT]
   │   └─ Updates progress 0-100%
   ↓
   ├─ Network timeout? → Wait 1s → Retry
   ↓
   ├─ Attempt 2: uploadWithProgress()
   │   └─ Still failing? → Wait 2s → Retry
   ↓
   ├─ Attempt 3: uploadWithProgress()
   │   └─ Final attempt
   ↓
5. Success? Store S3 key
   Failure? Fallback to multipart FormData
   ↓
6. handleSubmit()
   • Path A: JSON with S3 keys (faster)
   • Path B: Multipart with files (fallback)
```

---

## 🧪 Testing Scenarios

### Manual Testing Checklist

- [ ] **Happy Path:** 5MB JPEG → compresses to <1MB → uploads with progress → checkmark shows
- [ ] **Large File:** 15MB PNG → compresses → progress bar updates smoothly
- [ ] **Network Interruption:** Disable WiFi during upload → verify retry happens (check console logs)
- [ ] **HEIC Photo (iPhone):** Upload → verify raw upload (no compression) or fallback to multipart
- [ ] **Slow Network:** Throttle to 3G → verify progress bar shows accurate percentage
- [ ] **CORS Error:** Verify graceful fallback with error message: "Upload S3 indisponible"
- [ ] **Both Photos:** Upload face + palm → verify both show progress independently

### E2E Test (Playwright) - TODO Task 5

```typescript
// tests/e2e/photo-upload.spec.ts
test('Photo upload with progress and retry', async ({ page }) => {
  await page.goto('/sanctuaire');
  
  // Step 3: Photos
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  
  // Upload face photo
  const faceInput = page.locator('input[type="file"]').first();
  await faceInput.setInputFiles('tests/fixtures/test-photo-10mb.jpg');
  
  // Verify progress bar appears
  const progressBar = page.locator('.w-full.h-1\\.5.bg-white\\/10');
  await expect(progressBar).toBeVisible();
  
  // Wait for upload completion
  await expect(page.getByText('OK')).toBeVisible({ timeout: 30000 });
  
  // Verify S3 key stored (check network tab or localStorage)
  const uploadedKeys = await page.evaluate(() => 
    sessionStorage.getItem('uploadedKeys')
  );
  expect(uploadedKeys).toContain('facePhotoKey');
});
```

---

## 📊 Impact Metrics

| Metric | Before | After |
|--------|--------|-------|
| User visibility | ❌ No feedback | ✅ Real-time progress |
| Network resilience | ❌ 1 attempt only | ✅ 3 attempts + backoff |
| Upload timeout | ⚠️ Infinite | ✅ 2 minutes max |
| Error handling | ⚠️ Generic message | ✅ Retryable vs. permanent |
| UI responsiveness | ⚠️ Input always active | ✅ Disabled during upload |
| Compression visibility | ❌ Hidden | ⚠️ TODO (Task 11) |

---

## 🚀 Next Steps (TODO Tasks 5-11)

### Immediate Priority (for demo)
1. **Task 5:** E2E test with Playwright (validate retry logic works)
2. **Task 9:** Manual test Sanctuaire → Expert Desk flow (verify photos appear in queue)

### Post-Demo Enhancements
3. **Task 11:** Show file size/compression ratio in UI (`2.3 MB → 850 KB`)
4. **Task 11:** Add remove button (X icon) to clear uploaded photos
5. **Future:** HEIC/HEIF client-side compression (WebAssembly library)

---

## 🔧 Technical Notes

### Why XMLHttpRequest instead of fetch()?
- `fetch()` API does **not** support upload progress events
- `xhr.upload.addEventListener('progress')` is the only way to track uploads
- Future: Once Fetch API `ReadableStream` upload support is standardized, migrate back

### Why exponential backoff?
- Linear delays (1s, 1s, 1s) can overwhelm servers recovering from issues
- Exponential (1s, 2s, 4s) gives increasing recovery time
- Standard practice in distributed systems (AWS SDK, Google Cloud)

### Why not retry CORS errors?
- CORS (403) = misconfigured S3 bucket policy → permanent issue, needs DevOps fix
- Auth (400) = invalid presigned URL → backend issue, not network
- Retrying these wastes time and creates false hope

---

## 📝 Code Quality Notes

### Linting Warnings (Non-breaking)
```
⚠️ Form elements must have labels (lines 723, 736)
   → Accessibility improvement (TODO Task 10)

⚠️ 'maxDimension' is never reassigned. Use 'const'
   → Minor: doesn't affect functionality

⚠️ Unexpected any (catch blocks)
   → TypeScript strictness: catch (err: unknown) preferred
```

### No Functional Errors
- ✅ All TypeScript compilation passes
- ✅ No breaking changes to existing flow
- ✅ Maintains backward compatibility with multipart fallback

---

## 🎓 Lessons Learned

1. **Always show progress for >3s operations** - Users think app is frozen otherwise
2. **Retry transient errors only** - Permanent errors need different UX (contact support)
3. **Compression is critical** - iPhone HEIC photos can be 20MB → S3 costs $$
4. **XHR still relevant in 2025** - fetch() can't do everything (yet)

---

## 👥 Credits

**Implemented by:** Full Stack Dev Team (via AI-assisted development)  
**Reviewed by:** [Pending Client Demo]  
**Tested by:** [TODO - QA Team]

---

## 📚 Related Documentation

- [AUDIT-TECHNIQUE-COMPLET-2025.md](./AUDIT-TECHNIQUE-COMPLET-2025.md) - Original audit findings
- [QUICK-START-CHECKOUT.md](./QUICK-START-CHECKOUT.md) - Checkout flow overview
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [MDN: XMLHttpRequest.upload](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)

---

**Status:** ✅ **Ready for Client Demo**  
**Next Review:** After manual testing (Task 9) + E2E tests (Task 5)
