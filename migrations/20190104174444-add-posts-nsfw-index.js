'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addIndex("posts", ["nsfw"], {
			type: "btree"
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex("posts", ["nsfw"]);
	}
};
