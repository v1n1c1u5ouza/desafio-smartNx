import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    authorId: { type: DataTypes.STRING, allowNull: false },
    authorUsername: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'comments',
    timestamps: true,
  });

  return Comment;
};