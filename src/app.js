import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';
import Exercise from './components/Exercise';

const APIURL = 'https://wger.de/api/v2/exercise/';
const NUMWORKOUTS = 4;
const WORKOUTDURATION = 10; // Duration of each workout in seconds
const RESTDURATION = 5; // Duration of each rest period in seconds

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
			showWorkoutDisplay: false,
			isWorkoutFinished: false,
			timer: 1, 
			rest: RESTDURATION,
			isResting: false
		}
		this.handleChange = this.handleChange.bind(this);
		this.getWorkout = this.getWorkout.bind(this);
		this.workoutPicker = this.workoutPicker.bind(this);
		this.displayCurrentWorkout = this.displayCurrentWorkout.bind(this);
		this.startWorkout = this.startWorkout.bind(this);
		this.displayWorkoutForm = this.displayWorkoutForm.bind(this);
	}


	startWorkout() {
		this.setState({
			showWorkoutDisplay: true
		})

		let intervalID = setInterval(() => { // starts an interval counter for each second and stored in timer

			console.log(this.state.timer + ' seconds', this.state.isResting);

			if (this.state.timer > WORKOUTDURATION && this.state.rest <= 1) { // if the timer is greater than the workout DURATION and if resting period is done
				this.setState({ // Update the states so that the workout is continued for the next exercise set
					isResting: false,
					interval: this.state.interval += 1, 
					timer: 0,
					rest: RESTDURATION // Resting time in seconds
				})
			} else if (this.state.timer >= WORKOUTDURATION) {
				this.setState({
					rest: this.state.rest -= 1
				})
				this.setState({
					isResting: true
				})
				console.log('RESTING ' + this.state.rest)

			}

			
			if (this.state.timer >= WORKOUTDURATION && this.state.interval === 3) {
				clearInterval(intervalID);
				console.log('finished');
				this.setState({
					isWorkoutFinished: true
				})
			}

			this.setState({
				timer: this.state.timer += 1
			})

		}, 1000)


	} // End of startWorkout()

	componentDidMount() {

	}


	render() {
		return (
			<div>
				<header>
					<h1>4 Minute <img src="../public/assets/noun_637461_cc.svg" alt=""/> Workout</h1>
				</header>

				<div className="wrapper">
					<div className='workoutOutput'>
						{this.displayWorkoutForm()}
						<div className="workoutDisplay">
							<div className="allWorkouts">
								<h2>Workout List:</h2>
								<ol>
									{this.state.currentWorkoutList.map((workout) => {
										return <Exercise data={workout} />
									})}
								</ol>
							</div> {/* allWorkouts */}
							<button onClick={this.startWorkout}>Start</button>
							{this.displayCurrentWorkout()}
						</div> {/* workoutDisplay */}
					</div> {/* workoutOutput */}
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
		this.setState({
			showWorkoutForm: false
		})
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
		if (this.state.isWorkoutFinished === true) {
			// return workout is done
			return (
				<div className="isWorkoutFinished">
					<h3>FINISHED!!!</h3>
				</div>
			)
		} else if (this.state.isResting === true) {
			// Display resting countdown
			return(
				<div className="restCountdown">
					<h2>{this.state.rest}</h2>
					<p>RESTING PERIOD</p>
				</div>
			)
		} else {
			return (
				<div className="currentWorkout">
					<h2>{this.state.timer}</h2>
					<p>{this.state.currentWorkoutList[this.state.interval].name}</p>
				</div>
			)
		}
	}

	displayWorkoutForm() {
		if(this.state.showWorkoutForm === true) {
			return(
				<div className='workoutFormContainer'>
					<form onSubmit={this.getWorkout}className='workoutForm'>
						<div className="workoutForm__question1">
							<label htmlFor="typeOfWorkout">Please select the type of workout: </label>
							<select name="typeOfWorkout" id="typeOfWorkout" onChange={this.handleChange}> {/*This is handling the type of workout to be set*/}
								<option value="7">Assorted Body Weight Exercises</option> {/*Value 7 represents body weight on the API*/}
								<option value="3">Assorted Dumbbell Exercises</option> {/*Value 3 represents body weight on the API*/}
							</select>
						</div>
						<button>Submit!</button>
					</form>
				</div>
			)
		} else {
			return null;
		}
	}


} // End of class App

ReactDOM.render(<App />, document.getElementById('app'));