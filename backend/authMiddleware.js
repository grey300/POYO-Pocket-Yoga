import jwt from 'jsonwebtoken';

// Read lazily: ES module imports execute before server.js runs dotenv.config(),
// so reading process.env at import time would miss the .env value.
function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.warn('WARNING: JWT_SECRET is not set. Using an insecure development secret.');
        return 'dev_insecure_secret_change_me';
    }
    return secret;
}

export function signToken(user) {
    return jwt.sign(
        { id: user._id.toString(), role: user.role, email: user.email },
        getSecret(),
        { expiresIn: '7d' }
    );
}

// Verifies the Bearer token and attaches { id, role, email } to req.user.
export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
        req.user = jwt.verify(token, getSecret());
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

// Must run after requireAuth.
export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}
