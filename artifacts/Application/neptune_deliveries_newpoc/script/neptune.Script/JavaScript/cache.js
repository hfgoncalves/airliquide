let deliveriesCacheLoaded = 0;

getCachesap_LIKP(true);
getCachesap_LIPS(true);

(function () {
    function waitForCache() {
        if (deliveriesCacheLoaded >= 2) {
            modeloListSES_SAP.setData(modelsap_LIKP.oData);
            modeloListSES_SAP.refresh(true);

            oApp.setBusy(false);
        } else {
            setTimeout(waitForCache, 50);
        }
    }
    waitForCache();
})();