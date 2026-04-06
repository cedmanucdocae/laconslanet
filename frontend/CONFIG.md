# Frontend Configuration

## Setup Instructions

1. Copy `config.js` to your project
2. Update the `API_BASE_URL` value for your environment:

```javascript
// For local development
API_BASE_URL: "http://localhost:5000";

// For production (example)
API_BASE_URL: "https://your-api-domain.com";
```

## Usage

Include the config file in your HTML before other scripts:

```html
<script src="/config.js"></script>
<script src="/your-app.js"></script>
```

Then use in your JavaScript:

```javascript
const apiBaseUrl =
	(window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.API_BASE_URL) ||
	(window.CONFIG && window.CONFIG.API_BASE_URL) ||
	"http://localhost:5000";

fetch(`${apiBaseUrl}/api/auth/login`, ...)
```

## Environment-Specific Configuration

For different environments, you can create separate config files:

- `config.development.js`
- `config.production.js`

And load the appropriate one based on your deployment process.
