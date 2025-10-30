const express = require('express')
const router = express.Router()

// Middleware necesario para leer req.body de formularios HTML
router.use(express.urlencoded({ extended: true })); 
router.use(express.json()); // También útil si maneja peticiones JSON



router.get('/', (req, res) => {
    res.render('index.hbs'); //index.hbs
});

router.get ('/about', (req, res) =>{
    res.render('about.hbs') //about.hbs
})

module.exports = router;
