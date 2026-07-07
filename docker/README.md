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
RUN npm install
COPY . .
RUN adduser app && chown -R app:app /app
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
USER app
ENTRYPOINT [ "entrypoint.sh" ]
CMD [ "npm" , "start"]
```
kenapa kok run chmod nya di atas user app, ya kalo di bawah kan doi bukan root cug udah jadi app duluan masa mau nge chmod file di usr local
- entrypoint.sh
```sh
#!/bin/sh

echo "nge seed db dulu lah biar aman sentosa"
node seed/data.js
exec "$@"
```

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