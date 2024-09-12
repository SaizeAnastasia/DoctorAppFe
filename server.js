const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Настройка маршрутов
const rewriter = jsonServer.rewriter({
  '/available-slots': '/available-slots'
});

server.use(middlewares);
server.use(rewriter);
server.use(router);

server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});
