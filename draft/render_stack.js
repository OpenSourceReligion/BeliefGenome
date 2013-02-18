//
//  Render Stack.
//
//  Simple recursive way to "draw" the stack in an HTML UL element.
//  The Xerblin stack is implemented as a nested list.
//
//  The empty stack is [].
//
//  A stack with just the number 1 on it would be [1, []].
//
//  With the numbers 1, 2, and 3 would be [3, [2, [1, []]]].
//
//  Get it? :)
//


// Main interface, call this with the interpreter stack and a UL element
// to populate.
function render(stack, display) {
  display.contents().remove(); // Ditch everything.
  stack_item(stack, display);  // Draw the first stack cell.
}


// Draw a stack cell recursively.
function stack_item(stack, list) {
  if (stack.length == 0) {
    return;  // Empty stack or we've reached the end of the stack.
  };
  display_item(stack[0], list); // Uh, display the item at this position.
  stack_item(stack[1], list);   // Recurse on the rest of the stack.
}


// This function draws a cell of the stack as an LI element.
function display_item(item, list) {

  // For arrays use a special function that draws them as nested ULs.
  if (_.isArray(item)) {
    var li = $('<li></li>');
    list.append(li);
    display_array(item, li);

  // Strings are "drawn" with double quotes around them.
  } else if (_.isString(item)) {
    list.append('<li>&quot;' + item + '&quot;');

  // Our belief and link objects get special treatment.
  } else if (_.isObject(item) && !_.isUndefined(item.kind)) {
     if (item.kind == "belief") {
       list.append('<li>Belief: ' + item.name);
     } else if (item.kind == "link") {
       list.append('<li>Link between ' + item.source.name + ' and ' + item.target.name);
     }

  // Everything else defaults to the JS string coercion.
  } else {
    list.append('<li>' + item);
  }
}


// Draw an array as an UL element. Recursively uses display_item().
function display_array(A, list) {
  var d = $('<ul></ul>');
  _.each(A, function(item) { return display_item(item, d); });
  list.append(d);
}

