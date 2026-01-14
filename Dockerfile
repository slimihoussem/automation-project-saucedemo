FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install pytest for Selenium tests
RUN pip install pytest pytest-html

# Install Playwright dependencies if package.json exists
COPY playwright_tests/package*.json ./playwright_tests/
RUN if [ -f "playwright_tests/package.json" ]; then \
        cd playwright_tests && npm ci && npx playwright install --with-deps; \
    fi

# Copy test files
COPY . .

# Default command
CMD ["python", "-c", "print('Test container is ready')"]
