import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
  },
  {timestamps: true}
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;