import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide username'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please Provide Password'],
    unique: false,
  },
  email: {
    type: String,
    required: [true, 'Please Provide Email'],
    unique: true,
  },
  firstName: { type: String },
  lastName: { type: String },
  mobileNumber: { type: Number },
  address: { type: String },
  profile: { type: String },
});

export default mongoose.model.Users || mongoose.model('User', UserSchema);
