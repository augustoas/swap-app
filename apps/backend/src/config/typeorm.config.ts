import { registerAs } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";

/**
 * TypeORM database configuration for SICOP
 *
 * - Uses environment variables for all connection parameters
 * - Loads entities and migrations from the dist directory
 * - Disables auto schema sync for production safety
 * - Enables SQL logging
 * - Exports both a NestJS config provider and a DataSource instance
 */
const config = {
	type: 'postgres', // Database type
	host: process.env.PG_HOST, // Database host
	port: parseInt(process.env.PG_PORT), // Database port
	username: process.env.PG_USERNAME, // Database username
	password: process.env.PG_PASSWORD, // Database password
	database: process.env.PG_DATABASE, // Database name
	entities: ["dist/database/entities/*.entity{.ts,.js}"], // Entity files
	migrations: ["dist/database/migrations/version*/*{.ts,.js}"], // Migration files
	autoLoadEntities: true, // Auto-load entities for NestJS
	synchronize: process.env.NODE_ENV !== 'production', // Never auto-sync schema in production
	logging: true, // Enable SQL query logging
}

// Export as a NestJS config provider (for ConfigModule)
export default registerAs('typeorm', () => config)
// Export as a DataSource instance (for CLI and programmatic use)
export const connectionSource = new DataSource(config as DataSourceOptions);