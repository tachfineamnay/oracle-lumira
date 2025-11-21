/**
 * Script de diagnostic MongoDB - Version Production
 * USAGE: npm run diagnose:order
 */

const mongoose = require('mongoose');

// URI fournie par l'utilisateur (production Coolify)
const MONGODB_URI = "mongodb://lumira_root:Lumira2025L@c4kcoss04wgo80c4wow8k4w4:27017/lumira?authSource=admin&directConnection=true";

console.log('🔍 Diagnostic MongoDB - Commande tachfine (PRODUCTION)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Schéma Order
const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });
const Order = mongoose.model('Order', orderSchema);

async function main() {
    try {
        console.log('🔌 Connexion à MongoDB (production Coolify)...');
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
                const pdfPreview = order.generatedContent.pdfUrl.length > 60
                    ? order.generatedContent.pdfUrl.substring(0, 60) + '...'
                    : order.generatedContent.pdfUrl;
                console.log(`│  🔗 PDF: ${pdfPreview}`);
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
                console.log(`\n📄 PDF URL: ${gc.pdfUrl ? '✅ ' + gc.pdfUrl : '❌❌ MANQUANT - CAUSE DU PROBLÈME!'}`);
                console.log(`🎵 Audio URL: ${gc.audioUrl ? '✅ ' + gc.audioUrl : '❌ Manquant'}`);
                console.log(`🎨 Mandala SVG: ${gc.mandalaSvg ? '✅ ' + gc.mandalaSvg : '❌ Manquant'}`);
                console.log(`✨ Rituel: ${gc.ritual ? '✅ Présent' : '❌ Manquant'}`);

                if (!gc.pdfUrl) {
                    console.log('\n🚨🚨🚨 DIAGNOSTIC - PDF MANQU ANT 🚨🚨🚨');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('Le pdfUrl est MANQUANT dans generatedContent!');
                    console.log('\nCauses possibles:');
                    console.log('  1. ❌ Le callback n8n n\'a pas envoyé le pdfUrl');
                    console.log('  2. ❌ Le PDF n\'a pas été généré par le workflow n8n');
                    console.log('  3. ❌ Le callback a échoué ou a été rejeté (signature invalide?)');
                    console.log('  4. ❌ Le PDF a été généré mais l\'URL n\'a pas été transmise');
                    console.log('\nActions requises:');
                    console.log('  • Vérifier les logs du workflow n8n pour cet order');
                    console.log('  • Vérifier que le callback a bien été appelé');
                    console.log('  • Vérifier que le PDF existe dans S3/MinIO');
                    console.log('  • Re-déclencher le workflow si nécessaire');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                }
            } else {
                console.log('❌❌ generatedContent est complètement vide!');
                console.log('\n🚨 DIAGNOSTIC CRITIQUE:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('Aucun generatedContent trouvé - le workflow n8n n\'a jamais');
                console.log('renvoyé de callback ou le callback a été rejeté.');
                console.log('La commande a été validée par l\'expert SANS contenu généré!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            }
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

        console.log(`Total de toutes les orders: ${totalOrders}`);
        console.log(`Orders completed (tous statuts): ${totalCompleted}`);
        console.log(`Orders completed + approved: ${completedApproved}`);
        console.log(`  ✅ Avec PDF: ${completedWithPdf}`);
        console.log(`  ❌ Sans PDF: ${completedWithoutPdf}`);

        if (completedWithoutPdf > 0) {
            console.log('\n⚠️  PROBLÈME SYSTÉMIQUE DÉTECTÉ!');
            console.log(`   ${completedWithoutPdf} order(s) validée(s) SANS PDF!`);
            console.log('   Le problème affecte potentiellement plusieurs clients.');
        }

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\nStack:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔌 Déconnecté de MongoDB\n');
    }
}

main();
