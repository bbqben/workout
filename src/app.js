import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';

const APIURL = 'https://wger.de/api/v2/exercise/'

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			typeOfWorkout: 7,
			showWorkoutForm: true,
			listOfWorkouts: [],
			currentWorkout: []
		}
		this.handleChange = this.handleChange.bind(this);
		this.getWorkout = this.getWorkout.bind(this);
		this.displayWorkout = this.displayWorkout.bind(this);
		this.workoutPicker = this.workoutPicker.bind(this);
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
							{this.displayWorkout}
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
			//Once data is received, store the data in the 'listOfWorkouts' state
			this.setState({
				listOfWorkouts: data.results
			})
			
			this.workoutPicker();

		}) // End of ajax call -> then 
	}

	displayWorkout() {
		return(
			this.state.currentWorkout === []
		)
	}

	workoutPicker() {
		let chosenWorkout = Math.floor(Math.random()*this.state.listOfWorkouts.length); // Randomly picking a workout from the available list
		let currentWorkout = 0;
		currentWorkout = this.state.listOfWorkouts[chosenWorkout];
		this.setState({
			currentWorkout: currentWorkout
		});

	}





} // End of class App

ReactDOM.render(<App />, document.getElementById('app'));