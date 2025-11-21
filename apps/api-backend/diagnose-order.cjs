/**
 * Script de diagnostic MongoDB pour vérifier la commande tachfine
 * 
 * Usage depuis le répertoire api-backend:
 *   cd apps/api-backend
 *   node diagnose-order.cjs
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Diagnostic MongoDB - Commande tachfine');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`📍 .env path: ${path.join(__dirname, '../../.env')}`);
console.log(`🔗 MONGODB_URI: ${MONGODB_URI ? 'Chargé (' + MONGODB_URI.substring(0, 30) + '...)' : '❌ NON DÉFINI'}\n`);

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non défini dans .env');
    process.exit(1);
}

// Schéma Order simplifié
const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });
const Order = mongoose.model('Order', orderSchema);

async function main() {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté!\n');

        // 1. Les 5 orders les plus récentes
        console.log('📋 Les 5 commandes les plus récentes:\n');

        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        for (const order of recentOrders) {
            const client = order.formData?.firstName || order.formData?.email || 'N/A';
            const status = order.status || 'N/A';
            const validation = order.expertValidation?.validationStatus || 'N/A';
            const hasPdf = !!order.generatedContent?.pdfUrl;
            const hasAudio = !!order.generatedContent?.audioUrl;
            const date = order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : 'N/A';

            console.log(`┌─ 📦 Order: ${order.orderNumber || order._id.toString().substring(0, 8)}...`);
            console.log(`│  📅 Créé: ${date}`);
            console.log(`│  👤 Client: ${client}`);
            console.log(`│  📊 Status: ${status}`);
            console.log(`│  ✅ Validation: ${validation}`);
            console.log(`│  📄 PDF: ${hasPdf ? '✅ Présent' : '❌ Manquant'}`);
            console.log(`│  🎵 Audio: ${hasAudio ? '✅ Présent' : '❌ Manquant'}`);

            if (hasPdf) {
                console.log(`│  🔗 PDF: ${order.generatedContent.pdfUrl.substring(0, 60)}...`);
            }
            if (order.deliveredAt) {
                console.log(`│  🚚 Livré: ${new Date(order.deliveredAt).toLocaleString('fr-FR')}`);
            }
            console.log(`└─\n`);
        }

        // 2. Chercher spécifiquement "tachfine"
        console.log('\n🎯 Recherche spécifique de "tachfine"...\n');

        const tachfineOrder = await Order.findOne({
            $or: [
                { 'formData.firstName': /tachfine/i },
                { 'formData.lastName': /tachfine/i },
                { 'formData.email': /tachfine/i },
            ]
        }).lean();

        if (!tachfineOrder) {
            console.log('❌ Aucune commande trouvée pour "tachfine"');
            console.log('💡 Vérifiez que le nom est bien orthographié dans le formData\n');
        } else {
            console.log('✅ Commande "tachfine" trouvée!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📦 INFORMATIONS PRINCIPALES:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            console.log(`🆔 Order ID: ${tachfineOrder._id}`);
            console.log(`📋 Order Number: ${tachfineOrder.orderNumber || 'N/A'}`);
            console.log(`📊 Status: ${tachfineOrder.status}`);
            console.log(`👤 Client: ${tachfineOrder.formData?.firstName} ${tachfineOrder.formData?.lastName || ''}`);
            console.log(`📧 Email: ${tachfineOrder.formData?.email || tachfineOrder.userEmail || 'N/A'}`);
            console.log(`🎚️ Niveau: ${tachfineOrder.level || 'N/A'}`);
            console.log(`📅 Créé le: ${tachfineOrder.createdAt ? new Date(tachfineOrder.createdAt).toLocaleString('fr-FR') : 'N/A'}`);

            if (tachfineOrder.deliveredAt) {
                console.log(`🚚 Livré le: ${new Date(tachfineOrder.deliveredAt).toLocaleString('fr-FR')}`);
            } else {
                console.log(`🚚 Livré le: ❌ Pas encore livré`);
            }

            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ VALIDATION EXPERT:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            if (tachfineOrder.expertValidation) {
                console.log(`Status: ${tachfineOrder.expertValidation.validationStatus || 'N/A'}`);
                console.log(`Validé par: ${tachfineOrder.expertValidation.validatorName || 'N/A'}`);
                if (tachfineOrder.expertValidation.validatedAt) {
                    console.log(`Validé le: ${new Date(tachfineOrder.expertValidation.validatedAt).toLocaleString('fr-FR')}`);
                }
                console.log(`Notes: ${tachfineOrder.expertValidation.validationNotes || 'N/A'}`);
            } else {
                console.log('❌ Aucune validation expert');
            }

            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📝 CONTENU GÉNÉRÉ:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            if (tachfineOrder.generatedContent) {
                const gc = tachfineOrder.generatedContent;

                console.log(`Archétype: ${gc.archetype ? '✅ ' + gc.archetype.substring(0, 50) : '❌ Manquant'}`);
                console.log(`Lecture texte: ${gc.reading ? '✅ Présent (' + gc.reading.length + ' caractères)' : '❌ Manquant'}`);
                console.log(`\nPDF URL: ${gc.pdfUrl ? '✅ ' + gc.pdfUrl : '❌ MANQUANT - PROBLÈME ICI!'}`);
                console.log(`Audio URL: ${gc.audioUrl ? '✅ ' + gc.audioUrl : '❌ Manquant'}`);
                console.log(`Mandala SVG: ${gc.mandalaSvg ? '✅ ' + gc.mandalaSvg : '❌ Manquant'}`);
                console.log(`Rituel: ${gc.ritual ? '✅ Présent' : '❌ Manquant'}`);

                if (!gc.pdfUrl) {
                    console.log('\n⚠️  DIAGNOSTIC: Le pdfUrl est manquant dans generatedContent!');
                    console.log('   Cela signifie que:');
                    console.log('   1. Le callback n8n n\'a pas envoyé le pdfUrl');
                    console.log('   2. OU le PDF n\'a pas été généré par n8n');
                    console.log('   3. OU il y a eu une erreur lors du callback');
                }
            } else {
                console.log('❌ generatedContent est complètement vide!');
                console.log('\n⚠️  DIAGNOSTIC: Aucun contenu généré trouvé!');
                console.log('   Le workflow n8n n\'a probablement pas renvoyé de callback');
            }

            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔍 DONNÉES COMPLÈTES (JSON):');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log(JSON.stringify(tachfineOrder, null, 2));
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }

        // 3. Statistiques globales
        console.log('\n📊 STATISTIQUES GLOBALES:\n');

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

        console.log(`Total orders: ${totalOrders}`);
        console.log(`Orders completed: ${totalCompleted}`);
        console.log(`Orders completed + approved: ${completedApproved}`);
        console.log(`  ✅ Avec PDF: ${completedWithPdf}`);
        console.log(`  ❌ Sans PDF: ${completedWithoutPdf}`);

        if (completedWithoutPdf > 0) {
            console.log('\n⚠️  Il y a des orders validées SANS PDF!');
            console.log(`   Nombre affecté: ${completedWithoutPdf}`);
        }

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\nStack:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Déconnecté de MongoDB\n');
    }
}

main();
