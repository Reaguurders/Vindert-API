'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("posts", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true
			},
			dumpertId: {
				type: Sequelize.STRING,
				allowNull: false
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: false
			},
			thumbnail: {
				type: Sequelize.STRING,
				allowNull: true
			},
			postedAt: {
				type: Sequelize.DATE,
				allowNull: false
			},
			nsfw: {
				type: Sequelize.BOOLEAN,
				allowNull: false
			},
			rawData: {
				type: Sequelize.JSON,
				allowNull: false
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false
			}
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeTable("posts");
	}
};
