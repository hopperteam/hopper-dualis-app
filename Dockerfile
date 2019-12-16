FROM node

EXPOSE 80
COPY .build/ /app
COPY package.json/ /app/package.json
COPY package-lock.json/ /app/package-lock.json

WORKDIR /app
RUN npm install . --production

ENTRYPOINT ["node", ".", "/var/hopper/config.json"]
