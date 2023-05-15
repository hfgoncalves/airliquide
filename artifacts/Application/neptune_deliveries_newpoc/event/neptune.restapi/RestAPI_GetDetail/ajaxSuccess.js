if (xhr.responseJSON.length > 0) {
    // debugger;

    var detailOpenEdition = xhr.responseJSON;

    dataFromOpenEdition(detailOpenEdition, sap_LIPS);
}