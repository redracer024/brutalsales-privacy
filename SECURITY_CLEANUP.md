# Security Cleanup for Production Release

## 🚨 Critical Security Issues Found

### Files with Hardcoded Credentials (MUST BE REMOVED):

1. **test-verify-purchase.ts**
   - Contains: Supabase service role key
   - Action: Delete file or move credentials to environment variables

2. **test-terms.js**
   - Contains: Supabase service role key
   - Action: Delete file or move credentials to environment variables

3. **test-supabase.ts**
   - Contains: Supabase service role key
   - Action: Delete file or move credentials to environment variables

4. **get-test-token.ts**
   - Contains: Supabase service role key
   - Action: Delete file or move credentials to environment variables

5. **scripts/voting-performance.test.ts**
   - Contains: Supabase anon and service role keys
   - Action: Delete file or move credentials to environment variables

6. **generate-test-token.ts**
   - Contains: JWT secret
   - Action: Delete file or move to secure environment

## 🔧 Quick Cleanup Commands

```bash
# Option 1: Delete all test files with hardcoded credentials
rm test-verify-purchase.ts
rm test-terms.js
rm test-supabase.ts
rm get-test-token.ts
rm generate-test-token.ts
rm scripts/voting-performance.test.ts

# Option 2: Move to a test folder and add to .gitignore
mkdir -p __tests__/local-only
mv test-*.ts __tests__/local-only/
mv test-*.js __tests__/local-only/
mv get-test-token.ts __tests__/local-only/
mv generate-test-token.ts __tests__/local-only/
echo "__tests__/local-only/" >> .gitignore
```

## 📝 Additional Security Checks

### 1. Environment Variables
- [ ] Ensure `.env` is in `.gitignore` ✅ (Already done)
- [ ] Create `.env.example` with placeholder values
- [ ] Remove any `.env` from git history if accidentally committed

### 2. API Keys in Code
- [ ] Search for hardcoded API keys:
  ```bash
  grep -r "sk-" --include="*.ts" --include="*.tsx" --include="*.js"
  grep -r "AIzaSy" --include="*.ts" --include="*.tsx" --include="*.js"
  ```

### 3. Service Account Files
- [ ] Ensure `google-play-service-account.json` is in `.gitignore`
- [ ] Never commit service account keys

### 4. Firebase Configuration
- [ ] `google-services.json` can be committed (it's not secret)
- [ ] `GoogleService-Info.plist` can be committed (it's not secret)

## 🛡️ Production Security Best Practices

### 1. Use Environment Variables
```typescript
// BAD
const API_KEY = "sk-1234567890";

// GOOD
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
```

### 2. Validate Environment on Startup
```typescript
// Add to your app initialization
const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_DEEPSEEK_API_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 3. Use Different Keys for Different Environments
- Development: Use test/sandbox keys
- Staging: Use staging keys with limited permissions
- Production: Use production keys with strict permissions

### 4. Implement Key Rotation
- Plan to rotate API keys every 90 days
- Use Supabase's key rotation feature
- Update mobile apps through forced updates if needed

## ⚠️ Pre-Release Security Checklist

- [ ] All test files with hardcoded credentials removed
- [ ] No API keys in source code
- [ ] Environment variables properly configured
- [ ] Service account files not in repository
- [ ] Git history cleaned if needed
- [ ] Security headers configured for web version
- [ ] API rate limiting implemented
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include sensitive data
- [ ] HTTPS enforced everywhere

## 🔐 Supabase Security Configuration

1. **Row Level Security (RLS)**
   ```sql
   -- Example: Users can only see their own data
   CREATE POLICY "Users can view own data" ON user_terms
   FOR SELECT USING (auth.uid() = user_id);
   ```

2. **API Key Permissions**
   - Anon key: Public, safe to expose
   - Service role key: NEVER expose, server-side only

3. **Database Backups**
   - Enable automatic backups in Supabase dashboard
   - Test restore procedure

## 🚀 Final Steps

1. Run security audit:
   ```bash
   npm audit
   ```

2. Check for exposed secrets:
   ```bash
   # Install gitleaks
   brew install gitleaks
   
   # Run scan
   gitleaks detect --source . -v
   ```

3. Set up monitoring:
   - Enable Supabase audit logs
   - Set up alerts for suspicious activity
   - Monitor API usage patterns

Remember: **Never commit secrets to version control!**