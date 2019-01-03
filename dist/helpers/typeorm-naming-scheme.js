"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
/**
 * Converts string into camelCase.
 *
 * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
function camelCase(str, firstCapital = false) {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
        if (firstCapital === true && offset === 0) {
            return p1;
        }
        if (p2) {
            return p2.toUpperCase();
        }
        return p1.toLowerCase();
    });
}
exports.camelCase = camelCase;
/**
 * Naming strategy that is used by default.
 */
class NamingStrategy {
    /**
     * Normalizes table name.
     *
     * @param targetName Name of the target entity that can be used to generate a table name.
     * @param userSpecifiedName For example if user specified a table name in a decorator, e.g. @Entity("name")
     */
    tableName(targetName, userSpecifiedName) {
        return userSpecifiedName ? userSpecifiedName : camelCase(targetName);
    }
    /**
     * Creates a table name for a junction table of a closure table.
     *
     * @param originalClosureTableName Name of the closure table which owns this junction table.
     */
    closureJunctionTableName(originalClosureTableName) {
        return originalClosureTableName + "_closure";
    }
    columnName(propertyName, customName, embeddedPrefixes) {
        if (embeddedPrefixes.length) {
            return camelCase(embeddedPrefixes.join("_")) + (customName ? camelCase(customName) : camelCase(propertyName));
        }
        return customName ? customName : propertyName;
    }
    relationName(propertyName) {
        return propertyName;
    }
    primaryKeyName(tableOrName, columnNames) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        const clonedColumnNames = [...columnNames];
        clonedColumnNames.sort();
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_pkey`;
    }
    uniqueConstraintName(tableOrName, columnNames) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        const clonedColumnNames = [...columnNames];
        clonedColumnNames.sort();
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_${clonedColumnNames.join("_")}_unique`;
    }
    relationConstraintName(tableOrName, columnNames, where) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        const clonedColumnNames = [...columnNames];
        clonedColumnNames.sort();
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_${clonedColumnNames.join("_")}${where ? `_${where}` : ``}_rel`;
    }
    defaultConstraintName(tableOrName, columnName) {
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_${columnName}_default`;
    }
    foreignKeyName(tableOrName, columnNames) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        const clonedColumnNames = [...columnNames];
        clonedColumnNames.sort();
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_${clonedColumnNames.join("_")}_fkey`;
    }
    indexName(tableOrName, columnNames, where) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        const clonedColumnNames = [...columnNames];
        clonedColumnNames.sort();
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_${clonedColumnNames.join("_")}${where ? `_${where}` : ``}_index`;
    }
    checkConstraintName(tableOrName, expression) {
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_${expression}_check`;
    }
    exclusionConstraintName(tableOrName, expression) {
        const tableName = tableOrName instanceof typeorm_1.Table ? tableOrName.name : tableOrName;
        return `${tableName}_${expression}_exclusion`;
    }
    joinColumnName(relationName, referencedColumnName) {
        return camelCase(relationName + "_" + referencedColumnName);
    }
    joinTableName(firstTableName, secondTableName, firstPropertyName, secondPropertyName) {
        return camelCase(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName);
    }
    joinTableColumnDuplicationPrefix(columnName, index) {
        return columnName + "_" + index;
    }
    joinTableColumnName(tableName, propertyName, columnName) {
        return camelCase(tableName + "_" + (columnName ? columnName : propertyName));
    }
    joinTableInverseColumnName(tableName, propertyName, columnName) {
        return this.joinTableColumnName(tableName, propertyName, columnName);
    }
    /**
     * Adds globally set prefix to the table name.
     * This method is executed no matter if prefix was set or not.
     * Table name is either user's given table name, either name generated from entity target.
     * Note that table name comes here already normalized by #tableName method.
     */
    prefixTableName(prefix, tableName) {
        return prefix + tableName;
    }
}
exports.NamingStrategy = NamingStrategy;
//# sourceMappingURL=typeorm-naming-scheme.js.map