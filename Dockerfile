# Use multi-stage build for speed
FROM python:3.11-slim AS base

# Install only what's needed
ARG INSTALL_PYTHON=false
ARG INSTALL_PLAYWRIGHT=false

WORKDIR /app

# Copy minimal files first
COPY requirements.txt .
COPY package.json .

# Conditional Python installation
RUN if [ "$INSTALL_PYTHON" = "true" ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    fi

# Conditional Playwright installation
RUN if [ "$INSTALL_PLAYWRIGHT" = "true" ]; then \
        apt-get update && apt-get install -y curl && \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y nodejs && \
        npm ci --omit=optional && \
        npx playwright install chromium; \
    fi

# Final stage
FROM base AS final
COPY . .

CMD ["echo", "Optimized test container ready"]