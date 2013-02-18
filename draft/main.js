
var width = 1000, height = 618;

var belief_list = ['adequacy', 'anaseismic', 'antic', 'birdnester', 'brast', 'cincholoiponic', 'commandeers', 'crayonist', 'cryptopyrrole', 'deconcentrate', 'dicyclist', 'discussant', 'dissoluble', 'dwellers', 'emulate', 'episyntheton', 'erichtoid', 'farrandly', 'glucosine', 'googul', 'handful', 'hierarchizing', 'holosomatous', 'hydrops', 'incurability', 'jackstones', 'limacine', 'nanigo', 'neontology', 'neutralists', 'nitrogenate', 'nondevelopment', 'oldwives', 'peroneus', 'powerplants', 'prologuised', 'shagging', 'simial', 'speedfully', 'tabernae', 'tartronate', 'tolualdehyde', 'trinketed', 'twinkling', 'ulorrhagia', 'undignified', 'unfatty', 'untrowed', 'zimbaloon']

var beliefs = {}

var data = _.map(belief_list, function(d) {
  var it = {name:d, kind:"belief"};
  beliefs[d] = it;
  return it;
})
var links = [];


$(function() {

  var interpreter = xerblin.create_new_interpreter();

  function draw() {
    render(interpreter[0], $("#stack_display"));
  }

  var the_svg = d3.select("#visual");

  var force = d3.layout.force()
    .nodes(data)
    .links(links)
    .charge(-120)
    .linkDistance(function (d) { return d.distance; })
    .linkStrength(1.0)
    .on("tick", tick)
    .size([width, height]);

  var node = the_svg.selectAll(".node");
  var link = the_svg.selectAll(".link");

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function restart() {
    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link");

    node = node.data(data);
    node.enter().append("circle")
        .attr("class", "node")
        .attr("r", 15)
        .attr("title",  function(d) { return d.name; })
        .style("fill", "#0D94D0")
        .on("mouseover", function(d) {
          d3.select(this).style("fill", "#8e6");
        })
        .on("mouseout", function(d) {
          d3.select(this).style("fill", "#0D94D0");
        })
        .on("dblclick", function(d) {
          interpreter[0] = xerblin.push(interpreter[0], d);
          draw();
        })
        .call(force.drag);
 
    the_svg.selectAll(".node").call(force.drag);

    force.start();
  }

  // Command word to create a link between two beliefs on the stack.
  //
  interpreter[1] = xerblin.insert(interpreter[1], "create_link",
  function create_link(I) {
    var t = xerblin.pop(I[0], 2);
    var left_belief = t[0], right_belief = t[1];
    var new_link = {
      source: left_belief,
      target: right_belief,
      distance: 45,
      kind: "link"
    };
    links.push(new_link);
    return [[new_link, t[2]], I[1]];
  });

  restart();

  $("#button").click(function() {
    interpreter = xerblin.interpret(interpreter, ["create_link"]);
    restart();
    draw();
    return false;
  });

});

