sap.ui.getCore().attachInit(function (data) {
    setTimeout(function () {
        // showMap();
        if (sap.n) {
            sap.n.Shell.attachBeforeDisplay(function () {
                setTimeout(function () {
                    if (
                        oApp.getCurrentPage().getId().includes("oPageSESDetails") &&
                        oIconTabBar.getSelectedKey() === "tabMap"
                    ) {
                        oIconTabBar.fireSelect({
                            key: "tabMap",
                        });
                    } else if (oApp.getCurrentPage().getId().includes("oPageStart")) {
                        // showMap();
                        // map.setView(new L.LatLng(mapcenterlat, mapcenterlong), mapzoom);
                    } else if (oApp.getCurrentPage().getId().includes("oPageTimer")) {
                        var tmrData = JSON.parse(JSON.stringify(modeloPageSESDetails.oData));
                        initTimer(tmrData);
                    }
                }, 500);
            });
        }

        // INI ZEBRA DATAWEDGE -------------------------------------------------------------
        if (typeof datawedge !== "undefined") {
             datawedge.start();
        
// Use MessageToast
sap.m.MessageToast.show("datawedge active");             
             datawedge.start("com.bluefletch.motorola.datawedge.ACTION");
             datawedge.registerForBarcode(function (data) {
                datawedgeRegister(data);
             });
        }

        // document.addEventListener("deviceready", function () {
        //     if (window.datawedge) {
        //         datawedge.start(); //uses default

        //         datawedge.registerForBarcode(function (data) {
        //             var labelType = data.type,
        //                 barcode = data.barcode;

        //             // sap.m.MessageToast.show(
        //             //     "Barcode scanned.  Label type is: " + labelType + ", " + barcode
        //             // );
        //             // Do your stuff with the scanned barcode here!!!
        //             oSearchField.setValue(barcode);
        //             oSearchField.fireLiveChange();
        //         });
        //     }
        // });

        // END ZEBRA DATAWEDGE -------------------------------------------------------------
    }, 1000);

    //Added this for current testing
    btnListView.firePress();

    oApp.setBusy(true);

    if (!AppCache.isOffline) {
        // Get SAP Data
        var options = {
            parameters: {
                "sap-client": "800", // Required
            },
        };

        apiRestAPI_SAP(options);

        // //Get Header Documents
        // var options = {
        //     parameters: {
        //         where: "", // Optional
        //         select: "", // Optional
        //         take: "", // Optional
        //         skip: "", // Optional
        //         order: "", // Optional
        //     },
        // };

        // apiRestAPI_GetDocs(options);

        // //Get Stored Header / Detail in Open Edition
        // getDataOpenEdition();
    }
});

document.addEventListener(
    "deviceready",
    function () {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
        document.addEventListener(
            "resume",
            function () {
                if (
                    oApp.getCurrentPage().getId().includes("oPageSESDetails") &&
                    oIconTabBar.getSelectedKey() === "tabMap"
                ) {
                    oIconTabBar.fireSelect({
                        key: "tabMap",
                    });
                } else if (oApp.getCurrentPage().getId().includes("oPageStart")) {
                    // showMap();
                    // map.setView(new L.LatLng(mapcenterlat, mapcenterlong), mapzoom);
                } else if (oApp.getCurrentPage().getId().includes("oPageTimer")) {
                    var tmrData = JSON.parse(JSON.stringify(modeloPageSESDetails.oData));
                    lblHH.setText("00");
                    lblMM.setText("00");
                    lblSS.setText("00");
                    initTimer(tmrData);
                }
            },
            false
        );
    },
    false
);

// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
    var imgData = "data:image/jpeg;base64," + imageData;
    //imgData = iconDownload
    var nd = new Date();
    var ts = nd.getTime();
    var order = modeloPageSESDetails.oData.VBELN;
    var doc = {
        order: order,
        // order: modeloPageSESDetails.oData.VBELN,
        ts: ts,
        name: "DOC-" + ts,
        img: imgData,
        timetaken: getTS(nd),
    };
    ModelData.Add(mdlDocs, doc);
    setCachemdlDocs();

    if (modelmdlDocs.oData.length) {
        var alldocs = JSON.parse(JSON.stringify(modelmdlDocs.oData));
        var doclist = alldocs.filter((doclist) => doclist.order === order);
        // var doclist = ModelData.Find(mdlDocs, "order", modeloPageSESDetails.VBELN, "EQ");

        modeloListDocs.setData(doclist);
        modeloListDocs.refresh(true);
        tabDocs.setText("Documents(" + doclist.length + ")");
    } else {
        tabDocs.setText("Documents(0)");
    }

    // Add documents from cached API response
    var alldocsFromApi = JSON.parse(JSON.stringify(modelmdlDocsGetFromApi.oData));
    var doclistFromApi = alldocsFromApi.filter((doclistFromApi) => doclistFromApi.order === order);

    if (doclistFromApi.length) {
        //Find Existing Displayed Documents
        var findoListDocs = ModelData.Find(oListDocs, "order", order, "EQ");

        var checkIfDocExists;

        if (findoListDocs.length > 0) {
            for (let a = 0; a < doclistFromApi.length; a++) {
                checkIfDocExists = ModelData.Find(
                    findoListDocs,
                    "name",
                    doclistFromApi[a].name,
                    "EQ"
                );
                if (checkIfDocExists.length <= 0) {
                    ModelData.Add(oListDocs, doclistFromApi[a]);
                }
            }
        } else {
            for (let i = 0; i < doclistFromApi.length; i++) {
                ModelData.Add(oListDocs, doclistFromApi[i]);
            }
        }

        modeloListDocs.refresh(true);
        tabDocs.setText("Documents(" + modeloListDocs.oData.length + ")");
    }
}

// Called when a photo is successfully retrieved

function capturePhoto() {
    //  Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 50,
        correctOrientation: true,
        destinationType: destinationType.DATA_URL,
    });
}

// Called if something bad happens.
function onFail(message) {
    sap.m.MessageToast.show("Failed because: " + message);
}

window.addEventListener("offline", onOffline, false);
window.addEventListener("online", onOnline, false);

function onOffline() {
    sap.m.MessageToast.show("Device is Offline!");
    // btnSaveHeader.setEnabled(false);
}

function onOnline() {
    sap.m.MessageToast.show("Device is Online!");
    // btnSaveHeader.setEnabled(true);
}
