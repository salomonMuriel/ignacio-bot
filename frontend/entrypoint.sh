#!/bin/sh

# Replace environment variables in nginx config
envsubst '${VITE_API_BASE_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"