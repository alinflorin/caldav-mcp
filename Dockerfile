FROM node:alpine as builder
WORKDIR /app
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci
COPY . .
RUN npm run test
RUN npm run build

FROM node:alpine
COPY --from=builder /app/dist /app/dist
CMD ["node", "/app/dist/index.js"]
EXPOSE 8080