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
with this simple Dockerfile cuy 
```Dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN node seed/data.js
CMD [ "npm" , "start"]
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