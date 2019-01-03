'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("postHistories", {
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
			checkedAt: {
				type: Sequelize.DATE,
				primaryKey: true,
				allowNull: false
			},
			views: {
				type: Sequelize.BIGINT,
				allowNull: false
			},
			kudos: {
				type: Sequelize.BIGINT,
				allowNull: false
			},
			comments: {
				type: Sequelize.BIGINT,
				allowNull: false
			}
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("postHistories");
	}
};
