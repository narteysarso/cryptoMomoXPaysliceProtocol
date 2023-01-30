import tableland from "../db/tableland.js";
import makeAccountLists from "./account-list.js";
import makeAccountEndpointHandler from "./account-endpoint.js";

const accountList = makeAccountLists({database: tableland});
const accountEndpoint = makeAccountEndpointHandler({accountList});

export default accountEndpoint;
