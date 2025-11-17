import mongoose, { Schema }, { Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username?: string;
  photo: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: null,
    },
    photo: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<IUser> =
  mongoose.models.User as Model<IUser> || mongoose.model<IUser>("User", UserSchema);

export default UserModel;