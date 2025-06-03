import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js"; // Corrected export
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("username", value.trim().toLowerCase());
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("email", value.trim().toLowerCase());
      },
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("fullName", value.trim());
      },
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Cloudinary URL",
    },
    coverImage: {
      type: DataTypes.STRING,
      comment: "Cloudinary URL",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
    indexes: [
      {
        fields: ["username"],
      },
      {
        fields: ["fullName"],
      },
    ],
  }
);

// Instance methods
User.prototype.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    accessTokenSecret,
    {
      expiresIn: accessTokenExpiry,
    }
  );
};

User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id,
    },
    refreshTokenSecret,
    {
      expiresIn: refreshTokenExpiry,
    }
  );
};

export default User;
