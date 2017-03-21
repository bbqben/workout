import React from 'react';

export default function Exercise(props) {
	return (

		<li className='exercise'>
			<p className='exerciseTitle'>{props.data.name}</p>
			<p className='exerciseDescription'>{props.data.description}</p>
		</li>
	)
}