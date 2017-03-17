import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';
import Exercise from './components/Exercise';

const APIURL = 'https://wger.de/api/v2/exercise/';
const NUMWORKOUTS = 4;

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			typeOfWorkout: 7,
			showWorkoutForm: true,
			workoutList: [],
			currentWorkoutList: [{
				description: ""
			}],
			interval: 0,
			showWorkoutDisplay: false
		}
		this.handleChange = this.handleChange.bind(this);
		this.getWorkout = this.getWorkout.bind(this);
		this.workoutPicker = this.workoutPicker.bind(this);
		this.displayCurrentWorkout = this.displayCurrentWorkout.bind(this);
		this.startWorkout = this.startWorkout.bind(this);
	}
	startWorkout() {
		console.log(this.state.currentWorkoutList.length);
		this.setState({
			showWorkoutDisplay: true
		})
		let intervalID = setInterval(() => {
			this.setState({
				interval: this.state.interval += 1
			});
			console.log(this.state.interval)

			if (this.state.interval === (this.state.currentWorkoutList.length - 1)) {
				clearInterval(intervalID);


				setTimeout(() => {
					console.log('FINISHED!!');

				}, 2000)
			}
		}, 2000);

	}

	componentDidMount() {

	}
	render() {
		return (
			<div>
				<header>
					<h1>Workout Application</h1>
				</header>

				<div className='workoutOutput'>
					<div className='workoutFormContainer'>
						<form onSubmit={this.getWorkout}className='workoutForm'>
							<label htmlFor="typeOfWorkout">Please select the type of workout: </label>
							<select name="typeOfWorkout" id="typeOfWorkout" onChange={this.handleChange}> {/*This is handling the type of workout to be set*/}
								<option value="7">Body Weight</option> {/*Value 7 represents body weight on the API*/}
								<option value="3">Dumbbell</option> {/*Value 3 represents body weight on the API*/}
							</select>
							<button>Submit!</button>
						</form>
						<div className="workoutDisplay">
							<div className="allWorkouts">
								<h2>Workout List:</h2>
								<ul>
									{this.state.currentWorkoutList.map((workout) => {
										return <Exercise data={workout} />
									})}
								</ul>
							</div>
							<button onClick={this.startWorkout}>Start</button>
							<div className="currentWorkout">
								{this.displayCurrentWorkout()}
							</div>
						</div>
					</div>
				</div>

			</div>
		)
	} // End of render()

	handleChange(e){
		this.setState({
			[e.target.name] :e.target.value
		})
	}

	getWorkout(e) {
		e.preventDefault();
		//AJAX call is performed
		ajax({
			url: APIURL,
			dataType: 'JSON',
			method: 'GET',
			data: {
				language: 2,
				equipment:this.state.typeOfWorkout
			}
		})
		.then((data) => {
			//Once data is received, store the data in the 'workoutList' state
			this.setState({
				workoutList: data.results
			})

			this.workoutPicker();
			// this.showWorkout();

		}) // End of ajax call -> then 
	}

	workoutPicker() {

		let listOfAvailableWorkouts = this.state.workoutList;
		let listOfChosenWorkouts = [];

		for(let i = 0; i < NUMWORKOUTS; i++) {
			let randomWorkout = Math.floor(Math.random()*listOfAvailableWorkouts.length); // Picks a random workout
			let pickedWorkout = listOfAvailableWorkouts[randomWorkout];

			pickedWorkout.description = pickedWorkout.description.replace(/(<\/p>)/gi, '');
			pickedWorkout.description = pickedWorkout.description.replace(/(<p>)/gi, '');
			pickedWorkout.description = pickedWorkout.description.replace(/(<\/strong>)/gi, '');
			pickedWorkout.description = pickedWorkout.description.replace(/(<strong>)/gi, '');
			pickedWorkout.description = pickedWorkout.description.replace(/(<\/ol>)/gi, '');
			pickedWorkout.description = pickedWorkout.description.replace(/(<ol>)/gi, '');
			pickedWorkout.description = pickedWorkout.description.replace(/(<\/li>)/gi, '');
			pickedWorkout.description = pickedWorkout.description.replace(/(<li>)/gi, '');

			listOfChosenWorkouts.push(pickedWorkout);
			listOfAvailableWorkouts.splice(randomWorkout,1);
		} // end of for loop

		this.setState({
			currentWorkoutList: listOfChosenWorkouts
		})
		console.log(this.state.currentWorkoutList)

	}

	displayCurrentWorkout() {

		//run a map of the list of workouts
		//set a timer for 10 seconds each
		//display the next one
		if(this.state.showWorkoutDisplay === true) {
			return (
				<div>
					<p>{this.state.currentWorkoutList[this.state.interval].name}</p>
					<p>{this.state.currentWorkoutList[this.state.interval].description}</p>
				</div>
			)
		}
	}


} // End of class App

ReactDOM.render(<App />, document.getElementById('app'));