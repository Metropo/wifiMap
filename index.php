<?php
include("config.php");
?>
<!DOCTYPE html>
<html>
    <head>
        <script src="jquery/jquery-1.12.0.min.js"></script>
        <!-- Change Google Maps API KEY! -->
        <!--<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAF4meMeSyCp5oPqAKf2z0yn5oJVtTENtI&libraries=places"></script>-->
        <!--<script src="js/TxtOverlay.js"></script>-->
    
    
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
            integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
            crossorigin="" />
    
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
            integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
            crossorigin=""></script>
    
        <link rel="stylesheet" href="css/estils2.css">
        <script src="config.js"></script>
        <script src="js/wifiMap.js"></script>
    </head>
    
    <body>
        <input id="inputCerca" class="controls" type="text" placeholder="Cerca usuaris">
        <div class="divControls controls" id="divControls">
            <a href="#"><img id="botoRecarregar" src="images/refresh.png" alt="recargar"></a>
            <label class="labelsCheckbox"><input id="checkboxAP" type="checkbox" checked>APs</label>
            <label class="labelsCheckbox"><input id="checkboxEtiquetes" type="checkbox" checked>Noms</label>
        </div>
        <div id="map"></div>
        <script>
        
            var map = L.map('map').setView([<?php echo($mapStartPoint["lat"] . ", " . $mapStartPoint["long"]); ?>], <?php echo($mapZoomLevel); ?>);
        
            var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                maxZoom: 20,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1
            }).addTo(map);
        
            $(document).ready(function () {
                //Arrenca-ho tot!
                start(map, document.getElementById("divControls"), document.getElementById("inputCerca"), document.getElementById("botoRecarregar"), document.getElementById("checkboxAP"), document.getElementById("checkboxEtiquetes"));
            });
        </script>
    </body>
</html>