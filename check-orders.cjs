/**
 * Script de diagnostic MongoDB simplifié
 * 
 * Usage:
 *   Copier MONGODB_URI depuis .env et exécuter:
 *   $env:MONGODB_URI="mongodb://..."; node check-orders.cjs
 */

const mongoose = require('mongoose');

// URI MongoDB - à définir depuis les variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Diagnostic MongoDB - Orders');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non défini');
    console.error('\n💡 Pour Windows PowerShell:');
    console.error('   $env:MONGODB_URI="votre_uri_mongodb"; node check-orders.cjs\n');
    console.error('💡 Ou récupérez l\'URI depuis .env et relancez le script');
    process.exit(1);
}

// Schéma simple pour les orders
const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });
const Order = mongoose.model('Order', orderSchema);

async function main() {
    try {
        console.log('🔌 Connexion à MongoDB...\n');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté!\n');

        // Chercher les 5 orders les plus récentes
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        console.log(`📋 Les ${recentOrders.length} commandes les plus récentes:\n`);

        for (const order of recentOrders) {
            const client = order.formData?.firstName || 'N/A';
            const status = order.status || 'N/A';
            const validation = order.expertValidation?.validationStatus || 'N/A';
            const hasPdf = !!order.generatedContent?.pdfUrl;

            console.log(`┌─ Order ${order.orderNumber || order._id.toString().substring(0, 8)}`);
            console.log(`│  👤 Client: ${client}`);
            console.log(`│  📊 Status: ${status}`);
            console.log(`│  ✅ Validation: ${validation}`);
            console.log(`│  📄 PDF: ${hasPdf ? '✅ Oui' : '❌ Non'}`);
            if (hasPdf) {
                console.log(`│  🔗 ${order.generatedContent.pdfUrl}`);
            }
            console.log(`└─`);
            console.log('');
        }

        // Chercher "tachfine"
        console.log('\n🎯 Recherche de "tachfine"...\n');

        const tachfineOrder = await Order.findOne({
            $or: [
                { 'formData.firstName': /tachfine/i },
                { 'formData.email': /tachfine/i }
            ]
        }).lean();

        if (!tachfineOrder) {
            console.log('❌ Aucune commande trouvée pour "tachfine"\n');
        } else {
            console.log('✅ Commande trouvée!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📦 DÉTAILS COMPLETS:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log(JSON.stringify(tachfineOrder, null, 2));
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            // Analyser le contenu
            if (tachfineOrder.generatedContent) {
                console.log('📝 Contenu généré:');
                console.log(`   PDF: ${tachfineOrder.generatedContent.pdfUrl || '❌ MANQUANT'}`);
                console.log(`   Audio: ${tachfineOrder.generatedContent.audioUrl || '❌ MANQUANT'}`);
                console.log(`   Mandala: ${tachfineOrder.generatedContent.mandalaSvg || '❌ MANQUANT'}`);
            } else {
                console.log('❌ generatedContent vide!');
            }
        }

        // Stats globales
        console.log('\n\n📊 STATISTIQUES:\n');

        const totalCompleted = await Order.countDocuments({ status: 'completed' });
        const completedWithPdf = await Order.countDocuments({
            status: 'completed',
            'generatedContent.pdfUrl': { $exists: true, $ne: '' }
        });
        const completedWithoutPdf = totalCompleted - completedWithPdf;

        console.log(`Total orders completed: ${totalCompleted}`);
        console.log(`  ✅ Avec PDF: ${completedWithPdf}`);
        console.log(`  ❌ Sans PDF: ${completedWithoutPdf}`);

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\nDétails:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Déconnecté\n');
    }
}

main();
