FROM python:3.11-slim

# Install Node.js and dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    wget \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy ALL files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright from ROOT package.json (not playwright_tests/)
RUN npm ci
RUN npx playwright install --with-deps

# Show directory structure (for debugging)
RUN echo "=== Directory Structure ===" && \
    ls -la && \
    echo "=== Test Directories ===" && \
    ls -la robot_tests/ selenium_tests/ playwright_tests/ 2>/dev/null || echo "Some directories may not exist"

CMD ["bash", "-c", "echo 'Container ready. Run tests with:' && echo '1. robot: cd /app/robot_tests && robot .' && echo '2. selenium: cd /app/selenium_tests && python -m pytest .' && echo '3. playwright: cd /app && npx playwright test'"]