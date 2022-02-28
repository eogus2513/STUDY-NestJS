FROM node:16.13.2-alpine3.15

WORKDIR /server

COPY package.json yarn.lock tsconfig.json tsconfig.build.json ./

RUN yarn

COPY src .env ./

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]