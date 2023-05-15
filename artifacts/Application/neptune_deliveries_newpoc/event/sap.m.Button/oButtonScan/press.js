// if (typeof datawedge !== "undefined") {
//     datawedge.startScanner();
// } else {
//     DialogBarcodeScanner.open();
// }

if (window.datawedge) {
    // cordova.plugins.barcodeScanner.scan(
    //     // success callback function
    //     function (result) {
    //         // wrapping in a timeout so the dialog doesn't free the app
    //         setTimeout(function () {
    //             alert(
    //                 "We got a barcode\n" +
    //                     "Result: " +
    //                     result.text +
    //                     "\n" +
    //                     "Format: " +
    //                     result.format +
    //                     "\n" +
    //                     "Cancelled: " +
    //                     result.cancelled
    //             );
    //         }, 0);
    //     },

    //     // error callback function
    //     function (error) {
    //         alert("Scanning failed: " + error);
    //     },

    //     // options object
    //     {
    //         preferFrontCamera: false,
    //         showFlipCameraButton: true,
    //         orientation: "landscape",
    //     }
    // );
    datawedge.startScanner();
} else {
    DialogBarcodeScanner.open();
}

//Script
// cordova.plugins.barcodeScanner.scan(
//     // success callback function
//     function (result) {
//         // wrapping in a timeout so the dialog doesn't free the app
//         setTimeout(function () {
//             alert(
//                 "We got a barcode\
// " +
//                     "Result: " +
//                     result.text +
//                     "\
// " +
//                     "Format: " +
//                     result.format +
//                     "\
// " +
//                     "Cancelled: " +
//                     result.cancelled
//             );

//             oSearchField.setValue(result.text);
//             oSearchField.fireLiveChange();
//         }, 0);
//     },

//     // error callback function
//     function (error) {
//         alert("Scanning failed: " + error);
//     },

//     // options object
//     {
//         preferFrontCamera: false,
//         showFlipCameraButton: true,
//         orientation: "landscape",
//     }
// );
