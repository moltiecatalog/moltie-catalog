const crypto = require('crypto');

/**
 * L402 Helper Library for Moltie-Merchant
 */

class L402 {
    /**
     * Create a 402 Challenge header
     * @param {string} macaroon - Base64 encoded macaroon
     * @param {string} invoice - BOLT11 invoice
     */
    static createChallenge(macaroon, invoice) {
        return `L402 macaroon="${macaroon}", invoice="${invoice}"`;
    }

    /**
     * Parse Authorization header
     * @param {string} authHeader - The 'Authorization' header string
     * @returns {{macaroon: string, preimage: string} | null}
     */
    static parseAuth(authHeader) {
        if (!authHeader || !authHeader.startsWith('L402 ')) return null;
        const credentials = authHeader.split(' ')[1];
        const [macaroon, preimage] = credentials.split(':');
        return { macaroon, preimage };
    }

    /**
     * Verify a preimage against a payment hash
     * @param {string} preimage - Hex encoded preimage
     * @param {string} paymentHash - Hex encoded payment hash
     */
    static verifyPayment(preimage, paymentHash) {
        const hash = crypto.createHash('sha256')
            .update(Buffer.from(preimage, 'hex'))
            .digest('hex');
        return hash === paymentHash;
    }
}

module.exports = L402;
