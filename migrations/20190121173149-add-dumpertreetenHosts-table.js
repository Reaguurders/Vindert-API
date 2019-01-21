'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("dumpertreetenHosts", {
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
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("dumpertreetenHosts");
	}
};
