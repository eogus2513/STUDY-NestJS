FROM node:16.13.2-alpine3.15
COPY ./dist /dist
COPY ./node_modules /node_modules
CMD [ "node", "dist/main" ]