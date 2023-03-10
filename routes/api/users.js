const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../../models/Users');

//@route POST api/users
router.post('/', [
  check('firstName', 'First name is required')
  .not()
  .isEmpty(),
  check('lastName', 'Last name is required')
  .not()
  .isEmpty(),
  check('email', 'Please include a valid email')
  .isEmail(),
  check('password', 'Please enter a password with 6 characters or more')
  .isLength({min: 6}),
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('errors', errors);
     return res.status(400).json({ errors: errors.array() })
  }

  const {firstName, lastName, email, password, isDoctor, isPatient} = req.body;
  try {
    let user = await User.findOne({email});

    if (user) {
      return res.status(400).json({errors: [{msg: 'User already registered'}]});
    }

    user = new User({
      firstName,
      lastName,
      email,
      password,
      isDoctor: isDoctor && true,
      isPatient: isDoctor ? false : true
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

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