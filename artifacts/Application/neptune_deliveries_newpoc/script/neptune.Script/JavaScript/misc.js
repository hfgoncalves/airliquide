function showMap() {
    //var map = L.map('map-id');
    if (map) {
        map.remove();
    }
    map = L.map(hBoxMap.getDomRef());
    //https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

    //console.log(modelmobjMapState.oData)

    if (modelmobjMapState.oData.length) {
        var mapstate = JSON.parse(JSON.stringify(modelmobjMapState.oData))[0];
        //console.log(mapstate);
        mapcenterlat = mapstate.lat;
        mapcenterlong = mapstate.long;
        mapzoom = Math.round(mapstate.zoom);
    } else {
        mapcenterlat = initlat;
        mapcenterlong = initlong;
        mapzoom = 7;
    }

    offlineLayer = L.tileLayer.offline(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        tilesDb,
        {
            attribution:
                "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
            //subdomains: 'abc',
            minZoom: 7,
            maxZoom: 11,
            //crossOrigin: true
        }
    );

    offlineControl = L.control.offline(offlineLayer, tilesDb, {
        saveButtonHtml: '<img class="center" src="' + iconDownload + '" height="50%" width="50%"/>',
        removeButtonHtml: '<img class="center" src="' + iconTrash + '" height="50%" width="50%"/>',
        confirmSavingCallback: function (nTilesToSave, continueSaveTiles) {
            if (nTilesToSave > 1500) {
                sap.m.MessageToast.show(
                    "Please zoom in a little more before downloading offline map..."
                );
            } else if (nTilesToSave > 0) {
                sap.m.MessageBox.confirm(
                    "Download map with " + nTilesToSave + " tiles to the device for offline use ?",
                    {
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        onClose: function (sAction) {
                            if (sAction === "OK") {
                                continueSaveTiles();
                            }
                        },
                    }
                );
            } else {
                sap.m.MessageToast.show("No tiles to download, please zoom out a bit...");
            }
        },
        confirmRemovalCallback: function (continueRemoveTiles) {
            sap.m.MessageBox.confirm("Remove offline map and all the tiles?", {
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        continueRemoveTiles();
                    }
                },
            });
        },
        minZoom: 7,
        maxZoom: 11,
    });
    offlineLayer.addTo(map);
    offlineControl.addTo(map);
    // lat: 39.8097343,
    // lng: -98.5556199
    map.setView(
        {
            //lat: 30.430028,
            //lng: -97.748097
            lat: mapcenterlat,
            lng: mapcenterlong,
        },
        mapzoom
    );
    markers = L.markerClusterGroup();
    marker = [];
    circles = [];
    var color;
    $.each(orderheaders, function (i, val) {
        var maplink = getMapLink2(val.lat, val.long);
        switch (val.status) {
            case "Initial":
                color = "red";
                icon = iconRed;
                break;
            case "In Progress":
                color = "orange";
                icon = iconOrange;
                break;
            case "Completed":
                color = "green";
                icon = iconGreen;
                break;
        }
        marker[i] = L.marker([val.lat, val.long], {
            icon: icon, //L.BeautifyIcon.icon(iconRed)
        });
        marker[i].order = val.order;
        var strPopup =
            "<b> Order: <a class='orderlink' href=#>" +
            val.order +
            "</a></b><br/>Status: <font color='" +
            color +
            "'>" +
            val.status +
            "</font><br/><a href=" +
            maplink +
            " target=_system>Navigate here</a>";
        marker[i].bindPopup(strPopup);
        //marker[i].setIcon(icon); //L.BeautifyIcon.icon(icon)
        markers.addLayer(marker[i]);

        circles[i] = L.circle([val.lat, val.long], {
            color: "#2C3539",
            fillColor: "#2C3539", //#f03
            fillOpacity: 0.5,
            radius: val.geofenceradius,
        });

        circles[i].orderid = val.order;

        marker[i].on("add", function () {
            circles[i].addTo(map);
        });
        marker[i].on("remove", function () {
            circles[i].remove();
        });
    });
    map.addLayer(markers);

    map.on("popupopen", function () {
        $(".orderlink").click(function (e) {
            var str = e.target;
            var orderid = $(str).text();
            var orderheader = orderheaders.filter((header) => header.order === orderid);
            modeloPageSESDetails.setData(orderheader[0]);
            modeloPageSESDetails.refresh(true);
            var singleorder = orderdetails.filter((singleorder) => singleorder.order === orderid);
            modeloListSESItems.setData(singleorder);
            modeloListSESItems.refresh(true);
            oApp.to(oPageSESDetails);
            setMsgs(objStatMsgDet, singleorder[0].enabled);
            if (singleorder[0].enabled) {
                btnAdd.setEnabled(true);
                btnDelDoc.setEnabled(true);
            } else {
                btnAdd.setEnabled(false);
                btnDelDoc.setEnabled(false);
            }
            if (orderheader[0].status === "Completed") {
                btnSaveHeader.setEnabled(false);
                tabSign.setVisible(true);
                btnAdd.setEnabled(false);
                btnDelDoc.setEnabled(false);
            } else {
                btnSaveHeader.setEnabled(true);
                tabSign.setVisible(false);
            }
            if (modelmdlDocs.oData.length) {
                var alldocs = JSON.parse(JSON.stringify(modelmdlDocs.oData));
                var doclist = alldocs.filter((doclist) => doclist.order === orderid);
                modeloListDocs.setData(doclist);
                modeloListDocs.refresh(true);
                tabDocs.setText("Documents(" + doclist.length + ")");
            } else {
                tabDocs.setText("Documents(0)");
            }
        });
    });

    var currentLocIcon = L.icon({
        iconUrl: meIcon,
        iconSize: [22, 22], // size of the icon
    });

    memarker = L.marker([30.4, -97.5], {
        icon: currentLocIcon,
        zIndexOffset: -100,
        draggable: true,
    })
        .addTo(map)
        .bindPopup("This is you !");

    if (modelmobjMe.oData.length) {
        memarker.setLatLng(new L.LatLng(modelmobjMe.oData[0].lat, modelmobjMe.oData[0].long));
    }
    dragMarker({
        latlng: memarker.getLatLng(), //// ADDED
    });
    memarker.on("drag", function (e) {
        saveCoOrds(e.latlng);
        dragMarker(e);
    });

    getDBSize();

    map.on("zoom", function () {
        mapcenterlat = map.getCenter().lat;
        mapcenterlong = map.getCenter().lng;
        mapzoom = map.getZoom();
        saveMapState(mapcenterlat, mapcenterlong, mapzoom);
    });

    map.on("drag", function () {
        mapcenterlat = map.getCenter().lat;
        mapcenterlong = map.getCenter().lng;
        mapzoom = map.getZoom();
        saveMapState(mapcenterlat, mapcenterlong, mapzoom);
    });

    offlineLayer.on("offline:below-min-zoom-error", function () {
        sap.m.MessageToast.show("Can not save tiles below minimum zoom level.");
    });

    offlineLayer.on("offline:save-start", function (data) {});

    offlineLayer.on("offline:save-end", function () {
        oDialog.close();
        tileCounter = 0;
        getDBSize();
        sap.m.MessageToast.show("All the tiles were saved.");
    });

    offlineLayer.on("offline:save-error", function (err) {});

    offlineLayer.on("offline:remove-start", function () {});

    offlineLayer.on("offline:remove-end", function () {
        getDBSize();
        sap.m.MessageToast.show("All the tiles were removed.");
    });

    offlineLayer.on("offline:remove-error", function (err) {});
}

function getMapLink(address) {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
        windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
        iosPlatforms = ["iPhone", "iPad", "iPod"],
        os = null;
    if (macosPlatforms.indexOf(platform) !== -1) {
        os = "https://www.google.com/maps?q=" + address;
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        //os = "maps://" + lat + "," + long;
        os = "https://www.google.com/maps?q=" + address;
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = "https://www.google.com/maps?q=" + address;
    } else if (/Android/.test(userAgent)) {
        // os = "geo:0,0?q=" + lat + "," + long;
        os = "https://www.google.com/maps?q=" + address;
    } else if (!os && /Linux/.test(platform)) {
        os = "https://www.google.com/maps?q=" + address;
    }
    return os;
}
function getMapLink2(lat, long) {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
        windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
        iosPlatforms = ["iPhone", "iPad", "iPod"],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = "https://www.google.com/maps?q=" + address;
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        //os = "maps://" + lat + "," + long;
        os = "https://www.google.com/maps?q=" + address;
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = "https://www.google.com/maps?q=" + address;
    } else if (/Android/.test(userAgent)) {
        os = "geo:0,0?q=" + lat + "," + long;
    } else if (!os && /Linux/.test(platform)) {
        os = "https://www.google.com/maps?q=" + address;
    }
    return os;
}
function getDBSize() {
    var myprom = localforage.length();
    myprom.then((data) => {
        if (data > 0) lblStorage.setText(data + " maps in offline");
        else lblStorage.setText("No offline maps");
    });
}

function setProgress(current, total) {
    progDownload.setDisplayValue("Downloading tile... " + current + "/" + total + "...");
    progDownload.setPercentValue(parseInt((current * 100) / total));
    if (current === total) {
        progDownload.setDisplayValue("Saving " + total + " tiles to device...");
    }
}

function setEnableTimeRec(orderid, setVal) {
    $.each(orderheaders, function (i, val) {
        if (val.order === orderid) {
            val.enabled = setVal;
        }
    });
    $.each(orderdetails, function (i, val) {
        if (val.order === orderid) {
            val.enabled = setVal;
        }
    });
    saveOrderHeader();
    saveOrderDetails();
}

function setGeofenceExited(orderid, setVal) {
    $.each(orderheaders, function (i, val) {
        if (val.order === orderid) {
            val.geofenceexited = setVal;
        }
    });
    saveOrderHeader();
}

function setStatus(orderid, setVal) {
    setStatusHeader(orderid, setVal);
    setStatusItem(orderid, setVal);
}

function setStatusHeader(orderid, setVal) {
    // $.each(orderheaders, function(i, val) {
    //     if (val.order === orderid) {
    //         val.status = setVal;
    //     }
    // });
    // saveOrderHeader();

    //SAP--------------------------------------
    itemHeader = modeloPageSESDetails.oData;

    itemHeader.STATUS = setVal;

    saveOrderHeader();
}

function setStatusItem(orderid, setVal) {
    // $.each(orderdetails, function (i, val) {
    //     if (val.order === orderid) {
    //         val.status = setVal;
    //     }
    // });
    // saveOrderDetails();

    //SAP--------------------------------------
    // var orderNr = modeloPageSESDetails.oData.VBELN;

    itemList = ModelData.Find(sap_LIPS, "VBELN", orderid, "EQ");

    for (let i = 0; i < itemList.length; i++) {
        itemList[i].STATUS = setVal;
    }

    saveOrderDetails();
}

function saveTime(orderid, setVal) {
    // $.each(orderdetails, function (i, val) {
    //     if (val.order === orderid) {
    //         val.timerecorded = setVal;
    //     }
    // });
    // saveOrderDetails();

    itemList = ModelData.Find(sap_LIPS, "VBELN", orderid, "EQ");

    for (let i = 0; i < itemList.length; i++) {
        itemList[i].TIMERECORDED = setVal;
    }

    saveOrderDetails();
}

function saveSignature(orderid, setVal) {
    // $.each(orderheaders, function (i, val) {
    //     if (val.order === orderid) {
    //         val.signature = setVal;
    //     }
    // });
    // saveOrderHeader();

    itemHeader = modeloPageSESDetails.oData;

    itemHeader.SIGNATURE = setVal;

    saveOrderHeader();
}

function checkActiveTasks(order) {
    var retVal = false;
    for (var i = 0; i < orderdetails.length; i++) {
        if (orderdetails[i].status === "In Progress") {
            if (orderdetails[i].order !== order) {
                retVal = true;
                break;
            }
        }
    }
    return retVal;
}

function saveOrderHeader() {
    // if (modelmdlOrderHeaders.oData.length) {
    //     ModelData.UpdateArray(mdlOrderHeaders, "order", orderheaders, "EQ");
    // } else {
    //     ModelData.AddArray(mdlOrderHeaders, orderheaders);
    // }
    // setCachemdlOrderHeaders();

    ModelData.Update(sap_LIKP, "VBELN", itemHeader.VBELN, itemHeader, "EQ");

    setCachesap_LIKP();

    modeloPageSESDetails.setData(itemHeader);
}

function saveOrderDetails() {
    // if (modelmdlOrderDetails.oData.length) {
    //     ModelData.UpdateArray(mdlOrderDetails, "order", orderdetails, "EQ");
    // } else {
    //     ModelData.AddArray(mdlOrderDetails, orderdetails);
    // }
    // setCachemdlOrderDetails();

    for (let i = 0; i < itemList.length; i++) {
        ModelData.Update(
            sap_LIPS,
            ["VBELN", "POSNR"],
            [itemList[i].VBELN, itemList[i].POSNR],
            itemList[i],
            ["EQ", "EQ"]
        );

        setCachesap_LIPS();
    }

    modeloListSESItems_SAP.setData(itemList);
}

function saveCoOrds(latlong) {
    var latlongdata = {
        id: 1,
        lat: latlong.lat,
        long: latlong.lng,
    };
    if (modelmobjMe.oData.length) {
        ModelData.Update(mobjMe, "id", 1, latlongdata, "EQ");
    } else {
        ModelData.Add(mobjMe, latlongdata);
    }
    setCachemobjMe();
}

function saveMapState(lat, lng, zoom) {
    var mapstatedata = {
        id: 1,
        lat: lat,
        long: lng,
        zoom: Math.round(zoom),
    };
    if (modelmobjMapState.oData.length) {
        ModelData.Update(mobjMapState, "id", 1, mapstatedata, "EQ");
    } else {
        ModelData.Add(mobjMapState, mapstatedata);
    }
    setCachemobjMapState();
}

function setMsgs(obj, setVal) {
    if (setVal) {
        obj.setText("At Location");
        obj.setState("Success");
    } else {
        obj.setText("Not at Location");
        obj.setState("Error");
    }
}

function count() {
    var hour, mins, secs;

    hour = Number(lblHH.getText());
    mins = Number(lblMM.getText());
    secs = Number(lblSS.getText());
    secs++;
    if (secs == 60) {
        secs = 0;
        mins = mins + 1;
    }
    if (mins == 60) {
        mins = 0;
        hour = hour + 1;
    }
    if (hour == 13) {
        hour = 1;
    }

    lblHH.setText(plz(hour));
    lblMM.setText(plz(mins));
    lblSS.setText(plz(secs));
}

function plz(digit) {
    var zpad = digit + "";
    if (digit < 10) {
        zpad = "0" + zpad;
    }
    return zpad;
}

function startCount() {
    timer = setInterval(count, 1000);
}

function stopCount() {
    clearInterval(timer);
    timer = false;
}

function initTimer(data) {
    stopCount();
    // var orderheader = orderheaders.filter((header) => header.order === data.order)[0];
    var orderheader = modeloPageSESDetails.oData;
    if (modelmobjTimer.oData.length) {
        // if (modelmobjTimer.oData[0].orderid === data.order) {
        if (modelmobjTimer.oData[0].orderid === data.VBELN) {
            var storedTime = modelmobjTimer.oData[0].start;
            var timeNow;
            if (modelmobjTimer.oData[0].end > 0) {
                timeNow = modelmobjTimer.oData[0].end;
            } else {
                timeNow = Math.floor(Date.now() / 1000);
            }
            var totalSeconds = timeNow - storedTime;
            var hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = totalSeconds % 60;
            lblHH.setText(plz(hours));
            lblMM.setText(plz(minutes));
            lblSS.setText(plz(seconds));
            // if (data.enabled && modelmobjTimer.oData[0].end === 0) {
            if (data.ENABLED && modelmobjTimer.oData[0].end === 0) {
                startCount();
                btnStop.setEnabled(true);
                btnStart.setEnabled(false);
            } else {
                //console.log(data)
                // if (orderheader.geofenceexited) {
                //     lblMsg.setText("Timer was stopped because user moved out of geofenced area !");
                // } else {
                //     lblMsg.setText("");
                // }
                btnStop.setEnabled(false);
                btnReset.setEnabled(true);
                btnSaveItem.setEnabled(true);
            }
        }
    }

    // if (data.status === "Completed") {
    if (data.STATUS === "Completed") {
        // var timerec = data.timerecorded.split(":");
        var timerec = data.TIMERECORDED.split(":");
        lblHH.setText(timerec[0]);
        lblMM.setText(timerec[1]);
        lblSS.setText(timerec[2]);
        btnReset.setEnabled(false);
        btnSaveItem.setEnabled(false);
        btnStop.setEnabled(false);
        btnStart.setEnabled(false);
    }
}

function getTS(inpdate) {
    var a = inpdate;
    var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = "0" + a.getMinutes();
    var sec = "0" + a.getSeconds();
    var time =
        date + " " + month + " " + year + " " + hour + ":" + min.substr(-2) + ":" + sec.substr(-2);
    return time;
}

function redrawMarkers() {
    var color, icon;
    map.closePopup();
    $.each(orderheaders, function (i, val) {
        var maplink = getMapLink(val.lat, val.long);
        switch (val.status) {
            case "Initial":
                color = "red";
                icon = iconRed;
                break;
            case "In Progress":
                color = "orange";
                icon = iconOrange;
                break;
            case "Completed":
                color = "green";
                icon = iconGreen;
                break;
        }
        var strPopup =
            "<b> Order: <a class='orderlink' href=#>" +
            val.order +
            "</a></b><br/>Status: <font color='" +
            color +
            "'>" +
            val.status +
            "</font><br/><a href=" +
            maplink +
            " target=_system>Navigate here</a>";
        marker[i].setIcon(icon); //L.BeautifyIcon.icon(icon)
        marker[i].bindPopup(strPopup);
    });
}

function resetMarkers() {
    map.closePopup();
    $.each(orderheaders, function (i, val) {
        var maplink = getMapLink(val.lat, val.long);
        var strPopup =
            "<b> Order: <a class='orderlink' href=#>" +
            val.order +
            "</a></b><br/>Status: <font color='red'>" +
            val.status +
            "</font><br/><a href=" +
            maplink +
            " target=_system>Navigate here</a>";
        marker[i].setIcon(iconRed); //L.BeautifyIcon.icon(icon)
        marker[i].bindPopup(strPopup);
    });
}

function centerMap() {
    var latLngs = [memarker.getLatLng()];
    for (var k = 0; k < marker.length; k++) {
        latLngs.push(marker[k].getLatLng());
    }
    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
    mapcenterlat = map.getCenter().lat;
    mapcenterlong = map.getCenter().lng;
    mapzoom = map.getZoom();
    saveMapState(mapcenterlat, mapcenterlong, mapzoom);
}

function dragMarker(e) {
    $.each(circles, function (i, circle) {
        var d = map.distance(e.latlng, circle.getLatLng());
        var isInside = d < circle.getRadius();
        var nearmarker = marker.find((singlmarker) => singlmarker.order === circle.orderid);
        if (isInside) {
            if (!nearmarker.isBouncing()) {
                nearmarker.bounce();
            }
        } else {
            if (nearmarker.isBouncing()) {
                nearmarker.stopBouncing();
            }
        }
        var singleorder = orderdetails.find((singleorder) => singleorder.order === circle.orderid);
        if (singleorder.enabled !== isInside) {
            if (isInside) {
                setEnableTimeRec(circle.orderid, true);
            } else {
                setEnableTimeRec(circle.orderid, false);
                if (modelmobjTimer.oData.length) {
                    if (modelmobjTimer.oData[0].end === 0) btnStop.firePress();
                    setGeofenceExited(circle.orderid, true);
                }
            }
        }
        circle.setStyle({
            // fillColor: isInside ? 'green' : '#f03',
            // color: isInside ? 'green' : 'red'
            fillColor: isInside ? "blue" : "#2C3539",
            color: isInside ? "blue" : "#2C3539",
        });
    });
}

//Online / Offline Functions
// window.addEventListener("offline", onOffline, false);
// window.addEventListener("online", onOnline, false);

// function onOffline() {
//     sap.m.MessageToast.show("Offline!");
//     // oButtonCallAPI.setVisible(false);
// }

// function onOnline() {
//     sap.m.MessageToast.show("Online!");
//     // oButtonCallAPI.setVisible(true);
// }

//Get Delivery Headers from Open Edition to display data
function getDataOpenEdition() {
    var options = {
        parameters: {
            where: "", // Optional
            select: "", // Optional
            take: "", // Optional
            skip: "", // Optional
            order: "", // Optional
        },
    };

    apiRestAPI_GetHeader(options);
}

//Get Delivery Header to check if the record exists
function getDeliveryHeader(getHeader) {
    var options = {
        parameters: {
            where: JSON.stringify({ VBELN: getHeader.VBELN }),
        },
    };

    apiRestAPI_CheckHeader(options);
}

//Insert Delivery Header / Detail to Open Edition table
function insertDeliveryHeader(saveHeader) {
    var arrayHeaderDocs = [];
    var arrayHeaderDocsStruc = {};

    var saveDocs = modeloListDocs.oData;

    if (saveDocs.length > 0) {
        for (let i = 0; i < saveDocs.length; i++) {
            arrayHeaderDocsStruc = {
                order: saveDocs[i].order,
                ts: saveDocs[i].ts,
                name: saveDocs[i].name,
                img: saveDocs[i].img,
                timetaken: saveDocs[i].timetaken,
            };
            arrayHeaderDocs.push(arrayHeaderDocsStruc);
        }
    }

    var options = {
        data: {
            VBELN: saveHeader.VBELN,
            STATUS: saveHeader.STATUS,
            // ENABLED: saveHeader.ENABLED,
            ENABLED: false,
            GEOFENCERADIUS: saveHeader.GEOFENCERADIUS,
            GEOFENCEEXITED: saveHeader.GEOFENCEEXITED,
            SIGNATURE: saveHeader.SIGNATURE,
            DOCUMENTS: arrayHeaderDocs,
        },
    };

    apiRestAPI_HeaderSave(options);
}

function insertDeliveryDetail(saveDetail) {
    var arrayDetail = [];
    var arrayDetailstruc = {};

    if (saveDetail.length > 0) {
        for (let i = 0; i < saveDetail.length; i++) {
            arrayDetailstruc = {
                VBELN: saveDetail[i].VBELN,
                POSNR: saveDetail[i].POSNR,
                MATNR: saveDetail[i].MATNR,
                MAKTX: saveDetail[i].MAKTX,
                TIMERECORDED: saveDetail[i].TIMERECORDED,
                STATUS: saveDetail[i].STATUS,
                // ENABLED: saveDetail[i].ENABLED,
                ENABLED: false,
            };

            arrayDetail.push(arrayDetailstruc);
        }

        var options = {
            data: arrayDetail,
        };

        apiRestAPI_DetailSave(options);
    }
}

//Update Delivery Header / Detail to Open Edition table
function updateDeliveryHeader(updateHeader) {
    var options = {
        parameters: {
            where: JSON.stringify({ VBELN: updateHeader.VBELN }),
        },
        data: {
            STATUS: updateHeader.STATUS,
            // ENABLED: updateHeader.ENABLED,
            ENABLED: false,
            GEOFENCERADIUS: updateHeader.GEOFENCERADIUS,
            GEOFENCEEXITED: updateHeader.GEOFENCEEXITED,
            SIGNATURE: updateHeader.SIGNATURE,
        },
    };

    apiRestAPI_HeaderUpdate(options);
}

function updateDeliveryDetail(updateDetail) {
    var arrayUpdDetail = [];
    var arrayUpdDetailstruc = {};

    if (updateDetail.length > 0) {
        for (let i = 0; i < updateDetail.length; i++) {
            arrayUpdDetailstruc = {
                MATNR: updateDetail[i].MATNR,
                MAKTX: updateDetail[i].MAKTX,
                TIMERECORDED: updateDetail[i].TIMERECORDED,
                STATUS: updateDetail[i].STATUS,
                // ENABLED: updateDetail[i].ENABLED,
                ENABLED: false,
            };

            // arrayUpdDetail.push(arrayDetailstruc);

            var options = {
                parameters: {
                    where: JSON.stringify({
                        VBELN: updateDetail[i].VBELN,
                        POSNR: updateDetail[i].POSNR,
                    }),
                },
                data: arrayUpdDetailstruc,
            };

            apiRestAPI_DetailUpdate(options);
        }
    }
}

function datawedgeRegister(data) {

    oSearchField.setValue(data.barcode);
    oSearchField.fireLiveChange();

    datawedge.stopScanner();
}

function dataFromOpenEdition(modelOpenEdition, modelSAP) {
    var dataModel,
        responseDocsStruc = {},
        responseDocsArray = [];

    for (let i = 0; i < modelOpenEdition.length; i++) {
        //Header or Detail
        if (modelSAP === sap_LIKP) {
            dataModel = ModelData.Find(modelSAP, "VBELN", modelOpenEdition[i].VBELN, "EQ");
        } else {
            dataModel = ModelData.Find(
                modelSAP,
                ["VBELN", "POSNR"],
                [modelOpenEdition[i].VBELN, modelOpenEdition[i].POSNR],
                ["EQ", "EQ"]
            );
        }
        if (dataModel.length > 0) {
            //Change SAP Data based on Open Edition Data
            for (let a = 0; a < dataModel.length; a++) {
                if (modelSAP === sap_LIKP) {
                    dataModel[a].ENABLED = modelOpenEdition[i].ENABLED;
                    dataModel[a].STATUS = modelOpenEdition[i].STATUS;
                    dataModel[a].GEOFENCEEXITED = modelOpenEdition[i].GEOFENCEEXITED;
                    dataModel[a].GEOFENCERADIUS = modelOpenEdition[i].GEOFENCERADIUS;
                    dataModel[a].SIGNATURE = modelOpenEdition[i].SIGNATURE;
                    if (modelOpenEdition[i].DOCUMENTS !== undefined) {
                        if (modelOpenEdition[i].DOCUMENTS.length > 0) {
                            for (let c = 0; c < modelOpenEdition[i].DOCUMENTS.length; c++) {
                                responseDocsStruc = modelOpenEdition[i].DOCUMENTS[c];
                                responseDocsArray.push(responseDocsStruc);
                            }
                        }
                    }
                } else {
                    dataModel[a].ENABLED = modelOpenEdition[i].ENABLED;
                    dataModel[a].STATUS = modelOpenEdition[i].STATUS;
                    dataModel[a].TIMERECORDED = modelOpenEdition[i].TIMERECORDED;
                }
            }

            if (modelSAP === sap_LIKP) {
                ModelData.Update(modelSAP, "VBELN", modelOpenEdition[i].VBELN, dataModel[0], "EQ");
                setCachesap_LIKP();
            } else {
                for (let b = 0; b < dataModel.length; b++) {
                    ModelData.Update(
                        modelSAP,
                        ["VBELN", "POSNR"],
                        [modelOpenEdition[i].VBELN, modelOpenEdition[i].POSNR],
                        dataModel[b],
                        ["EQ", "EQ"]
                    );
                    setCachesap_LIPS();
                }
            }
        }
    }

    if (responseDocsArray.length > 0) {
        modelmdlDocsGetFromApi.setData(responseDocsArray);
        setCachemdlDocsGetFromApi();
    }

    modeloListSES_SAP.setData(modelsap_LIKP.oData);
    modeloListSES_SAP.refresh(true);
}

function getCachedData(cachedHeader, sapDataLikp, sapDataLips) {
    var checkDataHeader, checkDataDetail;

    for (let a = 0; a < cachedHeader.length; a++) {
        checkDataHeader = ModelData.Find(sapDataLikp, "VBELN", cachedHeader[a].VBELN, "EQ");
        checkDataDetail = ModelData.Find(sapDataLips, "VBELN", cachedHeader[a].VBELN, "EQ");

        if (checkDataHeader.length <= 0) {
            ModelData.Add(sap_LIKP, checkDataHeader[0]);

            for (let b = 0; b < checkDataDetail.length; b++) {
                ModelData.Add(sap_LIPS, checkDataDetail[b]);
            }
        }
    }

    modeloListSES_SAP.setData(modelsap_LIKP.oData);
    modeloListSES_SAP.refresh(true);
}
