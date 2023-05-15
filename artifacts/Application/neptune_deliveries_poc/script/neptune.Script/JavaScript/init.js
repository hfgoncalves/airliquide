sap.ui.getCore().attachInit(function(data) {
    setTimeout(function() {
        showMap();
        if (sap.n) {
            sap.n.Shell.attachBeforeDisplay(function() {
                setTimeout(function() {
                    if (oApp.getCurrentPage().getId().includes("oPageSESDetails") && oIconTabBar.getSelectedKey() === "tabMap") {
                        oIconTabBar.fireSelect({
                            'key': 'tabMap'
                        });
                    } else if (oApp.getCurrentPage().getId().includes("oPageStart")) {
                        showMap();
                        // map.setView(new L.LatLng(mapcenterlat, mapcenterlong), mapzoom);
                    } else if (oApp.getCurrentPage().getId().includes("oPageTimer")) {
                        var tmrData = JSON.parse(JSON.stringify(modeloPageSESDetails.oData));
                        initTimer(tmrData);
                    }
                }, 500);
            });
        }
    }, 1000);
});


document.addEventListener("deviceready", function() {
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
    document.addEventListener('resume', function() {
        if (oApp.getCurrentPage().getId().includes("oPageSESDetails") && oIconTabBar.getSelectedKey() === "tabMap") {
            oIconTabBar.fireSelect({
                'key': 'tabMap'
            });
        } else if (oApp.getCurrentPage().getId().includes("oPageStart")) {
            showMap();
            // map.setView(new L.LatLng(mapcenterlat, mapcenterlong), mapzoom);
        } else if (oApp.getCurrentPage().getId().includes("oPageTimer")) {
            var tmrData = JSON.parse(JSON.stringify(modeloPageSESDetails.oData));
            lblHH.setText("00");
            lblMM.setText("00");
            lblSS.setText("00");
            initTimer(tmrData);
        }
    }, false);
}, false);


// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
    var imgData = "data:image/jpeg;base64," + imageData;
    //imgData = iconDownload
    var nd = new Date();
    var ts = nd.getTime();
    var order = modeloPageSESDetails.oData.order;
    var doc = {
        'order': order,
        'ts': ts,
        'name': 'DOC-' + ts,
        'img': imgData,
        'timetaken': getTS(nd)
    };
    ModelData.Add(mdlDocs, doc);
    setCachemdlDocs();

    if (modelmdlDocs.oData.length) {
        var alldocs = JSON.parse(JSON.stringify(modelmdlDocs.oData));
        var doclist = alldocs.filter(doclist => doclist.order === order);
        modeloListDocs.setData(doclist);
        modeloListDocs.refresh(true);
        tabDocs.setText("Documents(" + doclist.length + ")");
    } else {
        tabDocs.setText("Documents(0)");
    }
}

// Called when a photo is successfully retrieved

function capturePhoto() {
    //  Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 50,
        correctOrientation: true,
        destinationType: destinationType.DATA_URL
    });
}


// Called if something bad happens.
function onFail(message) {
    sap.m.MessageToast.show('Failed because: ' + message);
}