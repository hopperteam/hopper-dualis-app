FROM node

EXPOSE 80
COPY .build/ /app
COPY package.json/ /app/package.json
COPY package-lock.json/ /app/package-lock.json

WORKDIR /app
RUN npm install . --production

COPY web/ /app/web/
ENTRYPOINT ["node", "main.js", "/var/hopper/config.json"]
