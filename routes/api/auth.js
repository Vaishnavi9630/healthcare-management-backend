const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/Users');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch(err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});

router.post('/', [
  check('email', 'Please include a valid email')
  .isEmail(),
  check('password', 'Password is required')
  .exists(),
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('errors', errors);
     return res.status(400).json({ errors: errors.array() })
  }

  const {email, password} = req.body;
  try {
    let user = await User.findOne({email});

    if (!user) {
      return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);

    if(!passwordMatch) {
      return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email
      }
    }

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {expiresIn: 360000},
      (err, token) => {
      if (err) throw err;
      res.json({token});
    });
  } catch(err) {
      console.error(err.message);
      res.status(500).send('server error');
  }

});

module.exports = router;