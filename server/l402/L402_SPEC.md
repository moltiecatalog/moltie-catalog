# L402 Protocol Specification (Agentic Payments)

L402 is a protocol for paid APIs that uses the Lightning Network for payments and Macaroons for authentication (formerly known as LSAT).

## Core Flow (402 Payment Required)

1.  **Request:** Agent requests a resource.
2.  **Challenge (402):** Server responds with `402 Payment Required`.
    - `WWW-Authenticate: L402 macaroon="<macaroon>", invoice="<bolt11>"`
3.  **Payment:** Agent pays the Bolt11 invoice via Lightning.
4.  **Preimage:** Agent receives the `preimage` upon successful payment.
5.  **Authorized Request:** Agent retries the request with the proof of payment.
    - `Authorization: L402 <macaroon>:<preimage>`

## Implementation Plan for Moltie-Merchant

### 1. Macaroon Service
- Generate root macaroons for resources.
- Support caveats (expiration, rate-limiting, IP binding).

### 2. Invoice Generator (OpenNode / LND Proxy)
- Create bolt11 invoices on demand.
- Link invoice IDs to Macaroon IDs.

### 3. Verification Middleware
- Intercept incoming requests.
- Parse `Authorization` header.
- Validate Macaroon signature against root key.
- Verify `preimage` hashes to the payment_hash in the Macaroon/Invoice record.

## Technical Details

- **Token Format:** `L402 <base64_macaroon>:<hex_preimage>`
- **HTTP Header:** `WWW-Authenticate: L402 macaroon="...", invoice="..."`
- **MIME Type:** Typically `application/json` for errors.
