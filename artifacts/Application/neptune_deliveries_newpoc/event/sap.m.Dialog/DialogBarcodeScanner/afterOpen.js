if (typeof cordova !== "undefined") {
    let permissions = cordova.plugins.permissions;

    permissions.checkPermission(permissions.CAMERA, (res) => {
        if (!res.hasPermission) {
            
            permissions.requestPermission(permissions.CAMERA, function (a) {
                Quagga.init(
                    {
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: document.getElementById("reader"), // Or '#yourElement' (optional)
                        },
                        decoder: {
                            readers: ["code_128_reader"],
                        },
                    },
                    function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log("Initialization finished. Ready to start");

                        Quagga.start();
                    }
                );
            });
        }
    });
} else {
    Quagga.init(
        {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.getElementById("reader"), // Or '#yourElement' (optional)
            },
            decoder: {
                readers: ["code_128_reader"],
            },
        },
        function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Initialization finished. Ready to start");

            Quagga.start();
        }
    );
}
