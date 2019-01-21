'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("dumpertreetenPostRatings", {
			dumpertreetenId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false
			},
			postId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false
			},
			hostId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "hosts",
					key: "id"
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE"
			},
			ratingTypeId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "ratingTypes",
					key: "id"
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE"
			},
			amount: {
				type: Sequelize.DOUBLE,
				allowNull: false
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("dumpertreetenPostRatings");
	}
};
