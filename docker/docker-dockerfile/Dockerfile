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