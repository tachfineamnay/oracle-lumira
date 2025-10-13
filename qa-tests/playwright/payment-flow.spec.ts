import { test, expect } from '@playwright/test';

test.describe('Payment flow routing + console cleanliness', () => {
  test('routes /payment-success to confirmation page', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));

    await page.goto('/payment-success?orderId=pi_test_123&email=test%40test.com');
    await expect(page.getByText('Préparation de votre Sanctuaire')).toBeVisible({ timeout: 10000 });

    // The page may continue polling; we only assert initial render is correct
    expect(consoleMessages.join('\n')).not.toContain('No routes matched');
  });

  test('no Stripe appearance warnings on /commande', async ({ page }) => {
    const logs: { type: string; text: string }[] = [];
    page.on('console', (msg) => logs.push({ type: msg.type(), text: msg.text() }));

    // Intercept PaymentIntent creation to avoid real backend dependency
    await page.route('**/api/products/create-payment-intent', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          clientSecret: 'pi_test_client_secret',
          orderId: 'pi_test_order',
          amount: 2700,
          currency: 'eur',
          productName: 'Niveau Initié',
        }),
      });
    });

    await page.goto('/commande?product=initie');

    // Wait a moment for potential Stripe warnings to appear (if Stripe JS loads)
    await page.waitForTimeout(1000);

    const full = logs.map((l) => `[${l.type}] ${l.text}`).join('\n');
    expect(full).not.toMatch(/invalid variable value .*colorBackground/i);
    expect(full).not.toMatch(/backdropFilter is not a supported property/i);
  });
});

