import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import adaptRequest from "./helpers/adapt-http-request.js";
import handleAccountRequest from "./accounts/index.js";
import adaptUssdRequest from "./helpers/adapt-ussd-request.js";
import {ussdMenu} from "./ussd/index.js";


dotenv.config({ path: ".env.local" });

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.all("/ussd", ussdController)
app.all("/accounts", accountController);
app.get("/accounts/:id", accountController);
app.get("/accounts/phonenumber/:phonenumber", accountController);

function accountController(req, res) {
    const httpRequest = adaptRequest(req);
    handleAccountRequest(httpRequest)
        .then(({ headers, statusCode, data }) =>
            res
                .set(headers)
                .status(statusCode)
                .send(data)

        )
        .catch(e => { console.log(e); res.status(500).end() });
}

function ussdController(req, res) {
    const ussdRequest = adaptUssdRequest(req);
    try {
        ussdMenu.run(ussdRequest).then(resMsg => {
            res
                .set({ "content-type": "text/plain" })
                .send(resMsg)
        }).catch(e => { console.log(e); res.status(500).end() });
        
    } catch (error) {
        console.log(error);
    }
}


app.listen(9000, () => console.log('server listening at port 9000'))

