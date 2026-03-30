FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate
RUN npx nest build
RUN ls -la dist/
EXPOSE 3000
CMD ["node", "dist/src/main"]
