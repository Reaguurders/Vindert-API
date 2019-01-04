'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addIndex("postTags", ["tag"], {
			type: "btree"
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex("postTags", ["tag"]);
	}
};
