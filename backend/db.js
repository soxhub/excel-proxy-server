const got = require("got");
const util = require("util");
const knex = require("knex")({
    client: "pg",
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

const ADDIN_LOG_TABLE_NAME = "logs";
const NARRATIVE_LOG_TABLE_NAME = "narrative_logs";

module.exports = Object.freeze({
    async initializeDatabase() {
        util.log("Initializing database...");

        const addinTableExists = await knex.schema.hasTable(ADDIN_LOG_TABLE_NAME);
        const narrativeTableExists = await knex.schema.hasTable(NARRATIVE_LOG_TABLE_NAME);

        if (!addinTableExists) {
            await knex.schema.createTable(ADDIN_LOG_TABLE_NAME, (table) => {
                table.increments("id");
                table.dateTime("date_time", { useTz: false });
                table.string("user_name");
                table.string("http_method");
                table.string("base_url");
                table.string("api_endpoint");
                table.integer("status_code");
            });
        }

        if (!narrativeTableExists) {
            await knex.schema.createTable(NARRATIVE_LOG_TABLE_NAME, (table) => {
                table.increments("id");
                table.dateTime("date_time", { useTz: false });
                table.string("user_name");
                table.string("instance_url");
            });
        }

        util.log("Database initialization complete!");
    },

    async saveAddinLogEntry(http_method, target_url, token, status_code) {
        // do some prep work before saving the log entry.
        // first, extract the base_url and api_endpoint from target_url
        const url_obj = new URL(target_url);

        const base_url = url_obj.origin;
        const api_endpoint = url_obj.pathname;

        // now get the user_name
        const user_name = await this._getUserName(base_url, token);
        
        // save the log entry
        return knex(ADDIN_LOG_TABLE_NAME).insert({
            date_time: new Date(), // save the current date/time in UTC timezone
            user_name,
            http_method,
            base_url,
            api_endpoint,
            status_code,
        });
    },

    async saveNarrativeLogEntry(instance_url, token) {
        const url_obj = new URL(instance_url);
        const base_url = url_obj.origin;

        const user_name = await this._getUserName(base_url, token);

        return knex(NARRATIVE_LOG_TABLE_NAME).insert({
            date_time: new Date(), // save the current date/time in UTC timezone
            user_name,
            instance_url,
        });
    },

    /**
     * Makes a request to the AB API to retrieve the user's full name. Returns the user's
     * full name, or null if the user's name could not be found.
     * 
     * @param {string} baseUrl the base url to make the API request to.
     * @param {string} token the token to include with the API request.
     * 
     * @returns {string|null} the user's full name, or null if the name could not be found.
     */
    async _getUserName(baseUrl, token) {
	    // gotOptions will be passed to "got" to make the request to the AB API
        const gotOptions = {
            method: "GET",
            headers: { token },
            responseType: "json",
        };

        const gotUrl = `${baseUrl}/api/v1/users/me`;

        let payload;
        try {
            payload = await got(gotUrl, gotOptions);
        } catch (error) {
            // if the API request gave a response with a bad error code, then return null
            // otherwise, rethrow the error
            if (error.response) { return null; }
            else { throw error; }
        }

        if (payload.body && payload.body.users && payload.body.users.length) {
            return payload.body.users[0].full_name;
        }
        
        return null;
    },
});
