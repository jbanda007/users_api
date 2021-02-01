const express = require('express');

const router = express.Router();

const UserContoller = require('../controllers/UserController');
const AdminContoller = require('../controllers/AdminController');

const AuthMiddleware = require('../middleware/AuthMiddleware');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

router.post('/admin/login', AdminContoller.login);

router.post('/admin/users/create', AuthMiddleware, UserContoller.create);
router.put('/admin/users/update/:user_id', AuthMiddleware, UserContoller.update);
router.delete('/admin/users/delete/:user_id', AuthMiddleware, UserContoller.delete);
router.post('/admin/users/list', AuthMiddleware, UserContoller.list);

module.exports = router;
