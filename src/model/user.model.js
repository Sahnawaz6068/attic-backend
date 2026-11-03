import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // avatar: {
    //   url: {
    //     type: String,
    //     default:
    //       "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png",
    //   },
    //   publicId: {
    //     type: String,
    //     default: null,
    //   },
    // },

    role: {
      type: String,
      enum: ["customer", "admin", "superAdmin",],
      default: "customer",
      required: true,
    },

    

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    employeeDetails: {
      employeeId: {
        type: String,
        sparse: true,
      },

      department: String,
      designation: String,
      joiningDate: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });

const User = mongoose.model("User", userSchema);

export default User;
//TODO : Forget Password Token 
//When user forgrt then in this case forgetToken and include here