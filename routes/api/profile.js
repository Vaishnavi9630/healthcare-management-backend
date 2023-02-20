const _ = require('lodash');
const express = require('express');

const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const sendEmail = require('./sendEmail');


const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const stripe = require('stripe')('sk_test_51M3kZfDVDnjiM1MncNXclmJpNIXpSCabmpEYmesMr3Mri1UUnMsuWjxkEeLV5sWzHKZtpXyFUVJPDpZdaDIaYDZA00UvRqHFvX');


router.post("/sendemail", async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    const send_to = email;
    const sent_from = 'akshitha.seproject@gmail.com';

    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Email Sent" });
  } catch (error) {
    res.status(500).json(error.message);
  }
});


router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id})
    .populate('user');

    if (!profile) {
      return res.status(400).json({msg: 'There is no profile for this user'});
    }
    res.json(profile);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});


router.post('/payment', async (req, res) => {
	let {id} = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount: 50,
			currency: "USD",
			description: "Doctor booking fee",
			payment_method: id,
			confirm: true
		})
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		res.json({
			message: "Payment failed",
			success: false
		})
	}
});

router.post('/doctorAppointment', async (req, res) => {
  const {email} = req.body
  try {
    const userObj = await User.findOne({email});

    const profile = await Profile.findOne({user: userObj.id})
    .populate('user');

    if (!profile) {
      return res.status(400).json({msg: 'There is no profile for this user'});
    }
    res.json(profile);

  } catch(err) {
    console.error(err.message);
    res.status(500).send({errors: [{msg: 'Server Error'}]});
  }
});

router.post('/userData', async (req, res) => {
  const {email} = req.body;
  try {
    const userObj = await User.findOne({email});

    const profile = await Profile.findOne({user: userObj.id})
    .populate('user');

    if (!profile) {
      return res.status(400).json({msg: 'There is no profile for this user'});
    }
    res.json(profile);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

router.post('/removeUser', async (req, res) => {
  const {email} = req.body
  try {
    const userObj = await User.findOne({email});
    // const profileObj = await Profile.findOne({user: userObj.id});

    if (!userObj) {
      return res.status(400).json({errors: [{msg: 'There is no user in the system with this email'}]});
    }
    await User.findOneAndRemove({_id: userObj.id});
    await Profile.findOneAndRemove({user: userObj.id});

    return res.status(200).json({ success: true, message: "User Deleted" });

  } catch(err) {
    console.error(err.message);
    res.status(500).send({errors: [{msg: 'Server Error'}]});
  }
});

router.post('/upcomingAppointment', async (req, res) => {
  const {doctorEmail, userEmail} = req.body;
  try {
    const userObj = await User.findOne({email: userEmail});

    let userProfile = await Profile.findOne({user: userObj.id})
    .populate('user');

    if (userProfile) {
      userProfile = await Profile.findOneAndUpdate(
          {user: userObj.id}, 
          {$push: {"upcomingAppointments": req.body}}
      );
    }
    const doctorObj = await User.findOne({email: doctorEmail});

    let doctorProfile = await Profile.findOne({user: doctorObj.id})
    .populate('user');

    if (doctorProfile) {
      doctorProfile = await Profile.findOneAndUpdate(
          {user: doctorObj.id}, 
          {$push: {"upcomingAppointments": req.body}}
      );
    }
    return res.status(200).json({ success: true, message: "Updated Successfully" });

  } catch(err) {
    console.error(err.message);
    res.status(500).send({errors: [{msg: 'Server Error'}]});
  }
  res.status(200)
});


router.post('/commentsAndPrescriptions', async (req, res) => {
  const {doctorEmail, userEmail} = req.body;
  try {
    const userObj = await User.findOne({email: userEmail});

    let userProfile = await Profile.findOne({user: userObj.id})
    .populate('user');

    if (userProfile) {
      userProfile = await Profile.findOneAndUpdate(
          {user: userObj.id}, 
          {$push: {"appointmnetsWithComments": req.body}}
      );
    }
    const doctorObj = await User.findOne({email: doctorEmail});

    let doctorProfile = await Profile.findOne({user: doctorObj.id})
    .populate('user');

    if (doctorProfile) {
      doctorProfile = await Profile.findOneAndUpdate(
          {user: doctorObj.id}, 
          {$push: {"appointmnetsWithComments": req.body}}
      );
    }
    return res.status(200).json({ success: true, message: "Updated Successfully" });

  } catch(err) {
    console.error(err.message);
    res.status(500).send({errors: [{msg: 'Server Error'}]});
  }
  res.status(200)
});

router.post('/', auth, async (req, res) => {
  const {
    dob,
    gender,
    medicalHistory,
    pastAppointments,
    upcomingAppointments,
    appointmnetsWithComments,
    payments,
    firstName,
    lastName,
    speciality,
    education,
    email
  } = req.body;

  const payload = {};
  payload.user = req.user.id;
  if (dob) payload.dob = dob;
  if (gender) payload.gender = gender;
  if (medicalHistory) payload.medicalHistory = medicalHistory.toString().split(',').map(item => item.trim());
  if (pastAppointments) payload.pastAppointments = pastAppointments;
  if (upcomingAppointments) payload.upcomingAppointments = upcomingAppointments;
  if (appointmnetsWithComments) payload.appointmnetsWithComments = appointmnetsWithComments;
  if (payments) payload.payments = payments;
  if (speciality) payload.speciality = speciality;
  if (education) payload.education = education.toString().split(',').map(item => item.trim());
  
  const userPayload = {
    user: {}
  };
  if (firstName) userPayload.user.firstName = firstName;
  if (lastName) userPayload.user.lastName = lastName;
  try {
    let profile = await Profile.findOne({user: req.user.id});
    let userInfo = await User.findOne({_id: req.user.id});

    if (userInfo) {
      userInfo = await User.findOneAndUpdate(
          {_id: req.user.id}, 
          {$set: userPayload.user},
          {new: true}
      );
    }
    if (profile) {
      profile = await Profile.findOneAndUpdate(
          {user: req.user.id}, 
          {$set: payload},
          {new: true}
      );
      return res.json(profile);
    }

    profile = new Profile(payload);

    await profile.save();
    res.json (profile);

  } catch(err) {
    console.error(err);
    res.status(500).send('server error');
  }
});
router.post('/updateWithoutToken', async (req, res) => {
  const {
    dob,
    gender,
    medicalHistory,
    pastAppointments,
    upcomingAppointments,
    appointmnetsWithComments,
    payments,
    firstName,
    lastName,
    speciality,
    education,
    userEmail,
    section
  } = req.body;
  const userObj = await User.findOne({email: userEmail});

  const payload = {};
  payload.user = userObj.id;

  if (dob) payload.dob = dob;
  if (gender) payload.gender = gender;
  if (medicalHistory) payload.medicalHistory = medicalHistory.toString().split(',').map(item => item.trim());
  if (pastAppointments) payload.pastAppointments = pastAppointments;
  if (upcomingAppointments) payload.upcomingAppointments = upcomingAppointments;
  if (appointmnetsWithComments) payload.appointmnetsWithComments = appointmnetsWithComments;
  if (payments) payload.payments = payments;
  if (speciality) payload.speciality = speciality;
  if (education) payload.education = education.toString().split(',').map(item => item.trim());
  
  const userPayload = {
    user: {}
  };
  if (firstName) userPayload.user.firstName = firstName;
  if (lastName) userPayload.user.lastName = lastName;
  
  try {
    let profile = await Profile.findOne({user: userObj.id});
    let userInfo = await User.findOne({_id: userObj.id});
    if (userInfo) {
      userInfo = await User.findOneAndUpdate(
          {_id: userObj.id}, 
          {$set: userPayload.user},
          {new: true}
      );
    }
    if (profile) {
      profile = await Profile.findOneAndUpdate(
          {user: userObj.id}, 
          {$set: payload},
          {new: true}
      );
      return res.status(200).json({ success: true, message: "Updated Successfully" });
    }

    profile = new Profile(payload);

    await profile.save();
    res.status(200).json({ success: true, message: "Updated Successfully" })

  } catch(err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

router.get('/allDoctors', async (req, res) => {
  try {
    const profiles = await Profile.find()
    .populate('user');
    const doctorProfiles = profiles.filter(item => _.get(item, 'user.isDoctor', false) === true);
    return res.json(doctorProfiles);
  } catch(err) {
    console.error(err);
    res.status(500).send({errors: [{msg: 'Server Error'}]});
  }
});

module.exports = router;