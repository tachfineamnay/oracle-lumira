
// Chercher les orders récents
console.log('📋 Recherche des orders récents...');
const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

console.log(`\n📊 ${recentOrders.length} orders trouvées récentes:\n`);

for (const order of recentOrders) {
    const firstName = order.formData?.firstName || 'N/A';
    const email = order.formData?.email || order.userEmail || 'N/A';
    const status = order.status || 'N/A';
    const validationStatus = order.expertValidation?.validationStatus || 'N/A';
    const hasPdf = !!order.generatedContent?.pdfUrl;
    const hasAudio = !!order.generatedContent?.audioUrl;

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📅 Créé le: ${new Date(order.createdAt).toLocaleString('fr-FR')}`);
    console.log(`👤 Client: ${firstName} (${email})`);
    console.log(`🔢 Order ID: ${order._id}`);
    console.log(`📋 Order Number: ${order.orderNumber || 'N/A'}`);
    console.log(`📊 Status: ${status}`);
    console.log(`✅ Validation: ${validationStatus}`);
    console.log(`📄 PDF: ${hasPdf ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`🎵 Audio: ${hasAudio ? '✅ Présent' : '❌ Manquant'}`);

    if (hasPdf) {
        console.log(`🔗 PDF URL: ${order.generatedContent.pdfUrl}`);
    }

    if (order.deliveredAt) {
        console.log(`🚚 Livré le: ${new Date(order.deliveredAt).toLocaleString('fr-FR')}`);
    }

    console.log('');
}

// Chercher spécifiquement tachfine
console.log('\n\n🎯 Recherche spécifique de "tachfine"...\n');

const tachfineOrders = await Order.find({
    $or: [
        { 'formData.firstName': /tachfine/i },
        { 'formData.lastName': /tachfine/i },
        { 'formData.email': /tachfine/i },
    ]
}).lean();

if (tachfineOrders.length === 0) {
    console.log('❌ Aucune commande trouvée pour "tachfine"');
} else {
    console.log(`✅ ${tachfineOrders.length} commande(s) trouvée(s) pour "tachfine":\n`);

    for (const order of tachfineOrders) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 DÉTAILS COMPLETS DE LA COMMANDE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(JSON.stringify(order, null, 2));
        console.log('\n');

        // Analyser le contenu généré
        if (order.generatedContent) {
            console.log('📝 CONTENU GÉNÉRÉ:');
            console.log(`  - archetype: ${order.generatedContent.archetype ? '✅' : '❌'}`);
            console.log(`  - reading: ${order.generatedContent.reading ? '✅ (${order.generatedContent.reading.substring(0, 50)}...)' : '❌'}`);
            console.log(`  - pdfUrl: ${order.generatedContent.pdfUrl || '❌ MANQUANT'}`);
            console.log(`  - audioUrl: ${order.generatedContent.audioUrl || '❌ MANQUANT'}`);
            console.log(`  - mandalaSvg: ${order.generatedContent.mandalaSvg || '❌ MANQUANT'}`);
            console.log(`  - ritual: ${order.generatedContent.ritual ? '✅' : '❌'}`);
        } else {
            console.log('❌ generatedContent est vide ou inexistant');
        }

        console.log('\n');
    }
}

// Statistiques globales
console.log('\n\n📊 STATISTIQUES GLOBALES:\n');

const stats = await Order.aggregate([
    {
        $group: {
            _id: '$status',
            count: { $sum: 1 }
        }
    },
    {
        $sort: { count: -1 }
    }
]);

console.log('Répartition par status:');
for (const stat of stats) {
    console.log(`  - ${stat._id}: ${stat.count}`);
}

const completedWithPdf = await Order.countDocuments({
    status: 'completed',
    'generatedContent.pdfUrl': { $exists: true, $ne: '' }
});

const completedWithoutPdf = await Order.countDocuments({
    status: 'completed',
    $or: [
        { 'generatedContent.pdfUrl': { $exists: false } },
        { 'generatedContent.pdfUrl': '' },
        { 'generatedContent.pdfUrl': null }
    ]
});

console.log(`\n✅ Orders completed avec PDF: ${completedWithPdf}`);
console.log(`❌ Orders completed SANS PDF: ${completedWithoutPdf}`);

    } catch (error) {
    console.error('❌ Erreur:', error);
} finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
}
}

diagnose();
