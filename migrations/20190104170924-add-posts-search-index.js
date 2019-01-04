'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		let transaction = await queryInterface.sequelize.transaction();

		await queryInterface.sequelize.query(`
			UPDATE
				"posts"
			SET
				"searchable" = to_tsvector(
					'simple',
					title || ' ' || description || ' ' || COALESCE((
						SELECT
							string_agg(tag, ' ')
						FROM
							"postTags"
						WHERE
							"postId" = "posts".id
					), '')
				)
		`, { transaction });

		await queryInterface.sequelize.query(`
			CREATE INDEX
				"posts_search_index"
			ON
				"posts"
			USING
				GIN("searchable");
		`, { transaction });

		await transaction.commit();
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`
			DROP INDEX "posts_search_index";
		`, { transaction });
	}
};
