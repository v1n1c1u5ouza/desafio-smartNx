import { sequelize } from '../config/database.js';
import postModel from './post.js'
import commentModel from './comment.js';

const Post = postModel(sequelize);
const Comment = commentModel(sequelize)

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

export { sequelize, Post, Comment };
