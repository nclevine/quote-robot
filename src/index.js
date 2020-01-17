import React from 'react';
import ReactDOM from 'react-dom';
import './normalize.css';
import './index.css';
import greatFace from './assets/great-face.png';
import mehFace from './assets/meh-face.png';
import lameFace from './assets/lame-face.png';
import speaker from './assets/speaker.png';

function Robot(props) {
	const description = "Built just for you, in your neighborhood of " + props.city + "! I find you quotes. You rate them!";
	return (
		<div className="robot-container">
			<div className="robot-identity-wrapper">
				<div className="robot-image-container">
					<img
						className="robot-image"
						src={props.imageUrl}
						alt='' />
				</div>
				<div className="robot-description">
					<p>{description}</p>
				</div>
			</div>
			<div className="robot-map-container">
				<img
					className="robot-map"
					src={props.mapImageUrl}
					alt='' />
			</div>
		</div>
	);
}

function Quote(props) {
	let ratingTimeClass = 'quote-rating-timestamp';
	let ratingIconClass = 'quote-rating-icon';
	let ratingIcon = null;
	let ratedDate = 'TODAY!';
	if (props.rating < 0) {
		ratingTimeClass += ' unrated';
		ratingIconClass += ' unrated';
	} else if (props.rating === 0) {
		ratingIcon = lameFace;
	} else if (props.rating === 1) {
		ratingIcon = mehFace;
	} else if (props.rating === 2) {
		ratingIcon = greatFace;
	}
	if (props.ratedDate) {
		ratedDate = props.ratedDate.toLocaleDateString('en-US', {
			year: '2-digit',
			month: '2-digit',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		});
	}
	return (
		<div className="quote-container">
			<div className="quote-reading">
				<img
					className="speaker-icon"
					src={speaker}
					alt=""
					onClick={() => playQuoteById(props.audioId)} />
				<audio
					controls
					id={props.audioId}
					src={props.voiceUrl}>
				</audio>
			</div>
			<div className="quote-body">
				<p className="quote-text">&ldquo;{props.text}&rdquo;</p>
				<p className="quote-author"><span className="author-tilde">~</span>{props.author}</p>
				<p className={ratingTimeClass}>Rated on: {ratedDate}</p>
			</div>
			<div className={ratingIconClass}>
				<img
					src={ratingIcon}
					alt="" />
			</div>
		</div>
	);
}

class QuoteRobotApp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ipAddress: '',
			city: '',
			lat: '',
			long: '',
			loadedQuotes: [],
			ratedQuotes: [],
			currentQuote: null,
			currentQuoteIndex: 0,
			inListMode: false
		};
	}

	componentDidMount() {
		fetch('https://api.ipgeolocation.io/ipgeo?apiKey=9726f4d524cb43f4991ae86110719b68')
	  		.then(res => res.json())
	  		.then(data => this.setState({
	  			ipAddress: data.ip,
	  			city: data.city,
	  			lat: data.latitude,
	  			long: data.longitude
	  		}));

	  	fetch('https://api.quotable.io/quotes?limit=50')
	  		.then(res => res.json())
	  		.then(data => this.setState({
	  			loadedQuotes: data.results,
	  			currentQuote: buildQuote(data.results[0])
	  		}));
	}

	componentDidUpdate(prevProps, prevState) {
		const indexPlusTwo = prevState.currentQuoteIndex + 2;
		const twoLessThan50 = (indexPlusTwo % 50) === 0;
		if(twoLessThan50) {
			fetch('https://api.quotable.io/quotes?limit=50&skip=' + indexPlusTwo)
		  		.then(res => res.json())
		  		.then(data => this.setState({
		  			loadedQuotes: prevState.loadedQuotes.concat(data.results)
		  		}));
		}
	}

	rateCurrentQuote(rating) {
		const ratedCurrentQuote = Object.assign(this.state.currentQuote, {
			rating: rating,
			ratedDate: new Date()
		});
		const ratedQuotes = this.state.ratedQuotes.concat(ratedCurrentQuote);
		const currentQuoteIndex = this.state.currentQuoteIndex + 1;
		this.setState({
			ratedQuotes: ratedQuotes,
			currentQuoteIndex: currentQuoteIndex,
			currentQuote: buildQuote(this.state.loadedQuotes[currentQuoteIndex])
		});
	}

	toggleListView() {
		const inListMode = this.state.inListMode;
		this.setState({
			inListMode: !inListMode
		});
	}

	render () {
		const robotData = {
			imageUrl: 'https://robohash.org/' + this.state.ipAddress + '.png',
			mapImageUrl: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/' + this.state.long + ',' + this.state.lat + ',14/900x400?access_token=pk.eyJ1IjoibmNsZXZpbmUiLCJhIjoiY2s0MnZqNmV6MDFmMzNucTRqZ3o4NGRzcSJ9.Ic501E8IYNVXnrjC-fHprQ',
			city: this.state.city
		};
		const currentQuote = Object.assign({}, this.state.currentQuote);
		const currentQuoteAudioId = currentQuote.id + '-audio';
		const ratedQuotes = [...this.state.ratedQuotes];
		const ratedQuotesList = ratedQuotes.length < 1
		? <p className="no-quotes">You haven't rated any quotes yet!</p>
		: ratedQuotes.map((quote, i) => {
			let audioId = quote.id + '-audio';
			return (
				<Quote
				key={quote.id}
				text={quote.text}
				author={quote.author}
				voiceUrl={quote.voiceUrl}
				rating={quote.rating}
				ratedDate={quote.ratedDate}
				audioId={audioId} />
			);
		});
		let quoteSectionClass = 'quotes-section';
		let quoteToggleButtonText = 'Show Rated Quotes';
		if (this.state.inListMode) {
			quoteSectionClass += ' in-list-mode';
			quoteToggleButtonText = 'Rate Another Quote';
		}

		if (!this.state.ipAddress || !currentQuote) {
			return (
				<div className="loader">LOADING...</div>
			);
		}

	  	return (
	  		<div className="quote-robot-app">
	  			<Robot
	  				imageUrl={robotData.imageUrl}
	  				mapImageUrl={robotData.mapImageUrl}
	  				city={robotData.city} />
	  			<div className={quoteSectionClass}>
		  			<div className="quote-rater">
		  				<Quote
		  					text={currentQuote.text}
		  					author={currentQuote.author}
		  					voiceUrl={currentQuote.voiceUrl}
		  					rating={currentQuote.rating}
		  					ratedDate={currentQuote.ratedDate}
		  					audioId={currentQuoteAudioId} />
		  				<div className="quote-rater-controls">
		  					<p>Tap face! Rate quote!</p>
		  					<div className="quote-rater-buttons-wrapper">
			  					<img
			  						className="quote-rater-button lame"
			  						src={lameFace}
			  						alt=""
			  						onClick={() => this.rateCurrentQuote(0)} />
			  					<img
			  						className="quote-rater-button meh"
			  						src={mehFace}
			  						alt=""
			  						onClick={() => this.rateCurrentQuote(1)} />
			  					<img
			  						className="quote-rater-button great"
			  						src={greatFace}
			  						alt=""
			  						onClick={() => this.rateCurrentQuote(2)} />
		  					</div>
		  				</div>
		  			</div>
		  			<div className="rated-quotes-list">
		  				{ratedQuotesList}
		  			</div>
		  			<button
		  				className="quote-view-toggle"
		  				onClick={() => this.toggleListView()}>
		  				{quoteToggleButtonText}
	  				</button>
	  			</div>
	  		</div>
	  	);
	}
}

ReactDOM.render(<QuoteRobotApp />, document.getElementById("root"));

function buildQuote(rawQuote) {
	return {
		id: rawQuote._id,
		text: rawQuote.content,
		author: rawQuote.author,
		retrievedDate: new Date(),
		ratedDate: null,
		rating: -1,
		voiceUrl: 'http://api.voicerss.org/?key=e591145feeb544cd8a8b5ffc1e8c934c&hl=en-us&c=MP3&src=' + rawQuote.content
	};
}

function playQuoteById(audioId) {
	const audioPlayer = document.getElementById(audioId);
	if (audioPlayer) {
		audioPlayer.currentTime = 0;
		audioPlayer.play();
	}
}
