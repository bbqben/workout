import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';
import Exercise from './components/Exercise';

const APIURL = 'https://wger.de/api/v2/exercise/';
const NUMWORKOUTS = 4;
const WORKOUTDURATION = 60; // Duration of each workout in seconds
const RESTDURATION = 15; // Duration of each rest period in seconds


//AUDIO SECTION
const audioHalfWay = new Audio('./public/assets/halfway.mp3');
const audioAlmostDone = new Audio('./public/assets/almostdone.mp3');
const audioAlert = new Audio('./public/assets/alert_daniel_simon.mp3');
const audioRest = new Audio('./public/assets/rest.mp3');
//AUDIO SECTION


class App extends React.Component {
	constructor() {
		super();
		this.state = {
			typeOfWorkout: 0,
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
		this.calculateRemainingWorkoutTime = this.calculateRemainingWorkoutTime.bind(this);
	}

	calculateRemainingWorkoutTime() {
		let remainingTime = WORKOUTDURATION - this.state.timer;

		return remainingTime;
	}


	startWorkout() { // Workout interval starts with this function
		this.setState({
			showWorkoutDisplay: true,
			hasWorkoutStarted: true
		})

		audioAlert.play(); // Audio to alert the beginning

		let intervalID = setInterval(() => { // starts an interval counter for each second and stored in timer


			if (this.state.timer > WORKOUTDURATION && this.state.rest <= 1) { // if the timer is greater than the workout DURATION and if resting period is done
				this.setState({ // Update the states so that the workout is continued for the next exercise set
					isResting: false,
					interval: this.state.interval += 1, 
					timer: 0,
					rest: RESTDURATION // Resting time in seconds
				})
				audioAlert.play();
			} else if (this.state.timer >= WORKOUTDURATION) { // If the timer is greater than the workout duration that means that currently it's a resting period

				if (this.state.timer === WORKOUTDURATION) {
					audioRest.play();
				}

				this.setState({ // decrease the rest timer and indicate that it is currently resting time
					rest: this.state.rest -= 1,
					isResting: true
				})
			}

			if (this.state.timer === (WORKOUTDURATION/2 - 1)) { // Checks to see if the workout has gone through half way, if so indicate with audio
				audioHalfWay.play();
			} else if (this.state.timer === (WORKOUTDURATION * 0.8)) { // Checks if workout is almost done, if so indicate with audio
				audioAlmostDone.play();
			}

			
			if (this.state.timer >= WORKOUTDURATION && this.state.interval === NUMWORKOUTS - 1) { //Checks if the workout is finished by seeing if the timer hit the max and if the interval is on it's last one 
				clearInterval(intervalID);
				this.setState({
					isWorkoutFinished: true
				})
			}

			this.setState({ // Increase the timer by 1, which indicates seconds. This is set at the end so that the items above are performed before the timer is started
				timer: this.state.timer += 1
			})

		}, 1000)


	} // End of startWorkout()

	displayWorkoutList() {
		if (this.state.hasWorkoutStarted === false) {
			if (this.state.isLoading === true) {
				// if the list is empty and loading is true, then show the loading image
				return(
					<div className="listOfWorkout">
						<div className="listOfWorkoutLoading">
							<img src="./public/assets/loading.gif" alt="loading bar"/>
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
									return <Exercise data={workout} key={`workoutId-${workout.id}`} />
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
			typeOfWorkout: e.target.value,
			isLoading: true
		}, () => {
			this.getWorkout();
		})


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

		for(let i = 0; i < NUMWORKOUTS; i++) { // Runs a for loop to randomly pick a pre-determined amount of exercises to compile a list
			let randomWorkout = Math.floor(Math.random()*listOfAvailableWorkouts.length); // Picks a random workout
			let pickedWorkout = listOfAvailableWorkouts[randomWorkout];


			// Regex to remove some tags found from API results
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

		this.setState({ // Updates the states with the chosen list and indicate that loading is completed.
			currentWorkoutList: listOfChosenWorkouts,
			isLoading: false
		})

	}

	displayCurrentWorkout() {
		if (this.state.isLoading === false && this.state.currentWorkoutList.length > 1) { // Checks to ensure that it is not loading and workout had more than one item in it
			if (this.state.isWorkoutFinished === true) {
				// return workout is done
				return (
					<div className="workoutFinishedContainer">

						<div className="workoutFinished">
							<h3>Workout Complete!</h3>
							<p>Congratulations, you finished the workout!!! You did an excellent job completing the workout! Please tweet about this workout app and share it with your friends if you liked it.</p>
							<p>If you had any feedback on the app, please feel free to send an email to <a href= "mailto:bbentran@gmail.com">bbentran@gmail.com</a> or tweet me at <a href="https://twitter.com/BenTranCodes">@BenTranCodes</a>
							</p>
						</div>
					</div>
				)
			} else if (this.state.isResting === true) {
				// Display resting countdown
				return(
					<div className="currentWorkout">
						<div className="restCountdown">
							<h2>{this.state.rest}</h2>
							<p>REST</p>
						</div>
					</div>
				)
			} else if (this.state.hasWorkoutStarted === true && this.state.isWorkoutFinished === false) {
				// Displays the current exercise and timer
				return (
					<div className="currentWorkout">
						<div className="currentWorkoutContainer">
							<h2>{this.calculateRemainingWorkoutTime()}</h2>
							<p>{this.state.currentWorkoutList[this.state.interval].name}</p>
						</div>
					</div>
				)
			}
		}

	} // End of displayCurrentWorkout

	displayWorkoutForm() {
		if(this.state.showWorkoutForm === true) { // Checks if the form should be displayed
			return(
				<div className='workoutFormContainer'>
					<div className="workoutFormContainerWrapper">
						<div className="logo">
							<h1>Appercise</h1>
							<img src="./public/assets/stretch.svg" alt="Image of a dumbbell"/>
						</div>
						<p>Salutations friends! I created this application as I wanted to have a way to be given assorted exercises based on the equipment currently available. To use the application please select a workout regime below. You'll be shown the selection of exercises hand picked for your workout along with instructions on how to perform them. Once you are ready scroll down to the bottom of the page and click on the 'Ready' button and the workout will begin! Note that the exercises are done in 60 second intervals. Additionally I would like to thank Gan Khoon Lay who created the logo taken from the Noun Project.</p>
						<form className='workoutForm'>
							<div className="workoutForm__question1">
								<label htmlFor="typeOfWorkout">Please select the type of workout: </label>
								<select name="typeOfWorkout" id="typeOfWorkout" value={this.state.typeOfWorkout} onChange={this.handleChange}> {/*This is handling the type of workout to be set*/}
									<option value="0" disabled>Workout Options:</option> {/* Used as a label, which is why it is disabled */}
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