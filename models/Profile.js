const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  dob: {
    type: Date
  },
  gender: {
    type: String
  },
  speciality: {
    type: String
  },
  medicalHistory: {
    type: [String]
  },
  education: {
    type: [String]
  },
  pastAppointments: [
    {
      doctor: {
        type: String
      },
      appDate: {
        type: Date
      }
    }
  ],
  upcomingAppointments: {
    type: Array
  },
  appointmnetsWithComments: {
    type: Array
  },
  payments: [
    {
      doctor: {
        type: String
      },
      amount: {
        type: String,
        default: '50'
      },
      paid: {
        type: Boolean,
        default: false
      }
    }
  ]
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);