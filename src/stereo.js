var stereo = events({})
var timeStamp
var isIE = !!global.attachEvent

stereo.__storageEventKey__ = '__stereo_storage_event_key__'

stereo.init = function() {
	var that = this

	if (global.addEventListener) {
		global.addEventListener('storage', emitEvent, false)

	// For IE 8 compatibility
	// http://jsfiddle.net/rodneyrehm/bAhJL/	
	} else if(isIE) {
		global.document.attachEvent('onstorage', emitEvent)
	}

}

stereo.broadcast = function(eventName, eventData) {
	// Here, `isAllowedToBroadcast` can be rewritten to adapt different broadcast strategy
	var isAllowed = stereo.isAllowedToBroadcast(eventName)

	if (!isAllowed) {
		return false
	}

	var that = this
	timeStamp = (+new Date) + Math.random()

	var sealEventInformation = JSON.stringify({
		eventName: eventName,
		eventData: eventData,
		timeStamp: timeStamp 
	})

	localStorage[that.__storageEventKey__] = sealEventInformation

	return this
}

function emitEvent(event) {

	// IE(No matter which version) Browsers 
	// will execute this tab event's callback function before the other tab setting localStorage value.
	// So, here to defer the `emit` function, after the other tab setting localStorage value.
	// It's something like dirty code...
	if (isIE) {
		setTimeout(emit, 1)
	} else {
		emit()
	}

	function emit () {
		var eventInformation = JSON.parse(localStorage[stereo.__storageEventKey__]) 
		var newTimeStamp = eventInformation.timeStamp
		var isChanged = (newTimeStamp !== timeStamp)

		if (isChanged) {
			stereo.emit(eventInformation.eventName, eventInformation.eventData)
			timeStamp = newTimeStamp
		} 
	}
}

stereo.config = function(config) {
	extend(configuration, config)
}

stereo.init()
