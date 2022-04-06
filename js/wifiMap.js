/*//////////////////////////////////////////////////////////////////////////////////////
// WifiMap
// 
// Joan Sirera

The MIT License (MIT)

Copyright (c) 2016, jsirera

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


var map, 			//Mapa
	APs = [],		//Array de AP
	usuaris = [],	//Array de usuaris
	inputCerca, checkboxAP, checkboxEtiquetes, botoRecarregar; //Interficie afegida al mapa
	
customCircleMarker = L.CircleMarker.extend({
	options: { 
	   custom_data: 'Custom data!',
	   distance: 'distance from AP',
	   angle: 'rotation angle around AP',
	   apLocation: 'location of AP'
	}
 });
/**
 * Start everything
 * @param {div DOM object} Div containter for google map
 * @param {div DOM object} Div container for controls
 * @param {input text DOM object} User text search box
 * @param {img DOM object} image for refresh button
 * @param {input checkbox DOM object} Checkbox. show/hide AP's
 * @param {input checkbox DOM object} Checkbox. show/hide labels
 */
function start(divMapa, divControls, formInputCerca, formBotoRecarregar, formCheckboxAP, formCheckboxEtiquetes){
	inputCerca = formInputCerca;
	checkboxAP = formCheckboxAP;
	checkboxEtiquetes = formCheckboxEtiquetes
	botoRecarregar = formBotoRecarregar;
	map = divMapa; initMap(divMapa, divControls);
		
	//Afegeix event al checkbox de mostrar APs
	checkboxAP.addEventListener('change', function(event) {
		repintarAPs(APs, map, checkboxAP.checked, checkboxEtiquetes.checked);
	});
	//Afegeix event al checkbox de mostrar etiquetes
	checkboxEtiquetes.addEventListener('change', function(event) {
		repintarAPs(APs, map, checkboxAP.checked, checkboxEtiquetes.checked);
	});
	//Afegeix event al boto de recarregar
	botoRecarregar.addEventListener('click', function(event) {
		carregarDades();
	});

	//Arranquem refresc automatic
	var interval = setInterval(function(){carregarDades();	;}, AUTO_ACTUALITZACIO * 1000);
	
	//Arranquem moviment rotacio clients
	var interval = setInterval(function(){moveUsers(usuaris, map);}, 1 /FPS * 1000);

	carregarDades(); //Cridem un primer cop a carregar dades
}

/**
 * Initialize the map with form elements.
 * @param {div object} Map container
 * @param {div object} Controls container
 * @return {google map object} Map
 */
function initMap(divMapa, divControls) {
	//var opcionsMapa = {
	//		zoom: ZOOM_INICIAL,			
	//		center: LAT_LON_INICAL,
	//		scaleControl: true,
	//		panControl:true,
	//		zoomControl:true,
	//		mapTypeControl:true,
	//		streetViewControl:true,
	//		overviewMapControl:true,
	//		rotateControl:true
	//};
	//map = new google.maps.Map(divMapa, opcionsMapa);
	//// Create the search box and link it to the UI element.
	//var searchBox = new google.maps.places.SearchBox(inputCerca);
	//map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputCerca);
	//// Afegir controls al mapa
	//divControls.index = 1;
	//map.controls[google.maps.ControlPosition.TOP_CENTER].push(divControls);
	//return map;
}

/**
 * Load AP and users using unifi-api
 */
function carregarDades(){
	botoRecarregar.src = "images/refresh.gif";//className = "botoClicat"; //Indiquem que la petició s'esta processant
	$.getJSON( "Unifi-API/?action=list_devices", function( data ) {
		eliminarMarkers(APs);
		APs = afegirAPs(data, map);
		repintarAPs(APs, map, checkboxAP.checked, checkboxEtiquetes.checked);
		$.getJSON( "Unifi-API/?action=list_clients", function( data ) {
			eliminarMarkers(usuaris);
			usuaris = afegirUsuaris(data, APs, map);
			botoRecarregar.src = "images/refresh.png"; //Indiquem que la petició ha acabat
		});	
	});
}


/**
 * Create Marker, overlay text and infoWindow on the MAP for each AP
 * @param {javascript data} AP data 
 * @param {google map object} the map
 * @return {Array} Array of Google Maps Markers
 */
function afegirAPs(objAPs, map){
	var markers = [];
	//var imgAPon={
	//	url: 'images/ap_on.png',
	//	anchor: new google.maps.Point(10,10)
	//};
	//var imgAPoff={
	//	url: 'images/ap_off.png',
	//	anchor: new google.maps.Point(10,10)
	//};

	for (var i = 0; i < objAPs.length; i++){
		
		var ap = objAPs[i], imgAP;
		if (ap.type != "uap") continue; // Si no es un AP no el pintem
		//if (ap.state != 1) imgAP = imgAPoff; else imgAP = imgAPon; //Si el AP no esta actiu -> imatge vermella
		//var latlng = new google.maps.LatLng(ap.x, ap.y);
		//var txt = new TxtOverlay(latlng, ap.name, "etiquetaAP", map)
		console.log("UAP: " + ap.name + map);
		var marker = L.marker([ap.x, ap.y]).addTo(map);
		marker.custom_data = ap;
		marker.bindPopup(ap.name + ", Users: " + ap.num_sta).openPopup();
		//var marker = L.popup()
		//	.setLatLng([ap.x, ap.y])
		//	.setContent(ap.name + ", usuaris: " + ap.num_sta)
		//	.openOn(map);
		//	// new google.maps.Marker({
		//	//position: {lat: ap.x, lng: ap.y},
		//	//map: map,
		//	//dades: ap, //Desem tota la informació de l'AP al mateix marker
		//	//txtOverlay: txt, //Desem objecte txtOverlay (etiqueta)
		//	////animation: google.maps.Animation.DROP,
		//	//icon: imgAP,
		//	//title: ap.name + ", usuaris: " + ap.num_sta 
		//    //});
		//marker.setZIndex(1);
		var imgAPFinestra = 'images/ap_on.png';
		if (ap.state != 1) { 
			imgAPFinestra = 'images/ap_off.png'; 
			var content = '<div class="finestraPropietats">'+
							'<h1 class="firstHeading">'+
								'<img src="images/ap_off.png"> ' + ap.name + ' - No actiu' +
							'</h1>'+
						  '</div>';
		}
		else{
			var content = '<div class="finestraPropietats">'+
							'<h1 class="firstHeading">'+
								'<img src="images/ap_on.png"> ' + ap.name +
							'</h1>'+
							'<div>'+
								'<p><ul>' +
									'<li>MAC: <b>' + ap.mac + '</b></li>'+
									'<li>Velocitat: <b>' + ap.uplink.speed + '</b></li>'+
									'<li>ip: <b>' + ap.config_network.ip + '</b> (' + ap.config_network.type + ') </li>'+
									'<li>mascara: ' +  ap.config_network.netmask + '</li>'+
									'<li>Gateway: ' + ap.config_network.gateway + '</li>'+
									'<li>DNS: ' + ap.config_network.dns1 + '</li>'+
								'</ul></p>'+
							'</div><div>'+
								'<h2><ul>' +				
									'<li>Estacions: <b>' + ap.num_sta + '</b></li>' +								
									'<li>RX: <b>' + humanFileSize(ap.rx_bytes,false) + '</b></li>' +
									'<li>TX: <b>' + humanFileSize(ap.tx_bytes,false)+ '</b></li>' +
								'</ul></h2>'+
							'</div>'+
						  '</div>';
		}
		//Contingut de la finestra d'informació
		//var infowindow = new google.maps.InfoWindow()

		//google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
		//	return function() {
		//		if(isInfoWindowOpen(infowindow))
		//			infowindow.close();
		//		else{
		//			infowindow.setContent(content);
		//			infowindow.setZIndex(5);
		//			infowindow.open(map,marker);
		//		}
		//	};
		//})(marker,content,infowindow)); 	
		markers.push(marker);
	}
	return markers;
}


/**
 * Show o hide Markers and overlay text for APs.
 * @param {Array} AP Markers array 
 * @param {google map object} map
 * @param {Boolean} Indicates if AP icon must be showed in the map.
 * @param {Boolean} Indicates if AP label must be showed in the map.
  */
function repintarAPs(APs, map, mostrarAP, mostrarEtiquetes){
	//for (var i = 0; i < APs.length; i++){
	//	if(mostrarAP) {
	//		APs[i].setVisible(true); //mostrem marker
	//		if (mostrarEtiquetes) APs[i].txtOverlay.setMap(map); //mostrem etiqueta
	//		else APs[i].txtOverlay.setMap(null); //amaguem etiqueta
	//	}
	//	else {
	//		APs[i].setVisible(false);	//amaguem marker
	//		APs[i].txtOverlay.setMap(null); //amaguem etiqueta
	//	}
	//}	
}

/**
 * Create Marker, overlay text and infoWindow on the MAP for each Wifi user
 * @param {javascript data} Users data 
 * @param {javascript data} APs data 
 * @param {google map object} the map
 * @return {Array} Array of Google Maps Markers
 */
function afegirUsuaris(objUsuaris, APs, map){
	var markers = [];
	//var imgUsuari1={
	//	url: 'images/usuari1.png',
	//	//size: new google.maps.Size(80, 80),
	//	//origin: new google.maps.Point(30,30),
	//	anchor: new google.maps.Point(0,1)//(47,1)
	//};
	//var imgUsuari2={
	//	url: 'images/usuari2.png',
	//	//size: new google.maps.Size(80, 80),
	//	//origin: new google.maps.Point(30,30),
	//	anchor: new google.maps.Point(0,1)//(47,1)
	//};
	//var imgUsuariNoAutenticat={
	//	url: 'images/usuariNoAutenticat.png',
	//	//size: new google.maps.Size(80, 80),
	//	//origin: new google.maps.Point(30,30),
	//	anchor: new google.maps.Point(0,1)//(47,1)
	//};
	for (var i = 0; i < objUsuaris.length; i++){
		var usuari = objUsuaris[i];
		//var imatge = imgUsuari1;
		//if (usuari.hasOwnProperty('note') && usuari['note'].toLowerCase().indexOf(NOTA_USUARIS_DIFERENTS) >-1) imatge = imgUsuari2; // Si s'ha de pintar de color diferent...
		//if (usuari.hasOwnProperty('authorized') && usuari['authorized'] == false ) imatge = imgUsuariNoAutenticat; // Si s'ha de pintar de color diferent...
		var AP = cercarAPUsuari(APs,usuari.ap_mac); //Cerquem el ap del usuari
		var distancia = -(usuari.signal ) * FACTOR_COBERTURA_DISTANCIA; //Distancia al AP proporcional a la cobertura
		var angle = Math.random() * 2 * Math.PI;	//Creem angle aleatori en radiants
		var latLngUsuari = calculPosicioUsuari(AP.custom_data.x, AP.custom_data.y, distancia, angle);
		var latLngAP = [AP.custom_data.x, AP.custom_data.y];  //Desem posicio AP al mateix usuari per a tindre-ho mes a mà
		var etiqueta;
		//Consultem si el usuari s'ha autenticat amb radius
		if(usuari.hasOwnProperty('1x_identity') && usuari['1x_identity'] != "") etiqueta = (usuari['1x_identity']); //Si existeix usuari, l'afegim a l'etiqueta
		else if(usuari.name != undefined && usuari.name.trim() != "")  etiqueta = usuari.name; //Si no provem de posar el nom definit al controlador unifi
		else if(usuari.hostname != undefined && usuari.hostname.trim() != "")  etiqueta = usuari.hostname; //Si no provem de posar el nom de host
		else etiqueta = usuari.oui; //Si tampoc, aleshores posem la marca del dispositiu.
		
		//Escollim color etiqueta segons consum
		var etiquetaClass = "etiquetaUsuari";
		if (usuari.tx_bytes > CONSUM_DADES_EXTREM || usuari.rx_bytes > CONSUM_DADES_EXTREM) etiquetaClass += " etiquetaUsuariConsumExtrem";
		else if(usuari.tx_bytes > CONSUM_DADES_ALT || usuari.rx_bytes > CONSUM_DADES_ALT) etiquetaClass += " etiquetaUsuariConsumAlt";
		//var txt = new TxtOverlay(latLngUsuari, etiqueta, etiquetaClass, map)

		//var marker = L.marker(latLngUsuari).addTo(map);
		//marker.bindPopup(usuari.hostname).openPopup();#
		var marker = L.popup({"closeButton": false, "autoClose": false, "closeOnClick": null, "autoPan": false})
    .setLatLng(latLngUsuari)
    .setContent(etiqueta)
    .openOn(map);
	marker.custom_data = usuari;
	marker.distance = distancia;
	marker.angle = angle;
	marker.apLocation = latLngAP;
	//marker.closeButton = false;
	//marker.autoClose = false;

		//var marker = new google.maps.Marker({
		//	position: latLngUsuari,/*{lat: latUsuari, lng: lngUsuari},*/
		//	map: map,
		//	dades: usuari, 		//Desem tota la informació del usuari al mateix marker
		//	txtOverlay: txt, 	//Desem objecte txtOverlay (etiqueta)
		//	angle: angle, 		//Desem l'angle creat aleatoriament per poder moure posteriorment
		//	distancia: distancia,//Desem la distancia calculada per poder moure posteriorment
		//	posicioAP: latLngAP, //Desem posició AP al mateix usuari per a tindre-ho més a mà
		//	//animation: google.maps.Animation.BOUNCE,
		//	icon: imatge,
		//	title: usuari.hostname
		//});
		//marker.setZIndex(3);
		if (usuari.hasOwnProperty('authorized') && usuari['authorized'] == false ) etiqueta += " (no autoritzat)";
		var nomPersonalitzat = "";
		if(usuari.hasOwnProperty('1x_identity')) nomPersonalitzat += '<li>Username: <b>' + usuari['1x_identity'] + '</b></li>';
		if(usuari.hasOwnProperty('name') && usuari.name.trim() != "") nomPersonalitzat += '<li>Nom: <b>' + usuari['name'] + '</b></li>';
		var content = '<div class="finestraPropietats">'+
							'<h1 class="firstHeading">'+
								//'<img src="' + imatge.url + '"> ' + etiqueta +
							'</h1>'+
							'<div>'+
								'<p><ul>' + nomPersonalitzat +
									'<li>Nom de host: <b>' + usuari.hostname + '</b></li>'+
									'<li>Dispositiu: <b>' + usuari.oui +' </b></li>'+
									'<li>Ip: <b>' +  usuari.ip + '</b></li>'+
									'<li>MAC: <b>' + usuari.mac + '</b></li>'+
									'<li>AP: <b>' + AP.custom_data.name + '</b></li>'+
									'<li>SSID: <b>' + usuari.essid + '</b></li>'+
									'<li>Canal: <b>' + usuari.channel + ' ('+ usuari['radio'] +')</b></li>'+
									'<li>Senyal: <b>' + usuari.signal + 'dB '+ senyal2Qualitat(usuari.signal) +'%</b></li>'+
									'<li>Primera connexi&oacute;: <b>' + humanMillis(usuari.first_seen) + '</b></li>'+
									'<li>Connexi&oacute; actual: <b>' + humanMillis(usuari.assoc_time) + '</b></li>'+
									//'<li>&Uacute;ltima connexi&oacute;: <b>' + humanMillis(usuari.latest_assoc_time) + '</b></li>'+
									'<li>&Uacute;ltima activitat fa: <b>' + segonsDesde(usuari.last_seen) + ' segons</b></li>'+
									
								'</ul></p>'+
							'</div><div>'+
								'<h2><ul>' +				
									'<li>Baixat: <b>' + humanFileSize(usuari.tx_bytes,false) + '</b></li>' +
									'<li>Pujat: <b>' + humanFileSize(usuari.rx_bytes,false)+ '</b></li>' +
								'</ul></h2>'+
							'</div>'+
					 '</div>';
		
		//var infowindow = new google.maps.InfoWindow()
//
		//google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
		//	return function() {
		//		if(isInfoWindowOpen(infowindow))
		//			infowindow.close();
		//		else{
		//			infowindow.setContent(content);
		//			infowindow.setZIndex(10);
		//			infowindow.open(map,marker);
		//		}
		//	};
		//})(marker,content,infowindow)); 
		markers.push(marker);
	}
	return markers;
}

/**
 * Rotate user markers and labels arround the AP. Visivility update
 * @param {Array} Users 
 * @param {google map object} the map
 */
function moveUsers(users, map){

	//Si s'ha fet algun cerca...
	var cadenaCerca = inputCerca.value.toLowerCase();
	
	for (var i = 0; i < users.length; i++){
		var mostrar = false;
		var user = users[i];
		
		if (cadenaCerca == "") mostrar = true; //Si no estem cercant res -> el marquem per mostrar
		else{ //Si estem cercant -> el cerquem a totes les cadenes d'informació (nostname, user radius, SSID, xarxa, fabricant telefon...)
			var userRadius = (user.custom_data.hasOwnProperty('1x_identity') && user.custom_data['1x_identity'].toLowerCase().indexOf(cadenaCerca) >-1);
			var nomUnifi = (user.custom_data.hasOwnProperty('name') && user.custom_data['name'].toLowerCase().indexOf(cadenaCerca) >-1);
			var essid = user.custom_data.essid.toLowerCase().indexOf(cadenaCerca)>-1;
			var hostname = user.custom_data.hostname.toLowerCase().indexOf(cadenaCerca)>-1 ;
			var ip = user.custom_data.ip.toLowerCase().indexOf(cadenaCerca)>-1;
			var mac = user.custom_data.mac.toLowerCase().indexOf(cadenaCerca)>-1;
			var oui = user.custom_data.oui.toLowerCase().indexOf(cadenaCerca)>-1;
			var noteUnifi = (user.custom_data.hasOwnProperty('note') && user.custom_data['note'].toLowerCase().indexOf(cadenaCerca) >-1);
			if (userRadius || nomUnifi || essid || hostname || ip || mac || oui || noteUnifi) mostrar = true;
		}
	
		//user.txtOverlay.setMap(null); //amaguem etiqueta
		if (mostrar){
			//Calculem angle per afegir a la rotació del user en funcio de la cobertura (com mes cobertura mes velocitat)
			user.angle = ((RPM/(-user.custom_data.signal/20))/60 * 2 * Math.PI)/FPS + user.angle;
			var newLatLngUser = calculPosicioUsuari(user.apLocation[0], user.apLocation[1], user.distance, user.angle);
			user.setLatLng( newLatLngUser );
			if (checkboxEtiquetes.checked){ // Si s'ha de mostrar l'etiqueta, l'actualitzem a la posicio i la mostrem
			//	user.txtOverlay.moure(newLatLngUser);
			//	user.txtOverlay.show();
			}
			else
			user.txtOverlay.hide();
			//user.setVisible(true);
				
		}
		else{
			user.setVisible(false);
			//user.txtOverlay.hide();
		}
	
	}

}

/**
 * Search AP for the wifi user by MAC
 * @param {Array} APs 
 * @param {String} MAC of the user device
 * @return {google maps marker} The AP of the user
 */
function cercarAPUsuari(APs,mac){
	for (var i = 0; i < APs.length; i++){
		if (APs[i].custom_data.mac == mac)
			return APs[i];
	}
	return null;
}

/**
 * Erase MAP markers and overlays
 * @param {Array} Markers to erase 
 */
function eliminarMarkers(arrayMarkers){
	for (var i = 0; i < arrayMarkers.length; i++){
		arrayMarkers[i].setMap(null);
		arrayMarkers[i].txtOverlay.setMap(null); //amaguem etiqueta
	}
}

/**
 * Calculate a point from another point and vector (angle + distance)
 * @param {Number} X
 * @param {Number} Y
 * @param {Number} Distance from the first point
 * @param {Number} Angle
 * @return {google maps LatLng object} New point
 */
function calculPosicioUsuari(x, y, distancia, angle){
	var novaX = x + distancia * Math.cos(angle);
	var novaY = y + distancia * Math.sin(angle);
	//var latLng = new google.maps.LatLng(novaX, novaY);
	return ([novaX, novaY]);
}

/**
 * Check if InfoWindow is open
 * @param {infoWindow object} infoWindow object
 * @return {Boolean} returns true if infoWindow is open
 */
function isInfoWindowOpen(infoWindow){
    var map = infoWindow.getMap();
    return (map !== null && typeof map !== "undefined");
}

/**
 * Return 'human friendly' amount of data
 * @param {Number} bytes
 * @param {Boolean} True for 1024 notation (kB, MB..) or false for metric notation (KiB, MiB)
 * @return {String} Amount of data
 */
function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

/**
 * Converts dBm signal to quality percentage
 * @param {Number} dBm signal
 * @return {Number} Percentage of signal
 */
function senyal2Qualitat(dBm){
	// dBm to Quality:
    if(dBm <= -100)
        return (0);
    else if(dBm >= -50)
        return (99);
    else
        return (2 * (dBm + 100));
}

/**
 * Convert seconds from 01/01/1970 (unifi controller notation) to date
 * @param {Number} seconds
 * @return {String} Date
 */
function humanMillis(segons){
	var date = new Date(segons * 1000);
	return (date.toLocaleDateString() + " " + date.toLocaleTimeString());	
}

/**
 * Calculate seconds from date to now
 * @param {Number} Secons from 01/01/1970 to event
 * @return {Number} seconds
 */
function segonsDesde(data){
	var ara = new Date();
	millisAra = ara.getTime();
	millisEvent = data*1000;
	millisDiferencia = millisAra - millisEvent;
	return (Math.round(millisDiferencia/1000));

}
