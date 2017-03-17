import React from 'react';

export default function Exercise(props) {
	return (

		<li className='exercise'>
			<p>{props.data.name}</p>
			<p>{props.data.description}</p>
		</li>
	)
}