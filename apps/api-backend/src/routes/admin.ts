/**
 * Admin Diagnostic Routes
 * Temporary diagnostic endpoints for troubleshooting
 * Protected by expert authentication
 */

import express from 'express';
import { authenticateExpert } from './expert'; // authenticateExpert is in expert.ts, not auth.ts
import { Order } from '../models/Order'; // Named export, not default

const router = express.Router();

/**
 * Diagnostic endpoint to inspect an order's data
 * GET /api/admin/diagnose/order/:searchTerm
 * 
 * @param searchTerm - Can be: orderId, orderNumber, firstName, or email
 * @returns Detailed diagnostic information about the order
 */
router.get('/diagnose/order/:searchTerm', authenticateExpert, async (req: any, res: any) => {
    try {
        const { searchTerm } = req.params;

        console.log(`[DIAGNOSTIC] Searching for order with term: ${searchTerm}`);

        // Search for the order using multiple criteria
        const order = await Order.findOne({
            $or: [
                { _id: searchTerm },
                { orderNumber: searchTerm },
                { 'formData.firstName': new RegExp(searchTerm, 'i') },
                { 'formData.lastName': new RegExp(searchTerm, 'i') },
                { 'formData.email': new RegExp(searchTerm, 'i') },
            ]
        }).lean();

        if (!order) {
            console.log(`[DIAGNOSTIC] Order not found for term: ${searchTerm}`);
            return res.status(404).json({
                error: 'Order not found',
                searchTerm,
                suggestions: [
                    'Verify the spelling',
                    'Try using the order ID or order number',
                    'Try using the email address',
                ]
            });
        }

        console.log(`[DIAGNOSTIC] Order found: ${order._id}`);

        // Prepare comprehensive diagnostic data
        const diagnostic = {
            // Basic Info
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            level: order.level,

            // Client Info
            client: {
                firstName: order.formData?.firstName,
                lastName: order.formData?.lastName,
                email: order.formData?.email || order.userEmail,
                birthDate: order.formData?.birthDate,
                birthPlace: order.formData?.birthPlace,
                birthTime: order.formData?.birthTime,
            },

            // Expert Validation
            expertValidation: {
                status: order.expertValidation?.validationStatus || null,
                validatorId: order.expertValidation?.validatorId || null,
                validatorName: order.expertValidation?.validatorName || null,
                validatedAt: order.expertValidation?.validatedAt || null,
                notes: order.expertValidation?.validationNotes || null,
            },

            // Generated Content Analysis
            generatedContent: {
                exists: !!order.generatedContent,
                hasArchetype: !!order.generatedContent?.archetype,
                archetypePreview: order.generatedContent?.archetype
                    ? order.generatedContent.archetype.substring(0, 100) + '...'
                    : null,
                hasReading: !!order.generatedContent?.reading,
                readingLength: order.generatedContent?.reading?.length || 0,

                // PDF URL - Critical for diagnosis
                hasPdfUrl: !!order.generatedContent?.pdfUrl,
                pdfUrl: order.generatedContent?.pdfUrl || null,

                // Audio URL
                hasAudioUrl: !!order.generatedContent?.audioUrl,
                audioUrl: order.generatedContent?.audioUrl || null,

                // Mandala SVG
                hasMandalaSvg: !!order.generatedContent?.mandalaSvg,
                mandalaSvgLength: order.generatedContent?.mandalaSvg?.length || 0,

                // Ritual
                hasRitual: !!order.generatedContent?.ritual,
                ritualPreview: order.generatedContent?.ritual
                    ? order.generatedContent.ritual.substring(0, 100) + '...'
                    : null,
            },

            // Timestamps
            timestamps: {
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                deliveredAt: order.deliveredAt || null,
                validatedAt: order.expertValidation?.validatedAt || null,
            },

            // Diagnosis
            diagnosis: {
                isPdfMissing: !order.generatedContent?.pdfUrl,
                isAudioMissing: !order.generatedContent?.audioUrl,
                isContentEmpty: !order.generatedContent,
                isValidatedButNotDelivered: order.expertValidation?.validationStatus === 'approved' && !order.deliveredAt,
                possibleCauses: [] as string[],
                recommendations: [] as string[],
            }
        };

        // Analyze and provide diagnostic insights
        if (!order.generatedContent) {
            diagnostic.diagnosis.possibleCauses.push(
                '❌ generatedContent is completely missing',
                '❌ n8n workflow callback was never executed',
                '❌ n8n callback was rejected (signature validation failure)',
                '❌ n8n workflow encountered an error before sending callback'
            );
            diagnostic.diagnosis.recommendations.push(
                '1. Check n8n workflow execution logs for this order',
                '2. Verify that the workflow reached the HTTP Request callback node',
                '3. Check if there were any signature validation errors in API logs',
                '4. Consider re-triggering the workflow manually for this order'
            );
        } else if (!order.generatedContent.pdfUrl) {
            diagnostic.diagnosis.possibleCauses.push(
                '⚠️ generatedContent exists but pdfUrl is missing',
                '⚠️ PDF generation step failed in the n8n workflow',
                '⚠️ PDF was not uploaded to S3/MinIO',
                '⚠️ pdfUrl was not included in the callback payload',
                '⚠️ Callback payload structure did not match expected format'
            );
            diagnostic.diagnosis.recommendations.push(
                '1. Check n8n workflow logs for PDF generation errors',
                '2. Verify the PDF exists in S3/MinIO storage',
                '3. Check if the callback payload included the pdfUrl field',
                '4. Review the n8n callback route to ensure pdfUrl extraction is correct',
                '5. Consider re-generating and re-uploading the PDF for this order'
            );
        } else {
            diagnostic.diagnosis.possibleCauses.push(
                '✅ All content appears to be present',
                'ℹ️ If the user still cannot see the PDF, the issue may be in the frontend or S3 access'
            );
            diagnostic.diagnosis.recommendations.push(
                '1. Verify the PDF URL is accessible (check S3/MinIO)',
                '2. Test the presigned URL generation in /api/users/files/presign',
                '3. Check frontend logic in Draws.tsx for PDF rendering',
                '4. Verify user authentication and order ownership'
            );
        }

        // Add warning if order is validated but content is missing
        if (order.expertValidation?.validationStatus === 'approved' && !order.generatedContent?.pdfUrl) {
            diagnostic.diagnosis.possibleCauses.push(
                '🚨 CRITICAL: Order is approved by expert but has no PDF!',
                '🚨 This should not happen - validation should only occur after content is generated'
            );
        }

        console.log(`[DIAGNOSTIC] Analysis complete for order ${order._id}`);
        console.log(`[DIAGNOSTIC] PDF Missing: ${diagnostic.diagnosis.isPdfMissing}`);

        res.json(diagnostic);

    } catch (error: any) {
        console.error('[DIAGNOSTIC] Error:', error);
        res.status(500).json({
            error: 'Diagnostic failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});

/**
 * Get statistics about orders with missing PDFs
 * GET /api/admin/diagnose/stats/missing-pdfs
 */
router.get('/diagnose/stats/missing-pdfs', authenticateExpert, async (req: any, res: any) => {
    try {
        console.log('[DIAGNOSTIC] Calculating missing PDF statistics...');

        const totalOrders = await Order.countDocuments({});
        const totalCompleted = await Order.countDocuments({ status: 'completed' });
        const completedApproved = await Order.countDocuments({
            status: 'completed',
            'expertValidation.validationStatus': 'approved'
        });

        const completedWithPdf = await Order.countDocuments({
            status: 'completed',
            'expertValidation.validationStatus': 'approved',
            'generatedContent.pdfUrl': { $exists: true, $ne: '' }
        });

        const completedWithoutPdf = completedApproved - completedWithPdf;

        // Find specific orders with missing PDFs
        const ordersWithoutPdf = await Order.find({
            status: 'completed',
            'expertValidation.validationStatus': 'approved',
            $or: [
                { 'generatedContent.pdfUrl': { $exists: false } },
                { 'generatedContent.pdfUrl': '' },
                { 'generatedContent.pdfUrl': null }
            ]
        })
            .select('_id orderNumber formData.firstName formData.email createdAt deliveredAt')
            .limit(20)
            .lean();

        const stats = {
            totals: {
                allOrders: totalOrders,
                completed: totalCompleted,
                completedAndApproved: completedApproved,
                withPdf: completedWithPdf,
                withoutPdf: completedWithoutPdf,
            },
            percentages: {
                completionRate: totalOrders > 0 ? ((totalCompleted / totalOrders) * 100).toFixed(2) : 0,
                approvalRate: totalCompleted > 0 ? ((completedApproved / totalCompleted) * 100).toFixed(2) : 0,
                pdfRate: completedApproved > 0 ? ((completedWithPdf / completedApproved) * 100).toFixed(2) : 0,
                missingPdfRate: completedApproved > 0 ? ((completedWithoutPdf / completedApproved) * 100).toFixed(2) : 0,
            },
            affectedOrders: ordersWithoutPdf.map(order => ({
                orderId: order._id,
                orderNumber: order.orderNumber,
                client: order.formData?.firstName || 'N/A',
                email: order.formData?.email || 'N/A',
                createdAt: order.createdAt,
                deliveredAt: order.deliveredAt,
            })),
            healthStatus: completedWithoutPdf === 0 ? 'HEALTHY' : completedWithoutPdf < 5 ? 'WARNING' : 'CRITICAL',
        };

        console.log(`[DIAGNOSTIC] Stats: ${completedWithoutPdf} orders missing PDFs out of ${completedApproved} approved`);

        res.json(stats);

    } catch (error: any) {
        console.error('[DIAGNOSTIC] Stats error:', error);
        res.status(500).json({
            error: 'Failed to calculate statistics',
            message: error.message
        });
    }
});

/**
 * List recent orders for quick inspection
 * GET /api/admin/diagnose/recent-orders?limit=10
 */
router.get('/diagnose/recent-orders', authenticateExpert, async (req: any, res: any) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

        console.log(`[DIAGNOSTIC] Fetching ${limit} most recent orders...`);

        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id orderNumber status formData.firstName formData.email expertValidation.validationStatus generatedContent.pdfUrl generatedContent.audioUrl createdAt deliveredAt')
            .lean();

        const orders = recentOrders.map(order => ({
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            client: order.formData?.firstName || 'N/A',
            email: order.formData?.email || 'N/A',
            validation: order.expertValidation?.validationStatus || null,
            hasPdf: !!order.generatedContent?.pdfUrl,
            hasAudio: !!order.generatedContent?.audioUrl,
            createdAt: order.createdAt,
            deliveredAt: order.deliveredAt || null,
        }));

        console.log(`[DIAGNOSTIC] Retrieved ${orders.length} recent orders`);

        res.json({ orders, count: orders.length });

    } catch (error: any) {
        console.error('[DIAGNOSTIC] Recent orders error:', error);
        res.status(500).json({
            error: 'Failed to fetch recent orders',
            message: error.message
        });
    }
});

export default router;
