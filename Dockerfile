FROM node:alpine as builder
ARG VERSION
WORKDIR /app
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci
COPY . .
RUN echo "export const VERSION = '${VERSION}';" > ./src/version.ts
RUN npm run test
RUN npm run build

FROM node:alpine
COPY --from=builder /app/dist /app/dist
CMD ["node", "/app/dist/index.js"]
EXPOSE 8080