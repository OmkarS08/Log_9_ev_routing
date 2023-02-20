import { useEffect, useRef, useState } from "react";
import * as tt from '@tomtom-international/web-sdk-maps'
function App() {

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
    <div className="App">
      <div ref={mapELement}></div>
    </div>
  );
}

export default App;
