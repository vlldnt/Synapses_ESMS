FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_OPENROUTER_API_KEY
ARG VITE_API_URL=/api
ARG VITE_BASENAME=/synapses

# Create .env file from build arguments
RUN printf "VITE_OPENROUTER_API_KEY=%s\nVITE_API_URL=%s\nVITE_BASENAME=%s\n" \
    "$VITE_OPENROUTER_API_KEY" "$VITE_API_URL" "$VITE_BASENAME" > .env.local

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
