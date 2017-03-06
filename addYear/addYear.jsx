var monthsForOoTM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Nov/Dec"];
var monthsForRoTM = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var months;
var Name = decodeURI(activeDocument.name).replace(/\.[^\.]+$/, '');
var Path = decodeURI(activeDocument.path);

function main(name){
	//prompt for year
	var banner = prompt('OoTM or RoTM?', 'OoTM', 'Continue');

	if(!year){
		var year = prompt('Enter the year that you wish to create:', 'year', 'Create');
	}
	else{
		year = prompt('Created, would you like to make another year?', year, 'Create');
	}

	if(year){
		var numberOfYears = prompt('How many consective years would you like to create?', '1', 'Start');
		if(numberOfYears){
			unselectAll(activeDocument);
			var editableLayer;
			if(banner === 'RoTM' || banner === 'rotm'){
				//we are doing recruiting of the month.
				months = monthsForRoTM;
				findLayers(activeDocument, ["Layer 2"]);
				editableLayer = findLayer(activeDocument, 'Text Layer');
			}else{
				months = monthsForOoTM;
				findLayers(activeDocument, ["Layer 2 copy 4", "Layer 2 copy 11", "Background"]);
				editableLayer = findLayer(activeDocument, "January", true);
			}
			for (var j = 0; j < numberOfYears; j++) {
				if(j !== 0)
					year = parseInt(year) + 1;
				year.toString();
				for (var i = 0; i < months.length; i++) {
					createMonth(months[i], year, editableLayer);
				}
			}
			main(year);
		}
	}


}

function createMonth(month, year, layer){
	layer.textItem.contents = month + " "+ year;
	var doc = activeDocument;
	if (doc.bitsPerChannel != BitsPerChannelType.EIGHT) doc.bitsPerChannel = BitsPerChannelType.EIGHT;
	var jpgSaveOptions = new JPEGSaveOptions();
	jpgSaveOptions.embedColorProfile = true;
	jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
	jpgSaveOptions.matte = MatteType.NONE;
	jpgSaveOptions.quality = 8;
	if(month === "Nov/Dec")
		month = "nov-dec";

	var folder = new Folder(Path + "/" + year);
	if(!folder.exists) {
		folder.create();
	}
	var saveFile = new File(Path + "/" + year + "/" + month + "-" + year + ".jpg");
	activeDocument.saveAs(saveFile, jpgSaveOptions, true,Extension.LOWERCASE);
}

function findLayers(ref, names){
	for(var i = 0; i < names.length; i++){
		findLayer(ref, names[i], true);
	}

	// var currentLayer = activeDocument.activeLayer;
	// // toggle visibility of active layer
	// currentLayer.visible = !currentLayer.visible
}

function unselectAll(ref){
	var layers = ref.layers;
	for (var i = 0; i < layers.length; i++){
		layers[i].visible = false;
	}
}

///////////////////////////////////////////////////////////////////////////////
// findLayer - iterate through layers to find a match
///////////////////////////////////////////////////////////////////////////////
function findLayer(ref, name, setVisible) {
	// declare local variables
	var layers = ref.layers;
	var len = layers.length;
	var layerref = null;

	// iterate through layers to find a match
	for (var i = 0; i < len; i++) {
		// test for matching layer
		var layer = layers[i];
		if (layer.name.toLowerCase() == name.toLowerCase()) {
			// select matching layer
			activeDocument.activeLayer = layer;
			if(setVisible){
				layer.visible = true;
			}
			layerref = layer;
			break;
		}
		// handle groups (layer sets)
		else if (layer.typename == 'LayerSet') {
			layerref = findLayer(layer, name);
			if (layerref) {
				break;
			}
		}
	}
	return layerref;
}

///////////////////////////////////////////////////////////////////////////////
// isCorrectVersion - check for Adobe Photoshop CS (v8) or higher
///////////////////////////////////////////////////////////////////////////////
function isCorrectVersion() {
	if (parseInt(version, 10) >= 8) {
		return true;
	}
	else {
		alert('This script requires Adobe Photoshop CS or higher.', 'Wrong Version', false);
		return false;
	}
}

///////////////////////////////////////////////////////////////////////////////
// isOpenDocs - ensure at least one document is open
///////////////////////////////////////////////////////////////////////////////
function isOpenDocs() {
	if (documents.length) {
		return true;
	}
	else {
		alert('There are no documents open.', 'No Documents Open', false);
		return false;
	}
}

///////////////////////////////////////////////////////////////////////////////
// hasLayers - ensure that the active document contains at least one layer
///////////////////////////////////////////////////////////////////////////////
function hasLayers() {
	var doc = activeDocument;
	if (doc.layers.length == 1 && doc.activeLayer.isBackgroundLayer) {
		alert('The active document has no layers.', 'No Layers', false);
		return false;
	}
	else {
		return true;
	}
}

///////////////////////////////////////////////////////////////////////////////
// showError - display error message if something goes wrong
///////////////////////////////////////////////////////////////////////////////
function showError(err) {
	if (confirm('An unknown error has occurred.\n' +
			'Would you like to see more information?', true, 'Unknown Error')) {
		alert(err + ': on line ' + err.line, 'Script Error', true);
	}
}

// test initial conditions prior to running main function
if (isCorrectVersion() && isOpenDocs() && hasLayers()) {
	try {
		main();
	}
	catch(e) {
		// don't report error on user cancel
		if (e.number != 8007) {
			showError(e);
		}
	}
}