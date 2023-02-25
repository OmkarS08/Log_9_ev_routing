import { useEffect, useRef, useState } from "react";
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import'@tomtom-international/web-sdk-maps/dist/maps.css';
import './Map.css';


export const Map = () =>{

   /*********************Vechile-Specs*******************************/
   const audi ={
    constantSpeedCosumptionInkWhPerHundredKm:['45,19','100,29.8'], // 45 is constant speed and 19 is consumptionin kwh same is for 100 on highways 
    vechileEngineType:'electric',
    vechileWeight:3245,
    currentChargeInKWH:43.25,
    maxChargeInKWH:86.5
  }

 /*********************Global-VAriable*******************************/
    const API_KEY = process.env.REACT_APP_TOM_TOM_API_KEY;
    const waypoints = [];
    const savedLocation ={
        lat:12.9716,
        lng:77.5946,
        zoom:14
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
      map.on('click',function(event){
        var location = event.lngLat;
        moveMap(location)
        // ttapi.services.calculateReachableRange({
        //   key:API_KEY,
        //   origin:location,
        //   vechileEngineType:'electric',
        //   constantSpeedCosumptionInkWhPerHundredKm:audi.constantSpeedCosumptionInkWhPerHundredKm,
        //   energyBudgetInkWh:audi.currentChargeInKWH
        // })
        // .then((result)=>console.log(result))
      }) 
      const moveMap =(lngLat) =>{
        map.flyTo({
            center:lngLat,
            zoom:map.getZoom()
        })
      }
  },[])
      /****************************************************/



     ttapi.services.longDistanceEVRouting({

     })

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
                const first= result.results[0];
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
      const route = () =>{
        const locations =waypoints.map((e) =>{
          return e.location
        })
        console.log(locations)

        const max =audi.maxChargeInKWH;

        const routeOption={
          key:API_KEY,
          origin:locations[0],
          destination:locations[1],
          vechileWeight:audi.vechileWeight,
          currentCharge:(max*0.5),// current SOC
          maxCharge:max,
          minFinalCharge:(max*0.2),
          minChargeAtStop:(max*0.2),  // battery level at charging stop
          speedConsumption:audi.constantSpeedCosumptionInkWhPerHundredKm,
          chargingModes:audiChargingModes

        }

        calculateRoute(routeOption)

        // route calculation
        // ttapi.services.calculateRoute({
        //   key:API_KEY,
        //   traffic:true,
        //   locations:locations,
        // },audi)
        // .then((result)=>{
        //   const geoJson =result.toGeoJson();
        //   drawRoute(geoJson,map)
        //   //drawconsumption(geoJson)

        //   SearchChargingStation(result);
        // })
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

      const audiChargingModes ={
          chargingMode:[
            {
              chargingConnections:[{
                  facilityType:"Charge_100_to_120V_1_Phase_at_10A",
                  plugType:"IEC_60309_1_Phase"
                  
                },
                {
                  facilityType:"Charge_100_to_120V_1_Phase_at_12A",
                  plugType:"IEC_60309_3_Phase"
                  
                }
              ],
              chargingCurve:[
                {
                  chargeInkWh:95, 
                  timeToChargeInSeconds:8900,
                }
              ]
            },
            {
              chargingConnections:[
                {
                  facilityType:"Charge_200_to_480V_Direct_Current_at_255A_120kW",
                  plugType:"CHAdeMO",
                  
                },
                {
                  facilityType:"Charge_200_to_240V_1_Phase_at_10A",
                  plugType:"IEC_62196_Type_2_Connector_Cable_Attached"
                  
                },
                {
                  facilityType:"Charge_380_to_480V_3_Phase_at_32A",
                  plugType:"China_GB_Part_3"
                  
                }
              ],
              chargingCurve:[
                {
                  chargeInkWh :95, 
                  timeToChargeInSeconds:5000,
                }
              ]
            }
          ]
      }

      //Cal culate Route 
      const baseUrl ='https://api.tomtom.com/routing/1/calculateLongDistanceEVRoute/';

      const buildURL=  (options)=>{
        console.log(options);
        const url = baseUrl + options.origin.lat + ',' + options.origin.lng + ':'
        + options.destination.lat + ',' + options.destination.lng + 
        '/json?&vehicleEngineType=electric&travelMode=car&traffic=true&key=' + API_KEY +
        '&vechileWeight=' + options.vechileWeight + 
        '&currentChargeInkWh=' + options.currentCharge +
        '&maxChargeInkWh=' +options.maxCharge + 
        '&minChargeAtDestinationInkWh='+ options.minFinalCharge + 
        '&minChargeAtChargingStopsInkWh=' + options.minChargeAtStop +
        '&constantSpeedConsumptionInkWhPerHundredkm=' + options.speedConsumption;
  
        console.log (url);
        return url;
      }

      const calculateRoute = (routeOption)=>{
        const url =  buildURL(routeOption);
        console.log(routeOption.chargingModes)
        postData(url,routeOption.chargingModes)
        .then(data => parseRoute(data.json()))// 
        .catch(err => console.error(err))
      }

      const postData=   async (url = '',data = {})=>{
        try {
          const response = await fetch(url, {
            method: 'POST',
            type: 'cors',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          const response_1 = await response.json();
          return console.log(response_1);
        } catch (err) {
          return console.log(err);
        }
      }
      const parseRoute = (data)=>{
        console.log(data);
      }

    /****************************************************/

    return(
    <div>
      <div className="input-container">
        <label htmlFor="waypoints">Waypoints:<input type="text" name ='waypoints' id='waypoints'/></label>
        <button>clearLastWayPoints</button>
        <button onClick={()=>SearchAdress()}>Add points</button>
        <button onClick={()=>route()}>Route2</button>
      </div>
      {map && <div ref={mapELement} className="map-container"></div>}

    </div>)


}