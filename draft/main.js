// This is the main javascript file (no surprise.)  I'm going to be
// adding a bit more commentary than I usually might for folks to have an
// easier time of following it.
//
// Eventually we should add the license and copyright notice here, as
// well as some other meta-data, and full JSDoc-style comments.

// These are the SVG dimensions, they should be kept in sync with the
// values in the HTML element attributes.
var width = 1000, height = 618;

// For now we're just using this list of random (and kinda weird) words
// to stand in for a list of beliefs.  Later we'll not only use more
// appropriate words but also add the ability to load beliefs and links
// and such from a server.
var belief_list = ['adequacy', 'anaseismic', 'antic', 'birdnester', 'brast', 'cincholoiponic', 'commandeers', 'crayonist', 'cryptopyrrole', 'deconcentrate', 'dicyclist', 'discussant', 'dissoluble', 'dwellers', 'emulate', 'episyntheton', 'erichtoid', 'farrandly', 'glucosine', 'googul', 'handful', 'hierarchizing', 'holosomatous', 'hydrops', 'incurability', 'jackstones', 'limacine', 'nanigo', 'neontology', 'neutralists', 'nitrogenate', 'nondevelopment', 'oldwives', 'peroneus', 'powerplants', 'prologuised', 'shagging', 'simial', 'speedfully', 'tabernae', 'tartronate', 'tolualdehyde', 'trinketed', 'twinkling', 'ulorrhagia', 'undignified', 'unfatty', 'untrowed', 'zimbaloon']

// This structure serves as a map from belief names to the actual belief
// objects we are about to create for each belief/word in the belief_list
// array.  This is used to be able to look up the belief object from its
// name.
var beliefs = {}

// This data array is what we will pass to the D3 Force Layout to use as
// its data for drawing the beliefs.  By creating a whole object we can
// store additional information (such as the x and y coorinates of the
// node in the SVG element, which the Force layout does automatically.)
var data = _.map(belief_list, function(d) {

  // Create an object for the belief (the x and y attributes are added
  // later by the Force layout.)
  var it = {name:d, kind:"belief"};

  // Record the object in the beliefs object so we can access it later by
  // its name.
  beliefs[d] = it;

  return it;
})

// This is an array to store the links created by the user.  We pass it
// to the Force layout as well, and later we can arrange to record links
// and post them back to a server.
var links = [];


// With that all out of the way let's write our "init" function.  This is
// what jQuery will run for us once the page has loaded.  (Stuff that was
// defined above will be available in, e.g. the Firebug console.  Stuff
// defined in the body of the function below is not in the global scope
// and cannot be accessed "outside" of the function.  I'm just sayin'.)
$(function() {

  // Create a Xerblin interpreter.  This is a simple extensible command
  // interpreter that we're using to structure the app.
  var interpreter = xerblin.create_new_interpreter();

  // This is a convenience function that "re-draws" the HTML that shows
  // the contents of the interpreter's stack.  See render_stack.js for
  // the implementation of the render() function.
  function draw() {
    render(interpreter[0], $("#stack_display"));
  }

  // Get a D3 "selection" for the SVG element.
  var the_svg = d3.select("#visual");

  // Create the Force Layout.
  var force = d3.layout.force()

    // Give it our nodes and links arrays to map.
    .nodes(data)
    .links(links)

    // Set the charge to a comfortable distance. (We could bring this
    // value out into a named variable but there's not much point as it's
    // only set here.)
    .charge(-120)

    // When links are created they are given a distance value and this
    // takes care of setting the link distance by the links object's
    // distance attribute.  That way we can control the length of the SVG
    // link by changing the value of the (Javascript) link object's
    // distance attribute.
    .linkDistance(function (d) { return d.distance; })

    // These should be self-explanitory.
    .linkStrength(1.0)
    .on("tick", tick) // The tick() function is defined below.
    .size([width, height]);

  // These are D3 "selections" based on searching the SVG element for
  // sub-elements that have the give classes.  When we create the SVG
  // elements we add these classes to them, and they are used in the
  // site.css file to style them.
  var node = the_svg.selectAll(".node");
  var link = the_svg.selectAll(".link");

  // This is called by the Force Layout on each "tick" of its internal
  // animation clock.  It just updates the SVG elements based on the
  // (newly re-computed) x and y attributes.
  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }


  // This is to be called when the animation first starts, and when
  // adding new nodes or links.  It takes care of updating the SVG and
  // telling the Force Layout to start() animating.
  function restart() {

    // Update links, creating svg:line elements for each.
    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link");

    // Update nodes, creating svg:circle elements for each and setting up
    // the mouse bindings.
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
          // When you double-click on a node the belief object is put
          // onto the xerblin interpreter stack.
          interpreter[0] = xerblin.push(interpreter[0], d);

          // Then we re-draw the stack so you can see the belief object.
          draw();
        })
        .call(force.drag); // This sets up the mouse-drag behavior built-in to D3.

    force.start(); // Start animating (if already animating does nothing.)
  }


  // Command word to create a link between two beliefs on the stack.
  //
  // To add new commands to the interpreter we replace its dictionary
  // with a copy of the dictionary that includes the new command.  There
  // is a very good reason why this is done in this slighty awkward
  // manner but it's too much to explain here.  Just trust me for now
  // when I say that this line is the right way to add a new command from
  // within Javascript:
  interpreter[1] = xerblin.insert(interpreter[1], "create_link",
  function create_link(I) {

    // Get two values (belief objects, we hope) off the stack.
    var t = xerblin.pop(I[0], 2);

    var left_belief = t[0], right_belief = t[1];

    // Create a new link object.
    var new_link = {
      source: left_belief,
      target: right_belief,
      distance: 45,
      kind: "link"
    };
    links.push(new_link);

    // Replace the two beliefs on the stack with the (single) new link
    // object.
    return [[new_link, t[2]], I[1]];

    // Note that this isn't the whole story: we aren't calling restart()
    // here so the new link won't automatically appear in the Force
    // Layout or on the SVG yet, even though it has been pushed into the
    // links array already.
  });

  restart();  // This is the initial call to start animating the SVG on first load.

  // Use jQuery to set up the hyperlink "button" to call the create_link
  // command we added to the interpreter's dictionary above, and then
  // update the Force Layout and the HTML stack display.
  $("#button").click(function() {
    interpreter = xerblin.interpret(interpreter, ["create_link"]);
    restart();
    draw();
    return false;
  });

});
