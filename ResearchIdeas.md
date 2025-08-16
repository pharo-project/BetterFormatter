In this file we list some possible research questions

Should we enrich AST with extra nodes to be able to get better capability to address the challenges listed below

- ASTs do not contain (nodes) about formatting entities such as 

### Some challenges

- Can we keep double empty spaces when we reformat?

```
method
	
	| reporter parent |	parent := self project baseDirectory.	reporter := MicAnalysisReportWriter 		reportForFolder: parent startingFrom: file.		
	
	reporter isOkay		ifTrue: [ self outputStreamDo: [ :str | str 			cr;			nextPutAll:  'File ' ; 			nextPutAll: (self relativePathStringOf: file) ; 			nextPutAll: ' does not have reference problems.' ]]
```



- Can we keep comments around?





## In functional languages

In https://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf
and explained in the following link with a JS implementation	https://observablehq.com/@freedmand/pretty-printing@1342 introduce

- line: This can be soft or hardline line break).
- nesting: to represent the fact that a block of text is indented. 
- union: to mean that yo can pick up either a flat line or the same contents with a smaller first line


```
Doc = ({
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
})
```