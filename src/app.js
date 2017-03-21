import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';
import Exercise from './components/Exercise';

const APIURL = 'https://wger.de/api/v2/exercise/';
const NUMWORKOUTS = 2;
const WORKOUTDURATION = 5; // Duration of each workout in seconds
const RESTDURATION = 5; // Duration of each rest period in seconds


//AUDIO SECTION
const audioHalfWay = new Audio('../public/assets/halfway.mp3');
const audioAlmostDone = new Audio('../public/assets/almostdone.mp3');
const audioAlert = new Audio('../public/assets/alert_daniel_simon.mp3');
const audioRest = new Audio('../public/assets/rest.mp3');
//AUDIO SECTION


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
			isResting: false,
			isLoading: false, 
			hasWorkoutStarted: false
		}
		this.handleChange = this.handleChange.bind(this);
		this.getWorkout = this.getWorkout.bind(this);
		this.workoutPicker = this.workoutPicker.bind(this);
		this.displayCurrentWorkout = this.displayCurrentWorkout.bind(this);
		this.startWorkout = this.startWorkout.bind(this);
		this.displayWorkoutForm = this.displayWorkoutForm.bind(this);
		this.displayWorkoutList = this.displayWorkoutList.bind(this);
	}


	startWorkout() {
		this.setState({
			showWorkoutDisplay: true,
			hasWorkoutStarted: true
		})

		audioAlert.play();

		let intervalID = setInterval(() => { // starts an interval counter for each second and stored in timer

			console.log(this.state.timer + ' seconds', `Interval is ${this.state.interval}`, `isResting value: ${this.state.isResting}`);

			if (this.state.timer > WORKOUTDURATION && this.state.rest <= 1) { // if the timer is greater than the workout DURATION and if resting period is done
				this.setState({ // Update the states so that the workout is continued for the next exercise set
					isResting: false,
					interval: this.state.interval += 1, 
					timer: 0,
					rest: RESTDURATION // Resting time in seconds
				})
				audioAlert.play();
			} else if (this.state.timer >= WORKOUTDURATION) {

				if (this.state.timer > WORKOUTDURATION && this.state.isResting === true) {
					audioRest.play();
				}

				this.setState({
					rest: this.state.rest -= 1
				})
				this.setState({
					isResting: true
				})
				console.log('RESTING ' + this.state.rest)
			}

			if (this.state.timer === (WORKOUTDURATION/2 - 1)) {
				audioHalfWay.play();
			} else if (this.state.timer === (WORKOUTDURATION * 0.8)) {
				audioAlmostDone.play();
			}

			
			if (this.state.timer >= WORKOUTDURATION && this.state.interval === NUMWORKOUTS - 1) {
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




	displayWorkoutList() {
		if (this.state.hasWorkoutStarted === false) {
			if (this.state.isLoading === true) {
				// if the list is empty and loading is true, then show the loading image
				return(
					<div className="listOfWorkout">
						<div className="listOfWorkoutLoading">
							<img src="../public/assets/loading.gif" alt="Image of a crab running to signify loading."/>
							<h3>LOADING</h3>
						</div>
					</div>
				)
			} else if (this.state.isLoading === false && this.state.currentWorkoutList.length > 1){
				// if isLoading is false then the list must be filled and can be displayed

				return(
					<div className="listOfWorkout">
						<div className="listOfWorkoutContainer">
							<h2>Workout List:</h2>
							<ol>
								{this.state.currentWorkoutList.map((workout) => {
									return <Exercise data={workout} />
								})}
							</ol>
						</div> {/* listOfWorkoutContainer */}
						<button className='readyBtn' onClick={this.startWorkout}>Ready To Start!</button>
					</div> /* listOfWorkout */
				)
			}
		}
	}


	render() {
		return (
			<div>

				<section>
					<header>
					</header>
					<div className="wrapper">
						<div className='workoutOutput'>
							<div className="workoutDisplay">
								{this.displayWorkoutForm()}
								{this.displayWorkoutList()}
								{this.displayCurrentWorkout()}
							</div> {/* workoutDisplay */}
						</div> {/* workoutOutput */}
					</div>
				</section>

			</div>
		)
	} // End of render()

	handleChange(e){
		this.setState({
			[e.target.name] :e.target.value,
			isLoading: true
		})

		this.getWorkout();
	}

	getWorkout() {


		this.setState({
			showWorkoutForm: false,
			isLoading: true
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
			currentWorkoutList: listOfChosenWorkouts,
			isLoading: false
		})
		console.log(this.state.currentWorkoutList)

	}

	displayCurrentWorkout() {

		//run a map of the list of workouts
		//set a timer for 10 seconds each
		//display the next one

		// if isLoading is true then you want to show a loading screen
		// if isLoading is true and the workout string is empty then you want to show a loading 

		if (this.state.isLoading === false && this.state.currentWorkoutList.length > 1) {
			if (this.state.isWorkoutFinished === true) {
				// return workout is done
				return (
					<div className="currentWorkout">
						<div className="isWorkoutFinished">
							<h3>FINISHED!!!</h3>
						</div>
					</div>
				)
			} else if (this.state.isResting === true) {
				// Display resting countdown
				return(
					<div className="currentWorkout">
						<div className="restCountdown">
							<h2>{this.state.rest}</h2>
							<p>RESTING PERIOD</p>
						</div>
					</div>
				)
			} else if (this.state.hasWorkoutStarted === true && this.state.isWorkoutFinished === false) {
				return (
					<div className="currentWorkout">
						<div className="currentWorkoutContainer">
							<h2>{this.state.timer}</h2>
							<p>{this.state.currentWorkoutList[this.state.interval].name}</p>
						</div>
					</div>
				)
			}
		}

	} // End of displayCurrentWorkout

	displayWorkoutForm() {
		if(this.state.showWorkoutForm === true) {
			return(
				<div className='workoutFormContainer'>
					<div className="workoutFormContainerWrapper">
						<h1>Appercise</h1>
						<img src="../public/assets/stretch.svg" alt="Image of a dumbbell"/>
						<p>Salutations friends! I created this application as I wanted to have a way to be given assorted exercises based on the equipment currently available. To use the application please select a workout regime below. You'll be shown the selection of exercises hand picked for your workout along with instructions on how to perform them. Once you are ready scroll down to the bottom of the page and click on the 'Ready' button to begin your workout! </p>
						<form className='workoutForm'>
							<div className="workoutForm__question1">
								<label htmlFor="typeOfWorkout">Please select the type of workout: </label>
								<select name="typeOfWorkout" id="typeOfWorkout" onChange={this.handleChange}> {/*This is handling the type of workout to be set*/}
									<option value="" disabled selected>Workout Options:</option>
									<option value="7">Assorted Body Weight Exercises</option> {/*Value 7 represents body weight on the API*/}
									<option value="3">Assorted Dumbbell Exercises</option> {/*Value 3 represents body weight on the API*/}
								</select>
							</div>
						</form>
					</div>
				</div>
			)
		} else {
			return null;
		}
	}


} // End of class App

ReactDOM.render(<App />, document.getElementById('app'));