'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("posts", "videoCount", {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0
		});

		await queryInterface.addColumn("posts", "imageCount", {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0
		});

		await queryInterface.addColumn("posts", "audioCount", {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("posts", "audioCount");
		await queryInterface.removeColumn("posts", "imageCount");
		await queryInterface.removeColumn("posts", "videoCount");
	}
};
