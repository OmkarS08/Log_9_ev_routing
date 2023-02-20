import { useEffect, useRef, useState } from "react";
import * as tt from '@tomtom-international/web-sdk-maps'
import './Map.css';

export const Map = () =>{

    const[map,setMap]= useState({});
    const[lat,setlat]=useState(12.9716);
    const[lng,setlng]=useState(77.5946);
    const mapELement =useRef();

    useEffect(()=>{
        let map = tt.map({
          key:'B6G6zRswUJMuH5VueWbHX7I3zEyaqkU8',
          container:mapELement.current,
          center:[lng,lat],
          zoom:14,
        })
        setMap(map)
      },[])

    return ( 
     <>
        <div className="input container">
            <input type='text' placeholder="Longitude"/>
            <input type='text' placeholder="Latitude"/>
        </div>
        <div className="map-container">
            <div ref={mapELement}></div>
        </div>
     </> 
     )

}