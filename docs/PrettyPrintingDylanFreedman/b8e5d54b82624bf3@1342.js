// https://observablehq.com/@freedmand/pretty-printing@1342
import define1 from "./3c37c9bffc213235@211.js";

function _doc(md){return(
md`# Pretty Printing

*A brief primer on how code auto-formatters work*

Pretty printing is an art and a science — the distinctly human endeavor of formatting code to look *pretty*.

I recently learned about how pretty printers work after I implemented one for my early-stage programming language, [Poly](poly.dev), to formalize the language's style. In the process of researching pretty printers, I was amazed to find that the technique is over 40 years old and the elegant underlying algorithm back then is still in use in modern, popular tools like [Prettier](https://prettier.io/).

In this computational essay, we'll build an HTML formatter (and a bonus syntax highlighter) from the ground up to learn how pretty printing works.`
)}

async function _2(visibility,table,draw,demoLineWidth,prettyHtml,documentNodes)
{
  await visibility();  // only render if visible
  return table(
    draw(demoLineWidth, prettyHtml(demoLineWidth, documentNodes), false, 12),
    0.8,
    draw(demoLineWidth, prettyHtml(demoLineWidth, documentNodes), false, 2),
    0.2,
  );
}


function _3(md){return(
md`*real-time formatting of the source code of this notebook (computed in-browser)*`
)}

function _4(md){return(
md`## Overview

Why format source code? In addition to making code look nicer, formatters...

* **help catch bugs** — formatted code reveals mistakes like mismatched braces.
* **unify code style** — eliminate debates on appropriate style by enforcing one.
* **improve developer experience** — make working with code editors pleasant. For example, the *"Format on save"* option provided in apps like Visual Studio Code is a satisfying way to prettify error-free code every time you hit save.
* **result in concise diffs** — repositories like GitHub show new changes, or *diffs*, in source code. Some formatting approaches aim to make diffs as small as possible for minor tweaks.`
)}

function _5(md){return(
md`## Documents

A *document* is a tree-like structure that can contain text, newlines, nested blocks, and unions of multiple possible layouts. The purpose of the document type is to provide the building blocks to represent how we want  source text to be formatted. Here's how we define our document structure:`
)}

function _Doc(){return(
{
  // An empty document
  nil:                           {type: 'nil'},

  // A text document (optional color for syntax highlighting)
  text: (text, color='black') => ({type: 'text', text, color}),

  // A newline separator that flattens to a space by default
  line: (reducedText=' ')    => ({type: 'line', reducedText}),

  // An indented document
  nest: (indent, doc)        => ({type: 'nest', indent, doc}),
  
  // The concatenation, or joining, of multiple documents
  concat: (docs)             => ({type: 'concat', docs}),

  // A union of documents that favors `a` if there's room
  union: (a, b)              => ({type: 'union', a, b}),
}
)}

function _7(md){return(
md`### Text

The simplest type of document is a *text document*, which just contains some text. Text documents should not contain newline characters, since line breaks are handled specially.`
)}

function _8(md){return(
md`### Line

*Line documents* represent line breaks and are useful in handling indentation and other behavior. Documents can be flattened to a single line with a flatten method we'll define below; when flattened, line breaks turn into the specified reduced text, typically a space or empty string.`
)}

function _9(md){return(
md`### Concatenation

*Concatenation documents* take a list of documents and join them into one document. For instance, the example below illustrates joining text and line documents to display some multi-line text.`
)}

function _10(display,Doc){return(
display(
  Doc.concat([
    Doc.text("Hello"),
    Doc.line(),
    Doc.text("world"),
  ]),
)
)}

function _11(md){return(
md`### Nesting

Indentation is commonly used in formatting to represent enclosed data. A *nest document* takes in a number and a sub-document, representing indenting the sub-document passed in a number of spaces. In practice, indenting means each occurrence of a newline is prepended with a number of spaces.`
)}

function _12(display,Doc){return(
display(
  Doc.concat([
    Doc.text('['),
    Doc.nest(2, Doc.concat([
      Doc.line(),
      Doc.text('arrayElement,'),
    ])),
    Doc.line(),
    Doc.text(']'),
  ])
)
)}

function _13(md){return(
md`### Union

A *union document* is the secret sauce to pretty printing. The other document types just define a fixed layout, with no mechanism to handle text wrapping. A union document stores two sub-documents that flatten to the same layout, where the first one has a longer first line. When pretty printing, the first document of the union is tried, and if the maximum line width is exceeded, the second document is rendered instead.`
)}

function _14(displaySmallAndLargeWidth,Doc){return(
displaySmallAndLargeWidth(
  Doc.union(() => Doc.concat([Doc.text("Hi"), Doc.text(' '), Doc.text("there")]),
            () => Doc.concat([Doc.text("Hi"), Doc.line(), Doc.text("there")])),
)
)}

function _15(md){return(
md`## The Pretty Printing Algorithm

So, now we are equipped with a structure to describe how we might want to format documents and are ready to develop our pretty printing algorithm. We'll follow the approach outlined by Philip Wadler in ["A Prettier Printer"](https://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf) (2003), which is a modern version of Derek Oppen's 1980 paper ["Prettyprinting"](https://www.cs.tufts.edu/~nr/cs257/archive/derek-oppen/prettyprinting.pdf).

Let's outline our approach and some helper methods. The crux is we want a method that consumes the document sequentially and outputs formatted text as it goes. The method should only have to look ahead a line at a time, and essentially it should optimistically try to place everything on the same line if possible, only breaking lines if needed.

The three helper methods that we'll define below are as follows:
* *lazy*: wraps a function so that it only has to be computed once and then the value is cached thereafter
* *layout*: returns a structure which stores some formatted text and a lazy function that returns the next layout structure (functions as a lazy linked list)
* *fits*: returns if there's enough room on the current line to output the passed in layout structure

We are setting up routines to lazily evaluate layout possibilities, which allows us to only compute what's needed in a performant manner while retaining the ability to express an exponential pool of possibilities.`
)}

function _lazy(){return(
function lazy(closure) {
  let cached = null;
  return () => cached == null ? (cached = closure()) : cached;
}
)}

function _layout(){return(
function layout(type, text=null, next=null, color='black') {
  // Type can be "text", "line", or "nil"
  return {type, text, color, next};
}
)}

function _fits(){return(
function fits(remainingWidth, layoutDoc) {
  if (remainingWidth < 0) return false;
  if (layoutDoc.type == 'text') {
    return fits(remainingWidth - layoutDoc.text.length, layoutDoc.next());
  }
  // If the layout is of type `line` or `nil` it always fits.
  return true;
}
)}

function _19(md){return(
md`We're ready to define the *best* method, which finds the ideal layout structure given a *max line width* and document. To make the function work well, it's a recursive method that is actually passed a list of *document pairs*, which each contain a document structure and that document's current level of indentation. The method is also passed the *line width*, to account for how much room is left in the current line.

The method proceeds by examining the first document pair and recursively calling itself as necessary, expanding the list of document pairs to examine based on the first document type. Union documents are picked apart with the *fits* method, expanding to use the first document if there is room and the second if not. When text and line documents are encountered, they output layout structures which we can unravel later to reconstruct the formatted text.`
)}

function _best(layout,fits,lazy){return(
function best(maxLineWidth, lineWidth, documentPairs) {
  if (documentPairs.length == 0) return layout('null');  // end of layout chain
  
  // Grab current indentation level and document from head of list
  const [indent, doc] = documentPairs[0];
  const nextDocs = documentPairs.slice(1);
  // Convenience function to recurse
  const _best = (newDocs=[], lw=lineWidth) => {
    return best(maxLineWidth, lw, newDocs.concat(nextDocs));
  };
    
  if (doc.type == 'nil') return _best();
  if (doc.type == 'concat') return _best(doc.docs.map(doc => [indent, doc]));
  if (doc.type == 'nest') return _best([[indent + doc.indent, doc.doc]]);
  if (doc.type == 'union') {
    // See if first doc in union fits; if not, use second
    const doc1 = _best([[indent, doc.a()]]);
    if (fits(maxLineWidth - lineWidth, doc1)) return doc1;
    return _best([[indent, doc.b()]]);
  }
  
  // Text and lines output layout chains
  if (doc.type == 'text') {
    const newLineWidth = lineWidth + doc.text.length;
    return layout('text', doc.text, lazy(() => _best([], newLineWidth)), doc.color);
  }
  if (doc.type == 'line') {
    return layout('line', `\n${' '.repeat(indent)}`, lazy(() => _best([], indent)));
  }
}
)}

function _21(md){return(
md`Once *best* returns, it will output a layout structure, which is a linked list of text and lines. Let's add a convenience method to *unravel* the layout, which converts this linked list into an array of \`{text, color}\` objects which can then be rendered to the screen!`
)}

function _unravelLayout(){return(
function unravelLayout(layoutDoc) {
  const results = [];
  while (layoutDoc.type != 'null') {
    results.push({text: layoutDoc.text, color: layoutDoc.color});
    layoutDoc = layoutDoc.next();
  }
  return results;
}
)}

function _render(){return(
function render(unraveledLayout) {
  const pre = document.createElement('pre');
  unraveledLayout.forEach(({color, text}) => {
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = text;
    pre.appendChild(span);
  });
  return pre;
}
)}

function _24(md){return(
md`Finally, the *pretty* method combines all of the above, taking in the desired line width and the document and returning the unraveled best layout.`
)}

function _pretty(unravelLayout,best){return(
function pretty(lineWidth, doc) {
  return unravelLayout(best(lineWidth, 0, [[0, doc]]));
}
)}

function _26(md){return(
md`## Usage in Practice

Let's see how one could make a text-wrapping formatter function in practice. The definition of *union* above had an example with the text "Hi there" on one line or two depending on avaialble width. That can be expressed as follows:`
)}

function _hiThere(Doc){return(
Doc.union(() => Doc.concat([Doc.text("Hi"), Doc.text(' '), Doc.text("there")]),
                    () => Doc.concat([Doc.text("Hi"), Doc.line(), Doc.text("there")]))
)}

function _28(md){return(
md`Essentially, this union will display the text "Hi" and "there" separated by a space if there's room and a newline if there's not.`
)}

function _29(render,pretty,hiThere){return(
render(pretty(80, hiThere))
)}

function _30(render,pretty,hiThere){return(
render(pretty(5, hiThere))
)}

function _31(md){return(
md`In practice, there are many use cases where you want text to go on the same line if possible and separate lines otherwise. To help construct formatters, certain helper functions are useful.

The *flatten* method takes a document and returns a version where everything occurs on the same line. It does this by converting line documents to their reduced text (typically space or empty text) and always picking the first option in a union (which will always be the longer line by definition).

The *group* function is a convenience method to automatically construct a union of the flattened version of a document with itself.`
)}

function _flatten(Doc){return(
function flatten(doc) {
  // Flatten always picks the first option in a union
  while (doc.type == 'union') doc = doc.a();

  if (doc.type == 'concat') return Doc.concat(doc.docs.map(flatten));
  if (doc.type == 'nest') return Doc.nest(doc.indent, flatten(doc.doc));
  // Convert lines to their reduced text
  if (doc.type == 'line') return Doc.text(doc.reducedText);

  // If doc is text or nil, it's unchanged
  return doc;
}
)}

function _group(Doc,lazy,flatten){return(
function group(doc) {
  // Unions are evaluated lazily
  return Doc.union(lazy(() => flatten(doc)), lazy(() => doc));
}
)}

function _34(md){return(
md`Our "Hi there" above example can be simplified with *group*:`
)}

function _hiThere2(group,Doc){return(
group(Doc.concat([Doc.text("Hi"), Doc.line(), Doc.text("there")]))
)}

function _36(render,pretty,hiThere2){return(
render(pretty(80, hiThere2))
)}

function _37(render,pretty,hiThere2){return(
render(pretty(5, hiThere2))
)}

function _38(md){return(
md`## Formatting HTML code`
)}

function _39(md){return(
md`Let's show a more practical pretty printer example. Generally, to put a pretty printer to use, we need to define methods on top of a parse tree to transform it into a document. As an example, we'll make a pretty printer for HTML, since the browser has built-in methods to parse HTML.

Let's start by defining an HTML structure that can contain elements and text nodes:`
)}

function _HTML(){return(
{
  element: (tag, attrs={}, children=[]) => {
    const attributes = Object.entries(attrs);
    return {type: 'element', tag, attributes, children};
  },
  text: (text) => ({type: 'text', text}),
}
)}

function _41(md){return(
md`Below, we define helpers to format HTML code. *showHTML* traverses the HTML structure, calling *showTag* to render HTML tags. *showList* renders a list of items without spaces in-between and relies on *show* to ensure list items are grouped in a way so that HTML tags tend to have lines to themselves. *showAttribute* renders the key/value pair for an HTML element attribute.`
)}

function _Color(){return(
{
  tag: 'green',
  property: '#ae39e8',
  attribute: 'blue',
}
)}

function _showHTML(showTag,Doc,showList,Color){return(
function showHTML(html) {
  if (html.type == 'element') {
    if (html.children.length == 0) {
      return [showTag(html, "/>")];
    } else {
      return [
        Doc.concat([showTag(html, ">"),
                    showList(showHTML, html.children),
                    Doc.text(`</${html.tag}>`, Color.tag)])
      ];
    }
  } else {
    return html.text.split(/\s/).map(word => Doc.text(word));
  }
}
)}

function _showTag(Doc,Color,showList,showAttribute){return(
function showTag(html, endTag) {
  const space = html.attributes.length > 0 ? ' ' : '';
  return Doc.concat([
    Doc.text(`<${html.tag}${space}`, Color.tag),
    showList(showAttribute, html.attributes),
    Doc.text(endTag, Color.tag),
  ]);
}
)}

function _showAttribute(Doc,Color){return(
function showAttribute(attr) {
  return [
    Doc.concat([
      Doc.text(`${attr[0]}=`, Color.property),
      Doc.text(JSON.stringify(attr[1]), Color.attribute),
    ]),
  ];
}
)}

function _showList(Doc,group,show){return(
function showList(fn, l) {
  if (l.length == 0) return Doc.nil;
  const mapped = l.map(fn).reduce((x, y) => x.concat(y), []);
  
  return group(Doc.concat([
    Doc.nest(2, Doc.concat([Doc.line(''), show(mapped)])),
    Doc.line(''),
  ]));
}
)}

function _show(Doc,lazy,flatten){return(
function show(l) {
  // method called "fill" in Wadler's paper. He describes:
  //   "[fill] collapses a list of documents into a
  //    document. It puts a space between two documents when
  //    this leads to reasonable layout, and a newline
  //    otherwise.
  //    ... Note the use of flatten to ensure that a space
  //    is only inserted between documents which occupy a
  //    single line."
  if (l.length == 0) return Doc.nil;
  if (l.length == 1) return l[0];
  return Doc.union(
    lazy(() => Doc.concat([flatten(l[0]), Doc.text(' '),
                      show([flatten(l[1]), ...l.slice(2)])])),
    lazy(() => Doc.concat([l[0], Doc.line(''), show(l.slice(1))])),
  );
}
)}

function _48(md){return(
md`To prettify at HTML structure, we define *prettyHtml*, which pretty-prints the concatenated list-style output of *showHTML*.`
)}

function _prettyHtml(pretty,Doc,showHTML){return(
(lineWidth, element) => pretty(lineWidth, Doc.concat(showHTML(element)))
)}

function _50(md){return(
md`Now, let's test the method with an example HTML structure.`
)}

function _testHtml(HTML){return(
HTML.element('p', {color: 'blue', font: 'Times', size: '10'}, [
    HTML.text('Here is some'),
    HTML.element('em', {}, [HTML.text('emphasized')]),
    HTML.text('text.'),
    HTML.text('Here is a'),
    HTML.element('a', {href: 'https://example.com'}, [HTML.text('link')]),
    HTML.text('elsewhere.')
  ])
)}

function _52(render,prettyHtml,testHtml){return(
render(prettyHtml(80, testHtml))
)}

function _53(render,prettyHtml,testHtml){return(
render(prettyHtml(10, testHtml))
)}

function _54(md){return(
md`Hooray, it works! And notice how we got syntax highlighting practically for free by painting the text as we format it.

Now for the fun part: JavaScript has free access to the page's HTML, which means we can write a method to convert an actual HTML element into the HTML structure we defined above.`
)}

function _htmlFromDom(Node,HTML){return(
function htmlFromDom(element) {
  if (element.nodeType == Node.TEXT_NODE) return HTML.text(element.textContent.trim());
  return HTML.element(
    element.tagName.toLowerCase(),
    Object.fromEntries(Array.from(element.attributes).map(a => [a.name, a.value])),
    Array.from(element.childNodes).map(htmlFromDom),
  );
}
)}

function _56(md){return(
md`To get the HTML structure for the source code of this Observable notebook, we can call *htmlFromDom* on the notebook's HTML element. At the very top of this notebook, I stored the rendered markdown of the intro paragraph as a variable called \`doc\`. It turns out, \`doc.parentElement.parentElement\` points to the HTML element that contains all the nodes in this notebook.`
)}

function _documentNodes(htmlFromDom,doc){return(
htmlFromDom(doc.parentElement.parentElement)
)}

function _58(md){return(
md`Let's render it! Try dragging the slider to change the print width and reformat the document. You can also scroll through the formatted document to see its full contents.

*(Note: because there's so much HTML in this notebook, the formatted text is super slow to display using our 
\`render\` method (HTML-based). Instead, I define a \`draw\` method you can find below which renders to canvas instead and is much more performant.)*`
)}

function _printWidth(html){return(
html`<input type="range" min="1" max="150">`
)}

function _60(html,printWidth){return(
html`Print width: ${printWidth}`
)}

function _61(draw,printWidth,prettyHtml,documentNodes){return(
draw(printWidth, prettyHtml(printWidth, documentNodes))
)}

function _62(md){return(
md`So, there you have it. Hopefully this guide serves as a fun way to explore an interesting algorithm and an instructive guide for anyone trying to make a formatter for their language.

If you want to learn more, I recommend reading the papers that informed this piece:

* ["A Prettier Printer" by Philip Wadler (2003)](https://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)
* ["Prettyprinting" by Derek Oppen (1980)](https://www.cs.tufts.edu/~nr/cs257/archive/derek-oppen/prettyprinting.pdf)`
)}

function _63(md){return(
md`# &nbsp;

#### *Supporting code for drawing and demoing*`
)}

function _drawFontHeight(){return(
12
)}

function _drawLineHeight(){return(
1.3
)}

function _draw(drawFontHeight,DOM,width,drawLineHeight,html){return(
function draw(lineWidth, nodes, showScroll=true, fontHeight = drawFontHeight) {
  const maxHeight = 300;
  const lineCount = nodes.reduce((x, y) => y.text.split('\n').length + x - 1, 0) + 1;
  const allText = nodes.reduce((x, y) => x + y.text, '');
  const maxLineLength = allText.split('\n').reduce((x, y) => Math.max(x, y.length), 0);
  const ctx = DOM.context2d(width, maxHeight);
  ctx.font = `bold ${fontHeight}px Courier New, Courier, monospace`;
  const letterWidth = ctx.measureText('M').width;
  
  function _draw(yOffset = 0, xOffset = 0) {
    ctx.clearRect(0, 0, width, maxHeight);

    let x = -xOffset;
    let y = -yOffset + drawLineHeight * fontHeight;
    for (const {text, color} of nodes) {
      ctx.fillStyle = color || 'black';
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i != 0) {
          y += fontHeight * drawLineHeight;
          x = -xOffset;
        }
        ctx.fillText(line, x, y);
        x += line.length * letterWidth;
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = 'gainsboro';
    ctx.setLineDash([4, 4]);
    ctx.moveTo(lineWidth * letterWidth - xOffset, 0);
    ctx.lineTo(lineWidth * letterWidth - xOffset, 500);
    ctx.stroke();
  }
  
  _draw();
  const scroller = showScroll ? html`
    <div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0;
                overflow-x: auto; overflow-y: auto; pointer-events: all">
      <div style="height: ${fontHeight * drawLineHeight * (lineCount + 1)}px;
                  width: ${(maxLineLength + 5) * letterWidth}px"></div>
    </div>` : '';
  if (showScroll) {
    scroller.onscroll = e => {
      _draw(scroller.scrollTop, scroller.scrollLeft);
    }
  }
  
  return html`
    <div style="position: relative; height: ${maxHeight}px; pointer-events: none; background: white;">
      <div style="position: absolute; top: 0; bottom: 0; pointer-events: none;">
        ${scroller}
        ${ctx.canvas}
      </div>
    </div>`;
}
)}

function _display(pretty,html){return(
function display(doc, width=1) {
  const nodes = pretty(width, doc);
  const pre = html`<pre></pre>`;
  const displayNodes = nodes.forEach(({text, color}) => {
    pre.appendChild(html`<span style="color: ${color}">${text}</span>`);
  });
  return pre;
}
)}

function _displaySmallAndLargeWidth(display,html){return(
function displaySmallAndLargeWidth(doc) {
  const pre1 = display(doc, 1);
  const pre2 = display(doc, 30);
  return html`
    <table>
      <tr>
        <td><i>Small width:</i></td>
        <td><i>Large width:</i></td>
      </tr>
      <tr>
        <td style="vertical-align: top;">${pre1}</td>
        <td style="vertical-align: top;">${pre2}</td>
      </tr>
    </table>`;
}
)}

function _demoLineWidth(Inputs){return(
Inputs.input(40)
)}

function _table(html,width){return(
function table(elem1, w1, elem2, w2) {
  return html`<table><tr><td style="width: ${width * w1}px; overflow: hidden;">${elem1}</td><td style="width: ${width * w2}px; overflow: hidden;">${elem2}</td></tr></table>`;
}
)}

function _71($0,set,md)
{
  function update() {
    const lineWidth = Math.round(Math.sin(Date.now() / 2500) * 30 + 40);
    if (($0).value != lineWidth) {
      set($0, lineWidth);
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
  return md`\`update\``;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("doc")).define("doc", ["md"], _doc);
  main.variable(observer()).define(["visibility","table","draw","demoLineWidth","prettyHtml","documentNodes"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer("Doc")).define("Doc", _Doc);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer()).define(["display","Doc"], _10);
  main.variable(observer()).define(["md"], _11);
  main.variable(observer()).define(["display","Doc"], _12);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer()).define(["displaySmallAndLargeWidth","Doc"], _14);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer("lazy")).define("lazy", _lazy);
  main.variable(observer("layout")).define("layout", _layout);
  main.variable(observer("fits")).define("fits", _fits);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer("best")).define("best", ["layout","fits","lazy"], _best);
  main.variable(observer()).define(["md"], _21);
  main.variable(observer("unravelLayout")).define("unravelLayout", _unravelLayout);
  main.variable(observer("render")).define("render", _render);
  main.variable(observer()).define(["md"], _24);
  main.variable(observer("pretty")).define("pretty", ["unravelLayout","best"], _pretty);
  main.variable(observer()).define(["md"], _26);
  main.variable(observer("hiThere")).define("hiThere", ["Doc"], _hiThere);
  main.variable(observer()).define(["md"], _28);
  main.variable(observer()).define(["render","pretty","hiThere"], _29);
  main.variable(observer()).define(["render","pretty","hiThere"], _30);
  main.variable(observer()).define(["md"], _31);
  main.variable(observer("flatten")).define("flatten", ["Doc"], _flatten);
  main.variable(observer("group")).define("group", ["Doc","lazy","flatten"], _group);
  main.variable(observer()).define(["md"], _34);
  main.variable(observer("hiThere2")).define("hiThere2", ["group","Doc"], _hiThere2);
  main.variable(observer()).define(["render","pretty","hiThere2"], _36);
  main.variable(observer()).define(["render","pretty","hiThere2"], _37);
  main.variable(observer()).define(["md"], _38);
  main.variable(observer()).define(["md"], _39);
  main.variable(observer("HTML")).define("HTML", _HTML);
  main.variable(observer()).define(["md"], _41);
  main.variable(observer("Color")).define("Color", _Color);
  main.variable(observer("showHTML")).define("showHTML", ["showTag","Doc","showList","Color"], _showHTML);
  main.variable(observer("showTag")).define("showTag", ["Doc","Color","showList","showAttribute"], _showTag);
  main.variable(observer("showAttribute")).define("showAttribute", ["Doc","Color"], _showAttribute);
  main.variable(observer("showList")).define("showList", ["Doc","group","show"], _showList);
  main.variable(observer("show")).define("show", ["Doc","lazy","flatten"], _show);
  main.variable(observer()).define(["md"], _48);
  main.variable(observer("prettyHtml")).define("prettyHtml", ["pretty","Doc","showHTML"], _prettyHtml);
  main.variable(observer()).define(["md"], _50);
  main.variable(observer("testHtml")).define("testHtml", ["HTML"], _testHtml);
  main.variable(observer()).define(["render","prettyHtml","testHtml"], _52);
  main.variable(observer()).define(["render","prettyHtml","testHtml"], _53);
  main.variable(observer()).define(["md"], _54);
  main.variable(observer("htmlFromDom")).define("htmlFromDom", ["Node","HTML"], _htmlFromDom);
  main.variable(observer()).define(["md"], _56);
  main.variable(observer("documentNodes")).define("documentNodes", ["htmlFromDom","doc"], _documentNodes);
  main.variable(observer()).define(["md"], _58);
  main.variable(observer("viewof printWidth")).define("viewof printWidth", ["html"], _printWidth);
  main.variable(observer("printWidth")).define("printWidth", ["Generators", "viewof printWidth"], (G, _) => G.input(_));
  main.variable(observer()).define(["html","printWidth"], _60);
  main.variable(observer()).define(["draw","printWidth","prettyHtml","documentNodes"], _61);
  main.variable(observer()).define(["md"], _62);
  main.variable(observer()).define(["md"], _63);
  main.variable(observer("drawFontHeight")).define("drawFontHeight", _drawFontHeight);
  main.variable(observer("drawLineHeight")).define("drawLineHeight", _drawLineHeight);
  main.variable(observer("draw")).define("draw", ["drawFontHeight","DOM","width","drawLineHeight","html"], _draw);
  main.variable(observer("display")).define("display", ["pretty","html"], _display);
  main.variable(observer("displaySmallAndLargeWidth")).define("displaySmallAndLargeWidth", ["display","html"], _displaySmallAndLargeWidth);
  main.variable(observer("viewof demoLineWidth")).define("viewof demoLineWidth", ["Inputs"], _demoLineWidth);
  main.variable(observer("demoLineWidth")).define("demoLineWidth", ["Generators", "viewof demoLineWidth"], (G, _) => G.input(_));
  main.variable(observer("table")).define("table", ["html","width"], _table);
  main.variable(observer()).define(["viewof demoLineWidth","set","md"], _71);
  const child1 = runtime.module(define1);
  main.import("set", child1);
  main.import("Inputs", child1);
  return main;
}
