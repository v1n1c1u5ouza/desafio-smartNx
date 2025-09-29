import { DataTypes } from "sequelize";

export default (sequelize) =>{
  const Post = sequelize.define('Post', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    authorId: { type: DataTypes.STRING, allowNull: false },
    authorUsername: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'posts',
    timestamps: true
  });

  return Post
}