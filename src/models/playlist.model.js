import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js"; // adjust path as needed
import User from "./user.model.js"; // adjust path as needed
import Video from "./video.model.js"; // adjust path as needed

const Playlist = sequelize.define(
  "Playlist",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
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

// Define many-to-many relationship between Playlist and Video
Playlist.belongsToMany(Video, { through: "PlaylistVideos" });
Video.belongsToMany(Playlist, { through: "PlaylistVideos" });

export default Playlist;
