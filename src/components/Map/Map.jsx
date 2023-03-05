import { useEffect, useRef, useState } from "react";
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import'@tomtom-international/web-sdk-maps/dist/maps.css';
import './Map.css';


export const Map = () =>{

   /*********************Vechile-Specs*******************************/
   const audi ={
    constantSpeedCosumptionInkWhPerHundredKm:'45,18.5:100,22.4', // 45 is constant speed and 19 is consumptionin kwh same is for 100 on highways 
    vechileEngineType:'electric',
    vechileWeight:3245, // vechile weightl
    currentChargeInKWH:43.25, // current SOc
    maxChargeInKWH:86.5 // maximum the bateery can hold
  }

 /*********************Global-VAriable*******************************/
    const API_KEY = process.env.REACT_APP_TOM_TOM_API_KEY;
    const waypoints = [];
    const savedLocation ={
        lat:49.24,
        lng:-123.116,
        zoom:14
    }


 /****************************************************/

    const[map,setMap]= useState({});
    const[lat,setLat]=useState(12.9716);
    const[lng,setLng]=useState(77.5946);
    const mapELement =useRef();
    const location = [];
    const moveMap =(lngLat) =>{
      map.flyTo({
          center:lngLat,
      })
    }
    /****************************************************/
  useEffect(()=>{
    let map = tt.map({
        key:API_KEY,
        container:mapELement.current,
        stylesVisibility:{
          trafficFlow:true,
          trafficIncidents:true
        },
        center:savedLocation,
        zoom: savedLocation.zoom
      })
      setMap(map)
      map.on('click',function(event){
        const location = event.lngLat;
        moveMap(location)
        ttapi.services.calculateReachableRange({
          key:API_KEY,
          versionNumber:1,
          origin:location,
          vehicleEngineType:'electric',
          constantSpeedCosumptionInkWhPerHundredKm:audi.constantSpeedCosumptionInkWhPerHundredKm,
          energyBudgetInkWh:audi.currentChargeInKWH 
      }) 
      .then((result)=>console.log(result))

  })},[])
      /****************************************************/




      const SearchAdress = (idSource) =>{
            ttapi.services.fuzzySearch({
                key:API_KEY,
                query:document.getElementById(idSource).value,
                idxSet:'PAD,Addr,Geo'
            })
            .then((result) =>{
                console.log(result);

                if(result.results && result.results.length>0)
                {
                //add marker
                const first= result.results[0];
                const markerElement = document.createElement('div');
                markerElement.className= 'marker';

                var marker =new tt.Marker({element:markerElement })
                .setLngLat(first.position)
                .addTo(map);
     
                moveMap(first.position);
              

                waypoints.push({
                    marker:marker,
                    location:first.position,
                    address:first.address.freeformAddress
                })
                }
                console.log(waypoints);
              
            })

      }


      const drawRoute=(geoJson,map)=>{
        if(map.getLayer('route')){
          map.removeLayer('route')
          map.removeSource('route')
        }
        map.addLayer({
          id:'route',
          type:'line',
          source:{
            type:'geojson',
            data:geoJson
          },
          paint:{
            'line-color':'red',
            'line-width':6
          }
        })
      }

      const SearchChargingStation=(data) =>{
          ttapi.services.alongRouteSearch({
            key:API_KEY,
            limit:20,
            maxDetourTime:2000,
            query:'electric vechile station',
            route:data.routes[0].legs[0].points
          })

          .then((result)=>{
            result.results.forEach(function(element){
                const marker = new tt.Marker()
                .setLngLat(element.position)
                .addTo(map);
            })
          })
      }

   

    return(
    <div>
      <div className="input-container">
        <label htmlFor="idSource">Waypoints:<input type="text" name ='waypoints' id='idSource'/></label>
        <button>clearLastWayPoints</button>
        <button onClick={()=>SearchAdress('idSource')}>Add points</button>
        <button>Route</button>
      </div>
      {map && <div ref={mapELement} className="map-container"></div>}

    </div>)


}