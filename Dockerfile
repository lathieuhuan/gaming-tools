# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for bun if needed, but the user is using npm/bun. 
# Since bun is used in the workspace, let's ensure we have it or use npm.
# The user's package.json uses workspaces.

COPY package.json package-lock.json ./
COPY packages/ron-utils/package.json ./packages/ron-utils/
COPY packages/rond/package.json ./packages/rond/
COPY packages/gidmgcalculator/package.json ./packages/gidmgcalculator/
COPY packages/tailwind-theme/package.json ./packages/tailwind-theme/

# Install root dependencies
RUN npm ci

# Copy sources
COPY packages/ron-utils ./packages/ron-utils
COPY packages/rond ./packages/rond
COPY packages/gidmgcalculator ./packages/gidmgcalculator
COPY packages/tailwind-theme ./packages/tailwind-theme

# Build dependencies in order
RUN npm run build -w packages/ron-utils
# tailwind-theme has no build script, but its sources are needed by rond
RUN npm run build -w packages/rond

# Build the main app
RUN npm run build -w packages/gidmgcalculator

# Production Stage
FROM nginx:alpine

# Copy built files from gidmgcalculator
COPY --from=builder /app/packages/gidmgcalculator/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
