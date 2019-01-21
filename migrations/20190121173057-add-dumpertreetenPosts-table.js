'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("dumpertreetenPosts", {
			dumpertreetenId: {
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
			displayOrder: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("dumpertreetenPosts");
	}
};
