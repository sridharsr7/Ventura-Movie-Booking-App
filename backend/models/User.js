const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin', 'partner'], default: 'user' },
  address: { type: String }, 
  location: { type: String }, 
  approvedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }] 
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
