var http = require('http');
var request = require('request');
var fs = require('fs');
var jsdom = require('jsdom'), html5 = require('html5');
var crypto = require('crypto');

function mediaPath(path, host) {
	if (path.charAt(0) == "/") {
		return "http://" + host + path
	}
	else return path
}


function update_link(node, host) {
	var attrs = [
		'href',
		'src'];

	for (var i in attrs) {
		if (node.hasAttribute(attrs[i])) {
			var path = node.getAttribute(attrs[i])
			node.setAttribute(attrs[i], mediaPath(path, host));
		}
	}
}

function walk(node, host, cb) {
	var notAllowed = [

			'SCRIPT',
			'NOSCRIPT',
			'H1',
			'FORM',
			'TITLE'
		],
		tags = { };

	if (node.nodeType !== node.ELEMENT_NODE) {
		return;
	}

	update_link(node, host);
	node.removeAttribute('class');
	node.removeAttribute('style');
	node.removeAttribute('id');

	//console.log('node: '+node.tagName)

	for(var i = 0; i < node.childNodes.length; ++i){

		var childNode = node.childNodes[i],
			tagName = childNode.tagName;

		if (~notAllowed.indexOf(childNode.tagName)===-1) {
			node.removeChild(childNode);
			--i;
		}
		else if (tagName !== undefined){

			if (childNode.hasAttribute("class")) {
				tagName += ' '+childNode.getAttribute("class");
			}
			var arr = ( (!tags[tagName]) ? tags[tagName] = [] : tags[tagName] );

			arr.push(childNode.textContent.length);
			walk(childNode, host, cb);
		}
	}//------------end child loop

	var items = Object.getOwnPropertyNames(tags).map(function (name) {
		var tag = tags[name];
		//	console.log('tags '+name+' '+tag)
		return {
			name: name,
			len: tag.length,
			ratio: tag.length/node.childNodes.length,
			std_dev: deviation(tag),
			mean: mean(tag),
			node: node
		}
	})
	if (items.length > 0)
		cb(items);
}

function deviation(set) {
	var n = set.length,
		d = set.reduce(function(a, b) { return a + Math.pow(b,2) }, 0)/n,
		e = Math.pow(set.reduce(function(a, b) { return a + b })/n, 2);

	return Math.sqrt(d - e);
}

function mean(set) {
	return set.reduce(function(a, b) { return a + b })/set.length;
}

function strip(node, tag) {

	var check = false;
	for(var i = 0; i < node.childNodes.length; ++i){
		var child = node.childNodes[i];

		if (child.tagName === tag) {
			check = true;
		}
		if (!check) {
			node.removeChild(child);
			--i;
		}
	}
}

function listTypes(node, host) {

	var articles = [],
		max = 0,
		candidateNode = null,
		tag, image = null;
	var candidate = { };

	walk(node, host, function(tags) {
		var retval = tags.some(function(item) {
			return item.len > 2 && item.mean > 80 && item.std_dev < 350 && item.ratio > 0.17;
		});
		if (retval) {
			articles.push(tags)
		}
	})

	for (var i in articles) {

		articles[i].forEach(function(item) {
			if(item.len > max) {
				tag = item.name.split(' ')[0];
				candidateNode = item.node;
				max = item.len;

			}
		})
	}
//	console.log(articles)
	image = candidateNode.parentNode.querySelector('IMG');
	if (image !== undefined) {
		candidate.image = mediaPath(image.getAttribute('src'), host);
	}
	strip(candidateNode, tag);
	var str =  candidateNode.querySelectorAll(tag);

	candidate.firstParagraph  = str[0].textContent+' '+str[1].textContent;

	candidate.main = html5.serialize(candidateNode);


	return candidate;
}


var articlize =  exports.articlize = function( urlName, callback) {

	request(urlName, function (error, response, body) {
		if (response.statusCode == 200) {
			var
				window = jsdom.jsdom(null, null, {
					parser: html5,
					features: {
						QuerySelector: true,
						FetchExternalResources: [ ]

					}
				}).createWindow(),
				parser = new html5.Parser({document:window.document});

			parser.parse(body);

			var document = window.document;


	//var published_date = document.querySelector('TIME').textContent
			var url = urlName.split("/"),
				fileName = crypto.createHash('md5').update(url[url.length - 1]).digest('hex'),
				path = "./public/resources/articles/" + fileName + ".xml",
				host = url[2],
				title = document.querySelector('TITLE').textContent,
				published_date = "";

			if (document.querySelector('H1'))
				title = document.querySelector('H1').textContent;

			var content = listTypes(document.documentElement, host);


			var stream = fs.createWriteStream(path);
			stream.once('open', function (fd) {

				stream.write('<title>' + title + '</title>\n')
				stream.write('<content>' + content.main + '</content>');

			})

			var result = {};
			result.url = urlName;
			result.path = fileName + ".xml";
			result.title = title;
			result.excerpt = content.firstParagraph;
			result.thumbnail = content.image;


			callback(error,result);

		}
	});

	/*
	 //for testing----------------
	 return document.querySelectorAll(tag).map(function(node) {
	 return "<p>"+node.textContent+"</p>";
	 }).join("");
	 //---------------------------
	 */
}