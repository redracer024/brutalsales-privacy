import { SignJWT } from 'https://deno.land/x/jose@v4.15.4/index.ts';

const JWT_SECRET = "o5JFPeNoNcYCdDKxjXFAkf2rIOqeooNaNJVh9Dd+CGGXDrnpkaOJsoZl/4ukKoWYpyEVPQJ627Sfa5M58rPUTQ==";

async function generateToken() {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ sub: 'test-user-id' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
    
  console.log('Test JWT Token:', token);
}

generateToken(); 