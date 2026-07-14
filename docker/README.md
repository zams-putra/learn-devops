# Masterchef - Dockerfile
- baca2 dari sini: https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/

with this file structure
```ps1
|   .env
|   .gitignore
|   Dockerfile
|   package-lock.json
|   package.json
|   README.md
|   server.js
|   
\---seed
        data.js
```

### Opsi - 1
with this simple Dockerfile cuy 
```Dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN node seed/data.js
CMD [ "npm" , "start"]
```

### Opsi - 2
step lanjutan, kasih permission and set user ke app 

```Dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN node seed/data.js
RUN adduser app && chown -R app:app /app
USER app
CMD [ "npm" , "start"]
```
### Opsi - 3
biar lebih optimize lagi, dia nanti kalau gonta ganti code di server.js misal, nah dia udah dalam keadaan install semua package kalau begini tuh

```Dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN node seed/data.js
RUN adduser app && chown -R app:app /app
USER app
CMD [ "npm" , "start"]
```
### Opsi - 4
biar lebih mantep lagi, kita buat entrypoint.sh buat naruh beberapa run command nya ga dari Dockerfile
- Dockerfile
```Dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN adduser app && chown -R app:app /app
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
USER app
ENTRYPOINT [ "entrypoint.sh" ]
CMD [ "npm" , "start"]
```
kenapa kok run chmod nya di atas user app, ya kalo di bawah kan doi bukan root cug udah jadi app duluan masa mau nge chmod file di usr local, also kita ganti run npm install nya ke run npm ci biar lebih stabil buat deployment
- entrypoint.sh
```sh
#!/bin/sh

echo "nge seed db dulu lah biar aman sentosa"
node seed/data.js
exec "$@"
```

### How to played
- Build Dockerfile nya

```bash
docker build -t masterchef . 
```

- Run images hasil build nya 
```bash
docker run -p 5000:5000 masterchef
```
- Test aja 
```bash
curl 127.0.0.1:5000/api
```



# Cave React App - Dockerfile (Multi-Stage Dockerfile)
buat nge build frontend app, misal ini react app isinya
implement npm build, lalu deploy ke nginx
- Dockerfile client

```Dockerfile
FROM node:22 AS buildernya
WORKDIR /client
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM nginx
COPY --from=buildernya /client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
```
buat ngebuild backend app, misal ini golang app isinya implement go build, lalu deploy ke debian server, also implement chromium soalnya di go mod nya ada package chrome buat xss
- /server/entrypoint.sh nya gini 
```bash
#!/bin/sh

echo "nge seed table sekalian bikin db dulu lah biar ada tabelnya cuk"
seed_table
echo "nge seed data di table nya cuy"
seed_data

exec "$@"
```
- Dockerfile server
```Dockerfile
FROM golang:1.25 AS buildernya
WORKDIR /server
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o seed_table /server/cmd/seed/create_table
RUN CGO_ENABLED=0 GOOS=linux go build -o seed_data /server/cmd/seed/insert_data
RUN CGO_ENABLED=0 GOOS=linux go build -o go_server /server/cmd/app

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends chromium ca-certificates fonts-liberation dumb-init && rm -rf /var/lib/apt/lists/*

WORKDIR /server

RUN adduser flags_are_here_dude

COPY --from=buildernya /server/go_server .
COPY --from=buildernya /server/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --from=buildernya /server/seed_table /usr/local/bin/seed_table
COPY --from=buildernya /server/seed_data /usr/local/bin/seed_data
RUN mkdir logs
COPY logs /server/logs

RUN chmod +x /usr/local/bin/seed_table
RUN chmod +x /usr/local/bin/seed_data
RUN chmod +x /usr/local/bin/entrypoint.sh


EXPOSE 8080

ENTRYPOINT [ "dumb-init", "--", "entrypoint.sh" ]
CMD [ "./go_server" ]
```
ku edit beberapa file di server nya, dari admin bot dan lain lain, buat nge fit in docker container nya

dan kita compose keduanya di docker-compose.yaml
```yaml
services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    networks:
      - cave-net
    depends_on:
      - server


  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    networks:
      - cave-net

networks:
  cave-net:
    driver: bridge
```
### How to played
- up the docker compose
```bash
docker compose up --build 
```
- access localhost:80
- and play