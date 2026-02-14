"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
const auth_1 = require("../utils/auth");
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Missing or invalid token" });
            return;
        }
        const token = authHeader.substring(7);
        const payload = (0, auth_1.verifyToken)(token);
        if (!payload) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(500).json({ error: "Authentication error" });
    }
}
function adminMiddleware(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        res.status(403).json({ error: "Admin access required" });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map