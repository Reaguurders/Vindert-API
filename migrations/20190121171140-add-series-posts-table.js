'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("seriesPosts", {
			seriesId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "series",
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
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("seriesPosts");
	}
};
