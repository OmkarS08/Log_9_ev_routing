
/**
 * The Dashboard function displays various information related to a route and charging stations along
 * the route in a card format.
 * @returns The Dashboard component is being returned, which contains a set of Card components
 * displaying various information related to the route and charging stations.
 */
import './Dashboard.css';
import Card from 'react-bootstrap/Card';
import { useState } from 'react';

export const Dashboard = (props) =>{
    console.log(props.chargingData);
    console.log(props.chargingData.results[0].dist);
/* These lines of code are extracting various information related to the route from the `props` object
and storing them in separate variables. */
    const distance = props.routeData.routes[0].legs[0].summary.lengthInMeters/1000
    const Time =props.routeData.routes[0].legs[0].summary.travelTimeInSeconds/60;
    const ArrivalTime = props.routeData.routes[0].legs[0].summary.arrivalTime;
    const DepartureTime = props.routeData.routes[0].legs[0].summary.departureTime;
    const trafficDistance = props.routeData.routes[0].legs[0].summary.trafficLengthInMeters/1000;
    const trafficDelay = (props.routeData.routes[0].legs[0].summary.trafficDelayInSeconds/60 ).toFixed(2);

    const chargers = props.chargingData.results.length;

    const count1 = [];
    if(chargers > 0)
    {
         props.chargingData.results.map((e) => count1.push(e.dist) )
    }

    const count5000 =[];
    const count10000 = [];
    
/* These lines of code are creating two arrays `count5000` and `count10000` which store the number of
charging stations within a 5-kilometer and 10-kilometer range respectively. */
    count1.map(element => {if(element < 5000 ){count5000.push(parseFloat(element/1000).toFixed(1)) 
                                                                count1.pop(element)}});
    count1.map(element => {if(element < 10000 ){count10000.push(parseFloat(element/1000).toFixed(1))}});

    return(
        <div className='dashboard-container'>
            <h1> Dashboard</h1>

            <div className='card-container'>
                    <Card
                 
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Distance </Card.Title>
                        <Card.Img variant="top" src="measure-distance.png" />
                        <Card.Text>
                            {distance.toFixed(2) } K.M
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}
                <Card
                    
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Time </Card.Title>
                        <Card.Img variant="top" src="arrival-time.png" className='dasboard-image-container'/>
                        <Card.Text>
                        {Time.toFixed(2)} Min
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}
                <Card
                    
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Departure Time </Card.Title>
                        <Card.Img variant="top" src="arrival.png" />
                        <Card.Text>
                            {DepartureTime}
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}
                <Card
                  
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Traffic Distance </Card.Title>
                        <Card.Img variant="top" src="warning.png" />
                        <Card.Text>
                            {trafficDistance .toFixed(2)} m
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}
                <Card
                   
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Traffic Delay </Card.Title>
                        <Card.Img variant="top" src="charging-location.png" />
                        <Card.Text>
                                {trafficDelay} min
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}
                <Card
            
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Arrival Time </Card.Title>
                        <Card.Img variant="top" src="departure.png" />
                        <Card.Text>
                           {ArrivalTime}
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}

                <Card
                    
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> No. of Chargers along the route </Card.Title>
                        <Card.Img variant="top" src="full-battery.png" />
                        <Card.Text>
                            {chargers}
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}
                <Card 
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Number of chargers in a 5-kilometer range</Card.Title>
                        <Card.Img variant="top" src="full-battery.png" />
                        <Card.Text>
                            {count5000.length}
                            <br></br>
                            <span>nearest Charging Staion {count5000[0]} KM</span>
                        </Card.Text>
                    </Card.Body>
                    </Card>
                  
                {/***************************************************** */}
                <Card
                    className="mb-2"
                    >
                    <Card.Body>
                        <Card.Title> Number of chargers in a 10-kilometer range</Card.Title>
                        <Card.Img variant="top" src="full-battery.png" />
                        <Card.Text>
                            {count10000.length}
                        </Card.Text>
                    </Card.Body>
                    </Card>
                {/***************************************************** */}
                
                  
            </div>
   
    </div>
    )
}