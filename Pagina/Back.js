window.onload = function() {
    const lista = [];
    var planes={};
    var box = document.getElementById("chat");
    var btn = document.getElementById("boton");
    var mensaje = document.getElementById("mensaje");
    let socket = new WebSocket("wss://tarea-1.2022-2.tallerdeintegracion.cl/connect");

    var myIcon = L.icon({
        iconUrl: 'https://freepikpsd.com/file/2019/10/red-pin-png-Transparent-Images.png',
        iconSize: [24,48],
        iconAnchor: [12,48],

    });

    var PlaneIcon = L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Plane_icon.svg/1200px-Plane_icon.svg.png',
        iconSize: [24,24],
        iconAnchor: [12,24],

    });

    socket.onopen = function(event) {
        var join = {
          "type": "join",
          "id": "4bf7a7bc-8529-4984-b246-da04542741fa",
          "username": "srhernandez1",
          }
        socket.send(JSON.stringify(join));
    };

    btn.addEventListener("click", function (e) {
        var enviar = new Object();
        enviar.type="chat";
        enviar.content = mensaje.value;
        socket.send(JSON.stringify(enviar));
        mensaje.value = "";
    });

    var map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 190,
    attribution: '© OpenStreetMap'
}).addTo(map);

    socket.onmessage = function(event) {
        var message = event.data;
        var msg = JSON.parse(message);
        console.log(message)
        if (msg.type == "message"){
            var name = msg.message.name
            var currentdate = new Date(); 
            var datetime = "(" + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " ,["  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() +"])";
            box.innerHTML += datetime+name+":"+msg. message.content+"<br />"+"<br />";
        }
        if (msg.type == "flights"){
            //console.log(msg.flights);
            for(var name in msg.flights){

            }

            for(var name in msg.flights){
                //console.log(msg.flights[name]);
                var flight_id = msg.flights[name].id

                var aport_id = msg.flights[name].departure.id
                var nombre = msg.flights[name].departure.name
                var ciudad = msg.flights[name].departure.city.name
                var lat = msg.flights[name].departure.location.lat;
                var long = msg.flights[name].departure.location.long;
                var pos_id = lat.toString() + long.toString();
                
                var aport_id_2 = msg.flights[name].destination.id
                var nombre_2 = msg.flights[name].destination.name
                var ciudad_2 = msg.flights[name].destination.city.name
                var lat_2 = msg.flights[name].destination.location.lat;
                var long_2 = msg.flights[name].destination.location.long;

                var unique_id = flight_id +  lat.toString() + long.toString() +lat_2.toString() + long_2.toString();
                if(!(lista.includes(unique_id))){
                    lista.push(unique_id);
                    L.marker([lat, long], {icon: myIcon}).addTo(map)
                    .bindPopup("ID: "+aport_id+"<br>"+"Name: "+ nombre+"<br>"+"City: "+ciudad+"<br>"+"Location: "+lat+","+long);

                    L.marker([lat_2, long_2]).addTo(map)
                    .bindPopup("ID: "+aport_id_2+"<br>"+"Name: "+ nombre_2+"<br>"+"City: "+ciudad_2+"<br>"+"Location: "+lat_2+","+long_2);

                    var polyline = L.polyline([[lat,long],[lat_2,long_2]], {color: 'red'}).addTo(map);
                    map.fitBounds(polyline.getBounds());
                }
            }
        }
        if (msg.type == "plane"){
            var avion = L.marker([msg.plane.position.lat, msg.plane.position.long],{icon: PlaneIcon});
            if (!(msg.plane.flight_id in planes)){
                planes[msg.plane.flight_id] = avion;
                planes[msg.plane.flight_id].addTo(map).bindPopup("ID: "+msg.plane.flight_id+"<br>"+"Airline: "
                +msg.plane.airline.name+"<br>"+"Captain: "+msg.plane.captain);
            }
            else{
                planes[msg.plane.flight_id].setLatLng([msg.plane.position.lat, msg.plane.position.long]);
            }
            if (msg.plane.status == "arrived"){
                var tem = L.marker(planes[msg.plane.flight_id].getLatLng()).addTo(map).bindPopup("ARRIVED"+"<br>"+
                "ID: "+msg.plane.flight_id+"<br>"+"Lat: "+msg.plane.position.lat+"<br>"+"Long: "+msg.plane.position.long).openPopup();
                setTimeout(function(){
                    map.removeLayer(tem);
                }, 1000);
                map.removeLayer(planes[msg.plane.flight_id]);
                delete planes[msg.plane.flight_id];
            }
            if (msg.plane.status == "take-off"){
                var tem = L.marker(planes[msg.plane.flight_id].getLatLng()).addTo(map).bindPopup("TAKE-OFF"+"<br>"+
                "ID: "+msg.plane.flight_id+"<br>"+"Lat: "+msg.plane.position.lat+"<br>"+"Long: "+msg.plane.position.long).openPopup();
                setTimeout(function(){
                    map.removeLayer(tem);
                }, 1000);
                map.removeLayer(planes[msg.plane.flight_id]);
                delete planes[msg.plane.flight_id];
            }
            if (msg.plane.status == "crashed"){
                var tem = L.marker(planes[msg.plane.flight_id].getLatLng()).addTo(map).bindPopup("CRASHED"+"<br>"+
                "ID: "+msg.plane.flight_id+"<br>"+"Lat: "+msg.plane.position.lat+"<br>"+"Long: "+msg.plane.position.long).openPopup();
                setTimeout(function(){
                    map.removeLayer(tem);
                }, 1000);
                map.removeLayer(planes[msg.plane.flight_id]);
                delete planes[msg.plane.flight_id];
            }
        }
        //console.log(JSON.stringify(message));
    };
}
  