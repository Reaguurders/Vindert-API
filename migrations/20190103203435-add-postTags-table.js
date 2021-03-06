'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("postTags", {
			postId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "posts",
					key: "id"
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE"
			},
			tag: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false
			}
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("postTags");
	}
};
