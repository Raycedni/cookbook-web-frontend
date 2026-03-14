#!/bin/sh
# Replace runtime environment variable placeholders in index.html
sed -i "s|__API_BASE_URL__|${API_BASE_URL:-/api/v1}|g" /usr/share/nginx/html/index.html
sed -i "s|__KEYCLOAK_URL__|${KEYCLOAK_URL:-http://localhost:8180}|g" /usr/share/nginx/html/index.html
sed -i "s|__KEYCLOAK_REALM__|${KEYCLOAK_REALM:-cookbook}|g" /usr/share/nginx/html/index.html
sed -i "s|__KEYCLOAK_CLIENT_ID__|${KEYCLOAK_CLIENT_ID:-cookbook-frontend}|g" /usr/share/nginx/html/index.html
exec "$@"
