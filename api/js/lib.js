// domain/js/:id?engine=??&auto=false&target=.test
// As soon as DOM is loaded, let's get to work...
document.addEventListener("DOMContentLoaded", function(event) {
	//console.log(smData);
	// Get targets
	var renders = document.getElementsByClassName("sm-render");

	// Loop targets
	for(var i = 0; i < renders.length; i++) {
		var render = renders[i];
		var source   = render.innerHTML;
		// Creating Handlebars template
		var template = Handlebars.compile(source);
		// Combine data with targets...
		var html    = template(smData);
		// Set HTML
		render.innerHTML = html;
	}
});