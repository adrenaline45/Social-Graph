var profile_div = document.getElementById("profile-div");
var select = document.getElementById("list-user");
var fullName = document.createElement("H5");
var age = document.createElement("P");
var gender = document.createElement("P");
var check = 0;
var friends = document.getElementById("friends");
var friendsOfFriends = document.getElementById("friends-of-friends");
var friendsSuggested = document.getElementById("friends-suggested");

$.getJSON("data.json", function(data){

    for (var i = 0; i < data.length; i++) {
    	var option = document.createElement("OPTION");
    	option.innerHTML = data[i].firstName +" "+ data[i].surname;
    	option.value = data[i].id;
    	select.appendChild(option);
    }

    fullName.innerHTML = data[0].firstName +" "+ data[0].surname;
    age.innerHTML = "<b>Age: </b>" + data[0].age;
	gender.innerHTML = "<b>Gender: </b>" + data[0].gender;

    profile_div.appendChild(fullName);
    profile_div.appendChild(age);
    profile_div.appendChild(gender);
    socialGraph(pushLinks(0,data));

    select.addEventListener("change", function() {
    	check = 0;
    	start(data);
    });

    friends.addEventListener("click", function() {
    	check = 0;
    	start(data);
    });

    friendsOfFriends.addEventListener("click", function() {
    	check = 1;
    	start(data);
    });

    friendsSuggested.addEventListener("click", function() {
    	check = 2;
    	start(data);
    });

});

function start(data) {
    var id = select.value;
	for (var i = 0; i < data.length; i++) {
		if (data[i].id == id) {
			fullName.innerHTML = data[i].firstName +" "+ data[i].surname;
			age.innerHTML = "<b>Age: </b>" + data[i].age;
			gender.innerHTML = "<b>Gender: </b>" + data[i].gender;
			socialGraph(pushLinks(i, data));
		}
	}
}

function pushLinks(z, data) {
	var links = [];
	for (var i = 0; i < data[z].friends.length; i++) {
		for (var j = 0; j < data.length; j++) {
			if (data[z].friends[i] == data[j].id) {
				links.push({
					source: data[z].firstName +" "+ data[z].surname,
					target: data[j].firstName +" "+ data[j].surname
				});
				if (check == 1 || check == 2) {
					pushLinksFriend(data, j, links);
				}
			}
		}
	}
	return links;
}

function pushLinksFriend(data, z, links) {
	for (var i = 0; i < data[z].friends.length; i++) {
		for (var j = 0; j < data.length; j++) {
			if (data[z].friends[i] == data[j].id) {
				links.push({
					source: data[z].firstName +" "+ data[z].surname,
					target: data[j].firstName +" "+ data[j].surname
				});
				if (check == 2) {
					pushLinksSuggested(data, j, links);
				}
			}
		}
	}
}

function pushLinksSuggested(data, z, links) {
	for (var i = 0; i < data[z].friends.length; i++) {
		for (var j = 0; j < data.length; j++) {
			if (data[z].friends[i] == data[j].id) {
				links.push({
					source: data[z].firstName +" "+ data[z].surname,
					target: data[j].firstName +" "+ data[j].surname
				});
			}
		}
	}
}

function socialGraph(links) {

	var width, heigth;
	var mq = window.matchMedia( "(max-width: 700px)" );
	if (mq.matches) {
		var width = 400,
			height = 500;
	} else {
		var width = 700,
			height = 500;
	}
	var graph_div = document.getElementById("graph-div")
		graph_div.innerHTML = "";
	var nodes = {};

	links.forEach(function(link) {
		link.source = nodes[link.source] ||
			(nodes[link.source] = {name: link.source});
		link.target = nodes[link.target] ||
			(nodes[link.target] = {name: link.target});
	});

	var svg = d3.select(graph_div).append('svg')
		.attr('width', width)
		.attr('height', height);

	var force =  d3.layout.force()
		.size([width, height])
		.nodes(d3.values(nodes))
		.links(links)
		.charge(function(d){
        	var charge = -500;
        	if (d.index === 0) charge = 10 * charge;
        	return charge;
    	})
		.on("tick", tick)
		.linkDistance(100)
		.start()

	var link = svg.selectAll('.link')
		.data(links)
		.enter().append('line')
		.attr('class', 'link');

	var gnodes = svg.selectAll('g.gnode')
	    .data(force.nodes())
	    .enter()
	    .append('g')
	    .classed('gnode', true);

	var node = gnodes.append("circle")
	    .attr("class", "node")
	    .attr("r", 30)
	    .style("fill", "#fff")
	    .each(function (d, i) {
            if (i == 0) {
              // put all your operations on the second element, e.g.
              d3.select(this).style("stroke", "#FFD700");    
            }
          });
	    
    var labels = gnodes.append("text")
	    .text(function(d) { return d.name; })
	    .attr("dx", 35)
	    .attr("dy", ".35em");

	var img = gnodes.append("image")
	    .attr("xlink:href", "images/user.png")
	    .attr("width", 35)
	    .attr("height", 35)
	    .attr("x", -17.5)
	    .attr("y",-17.5);

	function tick(e) {
		link.attr('x1', function(d){ return d.source.x; })
			.attr('y1', function(d){ return d.source.y; })
			.attr('x2', function(d){ return d.target.x; })
			.attr('y2', function(d){ return d.target.y; })

		gnodes[0].x = width / 2;
		gnodes[0].y = height / 2;

		gnodes.attr("transform", function(d) { 
        	return 'translate(' + [d.x, d.y] + ')'; 
    	})
		 	.call(force.drag);
	}
}