# syntax=docker/dockerfile:1

FROM node:18-alpine

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install; else npm install; fi

# Copy source
COPY . .

EXPOSE 3000

# Ensure CRA binds to 0.0.0.0 inside container
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "start"]
