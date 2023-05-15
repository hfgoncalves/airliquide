jQuery.sap.require("sap.m.MessageBox");
var timer = false;
var addressMarker, addrmap, myTileLayer;
var signaturePad;
var map, offlineControl, offlineLayer, tileCounter = 0,
    memarker;
var markers = L.markerClusterGroup();
var marker = [];
var circles = [];
var dateToday = new Date().toDateString().substring(4);
var headerbackup, detailsbackup, orderheaders, orderdetails;
var initlat = 30.430028,
    initlong = -97.748097;
var mapcenterlat = initlat, mapcenterlong = initlong, mapzoom = 7;

var doc, docs = [];
var iconTrash =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAjklEQVRIie2ROwqAMBBEn3oBa0vPKH6O4A28nmAr2ApCbBTCEhNjFJsMDCzZZN6yAbtSoAJGQAlPQAtkjgyrakOwdB0COCfvgFK4OXqjLSDRahUyyVV2+nKomWLp5TdzFjw24PpUlws97PMV/Q5IPGtvQLAiIAIiIAIeAlatVp61fG8E9PLSTW3AAMz64Q56jzH0vZGtIAAAAABJRU5ErkJggg==";
var iconDownload =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAY0lEQVRIiWNgGOqAkQS1/8nRy0SCBWSBUQtGLRjiFpQzQDIXDKMDZLl6ch2Abgk2TLbhxFhCseH4LKGa4dgsIdpwZhIsOMoAKUEPMjAwNJLktFGADyDXStgyE8Vm07yoGPoAAH1UItbw1O5lAAAAAElFTkSuQmCC";
var meIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1NEM2Rjk2RkY4REExMUUwQjVCQzhEMERFODIwRjI2NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1NEM2Rjk3MEY4REExMUUwQjVCQzhEMERFODIwRjI2NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU0QzZGOTZERjhEQTExRTBCNUJDOEQwREU4MjBGMjY0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU0QzZGOTZFRjhEQTExRTBCNUJDOEQwREU4MjBGMjY0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+q7UyigAAAxtJREFUeNq8VU1IVFEUPm/ejMyfJqlvIDXRqCQXQouQlokmVARtojYRVLQQkcS9m1YiuHAZtGvpLvqBXESgmwjBWpUzOSXMODqOMm+mmfvTOefdNw460SY78PHOnHvPd889P3csaCyWgY0IGgTMmkIIA4nQJI0IDv8OGKIIIoaIIsLGBoawjHARRUTJ2FT9AVYDUiJsRbQtLCyMDg4ODvX29g60t7d306ZcLpdOJpOfV1dXV8bHx9+iaRuxaw5Qh6P3r92CODM1NXUvk8l8038R2kN7ycf4EodVz02GOG2YmJh4oFDIcX2voheT+/rppx39+EOWQTrZaI2E9pKPIScOm4j9IjUhOvD04dnZ2ecWytJPF96ki7DpCtC1nFmoe06nYkG42hWDK51Rrt709PT9ubm5d7i0haj4eaVr9ODVFh3H6Vv6UYQXXwtQFt51+GK161k1+giW887ZEzCMB2Sz2fVEInELN3xH7AVMGmJUKCJdL1TgVWof3LIEKSQohBYYtVQMJdHGuoBiRcLr1B6QD/kSh+kk22+tKFWf4vmYcWGjUGYCTcSSDlAg6Us2SToegDZVlbCx+4t9SAwHtWfQJw5TS9Hi2pbLUcqqFzF9OUoTvawKJBR8iG9by3rEhoN73p+ooN+nqe0Sb66Jrut2o/NHH5hSOyXWDQdzBg+PosR8yqoCCz21tv7I7heQrCpw9E0I+LNPE0WG081NGLEAQSmga/N1Fdv8q3NK2CY5kO5mLz7DIfyzePZpTGlxoCPCedU1AuHlVXgHSZNnBq9J9IkyseGgd0T4xC7NPi1e6myBruaQR0AFMsVrWEzUaS/5kBgOqqRoOCAvv2Th2Uoa+1RgkayDzFqeQiZSI002PBzqhmsXnCMDYtdXBCczPTIycvOcE7fiIRs2d0uQdyvAjwpCK806fXtaw3D3YidcH0jwSM/MzDxZXl6mVBSoB+z6hsCFnXw+vzY2NnbjfCJu9TtxaIuGuLzFchVCOE/9TgxG+zvgNpJe7jvJpJOTk4/m5+ffmyeUXid1bM/msT30/+Wv6Z/+mf4WYAC32Za2LB+YQQAAAABJRU5ErkJggg==";
var redIcon =
    "data:image/png;base64,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";
var greenIcon =
    "data:image/png;base64,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";
var orangeIcon =
    "data:image/png;base64,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";
var iconShadow =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACJ0lEQVR4Ae3ShY6bQRADYIeZ3v+9yszMDZPlkSWtslPuiS6+C+8n/zNp4p/froi8Jq/Jxk+TkwmHX//Wz8lG3jNjTeaguabD6HAVbphMwIIzqtd+rzKYhsgUNNcqo3fEBlyyOWmwhbbS4b8SaLBu7SGlpL9gklw3YpYR6J5Bm0zAguspZjvqSVQxqvxsPSJJKYIFKh5A2VIDyMgYfYB9hvcmI0VPTxVZS81ER7qiBoFqBAa9MKOKLzzv2BE3EOnlmDTrNRXryToGOGR65nhvSphjMP6b6WJ6xMYYxSW7l1Pp6CSzbLFPgAN3NGLKPRn3c59qxzapCTPUFNVKh0vUe24azMkW+uRm/B8UU3O3Eiw4nOrrafOSF5gS7PqHUotBQQ6f11p22HDOi+66i2LIHcWJOZrTP+rkhOl7n8YcTzCQIuIvyZPQrvs5Br0OdTsyB+YYrwKokXvsgOIXZzbeQ0DMnhHIqGOdBMEl9qKYAo3pBbbDNkijUSgjv/PrMFhwRwS2YbbMzqg+SzdukoxbeiSEVlgyK6yFmjSYtDxhTXRv1OsgsCb2jflu8hLMyC0P7Qg54NE1qc/MF5PqeAHWSfDL3zxN9dsQ+YD3zEeRS4GeYgFm5I7HNiJPfP4V7/CKeUvwsxpqhkwFzMgjj33Vwe+EnuIxngn8FvNTSCkwmJG+rQm8J/MId/EQL3nZwe2EmSNm9ufkFq9xHzcJPscnLGMRomBKqdzOY2EH+IPOLMEAAAAASUVORK5CYII=";

var iconGreen = new L.Icon({
    iconUrl: greenIcon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var iconRed = new L.Icon({
    iconUrl: redIcon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var iconOrange = new L.Icon({
    iconUrl: orangeIcon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

headerbackup = [{
        'order': '994953',
        'lat': 30.570618,
        'long': -97.409284,
        'address': '166 East 4th Street, Taylor, TX 76574',
        'customer': 'John Snow',
        'status': 'Initial',
        'amount': '$4426.39',
        'date': dateToday,
        'geofenceradius': 3000,
        'geofenceexited': false,
        'enabled': false,
        'signature': ''
    },
    {
        'order': '994952',
        'lat': 30.508023,
        'long': -97.686046,
        'address': '500 North Interstate 35, Round Rock, TX 78681',
        'customer': 'Steve Hofman',
        'status': 'Initial',
        'amount': '$1537.21',
        'date': dateToday,
        'geofenceradius': 5000,
        'geofenceexited': false,
        'enabled': false,
        'signature': ''
    },
    {
        'order': '994951',
        'lat': 30.351555,
        'long': -97.393205,
        'customer': 'Trudy Silva',
        'status': 'Initial',
        'amount': '$3612.78',
        'date': dateToday,
        'address': 'Roy Rivers Road, Elgin, TX 78621',
        'geofenceradius': 4000,
        'geofenceexited': false,
        'enabled': false,
        'signature': ''
    },
    {
        'order': '994800',
        'lat': 30.479818,
        'long': -97.110993,
        'customer': 'Harvey Nash',
        'status': 'Initial',
        'amount': '$1321.55',
        'date': dateToday,
        'address': 'FM 112, Lexington, TX 78947',
        'geofenceradius': 4500,
        'geofenceexited': false,
        'enabled': false,
        'signature': ''
    },
    {
        'order': '993161',
        'lat': 30.086911,
        'long': -97.837963,
        'customer': 'Jamie Oliver',
        'status': 'Initial',
        'amount': '$2518.37',
        'date': dateToday,
        'address': '405 Loop St, Buda, TX 78610',
        'geofenceradius': 2500,
        'geofenceexited': false,
        'enabled': false,
        'signature': ''
    },
    {
        'order': '910866',
        'lat': 30.117998,
        'long': -97.333234,
        'customer': 'Ryan Davis',
        'status': 'Initial',
        'amount': '$6619.42',
        'date': dateToday,
        'address': '131-101 Shoreline Dr, Bastrop, TX 78602',
        'geofenceradius': 3500,
        'geofenceexited': false,
        'enabled': false,
        'signature': ''
    }
];
console.log("-----");
console.log("headerbackup vvv");
console.log(headerbackup);

detailsbackup = [{
    'order': '994953',
    'lineno': 10,
    'desc': 'Rayban Pilot - Classic Black',
    'status': 'Initial',
    'timerecorded': 0,
    'enabled': false
}, {
    'order': '994953',
    'lineno': 11,
    'desc': 'Rayban Pilot - Deep Blue',
    'status': 'Initial',
    'timerecorded': 0,
    'enabled': false
}, {
    'order': '994952',
    'lineno': 1,
    'desc': 'M&M Kids Sunglasses',
    'status': 'Initial',
    'timerecorded': 0,
    'enabled': false
}, {
    'order': '994951',
    'lineno': 20,
    'desc': 'Oakley Radical Collection - Ski Glasses',
    'status': 'Initial',
    'timerecorded': 0,
    'enabled': false
}, {
    'order': '994800',
    'lineno': 30,
    'desc': 'Prada Flashion - VIP Edition',
    'status': 'Initial',
    'timerecorded': 0,
    'enabled': false
}, {
    'order': '993161',
    'lineno': 10,
    'desc': 'Nike Run Glasses - Women White',
    'status': 'Initial',
    'timerecorded': 0,
    'enabled': false
}, {
    'order': '910866',
    'lineno': 1,
    'desc': 'Oakley Classics - U Shape',
    'status': 'Initial',
    'timerecorded': 0,
    'enabled': false
}];
console.log("-----");
console.log("detailsbackup vvv");
console.log(detailsbackup);

orderheaders = JSON.parse(JSON.stringify(headerbackup));
orderdetails = JSON.parse(JSON.stringify(detailsbackup));