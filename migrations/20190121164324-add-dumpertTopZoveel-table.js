'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("dumpertTopZoveel", {
			year: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false
			},
			position: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false
			},
			postId: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: {
					model: "posts",
					key: "id"
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE"
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("dumpertTopZoveel");
	}
};
