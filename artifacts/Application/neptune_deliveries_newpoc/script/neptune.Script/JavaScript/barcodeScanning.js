// setTimeout(function() {

//     Quagga.init({
//         inputStream : {
//         name : "Live",
//         type : "LiveStream",
//         target: document.getElementById("reader")    // Or '#yourElement' (optional)
//         },
//         decoder : {
//         // You can add/change this according to the type of barcode you wish to scan
//         readers : ["code_128_reader"]
//         }
//     }, function(err) {
//         if (err) {
//             console.log(err);
//             return
//         }
//         console.log("Initialization finished. Ready to start");
//         // Quagga.start();
//     });

// }, 1000);
// try {
Quagga.onProcessed(function (result) {
    var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
        if (result.boxes) {
            drawingCtx.clearRect(
                0,
                0,
                parseInt(drawingCanvas.getAttribute("width")),
                parseInt(drawingCanvas.getAttribute("height"))
            );
            result.boxes
                .filter(function (box) {
                    return box !== result.box;
                })
                .forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                        color: "green",
                        lineWidth: 2,
                    });
                });
        }

        if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
                color: "#00F",
                lineWidth: 2,
            });
        }

        if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, { x: "x", y: "y" }, drawingCtx, {
                color: "red",
                lineWidth: 3,
            });
        }
    }
});
// }
// catch(err) {
// debugger;
// }
// try {
Quagga.onDetected(function (result) {
    var code = result.codeResult.code;
    sap.m.MessageToast.show(code);
    console.log("-----");
    console.log(code);

    oSearchField.setValue(code);
    oSearchField.fireLiveChange();

    Quagga.stop();

    DialogBarcodeScanner.close();
});

// }
// catch(err) {
// debugger;
// }
