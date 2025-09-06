"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var testData_1 = require("../data/testData");
var router = express_1.default.Router();
// Middleware d'authentification pour les experts
var authenticateExpert = function (req, res, next) {
    var authHeader = req.headers.authorization;
    var token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }
    try {
        var decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.expert = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token invalide' });
    }
};
// POST /api/expert/login - Connexion expert
router.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email_1, password, expert, validPasswords, token, _, expertWithoutPassword;
    return __generator(this, function (_b) {
        try {
            _a = req.body, email_1 = _a.email, password = _a.password;
            if (!email_1 || !password) {
                return [2 /*return*/, res.status(400).json({ error: 'Email et mot de passe requis' })];
            }
            console.log('🔐 Tentative de connexion:', { email: email_1, password: password });
            expert = testData_1.testExperts.find(function (e) { return e.email === email_1; });
            if (!expert) {
                console.log('❌ Expert non trouvé:', email_1);
                return [2 /*return*/, res.status(401).json({ error: 'Identifiants incorrects' })];
            }
            validPasswords = ['maya123', 'sophia123'];
            if (!validPasswords.includes(password)) {
                console.log('❌ Mot de passe incorrect:', password);
                return [2 /*return*/, res.status(401).json({ error: 'Identifiants incorrects' })];
            }
            console.log('✅ Connexion réussie pour:', expert.name);
            token = jsonwebtoken_1.default.sign({
                id: expert._id,
                email: expert.email,
                name: expert.name
            }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
            _ = expert.password, expertWithoutPassword = __rest(expert, ["password"]);
            res.json({
                message: 'Connexion réussie',
                expert: expertWithoutPassword,
                token: token
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        return [2 /*return*/];
    });
}); });
// GET /api/expert/orders/pending - Récupérer les commandes en attente
router.get('/orders/pending', authenticateExpert, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var pendingOrders;
    var _a;
    return __generator(this, function (_b) {
        try {
            console.log('📋 Récupération des commandes en attente pour:', (_a = req.expert) === null || _a === void 0 ? void 0 : _a.name);
            pendingOrders = testData_1.testOrders.filter(function (order) { return order.status === 'paid' && !order.assignedExpert; });
            console.log("\u2705 ".concat(pendingOrders.length, " commandes en attente trouv\u00E9es"));
            res.json({
                orders: pendingOrders,
                total: pendingOrders.length
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération des commandes:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
        }
        return [2 /*return*/];
    });
}); });
// GET /api/expert/orders/assigned - Récupérer les commandes assignées à l'expert
router.get('/orders/assigned', authenticateExpert, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var assignedOrders;
    var _a;
    return __generator(this, function (_b) {
        try {
            console.log('📋 Récupération des commandes assignées pour:', (_a = req.expert) === null || _a === void 0 ? void 0 : _a.name);
            assignedOrders = testData_1.testOrders.filter(function (order) { var _a; return order.assignedExpert === ((_a = req.expert) === null || _a === void 0 ? void 0 : _a.id); });
            console.log("\u2705 ".concat(assignedOrders.length, " commandes assign\u00E9es trouv\u00E9es"));
            res.json({
                orders: assignedOrders,
                total: assignedOrders.length
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération des commandes assignées:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des commandes assignées' });
        }
        return [2 /*return*/];
    });
}); });
// POST /api/expert/orders/:id/assign - Prendre en charge une commande
router.post('/orders/:id/assign', authenticateExpert, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, orderIndex, order;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        try {
            id_1 = req.params.id;
            console.log('🎯 Assignation de la commande:', id_1, 'à l\'expert:', (_a = req.expert) === null || _a === void 0 ? void 0 : _a.name);
            orderIndex = testData_1.testOrders.findIndex(function (order) { return order._id === id_1; });
            if (orderIndex === -1) {
                console.log('❌ Commande non trouvée:', id_1);
                return [2 /*return*/, res.status(404).json({ error: 'Commande non trouvée' })];
            }
            order = testData_1.testOrders[orderIndex];
            if (order.status !== 'paid') {
                console.log('❌ Commande non payée:', order.status);
                return [2 /*return*/, res.status(400).json({ error: 'Cette commande ne peut pas être prise en charge' })];
            }
            if (order.assignedExpert) {
                console.log('❌ Commande déjà assignée:', order.assignedExpert);
                return [2 /*return*/, res.status(400).json({ error: 'Cette commande est déjà assignée' })];
            }
            // Simuler l'assignation
            testData_1.testOrders[orderIndex] = __assign(__assign({}, order), { status: 'processing', assignedExpert: (_b = req.expert) === null || _b === void 0 ? void 0 : _b.id, assignedAt: new Date(), updatedAt: new Date() });
            console.log('✅ Commande assignée avec succès à:', (_c = req.expert) === null || _c === void 0 ? void 0 : _c.name);
            res.json({
                message: 'Commande prise en charge avec succès',
                order: testData_1.testOrders[orderIndex]
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de l\'assignation de la commande:', error);
            res.status(500).json({ error: 'Erreur lors de l\'assignation de la commande' });
        }
        return [2 /*return*/];
    });
}); });
// GET /api/expert/profile - Récupérer le profil de l'expert connecté
router.get('/profile', authenticateExpert, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var expert, _, expertWithoutPassword;
    var _a, _b;
    return __generator(this, function (_c) {
        try {
            console.log('👤 Récupération du profil pour:', (_a = req.expert) === null || _a === void 0 ? void 0 : _a.name);
            expert = testData_1.testExperts.find(function (e) { var _a; return e._id === ((_a = req.expert) === null || _a === void 0 ? void 0 : _a.id); });
            if (!expert) {
                console.log('❌ Expert non trouvé:', (_b = req.expert) === null || _b === void 0 ? void 0 : _b.id);
                return [2 /*return*/, res.status(404).json({ error: 'Expert non trouvé' })];
            }
            _ = expert.password, expertWithoutPassword = __rest(expert, ["password"]);
            console.log('✅ Profil récupéré pour:', expert.name);
            res.json({
                expert: expertWithoutPassword
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération du profil:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
        }
        return [2 /*return*/];
    });
}); });
// GET /api/expert/stats - Récupérer les statistiques de l'expert
router.get('/stats', authenticateExpert, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        try {
            console.log('📊 Récupération des statistiques pour:', (_a = req.expert) === null || _a === void 0 ? void 0 : _a.name);
            res.json(testData_1.testStats);
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
        }
        return [2 /*return*/];
    });
}); });
exports.default = router;
