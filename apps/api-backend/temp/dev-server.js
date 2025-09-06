"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Serveur de développement simple pour l'expert desk
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var expert_test_1 = require("./routes/expert-test");
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Routes
app.use('/api/expert', expert_test_1.default);
// Route de santé
app.get('/api/health', function (req, res) {
    res.json({
        status: 'OK',
        message: 'Expert Desk API Test Server',
        timestamp: new Date().toISOString()
    });
});
// Démarrage du serveur
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Expert Desk Test Server running on port ".concat(PORT));
    console.log("\uD83D\uDCE1 API disponible sur http://localhost:".concat(PORT));
    console.log("\uD83D\uDD10 Route de connexion: POST http://localhost:".concat(PORT, "/api/expert/login"));
    console.log("\uD83D\uDCCB Route des commandes: GET http://localhost:".concat(PORT, "/api/expert/orders/pending"));
});
exports.default = app;
