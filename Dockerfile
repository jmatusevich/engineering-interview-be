FROM node:19

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

EXPOSE 3000

# CMD npm start
CMD [ "/bin/sh", "entrypoint.sh" ]