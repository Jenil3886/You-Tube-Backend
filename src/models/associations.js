// import Video from "./video.model.js";
// import Channel from "./Channel.model.js";
// import User from "./user.model.js";
// import Comment from "./comment.model.js";

// Channel.hasMany(Video, { as: "videos", foreignKey: "channelId" });
// Video.belongsTo(Channel, { as: "channel", foreignKey: "channelId" });

// User.hasMany(Video, { as: "videos", foreignKey: "ownerId" });
// Video.belongsTo(User, { as: "owner", foreignKey: "ownerId" });

// Comment.belongsTo(User, { as: "owner", foreignKey: "ownerId" });
// User.hasMany(Comment, { as: "comments", foreignKey: "ownerId" });

// export { Video, Channel, User, Comment };

import Video from "./video.model.js";
import Channel from "./Channel.model.js";
import User from "./user.model.js";
import Comment from "./comment.model.js";
import Like from "./like.model.js";
import Subscription from "./subscription.model.js";

// Channel ↔ Video
Channel.hasMany(Video, { as: "videos", foreignKey: "channelId" });
Video.belongsTo(Channel, { as: "channel", foreignKey: "channelId" });

// User ↔ Video
User.hasMany(Video, { as: "videos", foreignKey: "ownerId" });
Video.belongsTo(User, { as: "owner", foreignKey: "ownerId" });

// User ↔ Comment
User.hasMany(Comment, { as: "comments", foreignKey: "ownerId" });
Comment.belongsTo(User, { as: "owner", foreignKey: "ownerId" });

// Video ↔ Comment
Video.hasMany(Comment, { foreignKey: "videoId" });
Comment.belongsTo(Video, { foreignKey: "videoId" });

// User ↔ Like
User.hasMany(Like, { foreignKey: "userId", onDelete: "CASCADE" });
Like.belongsTo(User, { foreignKey: "userId" });

// Video ↔ Like
Video.hasMany(Like, { foreignKey: "videoId", onDelete: "CASCADE" });
Like.belongsTo(Video, { foreignKey: "videoId" });

// Subscription ↔ Channel/User
Subscription.belongsTo(User, { as: "Subscriber", foreignKey: "subscriberId" });
Subscription.belongsTo(Channel, { as: "Channel", foreignKey: "channelId" });
Channel.hasMany(Subscription, { as: "subscriptions", foreignKey: "channelId" });
User.hasMany(Subscription, { as: "subscriptions", foreignKey: "subscriberId" });

export { Video, Channel, User, Comment, Like, Subscription };
