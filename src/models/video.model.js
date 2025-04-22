import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js"; // adjust path as needed
import User from "./user.model.js"; // adjust path as needed

const Video = sequelize.define(
  "Video",
  {
    videoFile: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Cloudinary URL",
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Cloudinary URL",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Video;
