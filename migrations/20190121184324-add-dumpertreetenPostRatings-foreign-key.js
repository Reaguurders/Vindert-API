'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`
			ALTER TABLE public."dumpertreetenPostRatings"
			ADD CONSTRAINT "dumpertreetenPostRatings_dumpertreetenId_postId_fkey" FOREIGN KEY ("dumpertreetenId", "postId")
					REFERENCES public."dumpertreetenPosts" ("dumpertreetenId", "postId") MATCH SIMPLE
					ON UPDATE CASCADE ON DELETE CASCADE;
		`);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint("dumpertreetenPostRatings", "dumpertreetenPostRatings_dumpertreetenId_postId_fkey")
	}
};
