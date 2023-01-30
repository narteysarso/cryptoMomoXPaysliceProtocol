import dotenv from "dotenv"
import { Database, Registry } from "@tableland/sdk";


dotenv.config({ path: ".env.local" });

const tableland = async ({ signer }) => {

    const db = new Database({ signer });
    const registry = new Registry({signer});

    const tables = await registry.listTables();

    const tablename = `${process.env.TABLELAND_TABLENAME}_${await signer.getChainId()}_${tables.pop().tableId}`;

    const insert = async ({ accountId, firstname, lastname, phonenumber, pinHash, lang }) => {
        const { meta: insert } = await db
            .prepare(`INSERT INTO ${tablename} (
                id,
                firstname,
                lastname,
                phonenumber,
                pin,
                lang
                ) VALUES (@accountId, @firstname, @lastname, @phonenumber, @pinHash, @lang);`)
            .bind({ accountId, firstname, lastname, phonenumber, pinHash, lang })
            .run();

        // Wait for transaction finality
        await insert.txn.wait();
    }

    const find = async ({ fields, query = "" }) => {
        let parsedFields = "*";
        if (typeof fields === "object" && fields?.length > 0) {
            parsedFields = fields.join(",");
        }
        const { results, success } = await db.prepare(`SELECT ${parsedFields} FROM ${tablename} ${query};`).all();

        if (!success) return null;

        return results;
    }

    const findAll = async ({ offset = 0, limit = 50 }) => {
        const { results, success } = await db.prepare(`SELECT * FROM ${tablename} LIMIT ${limit};`).all();

        if (!success) return null;

        return results;
    }

    const findById = async ({ id }) => {
        const results = await find({ query: `where id = '${id}' ` });
        return results[0];
    }

    const findByPhonenumber = async ({ phonenumber }) => {
        const results = await find({ query: `WHERE phonenumber = '${phonenumber}' ` });
        return results[0];
    }

    const findLangByPhonenumber = async ({ phonenumber }) => {
        const results = await find({ fields: ["lang"], query: `WHERE phonenumber = '${phonenumber}' ` });
        return results[0];
    }

    const update = async ({ id, ...updateInfo }) => {
        const { meta: update } = await db
            .prepare(`UPDATE ${tablename} SET 
                    firstname = @firstname,
                    lastname = @lastname,
                    phonenumber = @phonenumber,
                    pin = @pin,
                    lang = @lang
                 WHERE id = '${id}';`)
            .bind(updateInfo)
            .run()

        await update.txn.wait();

        return update;
    }

    const remove = async ({ id }) => {
        const { meta: remove } = await db.prepare(
            `DELETE FROM ${tablename} WHERE id = ${id}`
        ).run();

        await remove.txn.wait();
    }

    // const getConnection = () => connection;

    return Object.freeze({
        getTablename: () => tablename,
        insert,
        findById,
        findByPhonenumber,
        findLangByPhonenumber,
        find,
        findAll,
        update,
        remove
    })
}

export default tableland;