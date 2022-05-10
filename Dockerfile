FROM node:16

RUN mkdir /home/app

WORKDIR /home/app

RUN npm install -g @angular/cli

COPY . .

RUN npm install

EXPOSE 4200
