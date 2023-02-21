import { useEffect, useRef, useState } from "react";
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import'@tomtom-international/web-sdk-maps/dist/maps.css';
import './Map.css';

export const Map = () =>{

 /*********************Global-VAriable*******************************/
    const API_KEY = process.env.REACT_APP_TOM_TOM_API_KEY;
    const waypoints = [];
    const savedLocation ={
        lat:12.9716,
        lng:77.5946,
        zoom:14
    }
 /*********************Vechile-Specs*******************************/
  const audi ={
    constantSpeedCosumptionInkWhPerHundredKm:['45,10.5','100,16.7'],
    vechileEngineType:'eletric',
    vechileWeight:2000,
    currentChargeInKWH:86.5,
    maxChargeInKWH:86.5
  }

 /****************************************************/

    const[map,setMap]= useState({});
    const[lat,setLat]=useState(12.9716);
    const[lng,setLng]=useState(77.5946);
    const mapELement =useRef();

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
  },[])
      /****************************************************/

      map.on('click',function(event){
        var location = event.lngLat;
        moveMap(location)
      })

      const moveMap =(lngLat) =>{
        map.flyTo({
            center:lngLat,
            zoom:map.getZoom()
        })
      }

      const SearchAdress = (idSource) =>{
            ttapi.services.fuzzySearch({
                key:API_KEY,
                query:document.getElementById('waypoints').value,
                idxSet:'PAD,Addr,Geo'
            })
            .then((result) =>{
                console.log(result);

                if(result.results && result.results.length>0)
                {
                //add marker
                let first= result.results[0];
                const markerElement = document.createElement('div');
                markerElement.className= 'marker';

                var marker =new tt.Marker({element:markerElement })
                .setLngLat(first.position)
                .addTo(map)

                waypoints.push({
                    marker:marker,
                    location:first.position,
                    address:first.address.freeformAddress
                })
                }
                console.log(waypoints);
            })
      }

    /****************************************************/

    return(
    <div>
      <div className="input-container">
        <label htmlFor="waypoints">Waypoints:<input type="text" name ='waypoints' id='waypoints'/></label>
        <button>clearLastWayPoints</button>
        <button onClick={()=>SearchAdress()}>Route</button>
      </div>
      {map && <div ref={mapELement} className="map-container"></div>}

    </div>)


}