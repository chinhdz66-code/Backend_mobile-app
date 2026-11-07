## Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy file định nghĩa package để tận dụng Docker layer cache
COPY package*.json ./

# Cài đặt thư viện production (loại bỏ devDependencies)
RUN npm install --omit=dev

## Run stage
FROM node:18-alpine
WORKDIR /app

# Copy thư mục thư viện đã cài đặt từ stage build sang
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

# Copy mã nguồn dự án
COPY src ./src

# Khai báo port lắng nghe
EXPOSE 8080

# Chạy server
CMD ["node", "src/server.js"]
## End
