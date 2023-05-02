/**
 * The Page1 function is a React component that renders a map and search box, allows the user to add
 * waypoints and calculate a route, and displays the route and charging station data on a dashboard.
 * @returns The Page1 component is being returned, which contains a map and search box for adding
 * origin and destination locations, calculating and displaying a route between them, and displaying
 * charging stations along the route on a dashboard component.
 */
import './Page1.css'
import { Dashboard } from '../DashBoard/Dashboard';
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import { services } from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';
import'@tomtom-international/web-sdk-maps/dist/maps.css';
import { useState ,useEffect,useRef } from 'react';
/***************************************************************************** */

export const Page1 = () =>{
/*********************hooks********************************************* */
    const [map,setMap] = useState({});
    const mapElement = useRef();
    const [inputParameters,setInputParameter]=useState({
        batteryType:null,
        deliveryType:null,
        payload:null,
        currentCharge:null
    });
    const markers = [];

    const [routeData, setRouteData ] = useState(null);
    const [chargingData,setChargingData ] = useState(null);

/***********************- Global variable -------**************************** */
    const API_KEY = process.env.REACT_APP_TOM_TOM_API_KEY;
    const waypoints = [];
/* `savedLocation` is a constant object that stores the default location and zoom level for the map. It
is used as the initial center and zoom level for the map when it is first rendered. */
    const savedLocation ={
        lat:12.9716,
        lng:77.5946,
        zoom:14
    }

    
/***********************- Search Box -------**************************** */


const moveMap =(lngLat) =>{
    map.flyTo({
        center:lngLat,
        zoom:map.getZoom()
    })
  }




/*******************************Map element ********************************* */
    useEffect(()=>{
        let map =  tt.map({
            key:API_KEY,
            container:mapElement.current,
            stylesVisibility:{
              trafficFlow:true,
              trafficIncidents:true
            },
            center:savedLocation,
            zoom: savedLocation.zoom
          })
          setMap(map)
   
    },[])
/*******************************--Add marker ********************************* */

/**
 * The function searches for a location using a fuzzy search API and adds a marker to the map for the
 * first result.
 */
const searchOrigin = () =>{
    ttapi.services.fuzzySearch({
        key:API_KEY,
        query:document.getElementById('origin').value,
        idxSet:'PAD,Addr,Geo'
    })

    .then((result) =>{
    
    if(result.results && result.results.length>0)
                {
                //add marker
                const first= result.results[0];
                const markerElement = document.createElement('img');
                markerElement.className= 'marker-origin';
                markerElement.src="warehouse.png";

                const marker =markers.push(new tt.Marker({element:markerElement })
                .setLngLat(first.position)
                .addTo(map))
                moveMap(first.position)
                waypoints.push({
                    marker:marker,
                    location:first.position,
                    address:first.address.freeformAddress
                })
           
                }})

            }
/**
 * The function searches for a destination using a fuzzy search API and adds a marker to the map for
 * the first result.
 */
const searchDestination = () =>{
    ttapi.services.fuzzySearch({
        key:API_KEY,
        query:document.getElementById('destination').value,
        idxSet:'PAD,Addr,Geo'
    })

    .then((result) =>{
    
    if(result.results && result.results.length>0)
                {
                //add marker
                const first= result.results[0];
                const markerElement = document.createElement('img');
                markerElement.className= 'marker-destination';
                markerElement.src ="package.png"

                let marker =markers.push (new tt.Marker({element:markerElement })
                .setLngLat(first.position)
                .addTo(map))
                moveMap(first.position)

                waypoints.push({
                    marker:marker,
                    location:first.position,
                    address:first.address.freeformAddress
                })
                }})
}

 /********************Route calculation ********************************************* */

/**
 * The function calculates a route using the TomTom API, searches for charging stations along the
 * route, and then draws the route on a map.
 */
  const  RouteCalculation = () =>{
    const locations =waypoints.map((e) =>{
        return e.location
      })
    ttapi.services
            .calculateRoute({
              key:API_KEY,
              traffic:true,
              locations:locations,
              computeBestOrder:true,

            })
            .then((routeData) =>{ 
            const geoJson =routeData.toGeoJson()
            SearchChargingStation(routeData)
            setTimeout(drawRoute(geoJson,map), 3000)
            setRouteData(routeData);
            })        
    }
  

/********************Draw Route ********************************************* */

  /**
   * The function draws a route on a map using a provided GeoJSON object.
   */
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
            'line-color':'blue',
            'line-width':6
          }
        })
      }
/********************Seacrch charging sation ********************************************* */
/**
 * The function searches for electric vehicle charging stations along a given route and adds markers
 * for each station on a map.
 */
      const SearchChargingStation=(data) =>{
        ttapi.services.alongRouteSearch({
          key:API_KEY,
          limit:20,
          maxDetourTime:3600, //max maxDetourTime in sec
          query:'electric vechile station',
          route:data.routes[0].legs[0].points
        })

        .then((result)=>{
            console.log(result);
            setChargingData(result);
          result.results.forEach(function(element){
            var markerElement = document.createElement('img');
                markerElement.className= 'marker-destination';
                markerElement.src ="charger.png"
              const marker = markers.push( new tt.Marker({element:markerElement })
              .setLngLat(element.position)
              .addTo(map));
          })
        })
    }
  

/*****************************************----Clear Route ----************************ */
/**
 * The function clears a route on a map and removes markers and waypoints.
 */
const clearRoute = () =>{
    map.getLayer('route')
    map.removeLayer('route');
    map.removeSource('route');
    while (markers.length > 0) {
      
        markers.remove().pop();

      }
    
      while (waypoints.length > 0) {
        waypoints.pop().remove();
      }
      window.location.reload();
}


    RouteCalculation();

/***************************************------Return File--------********************************************* */
    return(
        <>
    <div className="page-container ">

        <div className="map-search-container">
            <div className="search-container box">
                <div className='origin-box'>
                <label>Origin:</label>
                <input type="text" name="origin" className='origin' id="origin" placeholder='origin'/>
                <button className='btn btn-primary' onClick={searchOrigin}>Add origin</button>
                <label>Destination:</label>
                <input type="text" name="destination" id="destination" placeholder='Destination'/>
                <button className='btn btn-primary' onClick={searchDestination}>Add Destination</button>
                </div>
                <br/><br/><br/>
                <div className='calculation-box'>
                <button className='btn btn-success' onClick={RouteCalculation}>Calculate Route</button>
                <button className='btn btn-danger' onClick={clearRoute}>Clear Route</button>
                </div>

            </div>
            {map && <div ref={mapElement} className="map-container"></div>}
        </div>
    </div>
    <div>
       {routeData && chargingData &&  <Dashboard chargingData = {chargingData} routeData= {routeData} /> }
    </div>
    </>
    )
}