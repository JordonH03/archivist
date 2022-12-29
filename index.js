import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";
import chalk from "chalk";

const error = chalk.bold.red('Error\n');
const success = chalk.bold.green('Success\n');
const pending = chalk.bold.blue('Pending\n');
const info = chalk.bold.gray('Info\n');

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY});
const databaseId = process.env.NOTION_DATABASE_ID;