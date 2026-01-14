FROM mcr.microsoft.com/playwright:v1.42.1-jammy

WORKDIR /app

# Copy project as-is
COPY . .

# Install Python requirements if present
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# Install Node dependencies (uses your existing package-lock.json)
RUN npm ci

# Install ONLY Chromium
RUN npx playwright install chromium --with-deps

# Default command: run tests ONLY on Chromium
CMD ["npx", "playwright", "test", "--project=chromium"]
