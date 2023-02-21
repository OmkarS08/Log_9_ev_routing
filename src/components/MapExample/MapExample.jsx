import { useEffect, useRef, useState } from "react";
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import './MapExample.css';
import'@tomtom-international/web-sdk-maps/dist/maps.css';

/******************-Imports*************************** */
export const MapExample = () =>{
    const[map,setMap]= useState({});
    const[lat,setLat]=useState(12.9716);
    const[lng,setLng]=useState(77.5946);
    const mapELement =useRef();


    // seprating the points in converToPoints
   const  convertToPoints =(lngLat) =>{
    return{
      point:{
        latitude:lngLat.lat,
        longitude:lngLat.lng
      }}}
/******************Drawing Routes****************** */
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
/******************Drawing Routes****************** */
   const addDeliveryMarker =(lngLat,map)=>{
      const element = document.createElement('div');
      element.className = 'marker-delivery';
      new tt.Marker({
        element:element
      })
      .setLngLat(lngLat)
      .addTo(map);
   }
/******************-API-integration-*************************** */
    useEffect(()=>{

      const origin ={
        lng:lng,
        lat:lat
      }

      const destinations =[] // global variable

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

        const addMarker =()=>{
        const popUpOffset = {
            bottom:[0,-25]
          }
        const element = document.createElement('div');
        element.className= 'marker';

          const popUp =  new tt.Popup({offset : popUpOffset}).setHTML('This is you!');
          const marker = new tt.Marker({
            draggable:true,
            element:element
          })
          .setLngLat([lng,lat])// lat lng of marker
          .addTo(map) // add to marker

          marker.on('dragend',()=>{ // get the lat lng after dragging
            const lngLat = marker.getLngLat()
            setLng(lngLat.lng)
            setLat(lngLat.lat)
          })
          marker.setPopup(popUp).togglePopup()
        }

        addMarker();

        const sortdestination =(locations) =>{
            const pointsForDestination = locations.map((destinations) =>{
              return convertToPoints(destinations);
            })
          
        
              const callParameters ={
              key : process.env.REACT_APP_TOM_TOM_API_KEY,
              destinations: pointsForDestination,
              origins: [convertToPoints(origin)],
            }
            return new Promise((resolve, reject) => {
              ttapi.services
              .matrixRouting(callParameters)
              .then((MatrixApiResults) =>{
                const results =MatrixApiResults.matrix[0]
                const resultArray = results.map((result,index)=>{
                  return{
                    location:locations[index],
                    drivingtime:result.response.routeSummary.travelTimeInSeconds,
                  }
                })
                resultArray.sort((a,b) =>{
                  return a.drivingtime -b.drivingtime
                })
                const sortedLocations =resultArray.map((result)=>{
                  return result.location
                })

                resolve(sortedLocations);
              })
            })
        }

        const recalculateRoutes =() =>{
          sortdestination(destinations)
          .then((sorted) =>{
            sorted.unshift(origin)

            ttapi.services
            .calculateRoute({
              key:process.env.REACT_APP_TOM_TOM_API_KEY,
              locations:sorted,
            })
            .then((routeData) =>{ const geoJson =routeData.toGeoJson()
            drawRoute(geoJson,map)})
          })
        }
        
        map.on('click',(e)=> {
          destinations.push(e.lngLat) 
          addDeliveryMarker(e.lngLat,map)
        recalculateRoutes()})
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
        { map && <div className="map-container">
            <div ref={mapELement} className="map-container"></div>
        </div>
        }
     </> 
     )

}