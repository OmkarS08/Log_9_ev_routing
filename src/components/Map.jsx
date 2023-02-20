
import { useEffect, useRef, useState } from "react";
import * as tt from '@tomtom-international/web-sdk-maps'
import './Map.css'
import'@tomtom-international/web-sdk-maps/dist/maps.css'

/******************-Imports*************************** */
export const Map = () =>{
    const[map,setMap]= useState({});
    const[lat,setLat]=useState(12.9716);
    const[lng,setLng]=useState(77.5946);
    const mapELement =useRef();
/******************-API-integration-*************************** */
    useEffect(()=>{
        let map = tt.map({
          key:process.env.REACT_APP_TOM_TOM_API_KEY,
          container:mapELement.current,
          stylesVisibility:{
            trafficFlow:true,
            trafficIncidents:true
          },
          center:[lng,lat],
          zoom:14,
        })
        setMap(map)

        const element = document.createElement('div');
        element.className= 'marker';
        const addMarker =()=>{
          const marker = new tt.Marker({
            draggable:true,
            element:element
          })
          .setLngLat([lng,lat])
          .addTo(map)
          marker.on('dreagend',()=>{
            const lngLat = marker.getLngLat()
            setLng(lngLat.lng)
            setLat(lngLat.lat)
          })
        }
        addMarker();
        return ()=> map.remove()
      },[lng,lat])

/******************-Return-File-*************************** */
    return ( 
     <>
        <div className="input container">
            <input 
              type='text' 
              placeholder="longitude"
              id='longitude'
              className="longitude"
              onChange={(e)=>{setLng(e.target.value)}}
            />
            <input 
              type='text' 
              placeholder="latitude"
              id='latitude'
              className="latitude"
              onChange={(e)=>{setLat(e.target.value)}}
            />
        </div>
        <div className="map-container">
            <div ref={mapELement} className="map-container"></div>
        </div>
     </> 
     )

}