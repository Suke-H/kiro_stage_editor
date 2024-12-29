FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY backend /app/backend
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Pythonの環境セットアップ
RUN apk add --no-cache python3 py3-pip python3-dev
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

COPY backend/requirements.txt .
RUN . /app/venv/bin/activate && pip install --no-cache-dir -r requirements.txt

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]