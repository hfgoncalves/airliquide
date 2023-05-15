// req is the http request object when the server script is used as an api endpoint.
// const data = req.body; // request data body.

const getDeliveryHeader = await entities.airliquidesaveddeliveries_header.createQueryBuilder("alias")
    // .where("alias.VBELN = :VBELN", {VBELN: data.VBELN})
    .where("alias.VBELN = :VBELN", { VBELN: '0080017557' })
    .getOne();

var struc = {
    VBELN: '0080017558',
    STATUS: 'Initial',
    ENABLED: 'true',
    GEOFENCERADIUS: 'test5',
    GEOFENCEEXITED: '',
    SIGNATURE: ''
}

// if (getDeliveryHeader !== undefined) {
//     //Update Data
//     var test = "test3"

//     await entities.airliquidesaveddeliveries_header.createQueryBuilder()
//         .update()
//         .set({ "GEOFENCERADIUS": test })
//         .where("VBELN = :VBELN", { VBELN: '0080017557' })
//         .execute();

//     console.log(getDeliveryHeader)    
// } else {
//Insert Data

// }

// console.log(getDeliveryHeader)

complete();