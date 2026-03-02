const { CdpClient } = require("@coinbase/cdp-sdk");
const fs = require('fs');

const key_id = "organizations/a63023d8-85e0-47fd-bd81-0aeeb5857959/apiKeys/0135f580-16b8-4897-9d01-7bd034c2beae";
const key_secret = "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIMUkjZLeMfAX+7iaSc2P4w7nxsfClaVtZYYMRJB6m6FIoAoGCCqGSM49\nAwEHoUQDQgAE4Cn50Sd3eEVd0LRAI2mwiG9KZxFAYE4T+zUTJjlhcgD84wlvyFrQ\n08lWV/4jwjzR/0G/i0c0v8i5u22oYIQ4ug==\n-----END EC PRIVATE KEY-----\n";
const wallet_secret = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgN2P5Jn0iOOXFUjdP8rmhdcwbEVclPCav6d9cVMP6YI2hRANCAATYUm4IY7RB8nQ4Yu1WUopRoLpi4EhpKjCMAraSbFLdQIAfKoMJjW1kZ+lLmHyi29hsguPfrVkZeIuMMLb8lnsi";

const client = new CdpClient({
    apiKeyId: key_id,
    apiKeySecret: key_secret,
    walletSecret: wallet_secret
});

async function processSale(referralId, amountCents) {
    const commissionPercentage = 0.10; // 10%
    const commissionAmount = (amountCents * commissionPercentage) / 100;
    
    console.log(`🛒 Processing Sale | Amount: $${amountCents/100} | Commission: $${commissionAmount} | Agent: ${referralId}`);

    if (referralId && referralId.startsWith('0x')) {
        try {
            console.log(`🚀 Payout Initiated: Sending ${commissionAmount} USDC to ${referralId} on Base...`);
            
            // In SDK v2, we use the server-side account directly
            const account = await client.evm.getAccount("0x1CD1F4eD8D9EAB34DF0a7BbCa1643620d7FFeF7B");
            
            // Note: Since this is a server-side account, Coinbase handles the signing using the walletSecret we provided to the client
            const transfer = await account.transfer({
                amount: commissionAmount,
                assetId: "usdc",
                destination: referralId,
            });

            console.log(`✅ Payout Submitted! Hash: ${transfer.transactionHash}`);
        } catch (err) {
            console.error(`❌ Payout Error: ${err.message}`);
        }
    } else {
        console.log(`ℹ️ No valid referral address (referral_id: ${referralId}). Skipping payout.`);
    }
}

module.exports = { processSale };
