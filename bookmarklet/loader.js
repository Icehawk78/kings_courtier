var BASE_URL = 'http://icehawk78.github.io/kings_courtier/chrome_plugin/';

function load_scripts(script_list) {
	var s = document.createElement('script');
	var name = script_list.shift();
	s.src = BASE_URL + name;
	
	var remove_self = function() {
		//console.log('Remove self');
		//console.log(remove_self['script_list']);
		var script_list = remove_self['script_list'] || [];
		if (script_list.length > 0) {
			load_scripts(script_list);
		}
		this.remove();
	};
	remove_self['script_list'] = script_list;
	s.onload = remove_self;
	(document.head || document.documentElement).appendChild(s);
}

script_list = ['jquery-3.1.1.slim.min.js', 'lodash.js', 'main.js'];
load_scripts(script_list);