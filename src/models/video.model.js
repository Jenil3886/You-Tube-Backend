import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
import User from "./user.model.js";

const Video = sequelize.define(
  "Video",
  {
    // videoFile: {
    //   type: DataTypes.ARRAY(DataTypes.STRING),
    //   defaultValue: [],
    //   comment: "Cloudinary URL",
    // },

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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // duration: DataTypes.INTEGER,
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
        model: "Users", // Use table name string to avoid circular ref
        key: "id",
      },
    },
    channelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Channels", // Use table name string to avoid circular ref
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Video;
