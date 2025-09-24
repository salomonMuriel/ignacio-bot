# Auth0 Configuration Guide

## Frontend Authentication Status: ✅ OPERATIONAL

### Current Implementation
- **Framework**: @auth0/auth0-react v2.5.0
- **Architecture**: SPA (Single Page Application)
- **Token Flow**: JWT with silent refresh
- **Integration**: Full API client integration with Bearer tokens

### Required Auth0 Dashboard Configuration

#### Application Settings
1. **Application Type**: Single Page Application (SPA)
2. **Allowed Callback URLs**: `http://localhost:3000`
3. **Allowed Logout URLs**: `http://localhost:3000`
4. **Allowed Web Origins**: `http://localhost:3000`
5. **Allowed Origins (CORS)**: `http://localhost:3000`

#### API Configuration
1. Create API in Auth0 Dashboard
2. Set **Identifier** (e.g., `https://api.ignacio.com`)
3. Enable RBAC if using role-based access
4. Configure scopes as needed

### Environment Variables
```env
# frontend/.env.local
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
```

### Custom Claims (Optional)
For admin role detection, add custom claim in Auth0 Rules/Actions:
```javascript
// Rule/Action for custom claims
function (user, context, callback) {
  context.idToken['https://app.ignacio.com/roles'] = user.app_metadata.roles;
  callback(null, user, context);
}
```

### Troubleshooting
- **"Service not found"**: Update VITE_AUTH0_AUDIENCE to match actual API identifier
- **CORS errors**: Verify Allowed Origins in Auth0 dashboard
- **Login loops**: Check callback URLs match exactly