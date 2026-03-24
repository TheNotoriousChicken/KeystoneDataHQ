// auth/index.js — Barrel file that mounts all auth sub-routers
const express = require('express');
const router = express.Router();

router.use('/', require('./register'));
router.use('/', require('./login'));
router.use('/', require('./password'));
router.use('/', require('./profile'));
router.use('/', require('./twoFactor'));

module.exports = router;
