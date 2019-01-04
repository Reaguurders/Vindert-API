'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`
			ALTER TABLE "posts" ADD COLUMN "searchable" TSVECTOR;
		`);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`
			ALTER TABLE "posts" DROP COLUMN "searchable";
		`);
	}
};
