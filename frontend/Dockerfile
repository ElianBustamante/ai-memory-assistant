# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Install pnpm v9
RUN npm install -g pnpm@9

# Install dependencies
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy application code
COPY . .

# Build the application
# We use ARG to pass VITE_API_URL during build time if needed
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
