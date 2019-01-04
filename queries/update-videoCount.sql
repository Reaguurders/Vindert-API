UPDATE
	"posts"
SET
	"audioCount" = s."audioCount"
FROM
	(
		SELECT
			id,
			"count" as "audioCount"
		FROM
			(
				SELECT
					id,
					json_array_elements("rawData" -> 'media') ->> 'mediatype' as "type",
					COUNT(json_array_elements("rawData" -> 'media') ->> 'mediatype') as "count"
				FROM
					"posts"
				GROUP BY
					id,
					json_array_elements("rawData" -> 'media') ->> 'mediatype'
			) AS s2
		WHERE
			"type" = 'AUDIO'
	) as s
WHERE
	"posts".id = s.id