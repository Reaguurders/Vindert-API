'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("posts", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true
		});

		await queryInterface.addIndex("posts", ["deletedAt"], {
			type: "btree"
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex("posts", ["deletedAt"]);
		await queryInterface.removeColumn("posts", "deletedAt");
	}
};
