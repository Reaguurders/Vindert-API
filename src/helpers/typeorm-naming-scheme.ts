import {
	NamingStrategyInterface,
	Table
} from "typeorm";

/**
 * Converts string into camelCase.
 *
 * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
export function camelCase(str: string, firstCapital: boolean = false): string {
	return str.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
		if (firstCapital === true && offset === 0) {
			return p1;
		}

		if (p2) {
			return p2.toUpperCase();
		}

		return p1.toLowerCase();
	});
}

/**
 * Naming strategy that is used by default.
 */
export class NamingStrategy implements NamingStrategyInterface {

	/**
	 * Normalizes table name.
	 *
	 * @param targetName Name of the target entity that can be used to generate a table name.
	 * @param userSpecifiedName For example if user specified a table name in a decorator, e.g. @Entity("name")
	 */
	tableName(targetName: string, userSpecifiedName: string | undefined): string {
		return userSpecifiedName ? userSpecifiedName : camelCase(targetName);
	}

	/**
	 * Creates a table name for a junction table of a closure table.
	 *
	 * @param originalClosureTableName Name of the closure table which owns this junction table.
	 */
	closureJunctionTableName(originalClosureTableName: string): string {
		return originalClosureTableName + "_closure";
	}

	columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string { // todo: simplify
		if (embeddedPrefixes.length) {
			return camelCase(embeddedPrefixes.join("_")) + (customName ? camelCase(customName) : camelCase(propertyName));
		}

		return customName ? customName : propertyName;
	}

	relationName(propertyName: string): string {
		return propertyName;
	}

	primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
		// sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
		const clonedColumnNames = [...columnNames];
		clonedColumnNames.sort();
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_pkey`;
	}

	uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
		// sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
		const clonedColumnNames = [...columnNames];
		clonedColumnNames.sort();
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_${clonedColumnNames.join("_")}_unique`;
	}

	relationConstraintName(tableOrName: Table | string, columnNames: string[], where?: string): string {
		// sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
		const clonedColumnNames = [...columnNames];
		clonedColumnNames.sort();
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_${clonedColumnNames.join("_")}${where ? `_${where}` : ``}_rel`;
	}

	defaultConstraintName(tableOrName: Table | string, columnName: string): string {
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_${columnName}_default`;
	}

	foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
		// sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
		const clonedColumnNames = [...columnNames];
		clonedColumnNames.sort();
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_${clonedColumnNames.join("_")}_fkey`;
	}

	indexName(tableOrName: Table | string, columnNames: string[], where?: string): string {
		// sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
		const clonedColumnNames = [...columnNames];
		clonedColumnNames.sort();
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_${clonedColumnNames.join("_")}${where ? `_${where}` : ``}_index`;
	}

	checkConstraintName(tableOrName: Table | string, expression: string): string {
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_${expression}_check`;
	}

	exclusionConstraintName(tableOrName: Table | string, expression: string): string {
		const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

		return `${tableName}_${expression}_exclusion`;
	}

	joinColumnName(relationName: string, referencedColumnName: string): string {
		return camelCase(relationName + "_" + referencedColumnName);
	}

	joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
		return camelCase(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName);
	}

	joinTableColumnDuplicationPrefix(columnName: string, index: number): string {
		return columnName + "_" + index;
	}

	joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
		return camelCase(tableName + "_" + (columnName ? columnName : propertyName));
	}

	joinTableInverseColumnName(tableName: string, propertyName: string, columnName?: string): string {
		return this.joinTableColumnName(tableName, propertyName, columnName);
	}

	/**
	 * Adds globally set prefix to the table name.
	 * This method is executed no matter if prefix was set or not.
	 * Table name is either user's given table name, either name generated from entity target.
	 * Note that table name comes here already normalized by #tableName method.
	 */
	prefixTableName(prefix: string, tableName: string): string {
		return prefix + tableName;
	}
}
