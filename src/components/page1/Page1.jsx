import './Page1.css'
import RapidX8000 from '../../RapidX8000';
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
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

/***********************- Global variable -------**************************** */
    const API_KEY = process.env.REACT_APP_TOM_TOM_API_KEY;
    const waypoints = [];
    const savedLocation ={
        lat:12.9716,
        lng:77.5946,
        zoom:14
    }
  

/***********************- GLobal Function -------**************************** */
const InputParameters =()=>{
    const BatteryType = document.querySelector('input[name="rapidx6000-rapidx8000"]:checked').value;
    const DeliveryType =document.querySelector('input[name="Point-circular-hub"]:checked').value;
    const Payload = document.getElementById('payload').value;
    const CurrentCharge= document.getElementById('current-charge').value;

    if(DeliveryType =='hub' ||DeliveryType =='circular')
    {
        document.getElementById('waypoint-holder').disabled = false;
        document.getElementById('waypoint').disabled = false;
    }
    setInputParameter({
        batteryType:BatteryType,
        deliveryType:DeliveryType,
        payload:Payload,
        currentCharge:CurrentCharge
    })   
   
}
const moveMap =(lngLat) =>{
    map.flyTo({
        center:lngLat,
        zoom:map.getZoom()
    })
  }

/*******************************Vechile Metrics ********************************* */

const RapidX6000 = {
constantSpeedCosumptionInkWhPerHundredKm:'45,19:100,22.4', // 45 is constant speed and 19 is consumptionin kwh same is for 100 on highways 
vechileEngineType:'electric',
vechileWeight:3245,
currentChargeInKWH:43.5,
maxChargeInKWH:86.5
}
const max = RapidX6000.maxChargeInKWH;


const RapidX6000ChargingModes ={
    chargingModes:[
        {
            chargingConnections:[
                {
                facilityType : "Charge_200_to_240V_1_Phase_at_32A",
                 plugType : "CHAdeMO"
                },
                {
                facilityType : "Charge_380_to_480V_3_Phase_at_16A",
                 plugType : "CHAdeMO"
                }

            ],
            chargingCurve:[
                {
                    chargeInkWh:86.5,
                    timeToChargeInSeconds:89100
                }
            ]
        },
        {
            chargingConnections : [
              {facilityType : "Charge_200_to_240V_1_Phase_at_10A", 
              plugType : "Standard_Household_Country_Specific"},
              {facilityType : "Charge_100_to_120V_1_Phase_at_16A",
               plugType : "CHAdeMO"}
            ],
            chargingCurve : [
              {chargeInkWh : 86.5, timeToChargeInSeconds : 600},
              {chargeInkWh : 86.5, timeToChargeInSeconds : 2000},
              {chargeInkWh : 86.5, timeToChargeInSeconds : 8000}
            ]
        }
     
    ]   
        
    
}

// calculate Route here 

const baseUrl = "https://api.tomtom.com/routing/1/calculateLongDistanceEVRoute/";

const BuildUrl = (options) =>{
    const url = baseUrl + options.origin.lat +','+options.origin.lng +':'+
    options.destination.lat + ',' + options.destination.lng + '/json?vehicleEngineType=electric&travelMode=car&traffic=true&key='+API_KEY+
    '&vehicleWeight=' + options.vechileWeight + '&currentChargeInkWh=' + options.currentCharge +
    '&maxChargeInkWh=' +options.maxCharge + '&minChargeAtDestinationInkWh='+ options.minFinalCharge+ 
    '&minChargeAtChargingStopsInkWh='+options.minChargeAtStop + '&constantSpeedConsumptionInkWhPerHundredkm='+
    options.speedConsumption;
    return url;
};

 const postData=  (url ='',data={}) =>{

    return fetch(url,{
        method:'POST',
        cache:'no-cache',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(data),
    })
    .then(res => res.json());
    
}
const routeData =(data) =>{
    console.log(data);
}

const calculateRoute = (routeOptions) =>{
    const url = BuildUrl(routeOptions);
    postData(url,routeOptions.chargingModes)
    .then(data => routeData(data))
    .catch(err => console.log(err));
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


const searchOrigin = () =>{
    ttapi.services.fuzzySearch({
        key:API_KEY,
        query:document.getElementById('origin').value,
        idxSet:'PAD,Addr,Geo'
    })

    .then((result) =>{
        console.log(result);
    
    if(result.results && result.results.length>0)
                {
                //add marker
                const first= result.results[0];
                const markerElement = document.createElement('img');
                markerElement.className= 'marker-origin';
                markerElement.src="warehouse.png";

                var marker =markers.push(new tt.Marker({element:markerElement })
                .setLngLat(first.position)
                .addTo(map))
                moveMap(first.position)
                waypoints.push({
                    marker:marker,
                    location:first.position,
                    address:first.address.freeformAddress
                })
                console.log(waypoints);
           
                }})

            }
const searchDestination = () =>{
    ttapi.services.fuzzySearch({
        key:API_KEY,
        query:document.getElementById('destination').value,
        idxSet:'PAD,Addr,Geo'
    })

    .then((result) =>{
        console.log(result);
    
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
                console.log(waypoints);
                }})
}

 /********************Route calculation ********************************************* */

  const  RouteCalculation = () =>{
    const locations =waypoints.map((e) =>{
        return e.location
      })
    // ttapi.services
    //         .calculateRoute({
    //           key:API_KEY,
    //           traffic:true,
    //           locations:locations,
    //           computeBestOrder:true,

    //         })
    //         .then((routeData) =>{ 
    //         const geoJson =routeData.toGeoJson()
    //         SearchChargingStation(routeData)
    //         setTimeout(drawRoute(geoJson,map), 3000)
    //         console.log(routeData);
    //         })
            
            const routeOptions = {
                key:API_KEY,
                origin:locations[0],
                destination:locations[1],
                vechileWeight:RapidX6000.vechileWeight,
                currentCharge: (0.5 * max),
                maxCharge: max,
                minFinalCharge:(max *0.2),
                minChargeAtStop:(max * 0.2),
                speedConsumption:RapidX6000.constantSpeedCosumptionInkWhPerHundredKm,
                chargingModes:RapidX6000ChargingModes
            }

            // calculate route
            calculateRoute(routeOptions);
            
    }
  

/********************Draw Route ********************************************* */

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
/********************Seacrch charging sation ********************************************* */
      const SearchChargingStation=(data) =>{
        ttapi.services.alongRouteSearch({
          key:API_KEY,
          limit:20,
          maxDetourTime:3600, //max maxDetourTime in sec
          query:'electric vechile station',
          route:data.routes[0].legs[0].points
        })

        .then((result)=>{
            
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
console.log(markers);
const clearRoute = () =>{
    map.getLayer('route')
    map.removeLayer('route');
    map.removeSource('route');
    console.log(markers);
    while(markers.length > 0)
    { markers.pop().remove();}
    console.log(markers);
    while(waypoints.length > 0)
    {waypoints.pop();}

}

const Start =() =>{
    InputParameters();
    RouteCalculation();
}
console.log(inputParameters);
    
/***************************************------Return File--------********************************************* */
    return(
    <div className="page-container ">
        <div className="input-container">
            <div className='battery-container box'>
                <h3>Battery Type:</h3>
                <input type="radio" name="rapidx6000-rapidx8000" id="rapidx6000" value='rapidX6000' defaultChecked />
                <label htmlFor='rapidx6000'>RapidX6000</label>
                <input type="radio" name="rapidx6000-rapidx8000" id="rapidx8000" value='rapidX8000'  />
                <label htmlFor='rapidx6000'>RapidX8000</label>
            </div>
            <div className='delivery-container box'>
            <h3>Delivery Type:</h3>
                <input type="radio" name="Point-circular-hub" id="point" value='point' defaultChecked />
                <label htmlFor=''>Point-Point</label>
                <input type="radio" name="Point-circular-hub" value='circular' id="circular" />
                <label htmlFor=''>Circular</label>
                <input type="radio" name="Point-circular-hub" value='hub' id="hub" />
                <label htmlFor=''>Hub-Spoke</label>
            </div>
            <div className='payload-container box'>
                <h3>Payload:</h3>
                <input type="text" name="payload" id="payload" placeholder='Payload in kgs' value={500} disabled/>
            </div>
            <div className='soc-container box'>
                <h3>SOC:</h3>
                <input type="text" name="current-charge" id="current-charge" placeholder='Current charge in %' />
            </div>
        </div>
        <div className="map-search-container">
            <div className="search-container box">
                <label>Origin:</label>
                <input type="text" name="origin" id="origin" placeholder='origin'/>
                <button onClick={searchOrigin}>Add origin</button>
                <label>Destination:</label>
                <input type="text" name="destination" id="destination" placeholder='Destination'/>
                <button onClick={searchDestination}>Add Destination</button>
                <br/><br/>
                <input type="text" name="destination"  placeholder='Way-point' id='waypoint-holder' disabled/>
                <button  id='waypoint' disabled>Add waypoint</button>
                <button onClick={Start}>Calculate Route</button>
                <button onClick={clearRoute}>Clear Route</button>
            </div>
            {map && <div ref={mapElement} className="map-container"></div>}
        </div>
    </div>
    )
}