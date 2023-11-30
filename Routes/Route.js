// const express = require('express')
// const router=express.Router();
// const create=require('../Controller/Create')
// const fetch=require('../Controller/Fetch')
// const update=require('../Controller/Update')
// const del=require('../Controller/Delete')



// router.post('/api/data',create.CreateData)
// router.post('api/data',fetch.FetchData)
// router.post('api/data/',update.UpdateData)
// router.post('api/data/',del.DeleteData)

// module.exports=router;

// const express = require('express');
// const router = express.Router();

// const create = require('../Controller/Create');

// const fetch = require('../Controller/Fetch');
// const update = require('../Controller/Update');
// const del = require('../Controller/Delete');

// router.post('/api/data', create.CreateData);

// router.post('/api/data', fetch.FetchData);
// router.post('/api/data/', update.UpdateData);
// router.post('/api/data/', del.DeleteData);

// module.exports = router;





// const express = require('express');
// const postController = require('../Controller/Postcontroller');

// const router = express.Router();

// router.post('/posts', postController.createPost);
// router.get('/posts', postController.getPosts);
// router.get('/posts/:postId', postController.getPostById);
// router.put('/posts/:postId', postController.updatePost);
// router.delete('/posts/:postId', postController.deletePost);

// module.exports = router;





const express = require('express');
const router = express.Router();
const userController = require('../Controller/Usercontroller');
const postController = require('../Controller/Postcontroller');

router.post('/users', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/auth', userController.authenticateUser, userController.getUserDetails);
router.post('/posts', userController.authenticateUser, postController.createPost);
router.get('/posts', userController.authenticateUser, postController.getPosts);
router.get('/posts/:postId', userController.authenticateUser, postController.getPostById);
router.put('/posts/:postId', userController.authenticateUser, postController.updatePost);
router.delete('/posts/:postId',userController.authenticateUser, postController.deletePost);

module.exports = router;