import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentionsLegales: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mystical-dark text-white py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-mystical-gold hover:text-mystical-gold-light mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          
          <h1 className="font-playfair italic text-4xl md:text-5xl font-medium mb-4">
            <span className="bg-gradient-to-r from-mystical-gold to-mystical-amber bg-clip-text text-transparent">
              Mentions Légales
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-8 space-y-8">
            
            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Éditeur du site</h2>
              <div className="text-gray-300 space-y-2">
                <p><strong>Raison sociale :</strong> Oracle Lumira SARL</p>
                <p><strong>Siège social :</strong> [Adresse à compléter]</p>
                <p><strong>SIRET :</strong> [Numéro à compléter]</p>
                <p><strong>Email :</strong> contact@oraclelumira.com</p>
                <p><strong>Directeur de publication :</strong> [Nom à compléter]</p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Hébergement</h2>
              <div className="text-gray-300 space-y-2">
                <p><strong>Hébergeur :</strong> [Nom hébergeur]</p>
                <p><strong>Adresse :</strong> [Adresse hébergeur]</p>
                <p><strong>Téléphone :</strong> [Téléphone hébergeur]</p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Propriété intellectuelle</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  L'ensemble du contenu de ce site (textes, images, vidéos, animations, logos, etc.) 
                  est protégé par le droit d'auteur et appartient exclusivement à Oracle Lumira 
                  ou à ses partenaires.
                </p>
                <p>
                  Toute reproduction, distribution, modification, adaptation, retransmission ou 
                  publication de ces différents éléments est strictement interdite sans l'accord 
                  écrit préalable d'Oracle Lumira.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Protection des données personnelles</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD), 
                  Oracle Lumira s'engage à protéger la confidentialité de vos données personnelles.
                </p>
                <p>
                  Les données collectées via nos formulaires sont utilisées uniquement pour :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>La réalisation de vos lectures vibratoires personnalisées</li>
                  <li>L'envoi de vos commandes et fichiers</li>
                  <li>La gestion de votre espace client</li>
                  <li>L'amélioration de nos services</li>
                </ul>
                <p>
                  Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité 
                  et de limitation du traitement de vos données. Pour exercer ces droits, 
                  contactez-nous à : privacy@oraclelumira.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Cookies</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Ce site utilise des cookies techniques nécessaires au bon fonctionnement 
                  de l'application (navigation, panier, authentification).
                </p>
                <p>
                  Nous n'utilisons aucun cookie de tracking ou de publicité sans votre 
                  consentement explicite.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Limitation de responsabilité</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Les lectures proposées par Oracle Lumira sont des interprétations spirituelles 
                  et énergétiques à des fins de développement personnel et de bien-être.
                </p>
                <p>
                  Elles ne constituent en aucun cas :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Des consultations médicales, psychologiques ou thérapeutiques</li>
                  <li>Des conseils juridiques ou financiers</li>
                  <li>Des prédictions d'événements futurs garanties</li>
                </ul>
                <p>
                  Oracle Lumira ne saurait être tenue responsable des décisions prises par 
                  les utilisateurs suite à la consultation de nos services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Conditions de vente</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>Prix :</strong> Tous les prix sont indiqués en euros TTC.
                </p>
                <p>
                  <strong>Paiement :</strong> Paiements sécurisés via Stripe (CB, PayPal, etc.).
                </p>
                <p>
                  <strong>Livraison :</strong> Les lectures sont livrées sous 24-48h par email 
                  et dans votre espace client.
                </p>
                <p>
                  <strong>Droit de rétractation :</strong> Conformément à l'article L221-28 
                  du Code de la consommation, le droit de rétractation ne s'applique pas 
                  aux contenus numériques personnalisés fournis immédiatement.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair italic text-2xl text-mystical-gold mb-4">Contact</h2>
              <div className="text-gray-300 space-y-2">
                <p>Pour toute question concernant ces mentions légales :</p>
                <p><strong>Email :</strong> legal@oraclelumira.com</p>
                <p><strong>Adresse :</strong> [Adresse postale]</p>
              </div>
            </section>

            <div className="text-center text-sm text-gray-500 pt-8 border-t border-mystical-gold/20">
              <p>Dernière mise à jour : Décembre 2024</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MentionsLegales;
