import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();
const notion = new Client({ auth: process.env.NOTION_KEY});
const databaseId = process.env.NOTION_DATABASE_ID;

const error = chalk.bold.red('Error\n');
const success = chalk.bold.green('Success\n');
const pending = chalk.bold.blue('Pending\n');

/**
 * For each page with the "Complete" status, set the archive property to true.
 */
async function archivePages() {
    const pages = await getDatabasePages();

    console.log(pending + `Archiving ${pages.length} pages.`);
    for (const i in pages) {
        const page = pages[i];
        const pageId = page.id;

        const response = await archivePage(pageId);
        console.log(response);
    }

    console.log(success + `Archived ${pages.length} pages.`);
}

/**
 * Archives a single page with the given page id. Updates the 'Archived' property to true.
 * @param {string} pageId The id of the page to be updated
 */
async function archivePage(pageId) {
    const reponse = await notion.pages.update({
        page_id: pageId,
        properties: {
            'Archived': {
                checkbox: true,
            },
        },
    });

    console.log(reponse);
}

/**
 *  Gets pages from the database with a Status property of "Complete" and an Archived property of "unchecked".
 * @returns A list of all completed takss in the database that are unarchived.
 */
async function getDatabasePages() {
    const pages = [];

    let cursor = undefined;

    try {

        while (true) {

        // Get the next batch of pages from the database
        console.log(pending + 'Fetching pages from database...');
        const { results, next_cursor } = await notion.databases.query({
            database_id: databaseId,
            start_cursor: cursor,
            filter: {
                and: [
                    {
                        or: [
                            {
                                property: 'Status',
                                status: {
                                    equals: 'Done',
                                },
                            },
                            {
                                property: 'Status',
                                status: {
                                    equals: 'Missed',
                                }
                            },
                            {
                                property: 'Status',
                                status: {
                                    equals: 'Cancelled',
                                },
                            },
                        ],
                    },
                    {
                        property: 'Archived',
                        checkbox: {
                            does_not_equal: true,
                        },
                    },
                ],
            },
        });
        pages.push(...results);

        if (!next_cursor) { // no more page results left to query
            console.log(success + `${pages.length} page(s) sucessfully fetched.`);
            break;
        }

        cursor = next_cursor;
        }
    }
    catch(err) {
        console.error(error + err);
    }

    return pages;
}

archivePages();