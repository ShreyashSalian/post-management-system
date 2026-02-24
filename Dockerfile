FROM node

WORKDIR /app

COPY  package.json tsconfig.json /app/

RUN npm install

COPY . /app/

RUN npm run build # Ensure typescript compiles to javascript

EXPOSE 8000

CMD [ "npm" ,"start"]