const express = require('express');
const router = express.Router();

function factura (req, res) {
    res.render('view/pdfs/factura', { layouts: "pdf"})
}

module.exports = router;