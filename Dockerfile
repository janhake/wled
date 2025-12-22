FROM node:18-alpine

WORKDIR /app

# Kopieer package files en installeer dependencies
COPY package.json ./
RUN npm install --production

# Kopieer applicatie code
COPY server.js ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/devices', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start applicatie
CMD ["node", "server.js"]